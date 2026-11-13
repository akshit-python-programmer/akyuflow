import { useEffect, useId, useRef, useState, type CSSProperties, type FormEvent } from 'react'
import { GhostSprite } from '../ghost/GhostSprite'
import type { Mood } from '../ghost/sprite'
import { calm, demoAction, demoCompleted, demoStarted, react, useDemoRequest, useTimers } from '../lib/akyu'
import { DAY_START, hm, hmFull, length, parseDay, schedule, type PlanTask } from '../lib/plan'
import { CapTag, DemoTag } from './DemoTag'
import { CURSOR_COLORS, CURSOR_ROWS } from './Demo'
import { OsBar, OsTask } from './Os'
import { PixelArt } from './PixelArt'
import { PixelBox } from './PixelBox'
import { holdPage } from '../lib/hold'
import './PlanDemo.css'

export const EXAMPLES = [
  'Report first, then emails, slides by 4, gym at 6',
  'Inbox, then design review at 11, write proposal by 3, team call at 4',
  'Laundry, study for the exam by 2, lunch at 1, call mum at 6',
] as const

/** Minutes the first task runs over when the replan button is pressed. */
const OVERRUN = 40
const STAGGER_MS = 320

interface Row extends PlanTask {
  done: boolean
  notes: string
  /** Start time before the last replan, when it moved. */
  from?: number
}

type Phase = 'idle' | 'planning' | 'planned'

function late(task: PlanTask): boolean {
  return task.by !== undefined && task.end > task.by
}

export function PlanDemo() {
  const fieldId = useId()
  const timers = useTimers()
  const [text, setText] = useState<string>(EXAMPLES[0])
  const [rows, setRows] = useState<Row[]>([])
  const [base, setBase] = useState<PlanTask[]>([])
  const [shown, setShown] = useState(0)
  const [phase, setPhase] = useState<Phase>('idle')
  const [stuck, setStuck] = useState(false)
  const [replanned, setReplanned] = useState<{ minutes: number; moves: string[] } | null>(null)
  const [openNotes, setOpenNotes] = useState<number | null>(null)
  const [say, setSay] = useState<{ line: string; mood: Mood }>({
    line: 'Tell me your day in one line. I will fit it into time.',
    mood: 'idle',
  })
  const lostAfter = useRef<number | null>(null)
  const stage = useRef<HTMLDivElement>(null)
  const planBtn = useRef<HTMLButtonElement>(null)
  // The clock the self-starting demo runs on. While it is running, delays are measured on it.
  const clock = useRef({ v: 0, running: false, queue: [] as { at: number; fn: () => void }[] })
  const after = (ms: number, fn: () => void) => {
    const c = clock.current
    if (c.running) c.queue.push({ at: c.v + ms, fn })
    else timers.after(ms, fn)
  }
  const phaseRef = useRef<Phase>('idle')
  phaseRef.current = phase
  const planRef = useRef(plan)
  planRef.current = plan
  const [pointer, setPointer] = useState<{ x: number; y: number; show: boolean; press: boolean }>({
    x: 0,
    y: 0,
    show: false,
    press: false,
  })

  // The first time the demo scrolls into view it starts itself: a pixel cursor
  // glides to "Plan it", presses it, and the day is planned. The page is held still
  // while it plays, and every attempt to scroll speeds the demo up instead. Any touch
  // of the demo itself takes over and cancels it.
  useEffect(() => {
    const el = stage.current
    if (!el) return
    let ran = false
    let cancelled = false
    let finishNow: (() => void) | null = null
    const c = clock.current
    const later = (ms: number, fn: () => void) => c.queue.push({ at: ms, fn: () => !cancelled && fn() })
    const stop = () => {
      cancelled = true
      setPointer((p) => ({ ...p, show: false, press: false }))
      finishNow?.()
    }
    const centre = () => {
      const box = el.getBoundingClientRect()
      const btn = planBtn.current?.getBoundingClientRect()
      if (!btn) return null
      return { x: btn.left - box.left + btn.width * 0.55, y: btn.top - box.top + btn.height * 0.5, h: box.height }
    }
    const start = () => {
      if (ran || phaseRef.current !== 'idle') return
      ran = true
      if (calm()) {
        planRef.current(EXAMPLES[0])
        return
      }
      const target = centre()
      if (!target) return

      // The demo runs on its own clock so that scrolling can make it faster.
      c.running = true
      c.v = 0
      c.queue = []
      let boost = 0
      const began = performance.now()
      let last = began
      const release = holdPage((el.closest('.plandemo__box') as HTMLElement | null) ?? el, {
        onNudge: (n) => {
          boost = Math.min(9, boost + n)
        },
        onRelease: () => finishNow?.(),
      })
      const timer = window.setInterval(() => {
        const now = performance.now()
        const dt = Math.min(now - last, 200)
        last = now
        boost *= Math.exp(-dt / 600)
        c.v += dt * (1 + boost)
        c.queue.sort((x, y) => x.at - y.at)
        while (c.queue.length > 0 && c.queue[0].at <= c.v) c.queue.shift()!.fn()
        const played = phaseRef.current === 'planned' && c.v > 2_800
        if (played || now - began > 15_000) finishNow?.()
      }, 30)
      finishNow = () => {
        finishNow = null
        window.clearInterval(timer)
        c.running = false
        // Anything still waiting happens now, so the demo always ends fully drawn.
        for (const item of c.queue.sort((x, y) => x.at - y.at)) item.fn()
        c.queue = []
        release()
        setPointer((p) => ({ ...p, show: false, press: false }))
      }

      // Begin low and to the left, then head for the button.
      setPointer({ x: 24, y: target.h * 0.7, show: true, press: false })
      later(250, () => setPointer({ x: target.x, y: target.y, show: true, press: false }))
      later(1100, () => setPointer({ x: target.x, y: target.y, show: true, press: true }))
      later(1350, () => {
        setPointer({ x: target.x, y: target.y, show: true, press: false })
        planRef.current(EXAMPLES[0])
      })
      later(1700, () => setPointer({ x: target.x + 40, y: target.y + 140, show: true, press: false }))
      later(2600, () => setPointer((p) => ({ ...p, show: false })))
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          observer.disconnect()
          start()
        }
      },
      { threshold: 1 },
    )
    // Watch the button itself: the whole demo is taller than most screens.
    observer.observe(planBtn.current ?? el)
    el.addEventListener('pointerdown', stop)
    el.addEventListener('keydown', stop)
    return () => {
      cancelled = true
      observer.disconnect()
      finishNow?.()
      el.removeEventListener('pointerdown', stop)
      el.removeEventListener('keydown', stop)
    }
  }, [])

  function plan(input: string, via: 'page' | 'ghost' = 'page') {
    timers.clear()
    setReplanned(null)
    setOpenNotes(null)
    demoStarted('plan', via)
    const result = parseDay(input)
    if (!result.ok) {
      setStuck(true)
      setPhase('idle')
      setRows([])
      setShown(0)
      setSay({
        line: "Sorry, I'm a scripted demo, so I only understand simple lists. Try one of the examples below.",
        mood: 'rest',
      })
      demoAction('plan', 'not_understood')
      lostAfter.current = null
      return
    }
    setStuck(false)
    const tasks = result.tasks
    setBase(tasks)
    setRows(tasks.map((t) => ({ ...t, done: false, notes: '' })))
    setSay({ line: 'Fitting that into your day...', mood: 'right' })

    const finish = () => {
      setPhase('planned')
      const missed = tasks.find(late)
      const line = missed
        ? `There's your day. ${missed.title} won't make ${hmFull(missed.by!)}, so it's marked.`
        : `There's your day. ${tasks.length} things, and it all fits.`
      setSay({ line, mood: 'happy' })
      demoCompleted('plan', 'Your day is planned.')
      if (lostAfter.current !== null) {
        const minutes = lostAfter.current
        lostAfter.current = null
        after(calm() ? 0 : 700, () => overrun(tasks, minutes, 'ghost'))
      }
    }

    if (calm()) {
      setShown(tasks.length)
      finish()
      return
    }
    setPhase('planning')
    setShown(0)
    tasks.forEach((_, i) => after(250 + i * STAGGER_MS, () => setShown(i + 1)))
    after(250 + tasks.length * STAGGER_MS + 500, finish)
  }

  function overrun(from: PlanTask[], minutes: number, via: 'page' | 'ghost' = 'page') {
    if (from.length === 0) return
    demoStarted('replan', via)
    const first = from[0]
    const next = schedule(from, { id: first.id, minutes })
    const moves: string[] = []
    for (const task of next.slice(1)) {
      const old = from.find((t) => t.id === task.id)!
      if (old.start !== task.start) moves.push(`${task.title}: ${hm(old.start)} → ${hm(task.start)}`)
      else if (task.at !== undefined) moves.push(`${task.title} stays at ${hm(task.start)}`)
    }
    setRows((current) =>
      next.map((task) => {
        const was = current.find((r) => r.id === task.id)
        const old = from.find((t) => t.id === task.id)!
        return {
          ...task,
          done: was?.done ?? false,
          notes: was?.notes ?? '',
          from: old.start !== task.start ? old.start : undefined,
        }
      }),
    )
    setReplanned({ minutes, moves })
    const missed = next.find(late)
    setSay({
      line: missed
        ? `Replanned. ${missed.title} now misses ${hmFull(missed.by!)}. You might move something to tomorrow.`
        : `Replanned. ${first.title} took ${length(first.minutes + minutes)}, and the rest still fits.`,
      mood: 'happy',
    })
    timers.after(calm() ? 0 : 900, () => demoCompleted('replan', 'Replanned. It still fits.'))
  }

  function undoOverrun() {
    setRows((current) =>
      base.map((task) => {
        const was = current.find((r) => r.id === task.id)
        return { ...task, done: was?.done ?? false, notes: was?.notes ?? '' }
      }),
    )
    setReplanned(null)
    setSay({ line: 'Back to the first plan.', mood: 'idle' })
  }

  function tick(id: number, done: boolean) {
    const next = rows.map((r) => (r.id === id ? { ...r, done } : r))
    setRows(next)
    if (!done) return
    const row = next.find((r) => r.id === id)!
    demoAction('plan', 'tick')
    if (next.every((r) => r.done)) {
      setSay({ line: "That's everything. The day is done.", mood: 'happy' })
      react('All done. Go do nothing for a bit.')
    } else {
      setSay({ line: `${row.title}: done.`, mood: 'happy' })
      react(`${row.title}, done. Nice.`)
    }
  }

  function setNotes(id: number, notes: string) {
    setRows((current) => current.map((r) => (r.id === id ? { ...r, notes } : r)))
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault()
    plan(text)
  }

  useDemoRequest(['plan', 'lost'], (request) => {
    if (!request.start) return
    if (request.target === 'plan') {
      plan(text, 'ghost')
      return
    }
    // "I lost an hour": plan the day first if there is none, then replan.
    if (phase === 'planned' && !replanned) overrun(base, 60, 'ghost')
    else {
      lostAfter.current = 60
      plan(stuck ? EXAMPLES[0] : text, 'ghost')
      if (stuck) setText(EXAMPLES[0])
    }
  })

  const visible = rows.slice(0, shown)
  const lastEnd = Math.max(DAY_START + 9 * 60, ...rows.map((r) => r.end))
  const dayEnd = Math.ceil(lastEnd / 60) * 60
  const hours = Array.from({ length: (dayEnd - DAY_START) / 60 + 1 }, (_, i) => DAY_START + i * 60)
  const first = rows[0]

  return (
    <div className="plandemo" id="plan-demo" tabIndex={-1} aria-labelledby="plan-demo-title">
      <div className="plandemo__top">
        <h3 id="plan-demo-title">Try it: plan a day</h3>
        <DemoTag capability="planDay" />
      </div>

      <PixelBox shadow className="plandemo__box">
        <OsBar title="Akyu · Plan my day" />
        <div className="plandemo__in" ref={stage}>
          <span
            className="plandemo__cursor"
            data-show={pointer.show ? '' : undefined}
            data-press={pointer.press ? '' : undefined}
            style={{ left: pointer.x, top: pointer.y }}
            aria-hidden="true"
          >
            <PixelArt rows={CURSOR_ROWS} colors={CURSOR_COLORS} />
          </span>
          <form className="plandemo__ask" onSubmit={onSubmit}>
            <label htmlFor={fieldId} className="plandemo__label">
              What does today hold?
            </label>
            <div className="plandemo__row">
              <input
                id={fieldId}
                className="field plandemo__field"
                value={text}
                onChange={(e) => setText(e.target.value)}
                autoComplete="off"
                spellCheck={false}
                maxLength={200}
              />
              <button
                ref={planBtn}
                type="submit"
                className="btn"
                data-press={pointer.press ? '' : undefined}
                disabled={phase === 'planning'}
              >
                <span className="btn__face">Plan it</span>
              </button>
            </div>
            <div className="plandemo__chips" role="group" aria-label="Example days">
              <span className="small soft">Or try:</span>
              {EXAMPLES.slice(1).map((example) => (
                <button
                  key={example}
                  type="button"
                  className="chip"
                  onClick={() => {
                    setText(example)
                    plan(example)
                  }}
                >
                  {example}
                </button>
              ))}
              {stuck && (
                <button
                  type="button"
                  className="chip"
                  onClick={() => {
                    setText(EXAMPLES[0])
                    plan(EXAMPLES[0])
                  }}
                >
                  {EXAMPLES[0]}
                </button>
              )}
            </div>
          </form>

          <p className="plandemo__say" role="status">
            <GhostSprite unit={3} level={0.6} mood={say.mood} />
            <span className="pixel">{say.line}</span>
          </p>

          <div className="plandemo__grid">
            <div className="todo">
              <p className="plandemo__head pixel">To do</p>
              {visible.length === 0 ? (
                <p className="small soft todo__empty">Your tasks appear here.</p>
              ) : (
                <ul className="todo__list">
                  {visible.map((row) => (
                    <li key={row.id} className="todo__item" data-done={row.done ? '' : undefined}>
                      <div className="todo__line">
                        <input
                          type="checkbox"
                          className="todo__tick"
                          checked={row.done}
                          onChange={(e) => tick(row.id, e.target.checked)}
                          aria-label={`Done: ${row.title}`}
                        />
                        <button
                          type="button"
                          className="todo__open"
                          aria-expanded={openNotes === row.id}
                          aria-controls={`notes-${row.id}`}
                          onClick={() => {
                            const opening = openNotes !== row.id
                            setOpenNotes(opening ? row.id : null)
                            if (opening) demoAction('plan', 'notes')
                          }}
                        >
                          <span className="todo__title">{row.title}</span>
                          <span className="sr-only">, open notes</span>
                        </button>
                        <span className="todo__when pixel">
                          {row.at !== undefined ? `at ${hm(row.at)}` : length(row.minutes)}
                          {row.by !== undefined && ` · by ${hm(row.by)}`}
                        </span>
                      </div>
                      {openNotes === row.id && (
                        <div className="todo__notes" id={`notes-${row.id}`}>
                          <label className="small" htmlFor={`notes-field-${row.id}`}>
                            Notes for {row.title}
                          </label>
                          <textarea
                            id={`notes-field-${row.id}`}
                            className="field todo__notefield"
                            rows={2}
                            value={row.notes}
                            placeholder="Links, the first small step, anything."
                            onChange={(e) => setNotes(row.id, e.target.value)}
                          />
                          <CapTag capability="taskNotes" />
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="cal">
              <p className="plandemo__head pixel">
                Today <CapTag capability="dayCalendar" className="cal__tag" />
              </p>
              <div
                className="cal__day"
                style={{ '--hours': (dayEnd - DAY_START) / 60 } as CSSProperties}
                aria-label="Day calendar"
                role="list"
              >
                {hours.map((h) => (
                  <span
                    key={h}
                    className="cal__hour small soft"
                    style={{ '--at': (h - DAY_START) / 60 } as CSSProperties}
                    aria-hidden="true"
                  >
                    {hmFull(h).replace(':00', '')}
                  </span>
                ))}
                {visible.map((row) => (
                  <div
                    key={row.id}
                    role="listitem"
                    className="cal__block"
                    data-done={row.done ? '' : undefined}
                    data-moved={row.from !== undefined ? '' : undefined}
                    data-late={late(row) ? '' : undefined}
                    data-fixed={row.at !== undefined ? '' : undefined}
                    style={
                      {
                        '--start': (row.start - DAY_START) / 60,
                        '--len': (row.end - row.start) / 60,
                      } as CSSProperties
                    }
                  >
                    <span className="cal__name">
                      {row.done && <span aria-hidden="true">✓ </span>}
                      {row.title}
                      {row.done && <span className="sr-only"> (done)</span>}
                    </span>
                    <span className="cal__time pixel">
                      {hm(row.start)}–{hm(row.end)} · {length(row.end - row.start)}
                      {late(row) && ` · misses ${hm(row.by!)}`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="plandemo__foot">
            {phase === 'planned' && first && !replanned && (
              <button type="button" className="btn btn--small" onClick={() => overrun(base, OVERRUN)}>
                <span className="btn__face">
                  The {first.title.toLowerCase()} ran {OVERRUN} minutes over
                </span>
              </button>
            )}
            {replanned && (
              <button type="button" className="btn btn--small" onClick={undoOverrun}>
                <span className="btn__face">Show the first plan</span>
              </button>
            )}
            {phase === 'planned' && <CapTag capability="replan" />}
            {replanned && (
              <div className="plandemo__moves" role="status">
                <p className="small">
                  <strong>What moved</strong> ({first?.title} ran {replanned.minutes} minutes over):
                </p>
                <ul className="small">
                  {replanned.moves.length > 0 ? (
                    replanned.moves.map((move) => <li key={move}>{move}</li>)
                  ) : (
                    <li>Nothing else needed to move.</li>
                  )}
                </ul>
              </div>
            )}
          </div>
        </div>
        <OsTask />
      </PixelBox>
      <p className="small soft plandemo__fine">
        Tick a task to finish it, or press its name to add notes. Nothing you type here leaves this page.
      </p>
    </div>
  )
}
