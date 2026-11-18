import { CapTag } from './DemoTag'
import type { Capability } from '../site.config'
import { copy } from '../lib/copy'
import './Familiar.css'

interface Moment {
  /** The moment, in the visitor's own words. */
  feel: string
  /** What Akyu does about it. */
  akyu: string
  capability: Capability
}

/**
 * The everyday moments of ADHD and time blindness, each paired with the part of
 * Akyu that helps. Relatable, not clinical: never say Akyu treats anything.
 */
const MOMENTS: readonly Moment[] = [
  {
    feel: 'One thing runs over and the whole plan falls apart.',
    akyu: 'One click and Akyu replans the rest of your day around what actually happened.',
    capability: 'replan',
  },
  {
    feel: 'The big task waits all day because starting is the hardest part.',
    akyu: 'Say your day in one line. Akyu turns it into small, timed blocks with the first step first.',
    capability: 'planDay',
  },
  {
    feel: "You've set up five planner apps and abandoned every one.",
    akyu: 'Akyu has nothing to maintain. You just talk.',
    capability: 'planDay',
  },
  {
    feel: 'You sit down for “five minutes” and look up two hours later.',
    akyu: 'Akyu keeps a timer on top of your screen, so time stays visible instead of vanishing.',
    capability: 'focusGhost',
  },
  {
    feel: 'A two-line message takes you forty minutes to send.',
    akyu: 'Ask Akyu to fix your message, and it tidies the wording so you can hit send.',
    capability: 'fixMessage',
  },
]

export function Familiar() {
  const c = copy()

  return (
    <section className="section familiar" id="adhd" data-recap={c.familiar.recap}>
      <div className="wrap">
        <h2>
          {c.familiar.title} <span className="familiar__soft">{c.familiar.soft}</span>
        </h2>
        <p className="lede familiar__lede">{c.familiar.lede}</p>
        <ul className="familiar__list">
          {MOMENTS.map((m) => (
            <li key={m.feel} className="familiar__item">
              <p className="familiar__feel">{m.feel}</p>
              <p className="familiar__akyu">
                <span className="familiar__arrow pixel" aria-hidden="true">
                  →
                </span>
                <span>{m.akyu}</span>
              </p>
              <CapTag capability={m.capability} className="familiar__tag" />
            </li>
          ))}
        </ul>
        <p className="familiar__fine small soft">{c.familiar.fine}</p>
      </div>
    </section>
  )
}
