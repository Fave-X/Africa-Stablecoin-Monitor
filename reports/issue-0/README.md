# Issue #0: After Nigeria's CBN framework, more dollar transfers moved, not fewer

**Stablecoin rails before and after 5 November 2026: what moved, what it costs, and what the chain can't see.**

Favour Tabugbo (FaveDigitals) · 17 November 2026

**Windows:** 5 Oct – 4 Nov 2026 vs 5 – 15 Nov 2026. Nigeria's CBN framework for virtual-asset service providers took effect on 5 Nov.

**How it's compared:** average weekday against average weekday, with outlier days flagged and left out (section 3 shows why that matters). Every number on the [monitor](#/) passes ten automatic data checks before the site can build; the checks and every definition are on the [method page](#/method).

**Data:** Ethereum and Tron transfers from Google BigQuery public datasets, Tron fees from TronGrid (200 random USDT transfers a day), prices from CoinGecko.

## In short

- **More transfers, less value.** On Ethereum, USDT transfers rose 12% after 5 Nov while the value they carried fell 15%. Tron USDT, the rail most widely used for dollar transfers in Africa, held flat.
- **The pullback was big money, not people.** With exchanges, bots and contracts removed, Ethereum USDT value fell only 4%, and wallet-to-wallet transfers rose 12%. On Tron, where ordinary wallets carry 58% of the value (11% on Ethereum), wallet value rose 3%.
- **On Tron, cost is a setup choice.** Per $1,000 moved at a $10k ticket: $0.007 on Ethereum, $0.19 on Tron with nothing staked, $0 with staked energy. That's the network fee only; FX margin and fiat legs aren't on-chain.

## 1. More transfers, less value

| Average weekday | Transfers before | Transfers after | Change | Value before | Value after | Change |
|---|---|---|---|---|---|---|
| Ethereum USDT | 603,682 | 675,677 | +11.9% | $19.8B | $16.9B | −14.8% |
| Tron USDT | 2,400,580 | 2,433,677 | +1.4% | $30.5B | $30.1B | −1.4% |
| Ethereum USDC | 548,002 | 569,968 | +4.0% | $41.1B | $34.7B | −15.7% |

On Ethereum, more transfers carried less value, so the average transfer got smaller. Tron moves four times as many USDT transfers as Ethereum and barely changed on either measure.

## 2. The pullback was big money, not people

"Ordinary wallets" means transfers where neither side made 1,000 or more USDT/USDC transfers in the window, and, on Ethereum, neither side is a smart contract. That removes exchange hot wallets, market makers, payment processors, bots, DEX pools and bridges. Tron has no public contract list, so its filter is activity-based only.

| Ordinary wallets, average weekday | Value before | Value after | Value change | Transfers change | Share of rail's value (after) |
|---|---|---|---|---|---|
| Ethereum USDT | $1.97B | $1.90B | −3.8% | +11.8% | 11% |
| Tron USDT | $16.95B | $17.51B | +3.3% | +2.8% | **58%** |
| Ethereum USDC | $3.04B | $2.49B | −18.0% | +6.6% | 7% |

Two things stand out:

- **For Ethereum USDT, nearly all of the 15% drop came from large institutional flows.** Ordinary wallets moved about the same value as before, in more transfers. USDC is the exception: its wallet-level value fell as much as the headline.
- **The two rails are different businesses.** On Ethereum, ordinary wallets move 11% of USDT value; the rest is exchanges and contracts moving liquidity. On Tron they move 58%, and that value grew after 5 Nov. If you want to see wallet-to-wallet dollar payments, Tron is where they are.

The same split shows up in who sends the money. On an average weekday, the 10 largest senders move:

| Top-10 senders' share of value | Before 5 Nov | After 5 Nov |
|---|---|---|
| Ethereum USDT | 45.8% | 34.7% |
| Ethereum USDC | 56.7% | 49.2% |
| Tron USDT | 10.5% | 9.5% |

Ethereum got less concentrated as big-ticket flows pulled back. Tron was already spread across many senders and stayed that way.

## 3. One Saturday can rewrite the story

On Saturday 17 October, Ethereum USDT moved **$169.7B**, 9.8 times a normal day, almost all of it in transfers of $100k or more. Ordinary wallets were quiet that day.

**What it was:** flash-loan loops, not payments. Fifteen address pairs, every one of them contracts, carried 87% of the day's $100k+ volume, all between 05:43 and 09:53 UTC. In a typical transaction, a bot contract borrowed 40,000,000 USDT from [Morpho Blue](https://docs.morpho.org/get-started/resources/addresses/) as a flash loan, moved it in and out of the address Etherscan labels "BiFi Finance: USDT Wallet" dozens of times in $1.5M–$2M pieces (76 token transfers in one transaction), repaid the loan in the same transaction, and kept about $0.90. A few hundred transactions like that produce a $170B day without a single dollar changing owners. ([Sample transaction](https://etherscan.io/tx/0x60685d0142d6dde4c8a78c6e063a1f62853bcca113fafaa25ed53cc2f4e70b0e).)

It's flagged on the monitor and left out of every comparison, along with two smaller spikes (7 Oct and 3 Nov), which haven't been investigated yet.

It matters because the method decides the headline:

| Ethereum USDT, change in daily value after 5 Nov | |
|---|---|
| All days, nothing removed | −44.8% |
| Weekdays only | −21.5% |
| **Weekdays, flagged days removed (used here)** | **−14.8%** |
| Median day | −17.5% |

Every version says Ethereum value fell and Tron held. Only the size of the Ethereum drop moves. A naive average would have reported a 45% collapse.

## 4. On Tron, cost is a setup choice

A USDT transfer on Tron needs energy and bandwidth. The daily fee sample shows three fixed prices, not a spread:

| Sender setup | Fee per transfer | Share of transfers since 5 Nov |
|---|---|---|
| Energy and bandwidth staked | 0 TRX | about 49% |
| Energy covered, bandwidth burned | about 0.345 TRX (≈ $0.10) | most of the rest |
| Nothing staked | about 6.43 TRX (≈ $1.85) | the remainder |

On Ethereum, the median fee for a plain `transfer()` call since 5 Nov is $0.069.

| Per $1,000 moved, at a $10k ticket | |
|---|---|
| Ethereum USDT | $0.007 |
| Tron USDT, nothing staked | $0.19 |
| Tron USDT, energy staked | $0.00 |

**Why it matters:** an operator making 1,000 USDT payouts a day from wallets with nothing staked pays about $1,850 a day on Tron, against about $70 on Ethereum. That's roughly $650,000 a year, and staking or renting energy closes almost all of it. A transfer to an address that has never held USDT needs about twice the energy, so first-time recipients cost about twice as much.

**What this isn't:** network fees are the smallest part of a corridor's cost. FX margin, off-ramp fees and bank charges aren't on-chain and aren't counted here.

## 5. Payments are small, the value is in big transfers

Among ordinary wallets after 5 Nov, 82% of Ethereum USDT transfers were under $1,000, but they carried less than 1% of the value. Transfers of $10,000 or more carried 96% of it.

That's two businesses on one rail:

- **Many small payouts.** The per-transfer fee from section 4 decides the margin.
- **A few large treasury moves.** The fee hardly matters; settlement time, counterparty and compliance checks do.

## What an operator could do with this

1. **Price Tron with staking in mind.** Stake or rent energy for payout wallets, and track how many payouts go to first-time addresses.
2. **Route by ticket size.** Treat small payouts and large treasury moves as separate flows with separate cost and risk rules.
3. **Watch wallet-level activity, not headline volume.** Headline volume is mostly exchange, market-maker and bot churn; one Saturday of flash-loan loops swung a monthly average by 30 points.

## What this can't tell you

- **Two chains so far.** This issue covers Ethereum and Tron. BNB Smart Chain and Solana, the other rails Nigerians use most, come in Issue #1.
- **The chain has no country field.** These are the rails Nigerian businesses use, not Nigerian volume.
- **The fiat side is invisible.** Naira payouts, bank transfers, exchange netting and P2P trades never touch the chain.
- **The wallet filter is a rule of thumb.** Exchange deposit addresses and some smart-account wallets can still pass it, and Tron has no public contract list.
- **This is an early read, not a cause.** Seven comparable weekdays after 5 Nov show what changed, not why.

## What would make it precise

With an operator's own settlement transaction hashes (no customer data needed), the on-chain leg can be matched to internal records. That gives:

- corridor-level volume;
- the true all-in cost per payout, including energy;
- time to settle;
- the share of payouts going to first-time addresses;
- how stablecoin and bank rails split by ticket size.

That's about two weeks of work, and it turns every estimate here into a number the business can run on.

*Not financial or legal advice. Queries and code: [source repository](https://github.com/Fave-X/Africa-Stablecoin-Monitor).*
