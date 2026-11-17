"""Sampled Tron USDT data from TronGrid (used when BigQuery Tron is too expensive).

Writes:
  data/raw/tron_size_bands.csv  (day, token, band, transfers, volume_usd)  — sampled windows only
  data/raw/tron_fees.csv        (day, n_tx, median_fee_trx, p90_fee_trx, zero_burn_share)

Sampled data is for shares and distributions only. Never scale it into totals.

Usage:  python pipeline/tron_sample.py               (whole window)
        python pipeline/tron_sample.py --days 3      (quick test: last 3 days)
Needs:  TRONGRID_API_KEY in .env
"""
import argparse
import csv
import random
import statistics
import time
from collections import defaultdict
from datetime import date, datetime, timedelta, timezone

import requests

from config import (BASELINE_START, RAW, TRON_FEE_SAMPLE_PER_DAY, TRON_MODE, TRON_SAMPLE_WINDOWS,
                    TRONGRID_API_KEY, USDT_TRON, band_of)

API = "https://api.trongrid.io"
HEADERS = {"TRON-PRO-API-KEY": TRONGRID_API_KEY} if TRONGRID_API_KEY else {}
ZERO = {"T9yD14Nj9j7xAB4dbGeiX9h8unkKHxuWwb", "410000000000000000000000000000000000000000"}
PAUSE = 0.12  # ~8 requests/second, under the free 15 QPS cap


def get(url, method="GET", **kw):
    for attempt in range(6):
        r = requests.request(method, url, headers=HEADERS, timeout=30, **kw)
        if r.status_code in (403, 429):
            time.sleep(2 ** attempt)  # back off when rate-limited
            continue
        r.raise_for_status()
        time.sleep(PAUSE)
        return r.json()
    raise RuntimeError(f"Rate-limited too often: {url}")


def transfers_between(start_ms: int, end_ms: int):
    """Yield (txid, from, to, amount_usd) for USDT Transfer events in [start_ms, end_ms)."""
    params = {"event_name": "Transfer", "min_block_timestamp": start_ms,
              "max_block_timestamp": end_ms - 1, "order_by": "block_timestamp,asc", "limit": 200}
    url = f"{API}/v1/contracts/{USDT_TRON}/events"
    while True:
        data = get(url, params=params)
        for ev in data.get("data", []):
            res = ev.get("result", {})
            try:
                amt = int(res.get("value", "0")) / 1e6
            except ValueError:
                continue
            yield ev["transaction_id"], res.get("from"), res.get("to"), amt
        fp = data.get("meta", {}).get("fingerprint")
        if not fp:
            break
        params["fingerprint"] = fp


def fee_trx(txid: str):
    info = get(f"{API}/wallet/gettransactioninfobyid", method="POST", json={"value": txid})
    return info.get("fee", 0) / 1e6 if info else None


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--days", type=int, default=0, help="only the last N full days (for testing)")
    args = ap.parse_args()

    today = datetime.now(timezone.utc).date()
    start = today - timedelta(days=args.days) if args.days else BASELINE_START
    bands, fees = [], []
    day = start
    while day < today:
        counts, vols, txids = defaultdict(int), defaultdict(float), []
        for hour, minutes in TRON_SAMPLE_WINDOWS:
            if TRON_MODE == "bigquery":
                minutes = 1  # only need ~200 tx ids for fees; full transfers come from BigQuery
            s = datetime(day.year, day.month, day.day, hour, tzinfo=timezone.utc)
            e = s + timedelta(minutes=minutes)
            for txid, frm, to, amt in transfers_between(int(s.timestamp() * 1000), int(e.timestamp() * 1000)):
                if amt <= 0 or frm in ZERO or to in ZERO:
                    continue
                b = band_of(amt)
                counts[b] += 1
                vols[b] += amt
                txids.append(txid)
        for b in counts:
            bands.append({"day": day.isoformat(), "token": "USDT", "band": b,
                          "transfers": counts[b], "volume_usd": round(vols[b], 2)})
        sample = random.Random(day.isoformat()).sample(txids, min(TRON_FEE_SAMPLE_PER_DAY, len(txids)))
        vals = [v for v in (fee_trx(t) for t in sample) if v is not None]
        if vals:
            q = statistics.quantiles(vals, n=10) if len(vals) >= 10 else [max(vals)] * 9
            paid = [v for v in vals if v > 0]
            fees.append({"day": day.isoformat(), "n_tx": len(vals),
                         "median_fee_trx": round(statistics.median(vals), 4),
                         "p90_fee_trx": round(q[8], 4),
                         "zero_burn_share": round(sum(v == 0 for v in vals) / len(vals), 4),
                         "median_paid_fee_trx": round(statistics.median(paid), 4) if paid else ""})
        print(f"{day}: {sum(counts.values())} sampled transfers, {len(vals)} fees")
        day += timedelta(days=1)

    RAW.mkdir(parents=True, exist_ok=True)
    if TRON_MODE == "bigquery":
        print("TRON_MODE=bigquery: keeping the full BigQuery tron_size_bands.csv; writing fees only.")
    else:
        with open(RAW / "tron_size_bands.csv", "w", newline="", encoding="utf-8") as f:
            w = csv.DictWriter(f, fieldnames=["day", "token", "band", "transfers", "volume_usd"])
            w.writeheader(); w.writerows(bands)
    with open(RAW / "tron_fees.csv", "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=["day", "n_tx", "median_fee_trx", "p90_fee_trx", "zero_burn_share", "median_paid_fee_trx"])
        w.writeheader(); w.writerows(fees)
    print("Done: data/raw/tron_fees.csv" + ("" if TRON_MODE == "bigquery" else " and tron_size_bands.csv"))


if __name__ == "__main__":
    main()
