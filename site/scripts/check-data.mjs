// Runs before every site build (npm "prebuild"), including the GitHub Pages deploy.
// If monitor.json is missing, synthetic, or fails a check, the build stops and nothing is published.
import { readFileSync } from 'node:fs'

const fail = (msg) => { console.error(`\nDATA CHECK FAILED: ${msg}\nThe site was not built.\n`); process.exit(1) }
let d
try { d = JSON.parse(readFileSync(new URL('../public/data/monitor.json', import.meta.url), 'utf8')) }
catch (e) { fail(`can't read public/data/monitor.json (${e.message})`) }

if (d.meta?.sample) fail('monitor.json holds SAMPLE data')
if (!Array.isArray(d.meta?.checks) || !d.meta.checks.length) fail('no pipeline checks recorded; rebuild with pipeline/build_site_data.py')
const failed = d.meta.checks.filter((c) => !c.passed)
if (failed.length) fail(failed.map((c) => c.name).join('; '))
if (!d.compare?.rails?.length) fail('no comparison block')

// Re-check the figures the page prints, independently of the pipeline.
const bad = []
for (const f of d.fees) if (!(f.median_fee_usd >= 0 && f.p90_fee_usd >= 0)) bad.push(`negative/missing fee on ${f.day}`)
for (const r of d.compare.rails) for (const scope of ['all', 'wallets']) {
  if (!r[scope]) continue
  for (const w of ['baseline', 'post']) {
    const s = r[scope][w].band_shares.filter((x) => x != null)
    if (s.some((x) => x < 0 || x > 1) || Math.abs(s.reduce((a, b) => a + b, 0) - 1) > 1e-6) bad.push(`band shares ${r.chain} ${r.token} ${scope} ${w}`)
    if (!(r[scope][w].vol_per_day >= 0)) bad.push(`volume ${r.chain} ${r.token} ${scope} ${w}`)
  }
}
const c = d.compare.cost
for (const k of ['ethereum_usdt_fee', 'ethereum_usdt_per_1k', 'tron_usdt_full_fee', 'tron_usdt_full_per_1k']) if (!(c[k] >= 0)) bad.push(`cost.${k}`)
if (!(c.tron_zero_burn_share >= 0 && c.tron_zero_burn_share <= 1)) bad.push('cost.tron_zero_burn_share')
for (const x of d.compare.concentration || []) for (const w of ['baseline', 'post']) if (!(x[w] >= 0 && x[w] <= 1)) bad.push(`top-10 share ${x.chain} ${x.token} ${w}`)
if (bad.length) fail(bad.join('; '))

console.log(`Data checks: ${d.meta.checks.length} pipeline checks passed, page figures re-checked (${d.meta.first_day} – ${d.meta.last_day}).`)
