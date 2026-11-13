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

const TILES = ['#ffb58c', '#b9b0ff', '#ffe08a', '#9fd8ff']

export function NudgeSection() {
  const [chosen, setChosen] = useState<Choice | null>(null)
  const visit = useVisit()

  return (
    <section className="section nudgesec" id="nudge" data-recap="The nudge">
      <div className="wrap nudgesec__grid">
        <div className="nudgesec__copy">
          <h2 className="nudgesec__title">And if you drift, Akyu just asks.</h2>
          <p className="nudgesec__lede">
            Three buttons, all the same size. None of them is the wrong answer. No guilt, no streaks.
          </p>
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
          <div className="nudgesec__foot">
            <p className="nudgesec__reply pixel" role="status">
              {chosen ? REPLY[chosen] : 'Go on, press one.'}
            </p>
            <DemoTag capability="nudge" />
          </div>
        </div>
      </div>
    </section>
  )
}
