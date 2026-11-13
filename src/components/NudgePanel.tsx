import type { ReactNode } from 'react'
import { GhostSprite } from '../ghost/GhostSprite'
import type { Mood } from '../ghost/sprite'
import type { Choice } from '../lib/visit'
import { Glass } from './Glass'
import './NudgePanel.css'

/** Akyu's three answers. Same size, same weight: none of them is the wrong one. */
export const CHOICES: ReadonlyArray<{ id: Choice; label: string }> = [
  { id: 'back', label: 'Back to it' },
  { id: 'break', label: '5-min break' },
  { id: 'part', label: 'This is part of the task' },
]

interface NudgePanelProps {
  /** What the ghost says. */
  line: ReactNode
  onChoose?: (choice: Choice) => void
  /** Marks one answer as the one picked. */
  chosen?: Choice | null
  /** A picture of the nudge rather than a working one: no real buttons. */
  decorative?: boolean
  /** In a decorative panel, shows one button mid-press. */
  pressed?: Choice | null
  mood?: Mood
  className?: string
}

export function NudgePanel({
  line,
  onChoose,
  chosen = null,
  decorative = false,
  pressed = null,
  mood = 'idle',
  className = '',
}: NudgePanelProps) {
  return (
    <Glass className={`nudge ${className}`} radius={24}>
      <div className="nudge__say">
        <GhostSprite className="nudge__ghost" level={0.55} mood={mood} bob />
        <p className="nudge__line pixel">{line}</p>
      </div>
      {decorative ? (
        <div className="nudge__choices">
          {CHOICES.map((choice) => (
            <span
              key={choice.id}
              className="nudge__btn"
              data-choice={choice.id}
              data-pressed={pressed === choice.id ? '' : undefined}
            >
              {choice.label}
            </span>
          ))}
        </div>
      ) : (
        <div className="nudge__choices" role="group" aria-label="Answer Akyu">
          {CHOICES.map((choice) => (
            <button
              key={choice.id}
              type="button"
              className="nudge__btn"
              data-choice={choice.id}
              aria-pressed={chosen === null ? undefined : chosen === choice.id}
              onClick={() => onChoose?.(choice.id)}
            >
              {choice.label}
            </button>
          ))}
        </div>
      )}
    </Glass>
  )
}
