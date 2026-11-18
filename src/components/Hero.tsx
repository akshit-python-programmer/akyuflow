import { HeroGhost } from '../ghost/HeroGhost'
import { site } from '../site.config'
import { copy } from '../lib/copy'
import { shipDateLabel } from '../lib/format'
import { ReserveLink, WaitlistLink } from './Cta'
import { Demo } from './Demo'
import { isLaunch } from './DemoTag'
import { Pronounce } from './Pronounce'
import windowsLogo from '../../windows.png'
import macOSLogo from '../../mac-os-logo.png'
import './Hero.css'

export function Hero() {
  const c = copy()

  return (
    <section className="hero" id="top" data-recap="the top of the page">
      <div className="wrap hero__grid">
        <div className="hero__copy">
          <Pronounce />
          <p className="hero__kicker pixel">{c.hero.kicker}</p>
          <h1>
            {c.hero.headline.lead}
            <span className="hero__mark">{c.hero.headline.mark}</span>
            {c.hero.headline.tail}
          </h1>
          <p className="hero__sub">
            {c.hero.sub} Ask, and it fixes your writing{isLaunch('emailReply') ? ' and drafts replies' : ''} too.
            {!isLaunch('emailReply') && ' After launch it will draft replies.'}
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
