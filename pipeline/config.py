"""Shared settings. Secrets come from .env (never committed)."""
import os
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
RAW = ROOT / "data" / "raw"
SITE_DATA = ROOT / "site" / "public" / "data"


def _load_env() -> None:
    env = ROOT / ".env"
    if env.exists():
        for line in env.read_text(encoding="utf-8").splitlines():
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                k, v = line.split("=", 1)
                os.environ.setdefault(k.strip(), v.strip())


_load_env()

COINGECKO_API_KEY = os.getenv("COINGECKO_API_KEY", "")
TRONGRID_API_KEY = os.getenv("TRONGRID_API_KEY", "")
TRON_MODE = os.getenv("TRON_MODE", "bigquery")  # "bigquery" (full) or "sampled" (TronGrid fallback)

BASELINE_START = date(2026, 10, 5)
POST_START = date(2026, 11, 5)  # CBN framework effective date

BANDS = ["<1k", "1k-10k", "10k-100k", "100k+"]
BAND_EDGES = [1_000, 10_000, 100_000]

USDT_TRON = "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t"

COINGECKO_IDS = {
    "tether": "USDT",
    "usd-coin": "USDC",
    "euro-coin": "EURC",
    "ethereum": "ETH",
    "tron": "TRX",
}

# Tron sampling: two fixed windows per day (UTC hour, minutes long)
TRON_SAMPLE_WINDOWS = [(9, 10), (15, 10)]
TRON_FEE_SAMPLE_PER_DAY = 200

PEG_FLAG = 0.005  # 0.5%


def band_of(amount: float) -> str:
    for edge, name in zip(BAND_EDGES, BANDS):
        if amount < edge:
            return name
    return BANDS[-1]
