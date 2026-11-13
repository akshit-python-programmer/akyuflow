import { useState, type CSSProperties } from 'react'
import { demoCompleted, demoStarted } from '../lib/akyu'
import type { Choice } from '../lib/visit'
import { useVisit } from '../lib/visit'
import { DemoTag } from './DemoTag'
import { CHOICES, NudgePanel } from './NudgePanel'
import { PixelBox } from './PixelBox'
import './NudgeSection.css'

const MEANING: Record<Choice, string> = {
  back: 'You wandered off. Pick the task back up.',
  break: 'You need a pause. Take one on purpose.',
  part: 'Akyu guessed wrong. Say so and keep going.',
}

const REPLY: Record<Choice, string> = {
  back: 'Welcome back.',
  break: 'Enjoy the five minutes.',
  part: 'Got it. Carry on.',
}

const TILES = ['#ffb58c', '#b9b0ff', '#ffe08a', '#9fd8ff', '#ff8fa8', '#a9f2dd', '#b9b0ff', '#ffb58c', '#ffe08a']

export function NudgeSection() {
  const [chosen, setChosen] = useState<Choice | null>(null)
  const visit = useVisit()

  return (
    <section className="section nudgesec" id="nudge" data-recap="The nudge">
      <div className="wrap">
        <h2>And if you drift, Akyu just asks.</h2>
        <p className="lede nudgesec__lede">Three buttons, all the same size. None of them is the wrong answer.</p>

        <div className="nudgesec__grid">
          <div className="nudgesec__stage">
            <PixelBox shadow className="nudgesec__screen">
              <div className="driftwin">
                <div className="driftwin__bar" aria-hidden="true">
                  <span />
                  Videos
                </div>
                <div className="driftwin__feed" aria-hidden="true">
                  {TILES.map((color, i) => (
                    <span key={i} style={{ '--c': color } as CSSProperties} />
                  ))}
                </div>
                <div className="nudgesec__panel">
                  <NudgePanel
                    line="Still on the report?"
                    chosen={chosen}
                    onChoose={(choice) => {
                    // Starting and finishing are one press here.
                    demoStarted('nudge')
                    setChosen(choice)
                    demoCompleted('nudge', REPLY[choice])
                  }}
                    mood={chosen === 'back' ? 'happy' : chosen === 'break' ? 'rest' : 'idle'}
                  />
                </div>
              </div>
            </PixelBox>
            <div className="nudgesec__tag">
              <DemoTag capability="nudge" />
            </div>
            <p className="nudgesec__reply pixel" role="status">
              {chosen ? REPLY[chosen] : 'Go on, press one.'}
            </p>
          </div>

          <div className="nudgesec__copy">
            <dl className="nudgesec__meanings">
              {CHOICES.map((choice) => (
                <div key={choice.id}>
                  <dt>{choice.label}</dt>
                  <dd>{MEANING[choice.id]}</dd>
                </div>
              ))}
            </dl>

            <p className="nudgesec__vow">No guilt. No streaks.</p>
            <p>There is no streak to protect and no lecture when you slip. Just a question, and your answer.</p>
            {!visit.ghostHidden && (
              <p className="nudgesec__try small soft">
                Want to feel it? Open another tab for ten seconds, then come back to this one.
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
