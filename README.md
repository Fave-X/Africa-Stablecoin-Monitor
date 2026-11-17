# Africa Stablecoin Rails Monitor

Stablecoin rails used for African payments (Tron USDT, Ethereum USDT/USDC), before and after Nigeria's CBN framework for non-security virtual assets took effect on **5 Nov 2026**. Public data, open method. Built by FaveDigitals (@FaveDigitalsHQ).

- **Method and limits:** [METHOD.md](METHOD.md)
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
Open console.cloud.google.com/bigquery, run `queries/00_checks.sql` first, then each of `10_`, `11_`, `12_`. For each result: **Save results → CSV (local file)** and save into `data/raw/` with the name written at the top of the query (e.g. `eth_size_bands.csv`). Check the "This query will process…" estimate before every run.

**2. Tron** (one of these)
- If check D was cheap: run `queries/20_tron_size_bands.sql` → save as `data/raw/tron_size_bands.csv`, set `TRON_MODE=bigquery` in `.env`.
- Otherwise (default): `python pipeline/tron_sample.py --days 2` to test, then `python pipeline/tron_sample.py` for the full window.

The Tron fee file (`tron_fees.csv`) always comes from `tron_sample.py`.

**3. Prices**

```powershell
python pipeline/fetch_prices.py
```

**4. Build the site data and look at it**

```powershell
python pipeline/build_site_data.py
cd site; npm run dev            # open the localhost link it prints
```

The red **SAMPLE DATA** banner must be gone before you share any link. It appears only when the data came from `make_sample_data.py`.

## Deploy

**Vercel (sprint default):** New Project → import this repo → **Root Directory: `site`** → Framework: Vite → Deploy. Every push redeploys.

**GitHub Pages (later):** repo Settings → Pages → Source: **GitHub Actions**. `.github/workflows/deploy-pages.yml` builds with the right base path and publishes to `https://fave-x.github.io/africa-stablecoin-monitor/`.

## Refresh

Re-run steps 1–4, commit `data/raw/*.csv` and `site/public/data/monitor.json`, push. The "built" timestamp on the site updates itself.

## Preview with synthetic data

```powershell
python pipeline/make_sample_data.py   # fills data/raw with made-up numbers + red banner
```

Delete `data/raw/*.csv` before loading real data.
