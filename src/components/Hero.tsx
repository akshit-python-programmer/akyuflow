import { HeroGhost } from '../ghost/HeroGhost'
import { site } from '../site.config'
import { headlineVariant } from '../lib/variant'
import { shipDateLabel } from '../lib/format'
import { ReserveLink, WaitlistLink } from './Cta'
import { Demo } from './Demo'
import { isLaunch } from './DemoTag'
import { Pronounce } from './Pronounce'
import windowsLogo from '../../windows.png'
import macOSLogo from '../../mac-os-logo.png'
import './Hero.css'

export function Hero() {
  return (
    <section className="hero" id="top" data-recap="the top of the page">
      <div className="wrap hero__grid">
        <div className="hero__copy">
          <Pronounce />
          <p className="hero__kicker pixel">A personal assistant, built for ADHD brains</p>
          <h1>
            {headlineVariant() === 'a' ? (
              <>
                You don't need another productivity system. You need <span className="hero__mark">an assistant</span>.
              </>
            ) : (
              <>
                Built for <span className="hero__mark">ADHD brains</span> that lose track of time.
              </>
            )}
          </h1>
          <p className="hero__sub">
            Akyu is a tiny ghost that lives on your screen. Tell it your day in plain words and it plans it, then
            replans it when things change. It stays beside you, keeping time in view so the plan actually happens. Ask,
            and it fixes your writing{isLaunch('emailReply') ? ' and drafts replies' : ''} too.{!isLaunch('emailReply') && ' After launch it will draft replies.'}
          </p>
          <div className="hero__actions">
            <ReserveLink placement="hero" />
            <WaitlistLink placement="hero" />
          </div>
          <div className="hero__platforms-wrap">
            <p className="hero__platform-label pixel small soft">Platform availability</p>
            <ul className="hero__platforms" aria-label="Platform availability">
              <li className="hero__platform">
                <img src={windowsLogo} alt="" />
                <span>
                  <strong>Windows</strong>
                  <small>Launching {shipDateLabel()}</small>
                </span>
              </li>
              <li className="hero__platform">
                <img src={macOSLogo} alt="" />
                <span>
                  <strong>macOS</strong>
                  <small>Coming {shipDateLabel(site.macShipDate)}</small>
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="hero__ghost">
          <HeroGhost />
          <p className="hero__timing">
            <span className="small soft pixel">“What's on your plate today?”</span>
          </p>
        </div>
      </div>

      <div className="wrap hero__demo">
        <Demo />
      </div>
    </section>
  )
}
