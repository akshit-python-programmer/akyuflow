import type { CSSProperties } from 'react'
import { DemoTag } from './DemoTag'
import { PixelBox } from './PixelBox'
import { PlanDemo } from './PlanDemo'
import { copy } from '../lib/copy'
import './DaySlips.css'

const RECAP: ReadonlyArray<{ label: string; minutes: number; kind: 'task' | 'break' | 'else' }> = [
  { label: 'Report', minutes: 130, kind: 'task' },
  { label: 'Slides', minutes: 60, kind: 'task' },
  { label: 'Emails', minutes: 30, kind: 'task' },
  { label: 'Breaks', minutes: 20, kind: 'break' },
  { label: 'Elsewhere', minutes: 35, kind: 'else' },
]

function hoursMinutes(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return h > 0 ? `${h}h ${String(m).padStart(2, '0')}m` : `${m}m`
}

function RecapArt() {
  const longest = Math.max(...RECAP.map((row) => row.minutes))
  return (
    <PixelBox className="mock">
      <div className="mock__in">
        <p className="mock__head">
          <span className="small soft">Today</span>
          <span className="pixel">6:04 pm</span>
        </p>
        <ul className="recap">
          {RECAP.map((row) => (
            <li key={row.label} className="recap__row">
              <span className="recap__label">{row.label}</span>
              <span
                className={`recap__bar recap__bar--${row.kind}`}
                style={{ '--share': row.minutes / longest } as CSSProperties}
                aria-hidden="true"
              />
              <span className="recap__time pixel">{hoursMinutes(row.minutes)}</span>
            </li>
          ))}
        </ul>
      </div>
    </PixelBox>
  )
}

export function DaySlips() {
  const c = copy()

  return (
    <section className="section slips" id="slips" data-recap="Plan and replan">
      <div className="wrap">
        <p>
          <span className="captag pixel">1 · Runs your day</span>
        </p>
        <h2>{c.plan.title}</h2>
        <p className="lede slips__lede">{c.plan.lede}</p>

        <div className="slips__demo">
          <PlanDemo />
        </div>

        <div className="slips__recap" id="recap" tabIndex={-1}>
          <div className="slips__block">
            <RecapArt />
          </div>
          <div className="slips__block">
            <DemoTag capability="dayRecap" />
            <h3>End-of-day time recap</h3>
            <p>When the day is done, Akyu shows you where the time went. It's a recap, not a report card.</p>
          </div>
        </div>
      </div>
    </section>
  )
}
