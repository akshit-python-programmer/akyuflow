import type { ReactNode } from 'react'
import { reserveLabel } from '../components/Cta'
import { SiteLinks, type PageSlug } from '../components/SiteLinks'
import { GhostSprite } from '../ghost/GhostSprite'
import { checkoutOpen, site } from '../site.config'
import '../components/Header.css'
import '../components/Footer.css'
import './Pages.css'

/** Path from any of these pages back to the home page. */
export const HOME = '../'

/** Header and footer for the plain pages. Lighter than the home page's: no timer, no corner ghost. */
export function PageShell({ current, children }: { current: PageSlug; children: ReactNode }) {
  const email = site.supportEmail.trim()

  return (
    <>
      <a className="skip" href="#main">
        Skip to content
      </a>
      <header className="header">
        <div className="wrap header__in">
          <a className="header__brand" href={HOME} aria-label="Akyu, back to the home page">
            <GhostSprite unit={2} level={0.6} />
            <span className="pixel">akyu</span>
          </a>
          <nav className="header__nav" aria-label="Get Akyu">
            <a className="link" href={HOME}>
              Back to the home page
            </a>
            {checkoutOpen && (
              <a className="btn btn--small" href={`${HOME}#reserve`}>
                <span className="btn__face">{reserveLabel}</span>
              </a>
            )}
          </nav>
        </div>
      </header>

      <main id="main" className="page">
        <div className="wrap">{children}</div>
      </main>

      <footer className="footer page__footer">
        <div className="wrap footer__meta small soft">
          <SiteLinks root={HOME} current={current} />
          <p>Akyu is a desktop app. Windows first, Mac to follow. It is not released yet.</p>
          {email && (
            <p>
              <a href={`mailto:${email}`}>{email}</a>
            </p>
          )}
          <p>
            © {new Date().getFullYear()} Akyu, by {site.founder.name}
          </p>
        </div>
      </footer>
    </>
  )
}
