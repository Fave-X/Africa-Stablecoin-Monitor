import { useEffect, useRef, useState } from 'react'

// Fades/raises its children in the first time they scroll into view.
export function Reveal({ as: Tag = 'div', className = '', delay = 0, children, ...rest }) {
  const ref = useRef(null)
  const [inView, setIn] = useState(false)
  useEffect(() => {
    const el = ref.current
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setIn(true); io.disconnect() } },
      { rootMargin: '0px 0px -10% 0px' })
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return <Tag ref={ref} style={{ transitionDelay: `${delay}ms` }} className={`reveal ${inView ? 'is-in' : ''} ${className}`} {...rest}>{children}</Tag>
}

// Pill segmented control (single choice).
export function Segmented({ options, value, onChange, label }) {
  return (
    <div role="radiogroup" aria-label={label} className="inline-flex rounded-pill border border-ink-line bg-ink-2 p-1">
      {options.map((o) => (
        <button key={o.value} role="radio" aria-checked={value === o.value} onClick={() => onChange(o.value)}
          className={`rounded-pill px-3.5 py-1.5 text-xs font-medium transition-colors ${value === o.value
            ? 'bg-fg-1 text-ink' : 'text-fg-3 hover:text-fg-1'}`}>
          {o.label}
        </button>
      ))}
    </div>
  )
}

// Toggle chips for series on/off. Colour swatch carries identity; text stays neutral.
export function SeriesChips({ series, hidden, onToggle }) {
  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Show or hide series">
      {series.map((s) => {
        const off = hidden.has(s.key)
        return (
          <button key={s.key} onClick={() => onToggle(s.key)} aria-pressed={!off}
            className={`inline-flex items-center gap-2 rounded-pill border px-3 py-1.5 text-xs transition-colors ${off
              ? 'border-ink-line text-fg-3' : 'border-ink-edge text-fg-1 hover:border-fg-3'}`}>
            <span className="h-2 w-2 rounded-full" style={{ background: off ? 'transparent' : s.color, boxShadow: `inset 0 0 0 1.5px ${s.color}` }} />
            {s.label}
          </button>
        )
      })}
    </div>
  )
}

// Content card: title row with an optional data-table toggle, chart body, footnote.
export function Panel({ title, kicker, children, table, note, actions }) {
  const [showTable, setShowTable] = useState(false)
  return (
    <div className="rounded-card border border-ink-line bg-ink-2 p-5 shadow-halo sm:p-6">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          {kicker && <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-fg-3">{kicker}</p>}
          {title && <h3 className="mt-1 text-[15px] font-medium text-fg-1">{title}</h3>}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {actions}
          {table && (
            <button onClick={() => setShowTable((s) => !s)}
              className="rounded-pill border border-ink-line px-3 py-1.5 text-xs text-fg-2 hover:border-fg-3 hover:text-fg-1">
              {showTable ? 'Chart' : 'Table'}
            </button>
          )}
        </div>
      </div>
      {showTable && table ? <DataTable {...table} /> : children}
      {note && <p className="mt-4 text-xs leading-relaxed text-fg-3">{note}</p>}
    </div>
  )
}

export function DataTable({ columns, rows }) {
  return (
    <div className="max-h-80 overflow-auto">
      <table className="w-full text-left text-sm">
        <thead className="sticky top-0 bg-ink-2 text-fg-3">
          <tr>{columns.map((c) => <th key={c} className="border-b border-ink-line py-2 pr-4 font-medium">{c}</th>)}</tr>
        </thead>
        <tbody className="text-fg-2">
          {rows.map((r, i) => (
            <tr key={i} className="border-b border-ink-line/60">
              {r.map((v, j) => <td key={j} className="py-1.5 pr-4 tabular-nums">{v}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// Sticky in-page nav with scroll-spy: highlights the section currently on screen.
export function SectionNav({ sections }) {
  const [active, setActive] = useState(sections[0]?.id)
  useEffect(() => {
    const io = new IntersectionObserver((entries) => {
      const vis = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
      if (vis[0]) setActive(vis[0].target.id)
    }, { rootMargin: '-35% 0px -55% 0px' })
    sections.forEach((s) => { const el = document.getElementById(s.id); el && io.observe(el) })
    return () => io.disconnect()
  }, [sections])
  return (
    <nav aria-label="Sections" className="sticky top-0 z-20 border-b border-ink-line bg-ink/85 backdrop-blur">
      <div className="mx-auto flex max-w-page gap-1 overflow-x-auto px-4 py-2.5 sm:px-6">
        {sections.map((s) => (
          <a key={s.id} href={`#${s.id}`}
            onClick={(e) => { e.preventDefault(); document.getElementById(s.id)?.scrollIntoView({ behavior: 'smooth' }) }}
            className={`whitespace-nowrap rounded-pill px-3 py-1.5 text-xs transition-colors ${active === s.id
              ? 'bg-ink-3 text-fg-1' : 'text-fg-3 hover:text-fg-1'}`}>
            {s.label}
          </a>
        ))}
      </div>
    </nav>
  )
}
