// Formatting and small derivations. Every before/after figure comes precomputed in
// monitor.json → compare (pipeline/build_site_data.py), so the page never re-derives them.

export const RAILS = [
  { key: 'ethereum|USDT', chain: 'ethereum', token: 'USDT', label: 'Ethereum · USDT', color: '#3987e5' },
  { key: 'tron|USDT', chain: 'tron', token: 'USDT', label: 'Tron · USDT', color: '#d95926' },
  { key: 'ethereum|USDC', chain: 'ethereum', token: 'USDC', label: 'Ethereum · USDC', color: '#199e70' },
]
export const railOf = (chain, token) => RAILS.find((r) => r.chain === chain && r.token === token)

// Ordinal blue ramp for the four size bands (small → large)
export const BAND_COLORS = ['#86b6ef', '#3987e5', '#1c5cab', '#104281']

export const median = (xs) => {
  const s = xs.filter((x) => x != null).sort((a, b) => a - b)
  if (!s.length) return null
  const m = Math.floor(s.length / 2)
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2
}

// 7-day buckets anchored on the post_start date, so one bucket boundary falls exactly on 5 Nov.
export function weekStart(day, anchor) {
  const d = new Date(day + 'T00:00:00Z')
  const a = new Date(anchor + 'T00:00:00Z')
  const k = Math.floor((d - a) / 86400000 / 7)
  return new Date(a.getTime() + k * 7 * 86400000).toISOString().slice(0, 10)
}

// Tron fees are tiered, not continuous: 0 TRX (sender staked for energy and bandwidth), ~0.345 TRX
// (bandwidth only), ~6.43 TRX (full energy burn). The Tron series is the full-burn price (p90 of the
// daily sample, which sits on that tier every day); the zero-burn share is reported beside it.
export function weeklyFees(data) {
  const { fees, meta } = data
  const weeks = [...new Set(fees.map((f) => weekStart(f.day, meta.post_start)))].sort()
  const series = RAILS.map((r) => ({
    ...r,
    values: weeks.map((w) =>
      median(fees.filter((f) => f.chain === r.chain && f.token === r.token && weekStart(f.day, meta.post_start) === w)
        .map((f) => (f.chain === 'tron' ? f.p90_fee_usd ?? null : f.median_fee_usd)))),
  }))
  const first = fees.map((f) => f.day).sort()[0]
  return { weeks: weeks.map((w) => (first && w < first ? first : w)), series }
}

export function dailyVolume(data, chain, token) {
  const byDay = {}
  for (const b of data.bands) if (b.chain === chain && b.token === token) byDay[b.day] = (byDay[b.day] || 0) + b.volume_usd
  const days = Object.keys(byDay).sort()
  return { days, values: days.map((d) => byDay[d]) }
}

export const bigShare = (shares) => (shares ? (shares[2] ?? 0) + (shares[3] ?? 0) : null) // $10k and above

export const fmtUsd = (v, digits = 2) =>
  v == null ? '—' : v >= 1e9 ? `$${(v / 1e9).toFixed(1)}B` : v >= 1e6 ? `$${(v / 1e6).toFixed(1)}M`
    : `$${v.toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits })}`
export const fmtPct = (v, d = 1) => (v == null ? '—' : `${(v * 100).toFixed(d)}%`)
export const fmtChg = (v, d = 0) => (v == null ? '—' : `${v > 0 ? '+' : v < 0 ? '−' : ''}${Math.abs(v * 100).toFixed(d)}%`)
export const fmtAbsPct = (v, d = 0) => (v == null ? '—' : `${Math.abs(v * 100).toFixed(d)}%`)
export const fmtDay = (iso) =>
  iso ? new Date(iso + 'T00:00:00Z').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' }) : '—'
