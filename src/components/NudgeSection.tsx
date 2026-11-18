import type { Choice } from '../lib/visit'
import { useVisit } from '../lib/visit'
import { copy } from '../lib/copy'
import { Demo } from './Demo'
import { DemoTag } from './DemoTag'
import { CHOICES } from './NudgePanel'
import './NudgeSection.css'

const MEANING: Record<Choice, string> = {
  back: 'You wandered off. Pick the task back up.',
  break: 'You need a pause. Take one on purpose.',
  part: 'Akyu guessed wrong. Say so and keep going.',
}

export function NudgeSection() {
  const visit = useVisit()
  const c = copy()

  return (
    <section className="section nudgesec" id="nudge" data-recap="The nudge">
      <div className="wrap nudgesec__grid">
        <div className="nudgesec__copy">
          <p>
            <span className="captag pixel">2 · Stays by your side</span>
          </p>
          <h2 className="nudgesec__title">{c.nudge.title}</h2>
          <p className="nudgesec__lede">{c.nudge.lede}</p>
          <dl className="nudgesec__meanings">
            {CHOICES.map((choice) => (
              <div key={choice.id}>
                <dt>{choice.label}:</dt> <dd>{MEANING[choice.id]}</dd>
              </div>
            ))}
          </dl>
          {!visit.ghostHidden && (
            <p className="nudgesec__try small soft">
              Want to feel it? Open another tab for ten seconds, then come back.
            </p>
          )}
        </div>

        <div className="nudgesec__stage">
          <Demo part="drift" />
          <div className="nudgesec__foot">
            <DemoTag capability="nudge" />
          </div>
        </div>
      </div>
    </section>
  )
}
