# Issue #0: Dollar rails around Nigeria's CBN framework

**What moved, what it costs, and what the chain can't see.**

Favour Tabugbo (FaveDigitals) · 17 November 2026

**Windows:** 5 Oct – 4 Nov 2026 (31 days) vs 5 – 15 Nov 2026 (11 days). Nigeria's CBN framework for virtual-asset service providers took effect on 5 Nov.

**Data:** Ethereum and Tron transfers from Google BigQuery public datasets, Tron fees from TronGrid (200 random USDT transfers a day), prices from CoinGecko. Every chart is on the [monitor](#/), and every definition is on the [method page](#/method).

## In short

- **On Tron, the fee depends on how the sender is set up, not on the market.** About half of USDT transfers pay nothing. A sender with nothing staked pays about $1.85, roughly 25 times the $0.07 median on Ethereum.
- **Headline volume fell; ordinary wallets mostly didn't.** Ethereum USDT volume fell 45% after 5 Nov. With exchanges, bots and contracts removed, it fell 17%, and the number of wallet-to-wallet transfers rose 3%.
- **Payments are small, but the value is in big transfers.** 82% of wallet-to-wallet USDT transfers are under $1,000, yet 96% of the value moves in transfers of $10,000 or more.

## 1. On Tron, cost is a setup decision

A USDT transfer on Tron needs energy and bandwidth. A sender who has staked or rented them pays nothing. A sender who hasn't pays in TRX. The daily sample shows three fixed prices, not a spread:

| Sender setup | Fee per transfer | Share of transfers |
|---|---|---|
| Energy and bandwidth covered | 0 TRX | about 50% (50.5% before 5 Nov, 49.5% after) |
| Energy covered, bandwidth burned | about 0.345 TRX (≈ $0.10) | most of the rest |
| Nothing staked | about 6.43 TRX (≈ $1.85) | the remainder |

The full-burn price fell from $2.12 to $1.85 after 5 Nov. The TRX amount didn't change; TRX itself fell about 9%. A transfer to an address that has never held USDT needs roughly twice the energy, so it costs about twice as much.

On Ethereum, the median fee for a plain `transfer()` call was $0.075 before 5 Nov and $0.069 after.

**Why it matters:** an operator making 1,000 USDT payouts a day from wallets with nothing staked spends about $1,850 a day on Tron, against about $70 on Ethereum. That's roughly $675,000 a year. Staked or rented energy brings the Tron figure close to zero. Most people still call Tron "the cheap chain", but at list price it's now the expensive one. What decides the cost is the treasury setup.

## 2. Headline volume fell, ordinary wallets held up

| Average daily volume | Before 5 Nov | After 5 Nov | Change |
|---|---|---|---|
| Ethereum USDT, all transfers | $24.43B | $13.49B | −45% |
| Ethereum USDT, ordinary wallets | $1.72B | $1.42B | −17% |
| Ethereum USDC, all transfers | $42.25B | $28.53B | −32% |
| Ethereum USDC, ordinary wallets | $2.58B | $1.90B | −26% |
| Tron USDT, all transfers | $25.77B | $23.65B | −8% |

"Ordinary wallets" means transfers where neither side is a smart contract, and neither side made 1,000 or more USDT/USDC transfers in the window. That filter removes DEX pools, bridges, bots, exchange hot wallets and market makers. What's left sends 20% of Ethereum USDT transfers but only about 11% of its volume.

Concentration fell at the same time. The ten largest senders moved 49% of Ethereum USDT volume before 5 Nov and 33% after; for USDC the figures are 62% and 50%.

**The reading:** most of the drop in headline volume came from large institutional flows, not from people. Tron USDT, the rail most widely used for dollar transfers in Africa, fell only 8%.

## 3. Payments are small, but the value is in big transfers

Among ordinary wallets after 5 Nov, 82% of USDT transfers were under $1,000, but those transfers carried less than 1% of the value. Transfers of $10,000 or more carried 96% of it.

These are two different businesses on the same chain:

- **Many small payouts.** Here the per-transfer fee from section 1 decides the margin.
- **A few large treasury moves.** Here the fee hardly matters; settlement time, counterparty and compliance checks do.

## What an operator could do with this

1. **Price Tron with staking in mind.** Stake or rent energy for payout wallets, and check how many payouts go to first-time addresses, since those cost about twice as much.
2. **Route by ticket size.** Treat small payouts and large treasury moves as separate flows with separate cost and risk rules.
3. **Track wallet-level activity, not headline volume.** Headline volume is mostly exchange and market-maker churn, and it can swing 45% while real users barely move.

## What this can't tell you

- **The chain has no country field.** These are the rails Nigerian businesses use, not Nigerian volume.
- **The fiat side is invisible.** Naira payouts, bank transfers, exchange netting and P2P trades never touch the chain.
- **The wallet filter is a rule of thumb.** Exchange deposit addresses and some smart-account wallets can still pass it.
- **Eleven days show change, not cause.** Global market conditions also moved after 5 Nov, so none of this proves the CBN framework caused it.

## What would make it precise

With an operator's own settlement transaction hashes (no customer data needed), the on-chain leg can be matched to internal records. That would give:

- corridor-level volume;
- the true all-in cost per payout, including energy;
- time to settle;
- the share of payouts going to first-time addresses;
- how stablecoin and bank rails split by ticket size.

That's about two weeks of work, and it turns every estimate here into a number the business can run on.

*Not financial or legal advice. Queries and code are in the [source repository](https://github.com/Fave-X/africa-stablecoin-monitor).*
