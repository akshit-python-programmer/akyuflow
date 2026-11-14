import { GhostSprite } from '../ghost/GhostSprite'
import { short } from '../lib/format'
import { ghostLook, recap, setGhostHidden, useVisit } from '../lib/visit'
import { site } from '../site.config'
import './Footer.css'

export function Footer() {
  // Subscribing re-renders this once a second, which is what keeps the recap current.
  const visit = useVisit()
  const { level, tone } = ghostLook(visit)
  const visitRecap = recap()
  const email = site.supportEmail.trim()
  const counted = site.analytics.provider !== 'none'

  return (
    <footer className="footer">
      <div className="wrap footer__in">
        <div className="footer__recap">
          <GhostSprite unit={4} level={level} tone={tone} />
          <div>
            <p className="footer__line pixel">
              You've been here {short(visitRecap.totalSec)}.
              {visitRecap.longest && (
                <>
                  {' '}
                  Longest stop: {visitRecap.longest.name} ({short(visitRecap.longest.sec)}).
                </>
              )}
              {visitRecap.drifts > 0 && (
                <>
                  {' '}
                  Away {visitRecap.drifts === 1 ? 'once' : `${visitRecap.drifts} times`} ({short(visitRecap.driftSec)}).
                </>
              )}
            </p>
            <p className="small soft">
              That is a recap of this visit, the way Akyu recaps a day. It was counted in this tab and is not stored or
              sent anywhere.
            </p>
          </div>
        </div>

        <div className="footer__meta small soft">
          <p>Akyu is a desktop app. Windows first, Mac to follow. It is not released yet.</p>
          {email && (
            <p>
              <a href={`mailto:${email}`}>{email}</a>
            </p>
          )}
          {counted && <p>This site counts visits and button clicks. It does not use cookies.</p>}
          {visit.ghostHidden && (
            <p>
              <button type="button" className="footer__back link" onClick={() => setGhostHidden(false)}>
                Bring the ghost back
              </button>
            </p>
          )}
          <p>
            © {new Date().getFullYear()} Akyu, by {site.founder.name}
            {site.founder.website && (
              <>
                {' · '}
                <a href={site.founder.website} rel="noopener">
                  {site.founder.website.replace(/^https?:\/\//, '')}
                </a>
              </>
            )}
          </p>
        </div>
      </div>
    </footer>
  )
}
