// Derivations from monitor.json. Pure functions, no React.

export const RAILS = [
  { key: 'ethereum|USDT', chain: 'ethereum', token: 'USDT', label: 'Ethereum · USDT', color: '#3987e5' },
  { key: 'tron|USDT', chain: 'tron', token: 'USDT', label: 'Tron · USDT', color: '#d95926' },
  { key: 'ethereum|USDC', chain: 'ethereum', token: 'USDC', label: 'Ethereum · USDC', color: '#199e70' },
]

// Ordinal blue ramp for the four size bands (small → large)
export const BAND_COLORS = ['#86b6ef', '#3987e5', '#1c5cab', '#104281']

export const median = (xs) => {
  const s = xs.filter((x) => x != null).sort((a, b) => a - b)
  if (!s.length) return null
  const m = Math.floor(s.length / 2)
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2
}

export const isPost = (day, meta) => day >= meta.post_start

// Tron fees are tiered, not continuous: 0 TRX (sender staked for energy and bandwidth), ~0.345 TRX
// (bandwidth only), ~6.43 TRX (full energy burn). The Tron series is the full-burn price (p90 of the
// daily sample, which sits on that tier every day); the zero-burn share is reported beside it.

// 7-day buckets anchored on the post_start date, so one bucket boundary falls exactly on 5 Nov.
export function weekStart(day, anchor) {
  const d = new Date(day + 'T00:00:00Z')
  const a = new Date(anchor + 'T00:00:00Z')
  const diff = Math.floor((d - a) / 86400000)
  const k = Math.floor(diff / 7)
  const s = new Date(a.getTime() + k * 7 * 86400000)
  return s.toISOString().slice(0, 10)
}

export function weeklyFees(data) {
  const { fees, meta } = data
  const weeks = [...new Set(fees.map((f) => weekStart(f.day, meta.post_start)))].sort()
  const series = RAILS.map((r) => ({
    ...r,
    values: weeks.map((w) =>
      median(fees.filter((f) => f.chain === r.chain && f.token === r.token && weekStart(f.day, meta.post_start) === w)
        .map((f) => (f.chain === 'tron' ? f.p90_fee_usd ?? null : f.median_fee_usd)))),
  }))
  // Label a partial first bucket by its first data day, not a date before the data starts.
  const first = fees.map((f) => f.day).sort()[0]
  return { weeks: weeks.map((w) => (first && w < first ? first : w)), series }
}

export function latestFee(data, rail) {
  const { weeks, series } = weeklyFees(data)
  const s = series.find((x) => x.key === rail)
  for (let i = weeks.length - 1; i >= 0; i--) if (s.values[i] != null) return { week: weeks[i], value: s.values[i] }
  return null
}

export function bandShares(data, chain, token, window) {
  const rows = data.bands.filter((b) => b.chain === chain && b.token === token &&
    (window === 'post') === isPost(b.day, data.meta))
  const total = rows.reduce((a, b) => a + b.volume_usd, 0)
  return data.meta.bands.map((band) => {
    const v = rows.filter((r) => r.band === band).reduce((a, b) => a + b.volume_usd, 0)
    return total ? v / total : null
  })
}

// Share of sampled Tron transfers that burned no TRX (sender paid with staked energy).
export function tronZeroBurn(data, window) {
  const xs = data.fees.filter((f) => f.chain === 'tron' && (window === 'post') === isPost(f.day, data.meta)).map((f) => f.zero_burn_share)
  return xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null
}

export const bizShare = (shares) => (shares[2] ?? 0) + (shares[3] ?? 0)

export function dailyVolume(data, chain, token) {
  const days = [...new Set(data.bands.map((b) => b.day))].sort()
  return {
    days,
    values: days.map((d) => data.bands.filter((b) => b.day === d && b.chain === chain && b.token === token)
      .reduce((a, b) => a + b.volume_usd, 0) || null),
  }
}

export const fmtUsd = (v, digits = 2) =>
  v == null ? '—' : v >= 1e9 ? `$${(v / 1e9).toFixed(1)}B` : v >= 1e6 ? `$${(v / 1e6).toFixed(1)}M`
    : `$${v.toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits })}`
export const fmtPct = (v, d = 1) => (v == null ? '—' : `${(v * 100).toFixed(d)}%`)
export const fmtDay = (iso) =>
  iso ? new Date(iso + 'T00:00:00Z').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' }) : '—'

// "Ordinary wallets" vs all transfers for one Ethereum token: average daily volume per window,
// and the wallets' share of transfers and volume after post_start.
export function walletStats(data, token) {
  const wb = data.wallet_bands || []
  if (!wb.length) return null
  const agg = (rows, window) => {
    const rs = rows.filter((r) => r.chain === 'ethereum' && r.token === token && (window === 'post') === isPost(r.day, data.meta))
    const days = new Set(rs.map((r) => r.day)).size
    const vol = rs.reduce((a, r) => a + r.volume_usd, 0), n = rs.reduce((a, r) => a + r.transfers, 0)
    return { days, vol, n, perDay: days ? vol / days : null }
  }
  const all = { base: agg(data.bands, 'baseline'), post: agg(data.bands, 'post') }
  const wal = { base: agg(wb, 'baseline'), post: agg(wb, 'post') }
  const chg = (w) => (w.base.perDay ? w.post.perDay / w.base.perDay - 1 : null)
  return {
    token, all, wal, allChange: chg(all), walChange: chg(wal),
    txShare: all.post.n ? wal.post.n / all.post.n : null,
    volShare: all.post.vol ? wal.post.vol / all.post.vol : null,
    walBands: { base: bandSharesFrom(wb, data, token, 'baseline'), post: bandSharesFrom(wb, data, token, 'post') },
  }
}

function bandSharesFrom(rows, data, token, window) {
  const rs = rows.filter((r) => r.token === token && (window === 'post') === isPost(r.day, data.meta))
  const total = rs.reduce((a, r) => a + r.volume_usd, 0)
  return data.meta.bands.map((band) => (total ? rs.filter((r) => r.band === band).reduce((a, r) => a + r.volume_usd, 0) / total : null))
}
