"""SYNTHETIC data so the site can be built and styled before real data arrives.

Every number this writes is made up. The site shows a red "SAMPLE DATA" banner whenever
meta.sample is true. Never publish or send a link while that banner is showing.

Usage:  python pipeline/make_sample_data.py   (writes data/raw/*.csv, then builds monitor.json with --sample)
"""
import csv
import random
from datetime import date, timedelta

import build_site_data
from config import BANDS, BASELINE_START, RAW

rng = random.Random(42)
END = date(2026, 11, 15)
SHARE = {"<1k": 0.03, "1k-10k": 0.09, "10k-100k": 0.23, "100k+": 0.65}
AVG = {"<1k": 220, "1k-10k": 3800, "10k-100k": 32000, "100k+": 610000}


def days():
    d = BASELINE_START
    while d <= END:
        yield d
        d += timedelta(days=1)


def write(name, fields, rows):
    with open(RAW / name, "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=fields); w.writeheader(); w.writerows(rows)


def main():
    RAW.mkdir(parents=True, exist_ok=True)
    eth, tron, fees, tfees, prices = [], [], [], [], []
    for d in days():
        for chain, rows, tokens, scale in (("eth", eth, ("USDT", "USDC"), 6e9), ("tron", tron, ("USDT",), 2.5e8)):
            for t in tokens:
                tot = scale * (0.7 if t == "USDC" else 1) * rng.uniform(0.8, 1.2)
                for b in BANDS:
                    vol = tot * SHARE[b] * rng.uniform(0.85, 1.15)
                    rows.append({"day": d.isoformat(), "token": t, "band": b,
                                 "transfers": int(vol / AVG[b]), "volume_usd": round(vol, 2)})
        for t in ("USDT", "USDC"):
            m = rng.uniform(0.0002, 0.0009)
            fees.append({"day": d.isoformat(), "token": t, "n_tx": rng.randint(40000, 90000),
                         "median_fee_eth": m, "p90_fee_eth": m * 3})
        tfees.append({"day": d.isoformat(), "n_tx": 200, "median_fee_trx": round(rng.uniform(0, 14), 3),
                      "p90_fee_trx": round(rng.uniform(13, 28), 3), "zero_burn_share": round(rng.uniform(0.3, 0.6), 3)})
        for s, base in (("USDT", 1.0), ("USDC", 1.0), ("EURC", 1.16), ("ETH", 3100), ("TRX", 0.29)):
            prices.append({"day": d.isoformat(), "symbol": s, "price_usd": round(base * rng.uniform(0.997, 1.003), 6)})
    write("eth_size_bands.csv", ["day", "token", "band", "transfers", "volume_usd"], eth)
    write("tron_size_bands.csv", ["day", "token", "band", "transfers", "volume_usd"], tron)
    write("eth_fees.csv", ["day", "token", "n_tx", "median_fee_eth", "p90_fee_eth"], fees)
    write("tron_fees.csv", ["day", "n_tx", "median_fee_trx", "p90_fee_trx", "zero_burn_share"], tfees)
    write("prices.csv", ["day", "symbol", "price_usd"], prices)
    write("eth_concentration.csv", ["chain", "token", "window", "top10_share", "senders"], [
        {"chain": "ethereum", "token": t, "window": w, "top10_share": round(rng.uniform(0.2, 0.4), 4),
         "senders": rng.randint(300000, 600000)} for t in ("USDT", "USDC") for w in ("baseline", "post")])
    build_site_data.main(sample=True)
    print("SAMPLE data written. Delete data/raw/*.csv before loading real data.")


if __name__ == "__main__":
    main()
