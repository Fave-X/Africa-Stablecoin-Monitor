# Nigeria, receive side: what a recipient wallet would walk into

**The corridor, the cost of $200, the naira-only payout rule, and what small digital-dollar transfers did after 5 November.**

FaveDigitals · 20 November 2026

**Scope:** money sent to families in Nigeria, seen from the receiving end. Desk research from the Central Bank of Nigeria's (CBN) own regulations and circulars, the World Bank and the Nigerian press, plus Ethereum and Tron data from the [monitor](#/). Regulatory points are a reading of public documents, not legal advice.

## In short

- **The corridor is big and formal channels pay naira only.** Nigeria received about $22 billion in remittances in 2025. Since the CBN's January 2024 guidelines, licensed money transfer operators must pay recipients in naira, through a bank account or as cash. Since 1 May 2026, every payout must also run through a naira settlement account.
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

Two CBN rules, from two dates, decide how a licensed transfer reaches a Nigerian family.

**January 2024: naira only, and a $200 cash limit.** The revised Guidelines for International Money Transfer Services (circular TED/FEM/FPC/GEN/001/002, 31 January 2024) replaced the 2014 rules:

- **Naira only.** Recipients get naira, converted at the market rate on the day. Before this, they could often take dollars in cash or into a domiciliary (foreign-currency) account ([Nairametrics](https://nairametrics.com/2024/02/04/cbn-stops-outbound-international-money-transfer-transactions-limits-inflow-payouts-to-naira)).
- **Bank account above $200.** Cash pickup is allowed with ID, but payouts above the equivalent of $200 must go to a bank account ([Aluko & Oyebode](https://aluko-oyebode.com/insights/cbn-revised-guidelines-for-international-money-transfer-services-in-nigeria)).

**1 May 2026: naira settlement accounts.** A CBN circular, "Measures to Further Deepen Diaspora Remittances and Compliance" (TED/FEM/FPC/PUB/001/002, 24 March 2026), tightened those rules:

- **Every payout runs through a naira settlement account** that the operator holds at a licensed bank, and those accounts can only be credited with remittance flows and FX conversion proceeds ([Udo Udoma & Belo-Osagie](https://www.mondaq.com/nigeria/financial-services/1792840/routing-remittances-through-regulated-channels-the-cbns-new-directive-to-imtos)).
- **Operators price against a real-time market reference** (Bloomberg BMatch), so the naira rate a family gets is set by the official market.

Some press reports describe the May 2026 circular as the start of naira-only payouts. It isn't: it enforces the 2024 rule more tightly. Either way, a recipient who wants to keep dollars can't do it through the licensed remittance channel.

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

The CBN's [Regulations for the Operations of Non-Security Virtual Assets in Nigeria](https://www.cbn.gov.ng/Out/2026/CCD/REGULATIONS%20FOR%20THE%20OPERATIONS%20OF%20NON-SECURITY%20VIRTUAL%20ASSETS%20IN%20NIGERIA.pdf) took effect on 5 November 2026. Section numbers below refer to that document:

- **A local issuer for dollar stablecoins.** A foreign-currency stablecoin can't be offered or distributed in Nigeria unless it is approved as a Class 2 stablecoin and issued by a Nigerian-incorporated Class 2 licensed issuer (Section 11.1), and issuance needs CBN token approval (Section 7.4). A Class 2 issuer needs at least ₦15 billion in paid-up capital (Section 15.2).
- **A licence for the service provider.** Other virtual-asset service providers need at least ₦1 billion in paid-up capital (Section 16.1).
- **One permission per activity.** Each service needs its own authorisation (Section 9.2), and cross-border transfers or remittances need the CBN's express approval for that activity (Section 9.14).
- **No interest on holding stablecoins.** An issuer may not "pay, offer, arrange or facilitate" interest or yield to holders for holding its stablecoin (Section 13.3). A stored-value provider may not pay interest or yield on balances it holds (Section 9.8.5).
- **A transition period for existing operators (Section 54).** Register with the CBN within 30 days (by 5 December 2026), start supervisory reporting within 60 days, and submit a complete licence application within 180 days (by about 4 May 2027). Until then they may operate only at their existing scale. An operator that misses the application deadline must stop until it is licensed.

## 6. Questions for a Nigeria launch plan

For a company that gives recipients a branded wallet through their MTO:

1. **What does the wallet hold in Nigeria?** If it holds naira, it competes with bank accounts that recipients already have. If it holds dollars, the licensed remittance channel can't fund it, so what can?
2. **Which licence does it sit under?** The MTO partner's IMTO licence, a Nigerian bank or payment partner, or a CBN virtual-asset licence if stablecoins are involved.
3. **Does the retention case survive naira-only payouts?** A balance that loses value against the dollar is a weaker reason to keep money in a wallet than one that doesn't.
4. **Does the no-interest rule change what the wallet can offer on idle balances?** If the wallet holds stablecoins, Sections 13.3 and 9.8.5 rule out paying interest or yield on them, so a savings feature would need a different structure in Nigeria.
5. **Which licensed operators are the first partners?** A third of the 108 licensed IMTOs are UK companies.

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
