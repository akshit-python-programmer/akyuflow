import type { ReactNode } from 'react'
import { GhostSprite } from '../ghost/GhostSprite'
import './HowItWorks.css'

function PlanArt() {
  return (
    <div className="planart">
      <p className="planart__said pixel notch">Report first, then emails. Gym at 6.</p>
      <ul className="planart__list">
        <li>
          <span>Report</span>
          <b className="pixel">1h 30m</b>
        </li>
        <li>
          <span>Emails</span>
          <b className="pixel">25m</b>
        </li>
        <li>
          <span>Gym</span>
          <b className="pixel">6:00 pm</b>
        </li>
      </ul>
    </div>
  )
}

function TimerArt() {
  return (
    <div className="timerart">
      <GhostSprite unit={6} level={0.55} />
      <p className="timerart__read">
        <span className="small soft">Report</span>
        <span className="timerart__time pixel">24:12</span>
      </p>
    </div>
  )
}

function ReadArt() {
  return (
    <div className="askart">
      <div className="askart__win" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
      <div className="askart__say">
        <p className="askart__bubble pixel">Want a draft?</p>
        <GhostSprite unit={4} level={0.55} mood="happy" />
      </div>
    </div>
  )
}

function AskArt() {
  return (
    <div className="driftart">
      <p className="driftart__bubble pixel">“What should I reply?”</p>
      <GhostSprite unit={5} level={0.5} mood="right" />
    </div>
  )
}

const STEPS: ReadonlyArray<{ title: string; body: string; art: ReactNode }> = [
  {
    title: 'Talk to Akyu',
    body: 'Press the mic and say what you need, or type it. Akyu answers in a few words.',
    art: <AskArt />,
  },
  {
    title: 'It plans your day and your week',
    body: 'Say what today holds. Akyu turns it into a timed plan and a to-do list, and replans when something runs over.',
    art: <PlanArt />,
  },
  {
    title: 'It stays beside you and keeps time',
    body: 'It stays on your screen showing your time, and asks if you are still on task when you drift.',
    art: <TimerArt />,
  },
  {
    title: "Stuck? It helps with what's on your screen",
    body: 'Stuck on an email, a message or an error? Akyu looks at the window in front and works from what it sees. Only when you ask.',
    art: <ReadArt />,
  },
]

export function HowItWorks() {
  return (
    <section className="section how" id="how" data-recap="How it works">
      <div className="wrap">
        <h2>How it works</h2>
        <ol className="how__steps">
          {STEPS.map((step, i) => (
            <li className="how__step" key={step.title}>
              <div className="how__art" aria-hidden="true">
                {step.art}
              </div>
              <span className="how__n pixel notch" aria-hidden="true">
                {i + 1}
              </span>
              <h3>{step.title}</h3>
              <p>{step.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
