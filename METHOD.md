# Method

How every number on the Africa Stablecoin Rails Monitor is produced, and what it cannot tell you.

**Author:** FaveDigitals (@FaveDigitalsHQ)
**Status:** Issue #0, a fixed snapshot of 5 Oct – 15 Nov 2026. Refreshed per issue, not live.

---

## 1. Question

How did activity and cost on the main stablecoin rails used for African payments change after the Central Bank of Nigeria's framework for non-security virtual assets took effect on **5 November 2026**?

## 2. Windows

| Window | Dates (UTC) | Why |
| --- | --- | --- |
| Baseline | 5 Oct 2026 – 4 Nov 2026 | 31 days before the framework took effect |
| Post | 5 Nov 2026 – cutoff (shown on every chart) | From the effective date onward |

### Comparison rule (applies to every before/after figure)

Before/after figures compare the **average weekday (Mon–Fri)** in each window and **leave out flagged outlier days**. Two reasons:

- **Day-of-week mix.** The baseline is 26% weekend days; the first post window (5–15 Nov) is 36%. Weekends are quieter, so comparing all days biases the post window downward.
- **Outliers.** One Saturday (17 Oct) moved $169.7B of Ethereum USDT, 9.8× a normal day. Left in, it alone turns a 15% drop into a 45% drop.

**Outlier rule:** a day is flagged when a rail moves more than **3× its median day** in the window. Flagged days are marked on the daily-volume chart and listed on the page. Current flags: 7 Oct (Ethereum USDT, 3.3×), 17 Oct (Ethereum USDT, 9.8×), 3 Nov (Ethereum USDC, 3.2×).

**17 Oct, investigated** (`queries/14_eth_oct17_forensics.sql` + Etherscan): 15 address pairs, all contracts, carried 87% of the day's $100k+ volume between 05:43 and 09:53 UTC. Bot contracts took $40M USDT flash loans from Morpho Blue, cycled the funds in and out of the address Etherscan labels "BiFi Finance: USDT Wallet" dozens of times per transaction, and repaid in the same transaction. The same dollars were counted thousands of times; no value changed owners. 7 Oct and 3 Nov are flagged by the rule but not yet investigated.

**Sensitivity: change in daily value after 5 Nov under each choice**

| Rail | All days | All days, flags out | Weekdays | **Weekdays, flags out (used)** | Median day |
| --- | --- | --- | --- | --- | --- |
| Ethereum USDT | −44.8% | −25.9% | −21.5% | **−14.8%** | −17.5% |
| Tron USDT | −8.2% | −8.7% | −1.4% | **−1.4%** | −1.9% |
| Ethereum USDC | −32.5% | −28.8% | −20.9% | **−15.7%** | −26.2% |

The direction is the same under every choice; only the size of the Ethereum drop depends on it. With 7 comparable post weekdays so far, treat every change as an early read.

The CBN's transition rules (Section 54 of the [Regulations](https://www.cbn.gov.ng/Out/2026/CCD/REGULATIONS%20FOR%20THE%20OPERATIONS%20OF%20NON-SECURITY%20VIRTUAL%20ASSETS%20IN%20NIGERIA.pdf)) give existing operators three deadlines: register within 30 days (by 5 Dec 2026), start supervisory reporting within 60 days, and submit a complete licence application within 180 days (by about 4 May 2027). Issue #1 extends the post window past the 5 Dec registration deadline.

## 3. Rails and tokens

| Chain | Token | Contract | Decimals |
| --- | --- | --- | --- |
| Ethereum | USDT | `0xdac17f958d2ee523a2206206994597c13d831ec7` | 6 |
| Ethereum | USDC | `0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48` | 6 |
| Tron | USDT | `TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t` (hex `0xa614f803b6fd780986a42c78ec9c7f77e6ded13c`) | 6 |

Each contract address is checked on Etherscan / Tronscan before a run. Stablecoin amounts are treated as USD at face value; peg deviation is reported separately (section 7).

## 4. Data sources

| Data | Source | Coverage |
| --- | --- | --- |
| Ethereum transfers and fees | Google BigQuery public datasets (`bigquery-public-data.crypto_ethereum`) | Full, every transfer in the window |
| Tron USDT transfers | BigQuery `bigquery-public-data.goog_blockchain_tron_mainnet_us.logs` | Full, every transfer in the window (fallback: TronGrid sampling, recorded as `tron_mode`) |
| Tron fees | TronGrid `gettransactioninfobyid` on a random sample of transfers | Sampled |
| Prices | CoinGecko API, daily close | USDT, USDC, EURC, ETH, TRX |

**If Tron is sampled:** two fixed windows per day (default 09:00–09:10 and 15:00–15:10 UTC). Sampled Tron data is used for *shares and distributions only* (size-band shares, medians). It is never scaled up into totals.

## 5. Definitions

- **Transfer:** one `Transfer` event of the token contract. Mints and burns (from or to the zero address) are excluded.
- **Size bands (USD):** `<1k`, `1k–10k`, `10k–100k`, `100k+`. Transfers of $10k or more are called **business-sized**. That is a proxy, not proof that a business sent them.
- **Fee per transfer (Ethereum):** `receipt_gas_used × receipt_effective_gas_price`, in ETH, converted at that day's ETH price. Only transactions sent directly to the token contract are counted, so DEX swaps and batch contracts don't distort the fee.
- **Cost per $1,000 moved:** the median fee of one plain transfer since 5 Nov, at a $10,000 ticket, divided by 10. Network fees don't scale with the amount sent, so bigger tickets cost less per $1,000.
- **Network fee is not all-in cost.** FX margin, off-ramp and on-ramp fees, bank transfer charges and P2P spreads are not on-chain and are not included anywhere on the site.
- **Fee per transfer (Tron):** TRX burned per transaction (`fee` field), converted at that day's TRX price. Tron fees sit on fixed tiers: 0 TRX (energy and bandwidth staked), ~0.345 TRX (bandwidth only) and ~6.43 TRX (full energy burn, nothing staked). The site shows the full-burn tier (the 90th percentile of each day's sample, which sits on that tier every day) and reports the zero-burn share beside it.
- **Ordinary wallets:** transfers where neither side made 1,000+ USDT/USDC transfers in the window (removes exchange hot wallets, market makers, payment processors and bots). On Ethereum, neither side may be a smart contract either (`crypto_ethereum.contracts`); Tron has no public contract list, so its filter is activity-based only.
- **Concentration:** share of each day's volume sent by that day's 10 largest sending addresses, averaged over comparable weekdays. No labels needed.
- **Peg flag:** a day whose CoinGecko price is 0.5% or more away from $1.00 (EURC: away from that day's EUR/USD, if used).

## 6. Data checks (run on every build)

The pipeline (`pipeline/build_site_data.py`) runs these checks and **refuses to write the site data if any fails**. The site build (`site/scripts/check-data.mjs`) re-checks the printed figures and **refuses to publish** if anything is off, so a broken number can't reach the live page. Results are stored in `monitor.json → meta.checks`; the live page shows how many passed.

1. Fees are zero or positive.
2. Tron zero-burn share is between 0% and 100%.
3. Volumes and transfer counts are zero or positive.
4. Size-band shares are each 0–100% and sum to 100%.
5. Ordinary-wallet volume never exceeds all-transfer volume on any day.
6. Every rail has data for every day in the window (no silent gaps).
7. Top-10 sender shares are between 0% and 100%.
8. Stablecoin prices are within $0.90–$1.10 (outside that, the price feed is broken).
9. The comparison has at least 5 comparable days in each window.
10. Outlier days are flagged and left out of comparisons (and listed).

The site also refuses to build from synthetic sample data.

## 7. Labels

`registry/labels.csv` holds addresses linked to named operators.

| Tier | Evidence | Published? |
| --- | --- | --- |
| A | Address published by the operator itself (docs, website, official post) | Yes |
| B | Reputable third-party label | No, private file only |
| C | Heuristic | No, private file only |

The Nigeria-labelled subset only appears when enough tier-A addresses exist. Otherwise the monitor reports rail-level data only, and says so.

## 8. Limits

Read these before quoting any number.

1. **The chain has no country field.** Rail-level data shows global flows on rails that Nigerian businesses use. It is not Nigerian volume.
2. **Fiat legs are invisible.** Naira payouts, bank transfers, exchanges' internal netting and self-custody P2P trades don't appear on-chain.
3. **Size is a proxy.** A $50k transfer can be one person; a business can split payments into small transfers.
4. **Timing is not causation.** A few weeks of data after 5 Nov shows what changed, not why it changed.
5. **Network fee is not all-in cost.** FX margin and fiat legs are invisible.
6. **No company's own flows can be identified** without labels that company provides.
7. **Tron sampling** (if used) gives shares and distributions, not totals.
8. **Sources can lag or change.** The site shows the data window and build time.
9. **Refresh is manual.** Issue #0 is a fixed snapshot (5 Oct – 15 Nov 2026). The BigQuery steps need a signed-in Google account, so the data is refreshed per issue, not automatically.

## 9. Reproduce it

See `README.md`. Every chart is generated from the queries in `queries/` and the scripts in `pipeline/`. Nothing is edited by hand.
