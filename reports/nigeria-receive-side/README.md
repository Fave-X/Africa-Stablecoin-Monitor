# Nigeria, receive side: what a recipient wallet would walk into

**The corridor, the cost of $200, the naira-only payout rule, and what small digital-dollar transfers did after 5 November.**

FaveDigitals · 20 November 2026

**Scope:** money sent to families in Nigeria, seen from the receiving end. Desk research from the Central Bank of Nigeria (CBN), the World Bank and the Nigerian press, plus Ethereum and Tron data from the [monitor](#/). Regulatory points are a reading of public documents, not legal advice.

## In short

- **The corridor is big and formal channels pay naira only.** Nigeria received about $22 billion in remittances in 2025. Since 1 May 2026, licensed money transfer operators must pay recipients in naira, through a bank account or as cash.
- **Recipients who want to hold dollars now do it outside the licensed remittance channel.** One visible route is stablecoins: Tron alone carries about 1.58 million USDT transfers under $1,000 every weekday, averaging $220, and that count rose after 5 November.
- **So the first question for any recipient wallet in Nigeria is what it holds and under which licence.** The new CBN rules on stablecoins make that question sharper, and the answer decides whether a "keep your balance" product works here.

## 1. The corridor

Nigeria received **$21.8 billion** in remittances in 2025 by the CBN's count ([Vanguard](https://www.vanguardngr.com/?p=2883411)) and **$22.8 billion** by the World Bank's ([Intelpoint](https://intelpoint.co/insights/personal-remittance-inflows-to-nigeria-increased-3-0-year-on-year-from-22-1-billion-in-2024-to-22-8-billion-in-2025/)). It's the largest recipient in Sub-Saharan Africa. The CBN says flows through official channels reached about **$600 million a month** and is targeting $1 billion a month by the end of 2026 ([Nairametrics](https://nairametrics.com/2026/07/16/cbn-targets-1-billion-monthly-diaspora-remittances-by-year-end-as-reserves-climb/)).

The **United States and United Kingdom** are the largest sending countries. Published estimates of each country's exact share disagree, so this brief doesn't give one.

The CBN's 2025 list showed **108 licensed money transfer operators (IMTOs)** with commercial approval. 45% are incorporated in Nigeria, 33% in the UK, 9% in the US and 7% in Canada ([Condia](https://thecondia.com/cbn-list-imto-108-2025/)). Stablecoin-based firms are among them: NALA got its IMTO licence and a direct link to NIBSS, Nigeria's interbank switch, this year ([TechCabal](https://techcabal.com/?p=184101)).

For a company selling white-label wallets to MTOs, that UK-heavy list of licensed operators is the customer map.

## 2. What sending $200 costs

| Route | Cost of sending $200 | Source |
|---|---|---|
| Average, all of Sub-Saharan Africa (Q3 2025) | 8.46% (about $16.92) | [African Exponent, World Bank data](https://www.africanexponent.com/chart-of-the-day-sending-200-home-to-sub-saharan-africa-costs-8-46-percent/) |
| Average, UK to Nigeria (Q3 2025) | 1.96% | [Pryme, World Bank data](https://www.mypryme.com/blog/send-money-nigeria-from-uk) |
| Individual providers, US to Nigeria | from 0.28% to 6.01% | [World Bank RPW](https://remittanceprices.worldbank.org/corridor/United%20States/Nigeria?order=field_cc1_fee&sort=desc) |
| USDT on Ethereum, network fee only | about $0.07 (0.035%) | [Monitor](#/) |
| USDT on Tron, sender with staked energy | $0 | [Monitor](#/) |
| USDT on Tron, nothing staked | about $1.85 (0.9%) | [Monitor](#/) |

Nigeria is already one of the cheaper corridors into Africa for a $200 transfer, because competition among licensed digital operators has pushed costs down. The stablecoin rows show the network fee only. Buying the dollars, and turning them into naira at the end, adds a spread that the chain can't see.

So for Nigerian recipients, a cheaper transfer fee isn't the main gap a new product can fill. The gap is what happens to the money after it arrives.

## 3. How the money reaches families now

The CBN's rules for licensed operators, in force since **1 May 2026**:

- **Naira only.** Recipients get naira, converted at the market rate on the day. This ended decades of dollar payouts ([BusinessDay](https://businessday.ng/?p=1111112)).
- **Through a naira settlement account.** Every payout runs through the operator's naira settlement account at a licensed bank ([Mondaq](https://www.mondaq.com/nigeria/financial-services/1792840/routing-remittances-through-regulated-channels-the-cbns-new-directive-to-imtos)).
- **Bank account above $200.** Cash pickup is allowed with ID, but payouts above the equivalent of $200 must go to a bank account ([Techeconomy](https://techeconomy.ng/what-cbn-naira-only-remittance-policy-means)).

Before this, recipients could often choose dollars in cash or into a domiciliary (foreign-currency) account. Through the licensed remittance channel, that choice is gone.

## 4. Where small digital-dollar transfers sit

Stablecoins are one place where people still hold and move dollars. The monitor counts USDT and USDC transfers on Ethereum and Tron. Here are the transfers under $1,000, the size of a family remittance, comparing average weekdays before and after the CBN's virtual-asset rules took effect on 5 November (flagged outlier days left out):

| Average weekday | Transfers under $1k, after 5 Nov | Change | Average size | Share of all transfers |
|---|---|---|---|---|
| Tron USDT, all | 1,582,089 | +1.9% | $220 | 65% |
| Tron USDT, ordinary wallets | 453,363 | +2.7% | $245 | 55% |
| Ethereum USDT, all | 530,007 | +11.2% | $141 | 78% |
| Ethereum USDT, ordinary wallets | 115,378 | +12.0% | $101 | 82% |

"Ordinary wallets" leaves out exchanges, bots and other high-volume addresses ([method](#/method)). Two things stand out:

- **Small transfers grew on every rail after 5 November,** even as large-value flows on Ethereum fell (see [Issue #0](#/issue-0)).
- **Tron's small transfers are remittance-sized and huge in number.** A $220 average transfer, repeated about 1.6 million times a day, looks much more like people paying people than like trading.

The chain has no country field, so these are not Nigerian numbers. They show that demand for holding and sending small amounts of dollars is large and steady, and it shows up on stablecoin rails rather than in the naira-only licensed channel.

## 5. What the new CBN rules add

The CBN's rules for non-security virtual assets took effect on 5 November 2026:

- **A local issuer for dollar stablecoins.** Dollar stablecoins can reach Nigerian users only if a Nigerian company with a ₦15 billion Class 2 licence issues them, and the token itself needs CBN approval ([BusinessDay](https://businessday.ng/?p=1216278), [EdgeX](https://pro.edgex.exchange/en-US/news/article/nigeria-n15-billion-capital)).
- **A licence for the service provider.** Firms that hold, transfer or pay out virtual assets need their own licence, with at least ₦1 billion in capital ([Arise](https://www.arise.tv/cbn-sets-n15bn-capital-requirement-for-foreign-stablecoin-issuers-tightens-dollar-token-rules/)).
- **One permission per activity.** Approval for custody or exchange doesn't automatically cover payments or remittances ([Finance Magnates](https://www.financemagnates.com/cryptocurrency/regulation/nigeria-erects-strict-stablecoin-wall-demanding-11m-local-subsidiaries-for-us-dollar-tokens/)).
- **A transition period.** Existing operators have until 4 May 2027 to apply for a licence ([Unchained](https://unchainedcrypto.com/nigerias-central-bank-now-requires-offshore-stablecoin-issuers-to-license-locally/)).

## 6. Questions for a Nigeria launch plan

For a company that gives recipients a branded wallet through their MTO:

1. **What does the wallet hold in Nigeria?** If it holds naira, it competes with bank accounts that recipients already have. If it holds dollars, the licensed remittance channel can't fund it, so what can?
2. **Which licence does it sit under?** The MTO partner's IMTO licence, a Nigerian bank or payment partner, or a CBN virtual-asset licence if stablecoins are involved.
3. **Does the retention case survive naira-only payouts?** A balance that loses value against the dollar is a weaker reason to keep money in a wallet than one that doesn't.
4. **Which licensed operators are the first partners?** A third of the 108 licensed IMTOs are UK companies.

## What on-the-ground research would add

This brief covers what's public. The next layer needs someone in Nigeria:

- **Interviews with recipients** about how they receive money, what they lose cashing out, and whether they'd keep a balance.
- **A map of licensed operators by corridor,** with how each pays out today.
- **A check of payout partners:** banks, payment firms and agent networks, with their real costs and timing.
- **Tracking the CBN's rulings** on stablecoins and remittances as the transition period runs.

## What this can't tell you

- **Blockchain data has no country field.** The stablecoin numbers describe the rails, not Nigeria specifically.
- **Remittance figures differ by source.** The CBN and World Bank count differently, and estimates of each sending country's share disagree.
- **Stablecoin costs here are network fees only.** Buying dollars and converting them back to naira costs more.
- **The rules are new.** The CBN can still clarify how they apply, and this brief isn't legal advice.

*Data and method: [monitor](#/), [method and data checks](#/method), [source code](https://github.com/Fave-X/Africa-Stablecoin-Monitor).*
