import { SITE } from '../site.config'

const Col = ({ title, links }) => (
  <div>
    <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-fg-3">{title}</p>
    <ul className="mt-3 space-y-2 text-sm">
      {links.filter((l) => l.href).map((l) => (
        <li key={l.label}>
          <a href={l.href} {...(l.href.startsWith('http') ? { target: '_blank', rel: 'noreferrer' } : {})}
            className="text-fg-2 underline-offset-4 hover:text-fg-1 hover:underline">{l.label}</a>
        </li>
      ))}
    </ul>
  </div>
)

// "Wordmark bleed" footer: link columns on top, an oversized wordmark cropped by the page edge.
export default function Footer({ meta }) {
  return (
    <footer className="relative overflow-hidden border-t border-ink-line bg-ink">
      <div className="mx-auto grid max-w-page gap-10 px-4 pb-10 pt-14 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
        <div className="lg:col-span-1">
          <p className="text-sm font-medium text-fg-1">{SITE.name}</p>
          <p className="mt-2 max-w-xs text-sm leading-relaxed text-fg-3">
            Independent on-chain research by {SITE.author}. Public data, open method, every number reproducible.
          </p>
        </div>
        <Col title="Read" links={[
          { label: 'Monitor', href: '#/' }, { label: 'Issue #0', href: '#/issue-0' },
          { label: 'Nigeria receive-side', href: '#/nigeria-receive-side' }, { label: 'Compliance trace', href: '#/compliance-trace' },
        ]} />
        <Col title="Check" links={[
          { label: 'Method & limits', href: '#/method' }, { label: 'Source code', href: SITE.github },
        ]} />
        <Col title="Contact" links={[
          { label: 'X · @FaveDigitalsHQ', href: SITE.x }, { label: 'Portfolio', href: SITE.portfolio },
          { label: 'Writing', href: SITE.paragraph }, { label: 'Email', href: SITE.email && `mailto:${SITE.email}` },
        ]} />
      </div>
      <div className="mx-auto flex max-w-page flex-wrap justify-between gap-2 px-4 text-xs text-fg-3 sm:px-6">
        <span>Not financial or legal advice.</span>
        {meta && <span>Last built {meta.generated_at.replace('T', ' ').slice(0, 16)} UTC</span>}
      </div>
      <div aria-hidden="true" className="pointer-events-none select-none px-2">
        <p className="-mb-[0.22em] mt-6 text-center text-[24vw] font-semibold leading-none tracking-display text-ink-3">
          RAILS
        </p>
      </div>
    </footer>
  )
}
