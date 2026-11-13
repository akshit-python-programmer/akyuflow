import { HeroGhost } from '../ghost/HeroGhost'
import { site } from '../site.config'
import { shipDateLabel } from '../lib/format'
import { readout, useVisit } from '../lib/visit'
import { ReserveLink, WaitlistLink } from './Cta'
import { Demo } from './Demo'
import { isLaunch } from './DemoTag'
import { Pronounce } from './Pronounce'
import './Hero.css'

/**
 * "Akyu also helps when you ask..." built from the capabilities config, so a
 * help that is not ready at launch is never presented as if it were.
 */
function askLine(): string {
  const helps = [
    { now: 'plans your day', later: 'plan your day', on: isLaunch('planDay') },
    { now: 'drafts replies', later: 'draft replies', on: isLaunch('emailReply') },
    { now: 'fixes your writing', later: 'fix your writing', on: isLaunch('fixMessage') },
  ]
  const list = (items: string[]) =>
    items.length <= 1 ? items.join('') : `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`
  const now = helps.filter((h) => h.on).map((h) => h.now)
  const later = helps.filter((h) => !h.on).map((h) => h.later)
  if (later.length === 0) return `Ask it out loud or by typing, and it ${list(now)}.`
  if (now.length === 0) return `After launch, ask it out loud or by typing and it will ${list(later)}.`
  return `Ask it out loud or by typing, and it ${list(now)}. After launch it will ${list(later)} too.`
}

export function Hero() {
  const visit = useVisit()
  const { time, caption } = readout(visit)

  return (
    <section className="hero" id="top" data-recap="the top of the page">
      <div className="wrap hero__grid">
        <div className="hero__copy">
          <Pronounce />
          <h1>
            A tiny ghost on your screen that you can talk to. It reads your window, plans your day and makes your
            to-dos.
          </h1>
          <p className="hero__sub">Built for ADHD brains and time blindness.</p>
          <p className="hero__also">{askLine()}</p>
          <p className="hero__also">It also keeps your time on screen and checks in if you drift.</p>
          <div className="hero__actions">
            <ReserveLink placement="hero" />
            <WaitlistLink placement="hero" />
          </div>
          <p className="hero__note small soft">
            Not released yet. Windows ships {shipDateLabel()}. Mac follows in {shipDateLabel(site.macShipDate)}.
          </p>
        </div>

        <div className="hero__ghost">
          <HeroGhost />
          <p className="hero__timing">
            <span className="hero__clock pixel">{time}</span>
            <span className="small soft">{caption}</span>
          </p>
        </div>
      </div>

      <div className="wrap hero__demo">
        <Demo />
      </div>
    </section>
  )
}
