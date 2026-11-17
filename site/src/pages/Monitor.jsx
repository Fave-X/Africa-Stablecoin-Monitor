import { useMemo, useState } from 'react'
import { Bar, Line } from 'react-chartjs-2'
import HeroField from '../components/HeroField'
import { CountUp, Panel, Reveal, SectionNav, Segmented, SeriesChips } from '../components/ui'
import { SITE } from '../site.config'
import {
  BAND_COLORS, RAILS, bandShares, bizShare, dailyVolume, fmtDay, fmtPct, fmtUsd, latestFee, tronZeroBurn, walletStats, weeklyFees,
} from '../data'

const SECTIONS = [
  { id: 'cost', label: 'Cost' }, { id: 'size', label: 'Transfer size' }, { id: 'wallets', label: 'Real users' }, { id: 'mix', label: 'USDT vs USDC' },
  { id: 'peg', label: 'Peg' }, { id: 'concentration', label: 'Concentration' }, { id: 'limits', label: 'Limits' },
]
const BAND_LABEL = { '<1k': 'Under $1k', '1k-10k': '$1k–10k', '10k-100k': '$10k–100k', '100k+': '$100k+' }
const axisY = (fmt, extra = {}) => ({ grid: { color: '#262626' }, border: { display: false }, ticks: { callback: fmt, padding: 8 }, ...extra })
const axisX = { grid: { display: false }, border: { color: '#262626' }, ticks: { maxRotation: 0, autoSkipPadding: 18 } }
const pctPts = (a, b) => (a == null || b == null ? null : (b - a) * 100)
const signed = (v, unit = ' pts') => (v == null ? '—' : `${v > 0 ? '+' : v < 0 ? '−' : ''}${Math.abs(v).toFixed(1)}${unit}`)

// One numbered chapter: big finding on the left, evidence on the right.
function Chapter({ id, n, kicker, headline, body, children }) {
  return (
    <section id={id} className="scroll-mt-16 border-t border-ink-line">
      <div className="mx-auto grid max-w-page gap-8 px-4 py-16 sm:px-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-12 lg:py-24">
        <Reveal className="lg:sticky lg:top-24 lg:self-start">
          <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-fg-3"><span className="text-fg-2">{n}</span> · {kicker}</p>
          <h2 className="mt-4 text-[28px] font-semibold leading-[1.1] tracking-display text-fg-1 sm:text-[36px]">{headline}</h2>
          {body && <div className="mt-4 max-w-md text-[15px] leading-relaxed text-fg-3">{body}</div>}
        </Reveal>
        <Reveal delay={120}>{children}</Reveal>
      </div>
    </section>
  )
}

export default function Monitor({ data }) {
  const { meta } = data
  const tronSampled = meta.tron_mode === 'sampled'
  const ethFee = latestFee(data, 'ethereum|USDT')
  const tronFee = latestFee(data, 'tron|USDT')
  const zeroBurn = tronZeroBurn(data, 'post')
  const shares = useMemo(() => RAILS.map((r) => ({
    ...r, base: bandShares(data, r.chain, r.token, 'baseline'), post: bandShares(data, r.chain, r.token, 'post'),
  })), [data])
  const postLabel = fmtDay(meta.post_start)

  // ── Cost
  const wf = useMemo(() => weeklyFees(data), [data])
  const [hidden, setHidden] = useState(new Set())
  const toggle = (k) => setHidden((h) => { const n = new Set(h); n.has(k) ? n.delete(k) : n.add(k); return n })
  const feeChart = {
    labels: wf.weeks.map(fmtDay),
    datasets: wf.series.filter((s) => !hidden.has(s.key)).map((s) => ({
      label: s.label, data: s.values, borderColor: s.color, backgroundColor: s.color, pointBackgroundColor: s.color,
      pointBorderColor: '#131313', pointBorderWidth: 2, borderWidth: 2, pointRadius: 4, pointHoverRadius: 7, tension: 0.3, spanGaps: true,
    })),
  }

  // ── Size
  const [win, setWin] = useState('compare')
  const sizeRows = shares.flatMap((s) => (win === 'compare'
    ? [{ label: `${s.label} · before`, v: s.base }, { label: `${s.label} · after`, v: s.post }]
    : [{ label: s.label, v: win === 'post' ? s.post : s.base }]))
  const bandChart = {
    labels: sizeRows.map((r) => r.label),
    datasets: meta.bands.map((band, i) => ({
      label: BAND_LABEL[band], data: sizeRows.map((r) => (r.v[i] == null ? null : r.v[i] * 100)),
      backgroundColor: BAND_COLORS[i], borderColor: '#131313', borderWidth: { left: 2, right: 2 }, borderSkipped: false,
      borderRadius: 4, barThickness: 18,
    })),
  }
  const ethBizDelta = pctPts(bizShare(shares[0].base), bizShare(shares[0].post))

  // ── Real users (ordinary wallets)
  const ws = useMemo(() => ['USDT', 'USDC'].map((t) => walletStats(data, t)), [data])
  const wUsdt = ws[0]
  const perDayN = (w, k) => (w[k].days ? w[k].n / w[k].days : null)
  const walTxChange = wUsdt ? perDayN(wUsdt.wal, 'post') / perDayN(wUsdt.wal, 'base') - 1 : null
  const pctChg = (v) => (v == null ? '—' : `${v > 0 ? '+' : v < 0 ? '−' : ''}${Math.abs(v * 100).toFixed(0)}%`)
  const walletChart = wUsdt && {
    labels: ws.map((w) => `Ethereum · ${w.token}`),
    datasets: [
      { label: 'All transfers', data: ws.map((w) => w.allChange * 100), backgroundColor: '#5b6168' },
      { label: 'Ordinary wallets', data: ws.map((w) => w.walChange * 100), backgroundColor: '#f2f2f2' },
    ].map((d) => ({ ...d, borderColor: '#131313', borderWidth: 2, borderSkipped: false, borderRadius: 4, barThickness: 20 })),
  }

  // ── Mix
  const vUsdt = dailyVolume(data, 'ethereum', 'USDT')
  const vUsdc = dailyVolume(data, 'ethereum', 'USDC')
  const mixPost = (() => {
    const idx = vUsdt.days.map((d, i) => (d >= meta.post_start ? i : -1)).filter((i) => i >= 0)
    const a = idx.reduce((s, i) => s + (vUsdt.values[i] || 0), 0), b = idx.reduce((s, i) => s + (vUsdc.values[i] || 0), 0)
    return a + b ? a / (a + b) : null
  })()
  const volChart = {
    labels: vUsdt.days.map(fmtDay),
    datasets: [
      { label: 'Ethereum · USDT', data: vUsdt.values, borderColor: RAILS[0].color, backgroundColor: RAILS[0].color },
      { label: 'Ethereum · USDC', data: vUsdc.values, borderColor: RAILS[2].color, backgroundColor: RAILS[2].color },
    ].map((d) => ({ ...d, borderWidth: 2, pointRadius: 0, pointHoverRadius: 5, tension: 0.25 })),
  }

  // ── Peg
  const pegDays = [...new Set(data.peg.map((p) => p.day))].sort()
  const pegOf = (d, t) => data.peg.find((p) => p.day === d && p.token === t)
  const pegChart = {
    labels: pegDays.map(fmtDay),
    datasets: [['USDT', RAILS[0].color], ['USDC', RAILS[2].color]].map(([t, c]) => ({
      label: t, data: pegDays.map((d) => pegOf(d, t)?.price ?? null), borderColor: c, backgroundColor: c,
      borderWidth: 2, pointHoverRadius: 5, pointRadius: pegDays.map((d) => (pegOf(d, t)?.flag ? 6 : 0)), tension: 0.2,
    })),
  }
  const flagged = data.peg.filter((p) => p.flag)
  const maxDev = data.peg.reduce((m, p) => Math.max(m, Math.abs(p.price - 1)), 0)

  const lineOpts = (fmt, marker, y = {}) => ({
    responsive: true, maintainAspectRatio: false, interaction: { mode: 'index', intersect: false },
    plugins: { tooltip: { callbacks: { label: (c) => ` ${c.dataset.label}  ${fmt(c.parsed.y)}` } }, eventMarker: marker },
    scales: { x: axisX, y: axisY(fmt, y) },
  })

  const conc = (t, w) => data.concentration.find((c) => c.token === t && c.window === w)

  return (
    <>
      {/* ── Hero */}
      <section className="relative isolate overflow-hidden">
        <div className="absolute inset-0 -z-10"><HeroField /></div>
        <div className="mx-auto max-w-page px-4 pb-20 pt-16 sm:px-6 sm:pb-28 sm:pt-24">
          <Reveal>
            <p className="inline-flex items-center gap-2 rounded-pill border border-ink-line bg-ink/60 px-3 py-1 text-xs text-fg-2 backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-fg-1" /> Issue #0 · data {fmtDay(meta.first_day)} – {fmtDay(meta.last_day)} 2026
            </p>
          </Reveal>
          <Reveal delay={80}>
            <h1 className="mt-6 max-w-4xl text-[40px] font-semibold leading-[1.02] tracking-display text-fg-1 sm:text-[64px]">
              {tronFee ? (<>
                Moving $10,000 in USDT costs{' '}
                <span style={{ color: RAILS[0].color }}><CountUp value={ethFee?.value} format={(v) => fmtUsd(v)} /></span> on Ethereum.
                On Tron it's{' '}
                <span style={{ color: RAILS[1].color }}><CountUp value={tronFee.value} format={(v) => fmtUsd(v)} /></span>, or nothing if you stake.
              </>) : (<>
                Moving $10,000 in USDT costs{' '}
                <span style={{ color: RAILS[0].color }}><CountUp value={ethFee?.value} format={(v) => fmtUsd(v)} /></span> on Ethereum. On Tron,{' '}
                <span style={{ color: RAILS[1].color }}><CountUp value={zeroBurn} format={(v) => fmtPct(v, 0)} /></span> of transfers pay nothing at all.
              </>)}
            </h1>
          </Reveal>
          <Reveal delay={160}>
            <p className="mt-6 max-w-2xl text-[17px] leading-relaxed text-fg-3">
              A public monitor of the rails African businesses use to settle dollars, read before and after Nigeria's
              CBN framework for virtual assets took effect on {fmtDay(meta.post_start)} 2026. What changed, what it costs,
              and what the chain can't see.
            </p>
          </Reveal>
          <Reveal delay={240} className="mt-10 grid max-w-3xl grid-cols-2 gap-px overflow-hidden rounded-card border border-ink-line bg-ink-line sm:grid-cols-4">
            {[
              ['$10k+ share · ETH USDT', fmtPct(bizShare(shares[0].post)), `${signed(ethBizDelta)} vs before`],
              [`$10k+ share · Tron USDT${tronSampled ? '*' : ''}`, fmtPct(bizShare(shares[1].post)),
                `${signed(pctPts(bizShare(shares[1].base), bizShare(shares[1].post)))} vs before`],
              ['USDT share of ETH volume', fmtPct(mixPost), 'after 5 Nov'],
              ['Peg flags', String(flagged.length), `max move ${fmtPct(maxDev, 2)}`],
            ].map(([k, v, s]) => (
              <div key={k} className="bg-ink-2/90 p-4 backdrop-blur">
                <p className="text-[11px] leading-snug text-fg-3">{k}</p>
                <p className="mt-2 text-2xl font-semibold tracking-tightish text-fg-1">{v}</p>
                <p className="mt-1 text-[11px] text-fg-3">{s}</p>
              </div>
            ))}
          </Reveal>
          {tronSampled && <p className="mt-3 text-xs text-fg-3">* Tron figures come from fixed daily sample windows: shares, not totals.</p>}
        </div>
      </section>

      <SectionNav sections={SECTIONS} />

      {meta.missing?.length > 0 && (
        <div className="mx-auto max-w-page px-4 pt-6 sm:px-6">
          <p className="rounded-card border border-ink-line bg-ink-2 p-4 text-sm text-fg-3">
            Not loaded yet: {meta.missing.join(', ')}. Charts that need these files stay empty.
          </p>
        </div>
      )}

      <Chapter id="cost" n="01" kicker="Cost to settle"
        headline={<>Fees don't scale with size. A $10k transfer costs what a $10 one does.</>}
        body={<>Network fee for one plain transfer, in USD. Tron has three prices, not one: free if the sender has staked TRX for energy and bandwidth ({fmtPct(zeroBurn, 0)} of sampled transfers since 5 Nov), about $0.10 if only bandwidth is burned, and the full price on the chart if nothing is staked. At full price Tron now costs more per transfer than Ethereum, so for a business moving USDT daily, staking or renting energy is the biggest cost lever.</>}>
        <Panel kicker="USD per transfer · weekly" title="Network fee of one plain transfer"
          actions={<SeriesChips series={wf.series} hidden={hidden} onToggle={toggle} />}
          table={{ columns: ['Week of', ...wf.series.map((s) => s.label)], rows: wf.weeks.map((w, i) => [fmtDay(w), ...wf.series.map((s) => fmtUsd(s.values[i], 3))]) }}
          note="Ethereum: weekly median gas of direct transfer() calls. Tron: full-burn price (no staked energy) from 200 random transfers per day via TronGrid.">
          <div className="h-72"><Line data={feeChart} options={lineOpts((v) => fmtUsd(v, 2), { label: postLabel, text: 'CBN framework' })} /></div>
        </Panel>
      </Chapter>

      <Chapter id="size" n="02" kicker="Transfer size"
        headline={<>Transfers of $10k or more carry {fmtPct(bizShare(shares[0].post), 0)} of Ethereum USDT volume.</>}
        body={<>Share of each rail's volume by transfer size. Most of that large-ticket value is exchanges, market makers and contracts moving liquidity, not payments; see who moves it below. Change since 5 Nov on Ethereum USDT: {signed(ethBizDelta)}.</>}>
        <Panel kicker="Share of volume by transfer size" title="Before vs after 5 Nov"
          actions={<Segmented label="Window" value={win} onChange={setWin}
            options={[{ value: 'compare', label: 'Compare' }, { value: 'baseline', label: 'Before' }, { value: 'post', label: 'After' }]} />}
          table={{ columns: ['Rail', ...bandChart.datasets.map((d) => d.label)],
            rows: sizeRows.map((r, i) => [r.label, ...bandChart.datasets.map((d) => (d.data[i] == null ? '—' : `${d.data[i].toFixed(1)}%`))]) }}
          note={tronSampled ? 'Tron rows come from fixed daily sample windows.' : undefined}>
          <div className="mb-4 flex flex-wrap gap-x-4 gap-y-2 text-xs text-fg-2">
            {meta.bands.map((b, i) => (
              <span key={b} className="inline-flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-sm" style={{ background: BAND_COLORS[i] }} />{BAND_LABEL[b]}</span>
            ))}
          </div>
          <div style={{ height: 56 + sizeRows.length * 34 }}>
            <Bar data={bandChart} options={{
              indexAxis: 'y', responsive: true, maintainAspectRatio: false,
              plugins: { tooltip: { callbacks: { label: (c) => ` ${c.dataset.label}  ${c.parsed.x?.toFixed(1)}%` } } },
              scales: { x: { stacked: true, max: 100, grid: { color: '#262626' }, border: { display: false }, ticks: { callback: (v) => `${v}%` } },
                y: { stacked: true, grid: { display: false }, border: { display: false }, ticks: { color: '#cccccc' } } },
            }} />
          </div>
        </Panel>
      </Chapter>

      {wUsdt && (
      <Chapter id="wallets" n="03" kicker="Real users"
        headline={<>Take out exchanges, bots and contracts, and Ethereum USDT volume fell {pctChg(-wUsdt.walChange).replace('+', '')} after 5 Nov, not {pctChg(-wUsdt.allChange).replace('+', '')}.</>}
        body={<>Ordinary wallets are addresses that aren't smart contracts and made fewer than 1,000 USDT/USDC transfers in the window. Since 5 Nov they account for {fmtPct(wUsdt.txShare, 0)} of Ethereum USDT transfers but only {fmtPct(wUsdt.volShare, 0)} of its volume, and their daily transfer count moved {pctChg(walTxChange)}. The drop in headline volume came mostly from exchanges and contracts, not people.</>}>
        <Panel kicker="Change in average daily volume · after vs before 5 Nov" title="All transfers vs ordinary wallets"
          table={{ columns: ['Token', 'All · before /day', 'All · after /day', 'All change', 'Wallets · before /day', 'Wallets · after /day', 'Wallets change', 'Wallets $10k+ share after'],
            rows: ws.map((w) => [w.token, fmtUsd(w.all.base.perDay), fmtUsd(w.all.post.perDay), pctChg(w.allChange),
              fmtUsd(w.wal.base.perDay), fmtUsd(w.wal.post.perDay), pctChg(w.walChange), fmtPct(bizShare(w.walBands.post))]) }}
          note="Ordinary wallets: neither sender nor receiver is a contract (bigquery-public-data.crypto_ethereum.contracts) or an address with 1,000+ USDT/USDC transfers in the window. A heuristic: exchange deposit addresses and some wallets with EIP-7702 delegation can still pass.">
          <div className="mb-5 grid grid-cols-3 gap-px overflow-hidden rounded-xl border border-ink-line bg-ink-line">
            {[['Share of USDT transfers', fmtPct(wUsdt.txShare, 0)], ['Share of USDT volume', fmtPct(wUsdt.volShare, 0)],
              ['Their volume in $10k+', fmtPct(bizShare(wUsdt.walBands.post), 0)]].map(([k, v]) => (
              <div key={k} className="bg-ink-2 p-4"><p className="text-[11px] leading-snug text-fg-3">{k}</p><p className="mt-1.5 text-xl font-semibold text-fg-1">{v}</p></div>
            ))}
          </div>
          <div className="mb-4 flex gap-4 text-xs text-fg-2">
            {walletChart.datasets.map((d) => <span key={d.label} className="inline-flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-sm" style={{ background: d.backgroundColor }} />{d.label}</span>)}
          </div>
          <div className="h-48">
            <Bar data={walletChart} options={{
              indexAxis: 'y', responsive: true, maintainAspectRatio: false,
              plugins: { tooltip: { callbacks: { label: (c) => ` ${c.dataset.label}  ${pctChg(c.parsed.x / 100)}` } } },
              scales: { x: { min: -60, max: 0, grid: { color: '#262626' }, border: { display: false }, ticks: { callback: (v) => `${v}%` } },
                y: { grid: { display: false }, border: { display: false }, ticks: { color: '#cccccc' } } },
            }} />
          </div>
        </Panel>
      </Chapter>
      )}

      <Chapter id="mix" n="04" kicker="Which dollar"
        headline={<>USDT is {fmtPct(mixPost, 0)} of Ethereum stablecoin volume since 5 Nov.</>}
        body="Daily USDT and USDC volume on Ethereum. Mints and burns are excluded, so issuance doesn't count as activity.">
        <Panel kicker="USD per day" title="Ethereum: USDT vs USDC"
          table={{ columns: ['Day', 'USDT', 'USDC'], rows: vUsdt.days.map((d, i) => [fmtDay(d), fmtUsd(vUsdt.values[i]), fmtUsd(vUsdc.values[i])]) }}>
          <div className="mb-4 flex gap-4 text-xs text-fg-2">
            {volChart.datasets.map((d) => <span key={d.label} className="inline-flex items-center gap-2"><span className="h-0.5 w-4 rounded" style={{ background: d.borderColor }} />{d.label}</span>)}
          </div>
          <div className="h-64"><Line data={volChart} options={lineOpts((v) => fmtUsd(v, 0), { label: postLabel, text: '5 Nov' })} /></div>
        </Panel>
      </Chapter>

      <Chapter id="peg" n="05" kicker="Price stability"
        headline={flagged.length ? <>{flagged.length} day{flagged.length > 1 ? 's' : ''} moved 0.5% or more off $1.</> : <>Neither dollar moved 0.5% off $1.</>}
        body={<>Daily price from CoinGecko. Largest single-day deviation in the window: {fmtPct(maxDev, 2)}. Large dots mark flagged days.</>}>
        <Panel kicker="USD price · daily" title="USDT and USDC against $1.00"
          table={{ columns: ['Day', 'USDT', 'USDC'], rows: pegDays.map((d) => [fmtDay(d), ...['USDT', 'USDC'].map((t) => pegOf(d, t)?.price?.toFixed(4) ?? '—')]) }}>
          <div className="h-64"><Line data={pegChart} options={lineOpts((v) => (v == null ? '—' : `$${Number(v).toFixed(3)}`),
            { label: postLabel, text: '5 Nov' }, { suggestedMin: 0.99, suggestedMax: 1.01 })} /></div>
        </Panel>
      </Chapter>

      <Chapter id="concentration" n="06" kicker="Who moves it"
        headline={<>Ten addresses send {fmtPct(conc('USDT', 'post')?.top10_share, 0)} of Ethereum USDT volume.</>}
        body="Share of each window's volume sent by the 10 largest sending addresses. No labels needed. High concentration often points to exchanges and market makers rather than end users.">
        <Panel kicker="Top-10 sender share · Ethereum">
          {data.concentration.length ? (
            <div className="grid gap-px overflow-hidden rounded-xl border border-ink-line bg-ink-line sm:grid-cols-2">
              {['USDT', 'USDC'].map((t) => (
                <div key={t} className="bg-ink-2 p-5">
                  <p className="text-sm text-fg-2">{t}</p>
                  <div className="mt-4 flex items-end gap-6">
                    <div><p className="text-[11px] text-fg-3">Before</p><p className="text-2xl font-semibold text-fg-2">{fmtPct(conc(t, 'baseline')?.top10_share)}</p></div>
                    <div><p className="text-[11px] text-fg-3">After</p><p className="text-3xl font-semibold text-fg-1">{fmtPct(conc(t, 'post')?.top10_share)}</p></div>
                  </div>
                  <p className="mt-3 text-[11px] text-fg-3">{conc(t, 'post')?.senders?.toLocaleString() ?? '—'} distinct senders after 5 Nov</p>
                </div>
              ))}
            </div>
          ) : <p className="text-sm text-fg-3">Not loaded yet.</p>}
        </Panel>
      </Chapter>

      {/* ── Limits: light editorial band for rhythm and emphasis */}
      <section id="limits" className="scroll-mt-16 bg-paper text-paper-text">
        <div className="mx-auto grid max-w-page gap-10 px-4 py-20 sm:px-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-12">
          <Reveal>
            <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-paper-muted">07 · Limits</p>
            <h2 className="mt-4 text-[28px] font-semibold leading-[1.1] tracking-display sm:text-[36px]">What this data can't tell you.</h2>
            <p className="mt-4 max-w-md text-[15px] leading-relaxed text-paper-muted">Read these before quoting any number. The full method lists every definition.</p>
          </Reveal>
          <Reveal delay={120}>
            <ol className="divide-y divide-paper-line border-y border-paper-line">
              {[
                ['No country field', 'These are rails Nigerian businesses use, not Nigerian volume.'],
                ['Fiat legs are invisible', 'Naira payouts, bank transfers, exchange netting and P2P trades never touch the chain.'],
                ['Size is a proxy', 'One person can send $50k; a business can split payments into small ones.'],
                ['Timing is not cause', 'A few weeks after 5 Nov shows what changed, not why.'],
                ["No company's own flows", 'Those need labels the company provides.'],
              ].map(([h, b], i) => (
                <li key={h} className="grid grid-cols-[2.5rem_1fr] gap-2 py-4">
                  <span className="text-sm tabular-nums text-paper-muted">0{i + 1}</span>
                  <p className="text-[15px]"><span className="font-medium">{h}.</span> <span className="text-paper-muted">{b}</span></p>
                </li>
              ))}
            </ol>
          </Reveal>
        </div>
      </section>

      {/* ── CTA */}
      <section className="border-t border-ink-line">
        <div className="mx-auto max-w-page px-4 py-20 sm:px-6 sm:py-28">
          <Reveal className="mx-auto max-w-3xl text-center">
            <h2 className="text-[32px] font-semibold leading-[1.05] tracking-display text-fg-1 sm:text-[48px]">
              Public data stops at the chain. Your exports don't.
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-[15px] leading-relaxed text-fg-3">
              Reconciling on-chain settlement legs against an operator's own records turns these estimates into corridor-level
              volume, settlement time and all-in cost per $1,000.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <a href="#/method" className="rounded-pill bg-fg-1 px-5 py-2.5 text-sm font-medium text-ink hover:bg-fg-2">Read the method</a>
              {(SITE.email || SITE.x) && (
                <a href={SITE.email ? `mailto:${SITE.email}` : SITE.x} target={SITE.email ? undefined : '_blank'} rel="noreferrer"
                  className="rounded-pill border border-ink-edge px-5 py-2.5 text-sm font-medium text-fg-1 hover:border-fg-2">Get in touch</a>
              )}
            </div>
          </Reveal>
        </div>
      </section>
    </>
  )
}
