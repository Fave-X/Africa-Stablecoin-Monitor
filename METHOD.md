# Method

How every number on the Africa Stablecoin Rails Monitor is produced, and what it cannot tell you.

**Author:** FaveDigitals (@FaveDigitalsHQ)
**Status:** Issue #0. Each chart shows its own date range.

---

## 1. Question

How did activity and cost on the main stablecoin rails used for African payments change after the Central Bank of Nigeria's framework for non-security virtual assets took effect on **5 November 2026**?

## 2. Windows

| Window | Dates (UTC) | Why |
| --- | --- | --- |
| Baseline | 5 Oct 2026 – 4 Nov 2026 | 31 days before the framework took effect |
| Post | 5 Nov 2026 – cutoff (shown on every chart) | From the effective date onward |

The 30-day registration deadline for existing operators is 5 Dec 2026. Issue #1 extends the post window past it.

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
- **Cost to move $10,000:** the median fee of one plain transfer that day. On these rails, network fees don't scale with the amount sent.
- **Fee per transfer (Tron):** TRX burned per transaction (`fee` field), converted at that day's TRX price. Many senders pay with staked energy and burn nothing; the share of zero-burn transfers is reported next to the median.
- **Concentration:** share of window volume sent by the 10 largest sending addresses. No labels needed.
- **Peg flag:** a day whose CoinGecko price is 0.5% or more away from $1.00 (EURC: away from that day's EUR/USD, if used).

## 6. Labels

`registry/labels.csv` holds addresses linked to named operators.

| Tier | Evidence | Published? |
| --- | --- | --- |
| A | Address published by the operator itself (docs, website, official post) | Yes |
| B | Reputable third-party label | No, private file only |
| C | Heuristic | No, private file only |

The Nigeria-labelled subset only appears when enough tier-A addresses exist. Otherwise the monitor reports rail-level data only, and says so.

## 7. Limits

Read these before quoting any number.

1. **The chain has no country field.** Rail-level data shows global flows on rails that Nigerian businesses use. It is not Nigerian volume.
2. **Fiat legs are invisible.** Naira payouts, bank transfers, exchanges' internal netting and self-custody P2P trades don't appear on-chain.
3. **Size is a proxy.** A $50k transfer can be one person; a business can split payments into small transfers.
4. **Timing is not causation.** A few weeks of data after 5 Nov shows what changed, not why it changed.
5. **No company's own flows can be identified** without labels that company provides.
6. **Tron sampling** (if used) gives shares and distributions, not totals.
7. **Sources can lag or change.** Every run records the maximum block timestamp it saw in `data/meta.json`.

## 8. Reproduce it

See `README.md`. Every chart is generated from the queries in `queries/` and the scripts in `pipeline/`. Nothing is edited by hand.
