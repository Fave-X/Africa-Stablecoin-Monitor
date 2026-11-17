"""Turn data/raw/*.csv into site/public/data/monitor.json (what the website reads).

Usage:  python pipeline/build_site_data.py
Inputs (data/raw/):
  eth_size_bands.csv            day, token, band, transfers, volume_usd        (queries/10)
  eth_wallet_bands.csv          day, token, band, transfers, volume_usd        (queries/13, optional)
  eth_fees.csv                  day, token, n_tx, median_fee_eth, p90_fee_eth  (queries/11)
  eth_concentration_daily.csv   day, chain, token, top10_share, senders        (queries/15, optional)
  tron_size_bands.csv           day, token, band, transfers, volume_usd        (queries/20)
  tron_wallets_daily.csv        kind, day, band, transfers, volume_usd, top10_share, senders (queries/21, optional)
  tron_fees.csv                 day, n_tx, median_fee_trx, p90_fee_trx, zero_burn_share, median_paid_fee_trx
  prices.csv                    day, symbol, price_usd                          (fetch_prices.py)

Every before/after number on the site is computed HERE, with one rule (COMPARE_RULE below),
and the build stops if any data check fails. The checks are listed in METHOD.md and their
results are written to meta.checks, so the site can show them.
"""
import csv
import json
import math
import statistics
import sys
from datetime import date, datetime, timedelta, timezone

from config import BANDS, BASELINE_START, PEG_FLAG, POST_START, RAW, SITE_DATA, TRON_MODE

# A day is flagged as an outlier when a rail moves more than this multiple of its median day.
OUTLIER_MULTIPLE = 3.0
TICKET_USD = 10_000  # cost is quoted per $1,000 moved at this ticket size

COMPARE_RULE = ("Before/after figures compare average weekdays (Mon–Fri) only, and leave out "
                "any day flagged as an outlier, so a quiet weekend or a one-off spike can't drive the result.")

RAILS = [("ethereum", "USDT"), ("tron", "USDT"), ("ethereum", "USDC")]


def read(name):
    p = RAW / name
    if not p.exists():
        return None
    with open(p, newline="", encoding="utf-8-sig") as f:
        return list(csv.DictReader(f))


def window_of(day: str) -> str:
    return "post" if day >= POST_START.isoformat() else "baseline"


def is_weekday(day: str) -> bool:
    return date.fromisoformat(day).weekday() < 5


def num(x):
    return None if x in (None, "") else float(x)


class Checks:
    def __init__(self):
        self.items = []

    def add(self, name, ok, detail=""):
        self.items.append({"name": name, "passed": bool(ok), "detail": detail})

    @property
    def failed(self):
        return [c for c in self.items if not c["passed"]]


def daily_totals(rows, chain, token, key):
    out = {}
    for b in rows:
        if b["chain"] == chain and b["token"] == token:
            out[b["day"]] = out.get(b["day"], 0) + b[key]
    return out


def main(sample: bool = False) -> None:
    missing = []
    chk = Checks()

    # ── prices
    prices = {}
    for r in read("prices.csv") or []:
        prices.setdefault(r["symbol"], {})[r["day"]] = float(r["price_usd"])
    if not prices:
        missing.append("prices.csv")

    # ── size bands (all transfers)
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
    days = sorted({b["day"] for b in bands})
    first_day, last_day = (days[0], days[-1]) if days else (None, None)
    in_range = lambda d: first_day is not None and first_day <= d <= last_day

    # ── ordinary-wallet bands (Ethereum: queries/13 · Tron: queries/21)
    wallet_bands = [
        {"day": r["day"], "chain": "ethereum", "token": r["token"], "band": r["band"],
         "transfers": int(float(r["transfers"])), "volume_usd": float(r["volume_usd"])}
        for r in (read("eth_wallet_bands.csv") or []) if in_range(r["day"])
    ]
    tron_w = read("tron_wallets_daily.csv") or []
    wallet_bands += [
        {"day": r["day"], "chain": "tron", "token": "USDT", "band": r["band"],
         "transfers": int(float(r["transfers"])), "volume_usd": float(r["volume_usd"])}
        for r in tron_w if r["kind"] == "wallet_band" and in_range(r["day"])
    ]

    # ── daily top-10 sender share (Ethereum: queries/15 · Tron: queries/21)
    conc_daily = [
        {"day": r["day"], "chain": r["chain"], "token": r["token"],
         "top10_share": float(r["top10_share"]), "senders": int(float(r["senders"]))}
        for r in (read("eth_concentration_daily.csv") or []) if in_range(r["day"])
    ]
    conc_daily += [
        {"day": r["day"], "chain": "tron", "token": "USDT",
         "top10_share": float(r["top10_share"]), "senders": int(float(r["senders"]))}
        for r in tron_w if r["kind"] == "top10" and in_range(r["day"])
    ]

    # ── fees
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
        fees.append({"day": r["day"], "chain": "tron", "token": "USDT", "n": int(float(r["n_tx"])),
                     "median_fee_usd": round(float(r["median_fee_trx"]) * px, 4),
                     # Tron fees sit on fixed tiers; p90 of the daily sample is the full-burn tier
                     "p90_fee_usd": round(float(r["p90_fee_trx"]) * px, 4),
                     "zero_burn_share": float(r["zero_burn_share"])})

    # ── peg
    peg = []
    for sym in ("USDT", "USDC"):
        for day, p in sorted(prices.get(sym, {}).items()):
            if day >= BASELINE_START.isoformat() and in_range(day):
                peg.append({"day": day, "token": sym, "price": p, "flag": abs(p - 1) >= PEG_FLAG})

    # ── outlier days: a rail moving > OUTLIER_MULTIPLE × its median day
    flagged = []
    for chain, token in RAILS:
        vol = daily_totals(bands, chain, token, "volume_usd")
        if not vol:
            continue
        med = statistics.median(vol.values())
        for d, v in sorted(vol.items()):
            if med and v > OUTLIER_MULTIPLE * med:
                flagged.append({"day": d, "chain": chain, "token": token,
                                "volume_usd": round(v, 2), "multiple_of_median": round(v / med, 1),
                                "note": ""})
    excluded = sorted({f["day"] for f in flagged})

    def comparable(d):
        return is_weekday(d) and d not in excluded

    # ── the comparison block (single source for every before/after figure on the site)
    def compare_rows(rows, chain, token):
        out = {}
        for w in ("baseline", "post"):
            sel = [b for b in rows if b["chain"] == chain and b["token"] == token
                   and window_of(b["day"]) == w and comparable(b["day"])]
            n_days = len({b["day"] for b in sel})
            vol = sum(b["volume_usd"] for b in sel)
            n = sum(b["transfers"] for b in sel)
            shares = [sum(b["volume_usd"] for b in sel if b["band"] == band) / vol if vol else None for band in BANDS]
            out[w] = {"days": n_days, "vol_per_day": vol / n_days if n_days else None,
                      "transfers_per_day": n / n_days if n_days else None, "band_shares": shares}
        b, p = out["baseline"], out["post"]
        chg = lambda k: (p[k] / b[k] - 1) if b[k] and p[k] is not None else None
        out["vol_change"] = chg("vol_per_day")
        out["transfers_change"] = chg("transfers_per_day")
        return out

    def window_median_fee(chain, token, key):
        xs = [f[key] for f in fees if f["chain"] == chain and f["token"] == token and window_of(f["day"]) == "post"]
        return statistics.median(xs) if xs else None

    def conc_avg(chain, token, w):
        xs = [c["top10_share"] for c in conc_daily if c["chain"] == chain and c["token"] == token
              and window_of(c["day"]) == w and comparable(c["day"])]
        return sum(xs) / len(xs) if xs else None

    compare = {"rule": COMPARE_RULE, "excluded_days": excluded, "rails": [], "cost": {}, "concentration": []}
    for chain, token in RAILS:
        entry = {"chain": chain, "token": token, "all": compare_rows(bands, chain, token)}
        if any(w["chain"] == chain and w["token"] == token for w in wallet_bands):
            wal = compare_rows(wallet_bands, chain, token)
            a = entry["all"]["post"]
            wal["share_of_transfers_post"] = (wal["post"]["transfers_per_day"] / a["transfers_per_day"]) if a["transfers_per_day"] else None
            wal["share_of_volume_post"] = (wal["post"]["vol_per_day"] / a["vol_per_day"]) if a["vol_per_day"] else None
            entry["wallets"] = wal
        compare["rails"].append(entry)
        if any(c["chain"] == chain and c["token"] == token for c in conc_daily):
            compare["concentration"].append({"chain": chain, "token": token,
                                             "baseline": conc_avg(chain, token, "baseline"),
                                             "post": conc_avg(chain, token, "post")})

    eth_fee = window_median_fee("ethereum", "USDT", "median_fee_usd")
    tron_full = window_median_fee("tron", "USDT", "p90_fee_usd")
    tron_zero = [f["zero_burn_share"] for f in fees if f["chain"] == "tron" and window_of(f["day"]) == "post"]
    per_k = lambda fee: fee / (TICKET_USD / 1000) if fee is not None else None
    compare["cost"] = {
        "ticket_usd": TICKET_USD,
        "ethereum_usdt_fee": eth_fee, "ethereum_usdt_per_1k": per_k(eth_fee),
        "tron_usdt_full_fee": tron_full, "tron_usdt_full_per_1k": per_k(tron_full),
        "tron_zero_burn_share": statistics.mean(tron_zero) if tron_zero else None,
    }
    usdt = daily_totals(bands, "ethereum", "USDT", "volume_usd")
    usdc = daily_totals(bands, "ethereum", "USDC", "volume_usd")
    mix = {}
    for w in ("baseline", "post"):
        ds = [d for d in usdt if window_of(d) == w and comparable(d) and d in usdc]
        a, c = sum(usdt[d] for d in ds), sum(usdc[d] for d in ds)
        mix[w] = a / (a + c) if a + c else None
    compare["usdt_share_of_eth_usdt_usdc"] = mix

    # ── checks (the build stops if any fail)
    finite = lambda x: x is not None and isinstance(x, (int, float)) and math.isfinite(x)
    bad_fee = [f for f in fees for k in ("median_fee_usd", "p90_fee_usd") if not (finite(f[k]) and f[k] >= 0)]
    chk.add("Fees are zero or positive", not bad_fee, f"{len(fees)} daily fee rows" if not bad_fee else f"{len(bad_fee)} bad rows")
    bad_zb = [f for f in fees if f["zero_burn_share"] is not None and not 0 <= f["zero_burn_share"] <= 1]
    chk.add("Tron zero-burn share is between 0% and 100%", not bad_zb, f"{len(bad_zb)} bad rows" if bad_zb else "")
    neg = [b for b in bands + wallet_bands if b["volume_usd"] < 0 or b["transfers"] < 0]
    chk.add("Volumes and transfer counts are zero or positive", not neg, f"{len(bands) + len(wallet_bands)} band rows")
    share_issues = []
    for e in compare["rails"]:
        for scope in ("all", "wallets"):
            if scope not in e:
                continue
            for w in ("baseline", "post"):
                s = [x for x in e[scope][w]["band_shares"] if x is not None]
                if s and (any(not 0 <= x <= 1 for x in s) or abs(sum(s) - 1) > 1e-6):
                    share_issues.append(f"{e['chain']} {e['token']} {scope} {w}")
    chk.add("Size-band shares are each 0–100% and sum to 100%", not share_issues, ", ".join(share_issues))
    sub_issues = []
    for chain, token in RAILS:
        allv = daily_totals(bands, chain, token, "volume_usd")
        walv = daily_totals(wallet_bands, chain, token, "volume_usd")
        sub_issues += [f"{chain} {token} {d}" for d, v in walv.items() if v > allv.get(d, 0) * (1 + 1e-9)]
    chk.add("Ordinary-wallet volume never exceeds all-transfer volume on any day", not sub_issues, ", ".join(sub_issues[:5]))
    gap_issues = []
    if days:
        want = {(date.fromisoformat(first_day) + timedelta(i)).isoformat()
                for i in range((date.fromisoformat(last_day) - date.fromisoformat(first_day)).days + 1)}
        for chain, token in RAILS:
            have = set(daily_totals(bands, chain, token, "volume_usd"))
            if have and want - have:
                gap_issues.append(f"{chain} {token}: {len(want - have)} missing days")
    chk.add("Every rail has data for every day in the window", not gap_issues, "; ".join(gap_issues) or f"{len(days)} days")
    conc_bad = [c for c in conc_daily if not 0 <= c["top10_share"] <= 1]
    chk.add("Top-10 sender shares are between 0% and 100%", not conc_bad, f"{len(conc_daily)} daily rows")
    peg_bad = [p for p in peg if not 0.9 <= p["price"] <= 1.1]
    chk.add("Stablecoin prices are within $0.90–$1.10 (else the price feed is broken)", not peg_bad, f"{len(peg)} price rows")
    chk.add("Comparison has at least 5 comparable days in each window",
            all((e["all"]["baseline"]["days"] or 0) >= 5 and (e["all"]["post"]["days"] or 0) >= 5 for e in compare["rails"] if e["all"]["baseline"]["days"] is not None),
            ", ".join(f"{e['chain']} {e['token']}: {e['all']['baseline']['days']}/{e['all']['post']['days']} days" for e in compare["rails"][:1]))
    chk.add("Outlier days are flagged and left out of comparisons", True,
            ", ".join(f"{f['day']} ({f['chain']} {f['token']}, {f['multiple_of_median']}× median)" for f in flagged) or "none found")

    meta = {
        "sample": sample,
        "generated_at": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "baseline": [BASELINE_START.isoformat(), (POST_START - timedelta(days=1)).isoformat()],
        "post_start": POST_START.isoformat(),
        "first_day": first_day,
        "last_day": last_day,
        "tron_mode": TRON_MODE if not sample else "sample",
        "bands": BANDS,
        "missing": missing,
        "flagged_days": flagged,
        "checks": chk.items,
    }
    out = {"meta": meta, "compare": compare, "bands": bands, "wallet_bands": wallet_bands,
           "fees": fees, "concentration_daily": conc_daily, "peg": peg}

    for c in chk.items:
        print(f"  [{'PASS' if c['passed'] else 'FAIL'}] {c['name']}" + (f" ({c['detail']})" if c["detail"] else ""))
    if chk.failed:
        print(f"\nBUILD STOPPED: {len(chk.failed)} check(s) failed. monitor.json was NOT updated.")
        sys.exit(1)

    SITE_DATA.mkdir(parents=True, exist_ok=True)
    (SITE_DATA / "monitor.json").write_text(json.dumps(out, separators=(",", ":")), encoding="utf-8")
    print(f"monitor.json: {len(bands)} band rows, {len(wallet_bands)} wallet rows, {len(fees)} fee rows, "
          f"{len(conc_daily)} concentration rows, missing={missing or 'none'}")


if __name__ == "__main__":
    main(sample="--sample" in sys.argv)
