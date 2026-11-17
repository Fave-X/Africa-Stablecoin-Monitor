import { useMemo, useState } from 'react'
import { Bar, Line } from 'react-chartjs-2'
import HeroField from '../components/HeroField'
import { Panel, Reveal, SectionNav, Segmented, SeriesChips } from '../components/ui'
import { SITE } from '../site.config'
import {
  BAND_COLORS, RAILS, bigShare, dailyVolume, fmtAbsPct, fmtChg, fmtDay, fmtPct, fmtUsd, railOf, weeklyFees,
} from '../data'

const BAND_LABEL = { '<1k': 'Under $1k', '1k-10k': '$1k–10k', '10k-100k': '$10k–100k', '100k+': '$100k+' }
const axisY = (fmt, extra = {}) => ({ grid: { color: '#262626' }, border: { display: false }, ticks: { callback: fmt, padding: 8 }, ...extra })
const axisX = { grid: { display: false }, border: { color: '#262626' }, ticks: { maxRotation: 0, autoSkipPadding: 18 } }
const FLAG = '#e66767'
// 'rose 12%' / 'fell 15%' / 'held flat' without doubled signs
const moved = (v, d = 0) => (v == null ? '—' : Math.abs(v) < 0.005 ? 'held flat' : `${v > 0 ? 'rose' : 'fell'} ${fmtAbsPct(v, d)}`)
const MUTED_BAR = '#5b6168'
const BRIGHT_BAR = '#f2f2f2'

// One numbered chapter: big finding on the left, evidence on the right.
function Chapter({ id, n, kicker, headline, body, children }) {
  return (
    <section id={id} className="scroll-mt-16 border-t border-ink-line">
      <div className="mx-auto grid max-w-page gap-8 px-4 py-16 sm:px-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-12 lg:py-24">
        <Reveal className="lg:sticky lg:top-24 lg:self-start">
          <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-fg-3"><span className="text-fg-2">{n}</span> · {kicker}</p>
          <h2 className="mt-4 text-[28px] font-semibold leading-[1.1] tracking-display text-fg-1 sm:text-[36px]">{headline}</h2>
          {body && <div className="mt-4 max-w-md space-y-3 text-[15px] leading-relaxed text-fg-3">{body}</div>}
        </Reveal>
        <Reveal delay={120}>{children}</Reveal>
      </div>
    </section>
  )
}

function Legend({ items }) {
  return (
    <div className="mb-4 flex flex-wrap gap-x-4 gap-y-2 text-xs text-fg-2">
      {items.map(([label, color, line]) => (
        <span key={label} className="inline-flex items-center gap-2">
          <span className={line ? 'h-0.5 w-4 rounded' : 'h-2.5 w-2.5 rounded-sm'} style={{ background: color }} />{label}
        </span>
      ))}
    </div>
  )
}

const hbarOpts = (fmt, x = {}) => ({
  indexAxis: 'y', responsive: true, maintainAspectRatio: false,
  plugins: { tooltip: { callbacks: { label: (c) => ` ${c.dataset.label}  ${fmt(c.parsed.x)}` } } },
  scales: { x: { grid: { color: '#262626' }, border: { display: false }, ...x },
    y: { grid: { display: false }, border: { display: false }, ticks: { color: '#cccccc' } } },
})
const barStyle = { borderColor: '#131313', borderWidth: 2, borderSkipped: false, borderRadius: 4, barThickness: 16 }

export default function Monitor({ data }) {
  const { meta, compare } = data
  const rail = (chain, token) => compare.rails.find((r) => r.chain === chain && r.token === token)
  const eU = rail('ethereum', 'USDT'), tU = rail('tron', 'USDT'), eC = rail('ethereum', 'USDC')
  const cost = compare.cost
  const flaggedDays = meta.flagged_days || []
  const biggest = flaggedDays.reduce((m, f) => (!m || f.volume_usd > m.volume_usd ? f : m), null)
  const checksPassed = meta.checks?.filter((c) => c.passed).length ?? 0
  const postLabel = fmtDay(meta.post_start)
  const nPost = eU.all.post.days

  // ── Activity: like-for-like change per rail
  const actChart = {
    labels: compare.rails.map((r) => railOf(r.chain, r.token).label),
    datasets: [
      { label: 'Number of transfers', data: compare.rails.map((r) => r.all.transfers_change * 100), backgroundColor: BRIGHT_BAR },
      { label: 'Value moved', data: compare.rails.map((r) => r.all.vol_change * 100), backgroundColor: MUTED_BAR },
    ].map((d) => ({ ...d, ...barStyle })),
  }

  // ── Real users
  const withWallets = compare.rails.filter((r) => r.wallets)
  const walChart = {
    labels: withWallets.map((r) => railOf(r.chain, r.token).label),
    datasets: [
      { label: 'All transfers · value', data: withWallets.map((r) => r.all.vol_change * 100), backgroundColor: MUTED_BAR },
      { label: 'Ordinary wallets · value', data: withWallets.map((r) => r.wallets.vol_change * 100), backgroundColor: BRIGHT_BAR },
    ].map((d) => ({ ...d, ...barStyle })),
  }
  const pctRange = (vals) => {
    const lo = Math.min(0, ...vals), hi = Math.max(0, ...vals)
    return { min: Math.floor((lo - 5) / 10) * 10, max: Math.ceil((hi + 5) / 10) * 10 }
  }

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
  const sizeRows = compare.rails.flatMap((r) => {
    const lbl = railOf(r.chain, r.token).label
    return win === 'compare'
      ? [{ label: `${lbl} · before`, v: r.all.baseline.band_shares }, { label: `${lbl} · after`, v: r.all.post.band_shares }]
      : [{ label: lbl, v: (win === 'post' ? r.all.post : r.all.baseline).band_shares }]
  })
  const bandChart = {
    labels: sizeRows.map((r) => r.label),
    datasets: meta.bands.map((band, i) => ({
      label: BAND_LABEL[band], data: sizeRows.map((r) => (r.v[i] == null ? null : r.v[i] * 100)),
      backgroundColor: BAND_COLORS[i], borderColor: '#131313', borderWidth: { left: 2, right: 2 }, borderSkipped: false,
      borderRadius: 4, barThickness: 18,
    })),
  }

  // ── Daily volume with flagged days
  const [volRail, setVolRail] = useState('ethereum|USDT')
  const vr = RAILS.find((r) => r.key === volRail)
  const vol = dailyVolume(data, vr.chain, vr.token)
  const isFlag = (d) => flaggedDays.some((f) => f.day === d && f.chain === vr.chain && f.token === vr.token)
  const volChart = {
    labels: vol.days.map(fmtDay),
    datasets: [{
      label: vr.label, data: vol.values, borderColor: vr.color, backgroundColor: vol.days.map((d) => (isFlag(d) ? FLAG : vr.color)),
      pointBackgroundColor: vol.days.map((d) => (isFlag(d) ? FLAG : vr.color)), pointBorderColor: '#131313', pointBorderWidth: 2,
      pointRadius: vol.days.map((d) => (isFlag(d) ? 6 : 0)), pointHoverRadius: 6, borderWidth: 2, tension: 0.25,
    }],
  }
  const volMarkers = [{ label: postLabel, text: 'CBN framework', row: 0 },
    ...flaggedDays.filter((f) => f.chain === vr.chain && f.token === vr.token)
      .map((f, i) => ({ label: fmtDay(f.day), text: `${f.multiple_of_median}× normal`, color: FLAG, row: 1 + (i % 2) }))]

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
  const pegFlags = data.peg.filter((p) => p.flag)
  const maxDev = data.peg.reduce((m, p) => Math.max(m, Math.abs(p.price - 1)), 0)

  const lineOpts = (fmt, marker, y = {}) => ({
    responsive: true, maintainAspectRatio: false, interaction: { mode: 'index', intersect: false },
    plugins: { tooltip: { callbacks: { label: (c) => ` ${c.dataset.label}  ${fmt(c.parsed.y)}` } }, eventMarker: marker },
    scales: { x: axisX, y: axisY(fmt, y) },
  })

  const conc = compare.concentration || []
  const sections = [
    { id: 'activity', label: 'Activity' }, { id: 'wallets', label: 'Real users' }, { id: 'cost', label: 'Cost' },
    { id: 'size', label: 'Transfer size' }, { id: 'daily', label: 'Daily volume' }, { id: 'peg', label: 'Peg' },
    ...(conc.length ? [{ id: 'concentration', label: 'Concentration' }] : []), { id: 'limits', label: 'Limits' },
  ]
  const nums = sections.reduce((m, s, i) => ({ ...m, [s.id]: String(i + 1).padStart(2, '0') }), {})

  const summary = [
    ['More transfers, less value',
      <>On Ethereum, USDT transfers <b className="text-fg-1">{moved(eU.all.transfers_change)}</b> after 5 Nov while the value moved <b className="text-fg-1">{moved(eU.all.vol_change)}</b>. Tron USDT, the rail most widely used for dollar transfers in Africa, held flat ({fmtChg(tU.all.vol_change)} value, {fmtChg(tU.all.transfers_change)} transfers).</>],
    ['The pullback was big money, not people',
      eU.wallets ? <>Remove exchanges, bots and contracts and Ethereum USDT value <b className="text-fg-1">{moved(eU.wallets.vol_change)}</b>, against {fmtAbsPct(eU.all.vol_change)} for all transfers.{tU.wallets && <> On Tron, where ordinary wallets carry {fmtPct(tU.wallets.share_of_volume_post, 0)} of the value, wallet value <b className="text-fg-1">{moved(tU.wallets.vol_change)}</b>.</>}</> : null],
    ['On Tron, cost is a setup choice',
      <>Moving $1,000 at a $10k ticket costs <b className="text-fg-1">{fmtUsd(cost.ethereum_usdt_per_1k, 3)}</b> on Ethereum and <b className="text-fg-1">{fmtUsd(cost.tron_usdt_full_per_1k, 2)}</b> on Tron with nothing staked, or nothing with staked energy ({fmtPct(cost.tron_zero_burn_share, 0)} of Tron transfers). Network fee only: FX margin and fiat legs aren't on-chain.</>],
  ]

  return (
    <>
      {/* ── Hero */}
      <section className="relative isolate overflow-hidden">
        <div className="absolute inset-0 -z-10"><HeroField /></div>
        <div className="mx-auto max-w-page px-4 pb-16 pt-14 sm:px-6 sm:pb-24 sm:pt-20">
          <Reveal>
            <p className="inline-flex items-center gap-2 rounded-pill border border-ink-line bg-ink/60 px-3 py-1 text-xs text-fg-2 backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-fg-1" /> Issue #0 · data {fmtDay(meta.first_day)} – {fmtDay(meta.last_day)} 2026 · Ethereum &amp; Tron
            </p>
          </Reveal>
          <Reveal delay={80}>
            <h1 className="mt-6 max-w-4xl text-[38px] font-semibold leading-[1.04] tracking-display text-fg-1 sm:text-[60px]">
              After Nigeria's CBN framework, more dollar transfers moved, not fewer.{' '}
              <span className="text-fg-3">Tron, Africa's main rail, didn't flinch.</span>
            </h1>
          </Reveal>
          <Reveal delay={160}>
            <p className="mt-6 max-w-2xl text-[17px] leading-relaxed text-fg-3">
              A public monitor of the stablecoin rails African businesses use to settle dollars, read before and after the CBN
              framework for virtual assets took effect on {fmtDay(meta.post_start)} 2026. Like-for-like weekdays, outlier days flagged and removed,
              every number checked on each build.
            </p>
          </Reveal>
          <Reveal delay={240} className="mt-10 grid gap-px overflow-hidden rounded-card border border-ink-line bg-ink-line md:grid-cols-3">
            {summary.filter(([, b]) => b).map(([h, b], i) => (
              <div key={h} className="bg-ink-2/90 p-5 backdrop-blur">
                <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-fg-3">0{i + 1}</p>
                <p className="mt-2 text-[15px] font-semibold leading-snug text-fg-1">{h}</p>
                <p className="mt-2 text-[13px] leading-relaxed text-fg-3">{b}</p>
              </div>
            ))}
          </Reveal>
          <Reveal delay={300} className="mt-6 flex flex-wrap items-center gap-3">
            <a href="#/issue-0" className="rounded-pill bg-fg-1 px-5 py-2.5 text-sm font-medium text-ink hover:bg-fg-2">Read the Issue #0 memo</a>
            <a href="#/method" className="inline-flex items-center gap-2 rounded-pill border border-ink-edge px-5 py-2.5 text-sm font-medium text-fg-1 hover:border-fg-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[#199e70]" /> {checksPassed}/{meta.checks?.length ?? 0} data checks passed
            </a>
            <a href={SITE.github} target="_blank" rel="noreferrer" className="px-2 py-2.5 text-sm text-fg-3 hover:text-fg-1">Queries &amp; code ↗</a>
          </Reveal>
        </div>
      </section>

      <SectionNav sections={sections} />

      {meta.missing?.length > 0 && (
        <div className="mx-auto max-w-page px-4 pt-6 sm:px-6">
          <p className="rounded-card border border-ink-line bg-ink-2 p-4 text-sm text-fg-3">
            Not loaded yet: {meta.missing.join(', ')}. Charts that need these files stay empty.
          </p>
        </div>
      )}

      <Chapter id="activity" n={nums.activity} kicker="Activity"
        headline={<>Ethereum USDT transfers {moved(eU.all.transfers_change)}; the value they carried {moved(eU.all.vol_change)}.</>}
        body={<>
          <p>Average weekday after 5 Nov against average weekday before, for each rail. More, smaller transfers on Ethereum; Tron, the rail most widely used for dollar transfers in Africa, barely moved.</p>
          <p>An early read: {nPost} comparable weekdays after 5 Nov. Change over this window is not proof the framework caused it.</p>
        </>}>
        <Panel kicker="Change after 5 Nov · average weekday vs before" title="Transfers and value, per rail"
          table={{ columns: ['Rail', 'Transfers/day before', 'after', 'change', 'Value/day before', 'after', 'change'],
            rows: compare.rails.map((r) => [railOf(r.chain, r.token).label,
              Math.round(r.all.baseline.transfers_per_day).toLocaleString(), Math.round(r.all.post.transfers_per_day).toLocaleString(), fmtChg(r.all.transfers_change, 1),
              fmtUsd(r.all.baseline.vol_per_day), fmtUsd(r.all.post.vol_per_day), fmtChg(r.all.vol_change, 1)]) }}
          note={`${compare.rule} Left out: ${compare.excluded_days.map(fmtDay).join(', ') || 'none'}.`}>
          <Legend items={actChart.datasets.map((d) => [d.label, d.backgroundColor])} />
          <div className="h-56">
            <Bar data={actChart} options={hbarOpts((v) => fmtChg(v / 100, 1), { ...pctRange(actChart.datasets.flatMap((d) => d.data)), ticks: { callback: (v) => `${v}%` } })} />
          </div>
        </Panel>
      </Chapter>

      {withWallets.length > 0 && (
        <Chapter id="wallets" n={nums.wallets} kicker="Real users"
          headline={tU.wallets
            ? <>On Tron, ordinary wallets carry {fmtPct(tU.wallets.share_of_volume_post, 0)} of USDT value. On Ethereum, {fmtPct(eU.wallets?.share_of_volume_post, 0)}.</>
            : <>Take out exchanges, bots and contracts, and Ethereum USDT value {moved(eU.wallets?.vol_change)}, not {fmtAbsPct(eU.all.vol_change)}.</>}
          body={<>
            <p>Ordinary wallets: neither side made 1,000+ transfers in the window (and on Ethereum, neither is a smart contract). That removes exchanges, market makers, bots and payment processors' hot wallets.</p>
            {tU.wallets && <p>So Ethereum's dollars are mostly exchanges and contracts moving liquidity; Tron's are mostly wallet-to-wallet. After 5 Nov, Tron wallet value {moved(tU.wallets.vol_change)} and Ethereum USDT wallet value {moved(eU.wallets?.vol_change)}, against {fmtAbsPct(eU.all.vol_change)} for all Ethereum USDT.</p>}
            <p>USDC is the exception: its wallet value {moved(eC.wallets?.vol_change)}, against {fmtAbsPct(eC.all.vol_change)} for all USDC transfers.</p>
          </>}>
          <Panel kicker="Value change after 5 Nov · average weekday vs before" title="All transfers vs ordinary wallets"
            table={{ columns: ['Rail', 'All · value change', 'Wallets · value change', 'Wallets · transfers change', 'Wallets share of transfers (after)', 'Wallets share of value (after)', 'Wallets $10k+ share (after)'],
              rows: withWallets.map((r) => [railOf(r.chain, r.token).label, fmtChg(r.all.vol_change, 1), fmtChg(r.wallets.vol_change, 1), fmtChg(r.wallets.transfers_change, 1),
                fmtPct(r.wallets.share_of_transfers_post, 0), fmtPct(r.wallets.share_of_volume_post, 0), fmtPct(bigShare(r.wallets.post.band_shares), 0)]) }}
            note="Ethereum also excludes any address in bigquery-public-data.crypto_ethereum.contracts. Tron has no public contract list, so its filter is activity-based only. A heuristic: exchange deposit addresses and some smart-account wallets can still pass.">
            <Legend items={walChart.datasets.map((d) => [d.label, d.backgroundColor])} />
            <div style={{ height: 70 + withWallets.length * 56 }}>
              <Bar data={walChart} options={hbarOpts((v) => fmtChg(v / 100, 1), { ...pctRange(walChart.datasets.flatMap((d) => d.data)), ticks: { callback: (v) => `${v}%` } })} />
            </div>
          </Panel>
        </Chapter>
      )}

      <Chapter id="cost" n={nums.cost} kicker="Cost to settle"
        headline={<>Per $1,000 moved: {fmtUsd(cost.ethereum_usdt_per_1k, 3)} on Ethereum, {fmtUsd(cost.tron_usdt_full_per_1k, 2)} on Tron unstaked, $0 staked.</>}
        body={<>
          <p>Network fee for one plain USDT transfer at a ${(cost.ticket_usd / 1000).toFixed(0)}k ticket, divided per $1,000. Fees don't scale with size, so bigger tickets cost less per $1,000.</p>
          <p>Tron has three prices, not one: free if the sender has staked TRX for energy and bandwidth ({fmtPct(cost.tron_zero_burn_share, 0)} of sampled transfers since 5 Nov), about $0.10 if only bandwidth is burned, and the full price if nothing is staked. Staking or renting energy is the biggest cost lever on Tron.</p>
          <p className="text-fg-2">Network fee is not the all-in corridor cost. FX margin, off-ramp fees and fiat legs aren't on-chain and aren't counted here.</p>
        </>}>
        <Panel kicker="USD per transfer · weekly" title="Network fee of one plain transfer"
          actions={<SeriesChips series={wf.series} hidden={hidden} onToggle={toggle} />}
          table={{ columns: ['Week of', ...wf.series.map((s) => s.label)], rows: wf.weeks.map((w, i) => [fmtDay(w), ...wf.series.map((s) => fmtUsd(s.values[i], 3))]) }}
          note="Ethereum: weekly median gas of direct transfer() calls. Tron: full-burn price (no staked energy) from 200 random transfers per day via TronGrid. Per-$1,000 figures use the median since 5 Nov.">
          <div className="mb-5 grid grid-cols-3 gap-px overflow-hidden rounded-xl border border-ink-line bg-ink-line">
            {[['Ethereum · per $1,000', fmtUsd(cost.ethereum_usdt_per_1k, 3)], ['Tron unstaked · per $1,000', fmtUsd(cost.tron_usdt_full_per_1k, 2)], ['Tron staked · per $1,000', '$0.00']].map(([k, v]) => (
              <div key={k} className="bg-ink-2 p-4"><p className="text-[11px] leading-snug text-fg-3">{k}</p><p className="mt-1.5 text-xl font-semibold tabular-nums text-fg-1">{v}</p></div>
            ))}
          </div>
          <div className="h-64"><Line data={feeChart} options={lineOpts((v) => fmtUsd(v, 2), { label: postLabel, text: 'CBN framework' })} /></div>
        </Panel>
      </Chapter>

      <Chapter id="size" n={nums.size} kicker="Transfer size"
        headline={<>Transfers of $10k or more carry {fmtPct(bigShare(eU.all.post.band_shares), 0)} of Ethereum USDT value and {fmtPct(bigShare(tU.all.post.band_shares), 0)} on Tron.</>}
        body={<><p>Share of each rail's value by transfer size, average weekday before and after 5 Nov. Most large-ticket value is exchanges, market makers and contracts moving liquidity; the Real users chapter separates them out.</p></>}>
        <Panel kicker="Share of value by transfer size" title="Before vs after 5 Nov"
          actions={<Segmented label="Window" value={win} onChange={setWin}
            options={[{ value: 'compare', label: 'Compare' }, { value: 'baseline', label: 'Before' }, { value: 'post', label: 'After' }]} />}
          table={{ columns: ['Rail', ...bandChart.datasets.map((d) => d.label)],
            rows: sizeRows.map((r, i) => [r.label, ...bandChart.datasets.map((d) => (d.data[i] == null ? '—' : `${d.data[i].toFixed(1)}%`))]) }}>
          <Legend items={meta.bands.map((b, i) => [BAND_LABEL[b], BAND_COLORS[i]])} />
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

      <Chapter id="daily" n={nums.daily} kicker="Daily volume"
        headline={biggest
          ? <>On {fmtDay(biggest.day)}, Ethereum {biggest.token} moved {fmtUsd(biggest.volume_usd)}, {biggest.multiple_of_median}× a normal day. It's flagged and left out.</>
          : <>No outlier days in this window.</>}
        body={<>
          <p>Any day where a rail moves more than 3× its median day is flagged and left out of every before/after figure. {biggest && <>On {fmtDay(biggest.day)} ordinary wallets were quiet, so the spike came from contracts or bots, not payments.</>}</p>
          <p>USDT's share of Ethereum USDT+USDC value: {fmtPct(compare.usdt_share_of_eth_usdt_usdc.baseline, 0)} before 5 Nov, {fmtPct(compare.usdt_share_of_eth_usdt_usdc.post, 0)} after.</p>
        </>}>
        <Panel kicker="USD per day" title="Daily value moved"
          actions={<Segmented label="Rail" value={volRail} onChange={setVolRail} options={RAILS.map((r) => ({ value: r.key, label: r.label }))} />}
          table={{ columns: ['Day', vr.label, 'Flag'], rows: vol.days.map((d, i) => [fmtDay(d), fmtUsd(vol.values[i]), isFlag(d) ? 'Flagged outlier' : '']) }}
          note="Mints and burns are excluded, so issuance doesn't count as activity. Red dots: flagged outlier days.">
          <div className="h-64"><Line data={volChart} options={lineOpts((v) => fmtUsd(v, 0), { markers: volMarkers })} /></div>
        </Panel>
      </Chapter>

      <Chapter id="peg" n={nums.peg} kicker="Price stability"
        headline={pegFlags.length ? <>{pegFlags.length} day{pegFlags.length > 1 ? 's' : ''} moved 0.5% or more off $1.</> : <>Neither dollar moved 0.5% off $1.</>}
        body={<p>Daily price from CoinGecko. Largest single-day deviation in the window: {fmtPct(maxDev, 2)}. Large dots mark flagged days.</p>}>
        <Panel kicker="USD price · daily" title="USDT and USDC against $1.00"
          table={{ columns: ['Day', 'USDT', 'USDC'], rows: pegDays.map((d) => [fmtDay(d), ...['USDT', 'USDC'].map((t) => pegOf(d, t)?.price?.toFixed(4) ?? '—')]) }}>
          <Legend items={[['USDT', RAILS[0].color, true], ['USDC', RAILS[2].color, true]]} />
          <div className="h-64"><Line data={pegChart} options={lineOpts((v) => (v == null ? '—' : `$${Number(v).toFixed(3)}`),
            { label: postLabel, text: '5 Nov' }, { suggestedMin: 0.99, suggestedMax: 1.01 })} /></div>
        </Panel>
      </Chapter>

      {conc.length > 0 && (
        <Chapter id="concentration" n={nums.concentration} kicker="Who moves it"
          headline={(() => {
            const ce = conc.find((c) => c.chain === 'ethereum' && c.token === 'USDT'), ct = conc.find((c) => c.chain === 'tron')
            return ce && ct
              ? <>Ten addresses send {fmtPct(ce.post, 0)} of Ethereum USDT value on an average weekday. On Tron, {fmtPct(ct.post, 0)}.</>
              : <>Ten addresses send {fmtPct(conc[0].post, 0)} of {railOf(conc[0].chain, conc[0].token).label} value on an average weekday.</>
          })()}
          body={<>
            <p>Share of each day's value sent by that day's 10 largest senders, averaged over comparable weekdays. High concentration points to exchanges and market makers; low concentration means many independent senders.</p>
            <p>Ethereum got less concentrated after 5 Nov, consistent with the big-ticket pullback in the Activity chapter. Tron was already spread thin and stayed that way.</p>
          </>}>
          <Panel kicker="Top-10 sender share · average weekday"
            table={{ columns: ['Rail', 'Before', 'After'], rows: conc.map((c) => [railOf(c.chain, c.token).label, fmtPct(c.baseline), fmtPct(c.post)]) }}>
            <div className={`grid gap-px overflow-hidden rounded-xl border border-ink-line bg-ink-line ${['', 'sm:grid-cols-1', 'sm:grid-cols-2', 'sm:grid-cols-3'][Math.min(conc.length, 3)]}`}>
              {conc.map((c) => (
                <div key={c.chain + c.token} className="bg-ink-2 p-5">
                  <p className="inline-flex items-center gap-2 text-sm text-fg-2"><span className="h-2 w-2 rounded-full" style={{ background: railOf(c.chain, c.token).color }} />{railOf(c.chain, c.token).label}</p>
                  <div className="mt-4 flex flex-wrap items-end gap-x-5 gap-y-2">
                    <div><p className="text-[11px] text-fg-3">Before</p><p className="text-lg font-semibold tabular-nums text-fg-3">{fmtPct(c.baseline)}</p></div>
                    <div><p className="text-[11px] text-fg-3">After</p><p className="text-2xl font-semibold tabular-nums text-fg-1">{fmtPct(c.post)}</p></div>
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        </Chapter>
      )}

      {/* ── Limits: light editorial band for rhythm and emphasis */}
      <section id="limits" className="scroll-mt-16 bg-paper text-paper-text">
        <div className="mx-auto grid max-w-page gap-10 px-4 py-20 sm:px-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-12">
          <Reveal>
            <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-paper-muted">{nums.limits} · Limits</p>
            <h2 className="mt-4 text-[28px] font-semibold leading-[1.1] tracking-display sm:text-[36px]">What this data can't tell you.</h2>
            <p className="mt-4 max-w-md text-[15px] leading-relaxed text-paper-muted">Read these before quoting any number. The method page lists every definition and every check run on each build.</p>
          </Reveal>
          <Reveal delay={120}>
            <ol className="divide-y divide-paper-line border-y border-paper-line">
              {[
                ['No country field', 'These are rails Nigerian businesses use, not Nigerian volume.'],
                ['Network fee is not all-in cost', 'FX margin, off-ramp fees, bank transfers and P2P trades never touch the chain.'],
                ['Size is a proxy', 'One person can send $50k; a business can split payments into small ones.'],
                ['Early read, not cause', `${nPost} comparable weekdays after 5 Nov show what changed, not why.`],
                ['Why Ethereum gets more charts', "BigQuery has full Ethereum history plus a public contract list. Tron has full transfers but no contract list, so its wallet filter is cruder."],
                ['Two chains so far', 'BNB Smart Chain and Solana, the other rails Nigerians use most, come in Issue #1.'],
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
              <a href="#/issue-0" className="rounded-pill bg-fg-1 px-5 py-2.5 text-sm font-medium text-ink hover:bg-fg-2">Read Issue #0</a>
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
