# Compliance evidence: a worked source-of-funds trace

*Draft in progress.*

**Question → method → evidence chain → findings → limits → reproducible queries.**

- Case: a public, well-documented exploit whose receiving addresses are on OFAC's SDN list (each address checked on OFAC's own Sanctions List Search on the day of writing).
- Trace: 2–3 hops on Ethereum, every hop listed with transaction hash, timestamp and amount.
- Screening: counterparties matched against the SDN list's digital-currency address entries, downloaded from OFAC.

## Appendix: what an auditor must verify on a ZK-private chain without seeing balances

| Provable claim | Stays private |
| --- | --- |
| Counterparty is not on a sanctions list | Balances |
| Amount is within the permitted limit | Identities |
| Travel-rule data is present | Counterparty history |
| Reserves cover liabilities | Position sizes |
