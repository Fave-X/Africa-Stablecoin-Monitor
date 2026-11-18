import { useEffect, useState } from 'react'
import Monitor from './pages/Monitor'
import MarkdownPage from './pages/MarkdownPage'
import Footer from './components/Footer'
import methodMd from '../../METHOD.md?raw'
import issue0Md from '../../reports/issue-0/README.md?raw'
import { SITE } from './site.config'

const ROUTES = [
  { path: '/', label: 'Monitor' },
  { path: '/issue-0', label: 'Issue #0' },
  { path: '/method', label: 'Method' },
]
// Only finished pages are routed. Drafts (e.g. the Nigeria receive-side brief) stay out until they're done.
const DOCS = { '/method': methodMd, '/issue-0': issue0Md }

const useRoute = () => {
  const get = () => {
    const h = window.location.hash.replace(/^#/, '')
    return ROUTES.some((r) => r.path === h) ? h : '/'
  }
  const [r, setR] = useState(get)
  useEffect(() => {
    const on = () => { const n = get(); setR((p) => { if (p !== n) window.scrollTo(0, 0); return n }) }
    window.addEventListener('hashchange', on)
    return () => window.removeEventListener('hashchange', on)
  }, [])
  return r
}

export default function App() {
  const route = useRoute()
  const [data, setData] = useState(null)
  const [err, setErr] = useState(null)

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}data/monitor.json`, { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
      .then(setData).catch((e) => setErr(e.message))
  }, [])

  return (
    <div className="min-h-screen bg-ink text-fg-1">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-pill focus:bg-fg-1 focus:px-4 focus:py-2 focus:text-ink">Skip to content</a>
      {data?.meta?.sample && (
        <div role="alert" className="bg-flag px-4 py-2 text-center text-xs font-semibold text-ink">
          SAMPLE DATA: every number on this page is synthetic. Do not share this link until real data is loaded.
        </div>
      )}
      <header className="border-b border-ink-line">
        <div className="mx-auto flex max-w-page flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <a href="#/" className="flex items-baseline gap-2">
            <span className="text-sm font-semibold tracking-tightish text-fg-1">{SITE.name}</span>
            <span className="text-xs text-fg-3">by {SITE.author}</span>
          </a>
          <nav aria-label="Pages" className="flex flex-wrap gap-1">
            {ROUTES.map((r) => (
              <a key={r.path} href={`#${r.path}`} aria-current={route === r.path ? 'page' : undefined}
                className={`rounded-pill px-3 py-1.5 text-xs transition-colors ${route === r.path ? 'bg-ink-3 text-fg-1' : 'text-fg-3 hover:text-fg-1'}`}>
                {r.label}
              </a>
            ))}
          </nav>
        </div>
      </header>

      <main id="main">
        {DOCS[route] ? <div className="px-4 py-12 sm:px-6"><MarkdownPage source={DOCS[route]} /></div>
          : err ? <p className="mx-auto max-w-page px-6 py-20 text-fg-3">Couldn't load data/monitor.json ({err}). Run the pipeline first.</p>
          : !data ? <p className="mx-auto max-w-page px-6 py-20 text-fg-3">Loading…</p>
          : <Monitor data={data} />}
      </main>

      <Footer meta={data?.meta} />
    </div>
  )
}
