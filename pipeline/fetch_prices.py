"""Daily USD prices from CoinGecko → data/raw/prices.csv (day, symbol, price_usd).

Usage:  python pipeline/fetch_prices.py
Needs:  COINGECKO_API_KEY in .env (free demo key)
"""
import csv
import time
from datetime import datetime, timedelta, timezone

import requests

from config import BASELINE_START, COINGECKO_API_KEY, COINGECKO_IDS, RAW

BASE = "https://api.coingecko.com/api/v3"


def daily_prices(coin_id: str, start: datetime, end: datetime) -> dict:
    r = requests.get(
        f"{BASE}/coins/{coin_id}/market_chart/range",
        params={"vs_currency": "usd", "from": int(start.timestamp()), "to": int(end.timestamp())},
        headers={"x-cg-demo-api-key": COINGECKO_API_KEY} if COINGECKO_API_KEY else {},
        timeout=30,
    )
    r.raise_for_status()
    out = {}
    for ms, price in r.json().get("prices", []):
        day = datetime.fromtimestamp(ms / 1000, tz=timezone.utc).date().isoformat()
        out[day] = price  # last point of the day wins → close-ish
    return out


def main() -> None:
    RAW.mkdir(parents=True, exist_ok=True)
    start = datetime.combine(BASELINE_START, datetime.min.time(), tzinfo=timezone.utc) - timedelta(days=1)
    end = datetime.now(timezone.utc)
    rows = []
    for coin_id, symbol in COINGECKO_IDS.items():
        prices = daily_prices(coin_id, start, end)
        rows += [{"day": d, "symbol": symbol, "price_usd": round(p, 6)} for d, p in sorted(prices.items())]
        print(f"{symbol}: {len(prices)} days")
        time.sleep(2.5)  # stay well inside the free rate limit
    with open(RAW / "prices.csv", "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=["day", "symbol", "price_usd"])
        w.writeheader()
        w.writerows(rows)
    print(f"Wrote {len(rows)} rows → data/raw/prices.csv")


if __name__ == "__main__":
    main()
