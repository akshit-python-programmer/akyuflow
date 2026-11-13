import { useEffect, useRef, useState } from 'react'
import { GhostSprite, useBlink } from '../ghost/GhostSprite'
import type { Mood } from '../ghost/sprite'
import { requestDemo, useAkyu, type AkyuMood, type Target } from '../lib/akyu'
import { spell } from '../lib/format'
import { track } from '../lib/track'
import {
  backFromBreak,
  choose,
  dismissReplan,
  ghostLook,
  readout,
  replan,
  setGhostHidden,
  useVisit,
} from '../lib/visit'
import type { Capability } from '../site.config'
import { isLaunch } from './DemoTag'
import { Glass } from './Glass'
import { NudgePanel } from './NudgePanel'
import './Companion.css'

/** What you can ask the ghost for. Each one opens its demo further down and runs it. */
const ASKS: ReadonlyArray<{ id: Target; label: string; capability: Capability }> = [
  { id: 'plan', label: 'Plan my day', capability: 'planDay' },
  { id: 'reply', label: 'Reply to this email', capability: 'emailReply' },
  { id: 'fix', label: 'Fix my message', capability: 'fixMessage' },
  { id: 'lost', label: 'I lost an hour', capability: 'replan' },
]

/** How the ghost looks while each section is in the middle of the screen. */
const SECTION_MOOD: Record<string, AkyuMood> = {
  top: 'focused',
  how: 'focused',
  day: 'focused',
  nudge: 'peeking',
  slips: 'focused',
  screen: 'peeking',
  privacy: 'asleep',
  founder: 'focused',
  reserve: 'celebrating',
  faq: 'asleep',
}

const SPRITE: Record<AkyuMood, Mood> = {
  focused: 'idle',
  peeking: 'left',
  asleep: 'rest',
  celebrating: 'happy',
}

/** Mood of the section across the middle of the viewport. */
function useSectionMood(): AkyuMood {
  const [mood, setMood] = useState<AkyuMood>('focused')
  useEffect(() => {
    let raf = 0
    const check = () => {
      raf = 0
      const middle = window.innerHeight / 2
      for (const el of document.querySelectorAll<HTMLElement>('main > section[id]')) {
        const box = el.getBoundingClientRect()
        if (box.top <= middle && box.bottom >= middle) {
          setMood(SECTION_MOOD[el.id] ?? 'focused')
          return
        }
      }
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(check)
    }
    check()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      cancelAnimationFrame(raf)
    }
  }, [])
  return mood
}

/**
 * Akyu, living in the corner of this page the way it lives in the corner of a
 * screen. It takes over from the big hero ghost once that scrolls away. Press
 * it and it asks what you need; it also speaks for the page's own timer (the
 * nudge when you come back from another tab, the replan when time runs out)
 * and reacts when a demo finishes.
 */
export function Companion() {
  const visit = useVisit()
  const { reaction } = useAkyu()
  const sectionMood = useSectionMood()
  const [open, setOpen] = useState(false)
  const firstChoice = useRef<HTMLButtonElement>(null)
  const ghostButton = useRef<HTMLButtonElement>(null)
  const { level, tone } = ghostLook(visit)
  const { time } = readout(visit)

  const akyuMood: AkyuMood = reaction
    ? reaction.mood
    : visit.note === 'Welcome back.'
      ? 'celebrating'
      : visit.phase === 'break'
        ? 'asleep'
        : sectionMood
  const mood = useBlink(SPRITE[akyuMood])

  const bubble = visit.nudge
    ? 'nudge'
    : visit.askReplan
      ? 'replan'
      : open
        ? 'info'
        : reaction
          ? 'reaction'
          : visit.note
            ? 'note'
            : null
  const shown = !visit.ghostOnStage || bubble !== null

  // Escape answers or closes whatever the ghost is saying.
  useEffect(() => {
    if (!bubble || bubble === 'note' || bubble === 'reaction') return
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      if (bubble === 'nudge') choose('back')
      else if (bubble === 'replan') dismissReplan()
      else {
        setOpen(false)
        ghostButton.current?.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [bubble])

  useEffect(() => {
    if (bubble === 'info') firstChoice.current?.focus()
  }, [bubble])

  useEffect(() => {
    if (!shown) setOpen(false)
  }, [shown])

  if (visit.ghostHidden) return null

  const about =
    visit.phase === 'break'
      ? "On a break. I'll wait."
      : visit.phase === 'over'
        ? 'The time I gave this page is up. No rush.'
        : "I'm also timing this page: two minutes."

  function ask(target: Target) {
    track('ghost_choice', { choice: target })
    setOpen(false)
    requestDemo(target, true)
  }

  return (
    <aside className="companion" data-shown={shown ? '' : undefined} aria-label="Akyu">
      <div className="companion__live" role="status">
        {bubble === 'nudge' && visit.nudge && (
          <NudgePanel
            className="companion__nudge"
            line={<>You were away for {spell(visit.nudge.awaySec)}. No guilt. What now?</>}
            onChoose={choose}
          />
        )}
        {bubble === 'replan' && (
          <Glass className="companion__card">
            <p className="pixel">That was the two minutes. Pages run over.</p>
            <div className="companion__row">
              <button type="button" className="nudge__btn" onClick={replan}>
                Replan: one more minute
              </button>
              <button type="button" className="nudge__btn" onClick={dismissReplan}>
                Leave it
              </button>
            </div>
          </Glass>
        )}
        {bubble === 'note' && <p className="companion__note pixel">{visit.note}</p>}
        {bubble === 'reaction' && reaction && (
          <p className="companion__note pixel" key={reaction.n}>
            {reaction.line}
          </p>
        )}
      </div>

      <button
        ref={ghostButton}
        type="button"
        className="companion__ghost"
        data-mood={akyuMood}
        aria-expanded={bubble === 'info'}
        aria-controls="akyu-panel"
        aria-label="Talk to Akyu"
        onClick={() => setOpen((o) => !o)}
      >
        <span className="companion__time pixel" data-tone={tone}>
          {time}
        </span>
        <span className="companion__sprite">
          {akyuMood === 'asleep' && (
            <span className="companion__z pixel" aria-hidden="true">
              z
            </span>
          )}
          <GhostSprite unit={3} level={level} tone={tone} mood={mood} bob={akyuMood !== 'celebrating'} />
        </span>
      </button>

      {/* After the button in the page order, so Tab goes ghost, then its bubble. Drawn above it. */}
      {bubble === 'info' && (
        <Glass className="companion__card companion__card--info">
          <div id="akyu-panel" role="group" aria-labelledby="akyu-panel-q">
            <p className="pixel" id="akyu-panel-q">
              Hi, I'm Akyu. What do you need?
            </p>
            <div className="companion__asks">
              {ASKS.map((choice, i) => (
                <button
                  key={choice.id}
                  ref={i === 0 ? firstChoice : undefined}
                  type="button"
                  className="nudge__btn companion__ask"
                  onClick={() => ask(choice.id)}
                >
                  {choice.label}
                  {!isLaunch(choice.capability) && (
                    <span className="companion__later">
                      <span className="sr-only">, </span>after launch
                    </span>
                  )}
                </button>
              ))}
            </div>
            <p className="small soft companion__fine">Each one opens a scripted demo on this page.</p>
            <div className="companion__row companion__row--quiet">
              <span className="small soft">{about}</span>
              {visit.phase === 'break' && (
                <button
                  type="button"
                  className="nudge__btn"
                  onClick={() => {
                    backFromBreak()
                    setOpen(false)
                  }}
                >
                  Back to it
                </button>
              )}
              <button
                type="button"
                className="companion__hide small"
                onClick={() => {
                  setOpen(false)
                  setGhostHidden(true)
                }}
              >
                Hide the ghost
              </button>
            </div>
          </div>
        </Glass>
      )}
    </aside>
  )
}
