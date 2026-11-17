"""Turn data/raw/*.csv into site/public/data/monitor.json (what the website reads).

Usage:  python pipeline/build_site_data.py
Inputs (data/raw/):
  eth_size_bands.csv   day, token, band, transfers, volume_usd          (BigQuery: queries/10)
  eth_fees.csv         day, token, n_tx, median_fee_eth, p90_fee_eth     (BigQuery: queries/11)
  eth_concentration.csv chain, token, window, top10_share, senders       (BigQuery: queries/12)
  tron_size_bands.csv  day, token, band, transfers, volume_usd          (BigQuery: queries/20 OR tron_sample.py)
  tron_fees.csv        day, n_tx, median_fee_trx, p90_fee_trx, zero_burn_share   (tron_sample.py)
  prices.csv           day, symbol, price_usd                            (fetch_prices.py)
Missing files are skipped and listed in meta.missing, so the site still builds.
"""
import csv
import json
import sys
from datetime import datetime, timedelta, timezone

from config import BANDS, BASELINE_START, PEG_FLAG, POST_START, RAW, SITE_DATA, TRON_MODE


def read(name):
    p = RAW / name
    if not p.exists():
        return None
    with open(p, newline="", encoding="utf-8-sig") as f:
        return list(csv.DictReader(f))


def window_of(day: str) -> str:
    return "post" if day >= POST_START.isoformat() else "baseline"


def main(sample: bool = False) -> None:
    missing = []
    prices = {}
    for r in read("prices.csv") or []:
        prices.setdefault(r["symbol"], {})[r["day"]] = float(r["price_usd"])
    if not prices:
        missing.append("prices.csv")

    bands = []
    for chain, fname in (("ethereum", "eth_size_bands.csv"), ("tron", "tron_size_bands.csv")):
        rows = read(fname)
        if rows is None:
            missing.append(fname); continue
        for r in rows:
            if r["day"] < BASELINE_START.isoformat():
                continue
            bands.append({"day": r["day"], "chain": chain, "token": r["token"], "band": r["band"],
                          "transfers": int(float(r["transfers"])), "volume_usd": float(r["volume_usd"])})

    fees = []
    for r in read("eth_fees.csv") or missing.append("eth_fees.csv") or []:
        px = prices.get("ETH", {}).get(r["day"])
        if px is None:
            continue
        fees.append({"day": r["day"], "chain": "ethereum", "token": r["token"], "n": int(float(r["n_tx"])),
                     "median_fee_usd": round(float(r["median_fee_eth"]) * px, 4),
                     "p90_fee_usd": round(float(r["p90_fee_eth"]) * px, 4), "zero_burn_share": None})
    for r in read("tron_fees.csv") or missing.append("tron_fees.csv") or []:
        px = prices.get("TRX", {}).get(r["day"])
        if px is None:
            continue
        paid = r.get("median_paid_fee_trx") or ""
        fees.append({"day": r["day"], "chain": "tron", "token": "USDT", "n": int(float(r["n_tx"])),
                     "median_fee_usd": round(float(r["median_fee_trx"]) * px, 4),
                     "p90_fee_usd": round(float(r["p90_fee_trx"]) * px, 4),
                     "zero_burn_share": float(r["zero_burn_share"]),
                     # fee for a sender that actually pays (no staked energy); preferred for Tron cost
                     "median_paid_fee_usd": round(float(paid) * px, 4) if paid else None})

    concentration = [
        {"chain": r["chain"], "token": r["token"], "window": r["window"],
         "top10_share": float(r["top10_share"]), "senders": int(float(r["senders"]))}
        for r in (read("eth_concentration.csv") or missing.append("eth_concentration.csv") or [])
    ]

    peg = []
    for sym in ("USDT", "USDC"):
        for day, p in sorted(prices.get(sym, {}).items()):
            if day >= BASELINE_START.isoformat():
                peg.append({"day": day, "token": sym, "price": p, "flag": abs(p - 1) >= PEG_FLAG})

    days = sorted({b["day"] for b in bands})
    meta = {
        "sample": sample,
        "generated_at": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "baseline": [BASELINE_START.isoformat(), (POST_START - timedelta(days=1)).isoformat()],
        "post_start": POST_START.isoformat(),
        "first_day": days[0] if days else None,
        "last_day": days[-1] if days else None,
        "tron_mode": TRON_MODE if not sample else "sample",
        "bands": BANDS,
        "missing": missing,
    }
    SITE_DATA.mkdir(parents=True, exist_ok=True)
    out = {"meta": meta, "bands": bands, "fees": fees, "concentration": concentration, "peg": peg}
    (SITE_DATA / "monitor.json").write_text(json.dumps(out, separators=(",", ":")), encoding="utf-8")
    print(f"monitor.json: {len(bands)} band rows, {len(fees)} fee rows, missing={missing or 'none'}")
    for w in ("baseline", "post"):
        n = sum(1 for d in days if window_of(d) == w)
        print(f"  {w}: {n} days")


if __name__ == "__main__":
    main(sample="--sample" in sys.argv)
