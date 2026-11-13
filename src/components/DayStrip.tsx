import type { MouseEvent } from 'react'
import { GhostSprite } from '../ghost/GhostSprite'
import type { Mood } from '../ghost/sprite'
import { calm, requestDemo, type Target } from '../lib/akyu'
import { track } from '../lib/track'
import type { Capability } from '../site.config'
import { CapTag } from './DemoTag'
import './DayStrip.css'

interface Moment {
  time: string
  what: string
  href: string
  /** Opens a demo on the right tab without running it. */
  target?: Target
  capability: Capability
  mood: Mood
}

const MOMENTS: readonly Moment[] = [
  { time: '9:00', what: 'Plans your day and makes your to-dos', href: '#plan-demo', target: 'plan', capability: 'planDay', mood: 'happy' },
  { time: '10:40', what: 'Reads your screen, drafts a reply', href: '#screen-demo', target: 'reply', capability: 'emailReply', mood: 'right' },
  { time: '1:15', what: 'Fixes your message', href: '#screen-demo', target: 'fix', capability: 'fixMessage', mood: 'happy' },
  { time: '3:40', what: 'Replans after an overrun', href: '#plan-demo', target: 'lost', capability: 'replan', mood: 'idle' },
  { time: '5:10', what: 'Checks in if you drift', href: '#nudge', capability: 'nudge', mood: 'left' },
  { time: '6:00', what: 'Shows the recap', href: '#recap', capability: 'dayRecap', mood: 'rest' },
]

export function DayStrip() {
  function go(event: MouseEvent<HTMLAnchorElement>, moment: Moment) {
    track('day_strip_click', { moment: moment.time })
    if (moment.target) {
      event.preventDefault()
      requestDemo(moment.target, false)
      return
    }
    const el = document.querySelector<HTMLElement>(moment.href)
    if (!el) return
    event.preventDefault()
    el.scrollIntoView({ behavior: calm() ? 'auto' : 'smooth', block: 'start' })
    if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '-1')
    el.focus({ preventScroll: true })
  }

  return (
    <section className="section daystrip" id="day" data-recap="A day with Akyu">
      <div className="wrap">
        <h2>A day with Akyu</h2>
        <p className="lede daystrip__lede">One assistant on your screen, from the first plan to the last recap.</p>
        <ol className="daystrip__line">
          {MOMENTS.map((moment) => (
            <li key={moment.time} className="daystrip__item">
              <a className="daystrip__link" href={moment.href} onClick={(event) => go(event, moment)}>
                <span className="daystrip__time pixel">{moment.time}</span>
                <span className="daystrip__dot" aria-hidden="true">
                  <GhostSprite unit={2} level={0.6} mood={moment.mood} />
                </span>
                <span className="daystrip__what">{moment.what}</span>
                <span className="daystrip__go small">See it</span>
              </a>
              <CapTag capability={moment.capability} className="daystrip__tag" />
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
