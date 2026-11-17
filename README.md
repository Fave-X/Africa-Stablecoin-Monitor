# Africa Stablecoin Rails Monitor

Stablecoin rails used for African payments (Tron USDT, Ethereum USDT/USDC), before and after Nigeria's CBN framework for non-security virtual assets took effect on **5 Nov 2026**. Public data, open method. Built by FaveDigitals (@FaveDigitalsHQ).

- **Live site:** https://fave-x.github.io/Africa-Stablecoin-Monitor/
- **Method, data checks and limits:** [METHOD.md](METHOD.md)
- **Cadence:** Issue #0 is a fixed snapshot (5 Oct – 15 Nov 2026). Data is refreshed per issue, not automatically.
- **Site:** `site/` (React + Vite + Chart.js + Tailwind), reads one file: `site/public/data/monitor.json`

## Folder map

```
queries/     SQL for BigQuery (00_checks first, always)
pipeline/    Python: prices, Tron sampling, build monitor.json, sample-data generator
data/raw/    CSVs from BigQuery / scripts (inputs to build_site_data.py)
registry/    labels.csv: tier-A operator addresses only (public)
reports/     issue-0, nigeria-receive-side, compliance-trace (Markdown, shown on the site)
site/        the website
```

## Run it (Windows, PowerShell)

**One-time setup**

```powershell
copy .env.example .env          # then paste your CoinGecko + TronGrid keys into .env
pip install -r pipeline/requirements.txt
cd site; npm install; cd ..
```

**1. Ethereum (BigQuery console, no install needed)**
Open console.cloud.google.com/bigquery, run `queries/00_checks.sql` first, then each of `10_`, `11_`, `13_`, `15_`. For each result: **Save results → CSV (local file)** and save into `data/raw/` with the name written at the top of the query (e.g. `eth_size_bands.csv`). Check the "This query will process…" estimate before every run.

**2. Tron** (one of these)
- Run `queries/20_tron_size_bands.sql` → save as `data/raw/tron_size_bands.csv`, and `queries/21_tron_wallets_daily.sql` → `data/raw/tron_wallets_daily.csv`. Keep `TRON_MODE=bigquery` in `.env`.
- Otherwise (default): `python pipeline/tron_sample.py --days 2` to test, then `python pipeline/tron_sample.py` for the full window.

The Tron fee file (`tron_fees.csv`) always comes from `tron_sample.py`.

**3. Prices**

```powershell
python pipeline/fetch_prices.py
```

**4. Build the site data and look at it**

```powershell
python pipeline/build_site_data.py   # prints PASS/FAIL for every data check; stops on any FAIL
cd site; npm run dev            # open the localhost link it prints
```

`npm run build` (and the GitHub Pages deploy) re-checks the data first and refuses to publish if anything fails.

The red **SAMPLE DATA** banner must be gone before you share any link. It appears only when the data came from `make_sample_data.py`.

## Deploy (GitHub Pages)

One time: repo **Settings → Pages → Source: GitHub Actions**. After that, every push to `main` runs `.github/workflows/deploy-pages.yml`, which checks the data, builds with the right base path and publishes to **https://fave-x.github.io/Africa-Stablecoin-Monitor/** (the path is case-sensitive).

## Refresh

Per issue: re-run steps 1–4, commit `data/raw/*.csv` and `site/public/data/monitor.json`, push. If headline numbers change, regenerate `site/public/og.png` (the link-preview image) so it matches.

## Preview with synthetic data

```powershell
python pipeline/make_sample_data.py   # fills data/raw with made-up numbers + red banner
```

Delete `data/raw/*.csv` before loading real data.
