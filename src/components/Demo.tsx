import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { GhostSprite, useBlink } from '../ghost/GhostSprite'
import { INK, type Mood } from '../ghost/sprite'
import { clock } from '../lib/format'
import { setOnStage } from '../lib/visit'
import { site } from '../site.config'
import { Glass } from './Glass'
import { NudgePanel } from './NudgePanel'
import { PixelArt } from './PixelArt'
import { PixelBox } from './PixelBox'
import './Demo.css'

/**
 * The hero's demo.
 *
 * With site.demoVideo.src set, this is your real screen recording.
 * Until then it is a drawn, looping scene: ask Akyu by voice what to reply,
 * let it read the mail on screen and get a reply, to-dos and a plan; then a short
 * check-in when you drift. The caption says plainly that it is an illustration.
 */
export function Demo({ part = 'all' }: { part?: 'all' | 'drift' }) {
  // The 'drift' part is the same drawn scene, played from the video's distraction to the check-in.
  return site.demoVideo.src && part === 'all' ? <DemoVideo /> : <DemoScene part={part} />
}

function DemoVideo() {
  const calm = useMemo(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches, [])
  return (
    <figure className="demo">
      <PixelBox shadow className="demo__frame">
        <video
          className="demo__video"
          src={site.demoVideo.src}
          poster={site.demoVideo.poster || undefined}
          controls
          muted
          loop
          playsInline
          autoPlay={!calm}
          preload="metadata"
          aria-label="Demo of Akyu"
        />
      </PixelBox>
      <figcaption className="demo__meta">
        <p className="small soft">A short look at Akyu.</p>
      </figcaption>
    </figure>
  )
}

const LOOP_MS = 20_300
/** The ghost timer in the scene starts here and counts down in real seconds. */
const START_SEC = 24 * 60 + 12

type Phase =
  | 'work'
  | 'drift'
  | 'nudge'
  | 'aim'
  | 'click'
  | 'back'
  | 'calm'
  | 'micAim'
  | 'micClick'
  | 'listen'
  | 'mail'
  | 'look'
  | 'answer'
  | 'lure'

const CUES: ReadonlyArray<readonly [number, Phase]> = [
  [0, 'work'],
  [1_000, 'micAim'],
  [1_800, 'micClick'],
  [2_200, 'listen'],
  [4_000, 'mail'],
  [5_000, 'look'],
  [6_300, 'answer'],
  [9_500, 'calm'],
  [9_900, 'lure'],
  [11_100, 'drift'],
  [13_700, 'nudge'],
  [15_300, 'aim'],
  [16_300, 'click'],
  [16_700, 'back'],
  [18_900, 'calm'],
]

const DRIFT_STARTS = 11_100
const WORK_RESUMES = 16_700

/** The scene holds the page still until Akyu's first answer has had its moment. */
const HOLD_UNTIL = 9_500
/** How much scrolling (in wheel pixels) lets go of the hold early. */
const SKIP_AT = 900

function phaseAt(t: number): Phase {
  let phase: Phase = 'work'
  for (const [at, name] of CUES) if (t >= at) phase = name
  return phase
}

/** How much of the report has been typed, 0 to 1. Typing stops while the scene drifts. */
function typedAt(t: number): number {
  const worked = t < DRIFT_STARTS ? t : t < WORK_RESUMES ? DRIFT_STARTS : DRIFT_STARTS + (t - WORK_RESUMES)
  return worked / (DRIFT_STARTS + LOOP_MS - WORK_RESUMES)
}

const MOOD: Record<Phase, Mood> = {
  work: 'idle',
  drift: 'left',
  nudge: 'idle',
  aim: 'idle',
  click: 'happy',
  back: 'happy',
  calm: 'idle',
  micAim: 'idle',
  micClick: 'idle',
  listen: 'idle',
  mail: 'left',
  look: 'right',
  answer: 'happy',
  lure: 'right',
}

/** Where the cursor rests, as percentages of the scene, when it is not heading for a button. */
const CURSOR_REST: Partial<Record<Phase, readonly [number, number]>> = {
  work: [38, 60],
  calm: [38, 60],
  mail: [40, 50],
  look: [40, 50],
  answer: [30, 40],
  lure: [80, 15],
  drift: [44, 50],
  nudge: [44, 50],
}

const TIMES = ['4:12', '10:03', '0:58', '12:40', '3:21', '8:15']
const LINE_WIDTHS = [92, 97, 64, 95, 88, 99, 71, 93, 58]
const TILE_COLORS = ['#ffb58c', '#b9b0ff', '#ffe08a', '#ff8fa8', '#9fd8ff', '#a9f2dd']

export const CURSOR_ROWS = [
  '#..........',
  '##.........',
  '#o#........',
  '#oo#.......',
  '#ooo#......',
  '#oooo#.....',
  '#ooooo#....',
  '#oooooo#...',
  '#ooooooo#..',
  '#oooooooo#.',
  '#ooooo#####',
  '#oo#oo#....',
  '#o#.#oo#...',
  '##..#oo#...',
  '#....#oo#..',
  '.....###...',
]
export const CURSOR_COLORS = { '#': INK, o: '#ffffff' }

const MIC_ROWS = [
  '...###...',
  '..#####..',
  '..#####..',
  '..#####..',
  '#.#####.#',
  '#.#####.#',
  '##.###.##',
  '.##...##.',
  '..#####..',
  '....#....',
  '....#....',
  '..#####..',
]
const MIC_COLORS = { '#': INK }

const STORY =
  'Animated illustration. Someone is writing a report with the Akyu ghost and its timer in the corner of the screen. ' +
  'The microphone button next to the ghost is pressed and the person asks Akyu what to reply. Another screen shows ' +
  'an email that says “We have a meeting today.” Akyu reads the screen, suggests a short reply, adds to-dos and plans ' +
  'the day around the meeting: finish the report, prepare, then the meeting. Later, a video site takes over the ' +
  'screen and the ghost asks “Still on the report?” with three buttons: Back to it, 5-min break, and This is part ' +
  'of the task. Back to it is pressed and the report returns.'

/** Where the loop restarts for the 'drift' part: just before the notification arrives. */
const DRIFT_PART_FROM = 9_500

const DRIFT_STORY =
  'Animated illustration. Someone is writing a report with the Akyu ghost and its timer in the corner of the screen. ' +
  'A notification about funny cat videos arrives and a video player takes over the screen. The ghost timer turns red ' +
  'and says Off task, then the ghost asks “Still on the report?” with three buttons: Back to it, 5-min break, and This ' +
  'is part of the task. Back to it is pressed and the report returns.'

function DemoScene({ part }: { part: 'all' | 'drift' }) {
  const from = part === 'drift' ? DRIFT_PART_FROM : 0
  const calm = useMemo(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches, [])
  const frame = useRef<HTMLDivElement>(null)
  const scene = useRef<HTMLDivElement>(null)
  const time = useRef<HTMLElement>(null)
  const played = useRef<HTMLSpanElement>(null)
  // With reduced motion the scene opens paused on its most telling frame: Akyu's answer (or, for the drift part, the check-in).
  const t = useRef(calm ? (part === 'drift' ? 14_500 : 8_000) : from)
  const phaseNow = useRef<Phase>(phaseAt(t.current))
  const [phase, setPhase] = useState<Phase>(phaseNow.current)
  const [loop, setLoop] = useState(0)
  const [playing, setPlaying] = useState(!calm)
  const [onScreen, setOnScreen] = useState(false)
  const [cursor, setCursor] = useState<readonly [number, number]>(CURSOR_REST.work!)
  // The page hold, shown so a still page reads as a choice, not a bug: 'on' while held, 'done' for a moment after.
  const [held, setHeld] = useState<'off' | 'on' | 'done'>('off')
  const holdNote = useRef<HTMLDivElement>(null)

  const offTask = phase === 'drift' || phase === 'nudge' || phase === 'aim' || phase === 'click'
  const blinked = useBlink(MOOD[phase], !calm)

  const paint = useCallback(() => {
    const now = t.current
    const next = phaseAt(now)
    if (next !== phaseNow.current) {
      phaseNow.current = next
      setPhase(next)
    }
    if (time.current) time.current.textContent = clock(START_SEC - Math.floor(now / 1000))
    scene.current?.style.setProperty('--typed', typedAt(now).toFixed(3))
    played.current?.style.setProperty('--played', String(Math.min(1, (Math.floor(now / 1000) + 1) / (LOOP_MS / 1000))))
    holdNote.current?.style.setProperty('--held', Math.min(1, now / HOLD_UNTIL).toFixed(3))
  }, [])

  useLayoutEffect(paint, [paint])

  useEffect(() => {
    const el = frame.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        setOnScreen(entry.intersectionRatio >= 0.15)
        // The scene has its own ghost, so the corner ghost stays out of the way while it is in view.
        setOnStage('demo', entry.intersectionRatio >= 0.35)
      },
      { threshold: [0, 0.15, 0.35] },
    )
    observer.observe(el)
    return () => {
      observer.disconnect()
      setOnStage('demo', false)
    }
  }, [])

  // The first time the scene is properly in view, centre it and keep the page still until the first
  // story (the question and Akyu's answer) has played. Scrolling hard, or Escape, lets go at once.
  useEffect(() => {
    const el = frame.current
    if (!el || calm || part !== 'all') return
    let state: 'waiting' | 'holding' | 'done' = 'waiting'
    let intent = 0
    let poll = 0
    let lockY = 0
    // Where the page must sit so the whole scene is in view, clear of the sticky header.
    const target = () => {
      const header = document.querySelector('header')?.getBoundingClientRect().height ?? 0
      const box = el.getBoundingClientRect()
      const room = window.innerHeight - header
      const gap = Math.max(8, (room - box.height) / 2)
      return Math.max(0, Math.round(window.scrollY + box.top - header - gap))
    }
    // Hold the page exactly there, however it was moved (scrollbar, momentum, layout shifting).
    const keep = () => {
      if (Math.abs(window.scrollY - lockY) > 1) window.scrollTo({ top: lockY, behavior: 'instant' })
    }
    const refit = () => {
      lockY = target()
      keep()
    }
    // Every push against the hold fills the "keep scrolling to skip" bar, so it answers instead of feeling stuck.
    let nudgeTimer = 0
    const push = (amount: number) => {
      intent += amount
      const note = holdNote.current
      if (note) {
        note.style.setProperty('--skip', Math.min(1, intent / SKIP_AT).toFixed(3))
        note.dataset.nudged = ''
        window.clearTimeout(nudgeTimer)
        nudgeTimer = window.setTimeout(() => delete note.dataset.nudged, 450)
      }
      if (intent > SKIP_AT) release()
    }
    let touchY: number | null = null
    const touchStart = (event: TouchEvent) => {
      touchY = event.touches[0]?.clientY ?? null
    }
    const stop = (event: TouchEvent) => {
      event.preventDefault()
      const y = event.touches[0]?.clientY
      if (y === undefined) return
      if (touchY !== null) push(Math.abs(y - touchY) * 3)
      touchY = y
    }
    const keys = (event: KeyboardEvent) => {
      if (event.key === 'Escape') return release()
      if ([' ', 'ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'End', 'Home'].includes(event.key)) {
        event.preventDefault()
        push(300)
      }
    }
    const wheel = (event: WheelEvent) => {
      event.preventDefault()
      push(Math.abs(event.deltaY))
    }
    function release() {
      if (state !== 'holding') return
      state = 'done'
      window.clearInterval(poll)
      window.clearTimeout(nudgeTimer)
      setHeld('done')
      window.setTimeout(() => setHeld((h) => (h === 'done' ? 'off' : h)), 1800)
      window.removeEventListener('wheel', wheel)
      window.removeEventListener('touchstart', touchStart)
      window.removeEventListener('scroll', keep)
      window.removeEventListener('resize', refit)
      window.removeEventListener('touchmove', stop)
      window.removeEventListener('keydown', keys)
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (state !== 'waiting' || entry.intersectionRatio < 0.6) return
        state = 'holding'
        observer.disconnect()
        // 'instant' beats any smooth-scroll setting, so the page lands in one step.
        lockY = target()
        window.scrollTo({ top: lockY, behavior: 'instant' })
        // Layout can settle a moment later (fonts, images): measure again once it has.
        window.requestAnimationFrame(refit)
        window.addEventListener('scroll', keep, { passive: true })
        window.addEventListener('resize', refit)
        t.current = 0
        setHeld('on')
        paint()
        window.addEventListener('wheel', wheel, { passive: false })
        window.addEventListener('touchstart', touchStart, { passive: true })
        window.addEventListener('touchmove', stop, { passive: false })
        window.addEventListener('keydown', keys)
        poll = window.setInterval(() => {
          if (t.current >= HOLD_UNTIL) release()
        }, 100)
      },
      { threshold: [0.6] },
    )
    observer.observe(el)
    return () => {
      observer.disconnect()
      if (state === 'holding') release()
      setHeld('off')
    }
  }, [calm, paint, part])

  useEffect(() => {
    if (!playing || !onScreen) return
    let raf = 0
    let last = performance.now()
    const step = (now: number) => {
      // Real elapsed time, so a slow or throttled display skips ahead instead of running in slow motion.
      // The cap only stops a long-hidden tab from leaping forward on return.
      const dt = Math.min(now - last, 1000)
      last = now
      const before = t.current
      const next = before + dt
      // Past the end, start again at the loop's own beginning (which is later for a part).
      t.current = next < LOOP_MS ? next : from + ((next - LOOP_MS) % (LOOP_MS - from))
      if (t.current < before) setLoop((n) => n + 1)
      paint()
      raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [playing, onScreen, paint])

  // Send the cursor to the "Back to it" button when it is time to press it.
  useLayoutEffect(() => {
    const rest = CURSOR_REST[phase]
    if (rest) {
      setCursor(rest)
      return
    }
    if (phase !== 'aim' && phase !== 'micAim' && phase !== 'micClick' && phase !== 'listen') return
    const root = scene.current
    const target = root?.querySelector<HTMLElement>(phase === 'aim' ? '[data-choice="back"]' : '[data-mic]')
    if (!root || !target) return
    const a = root.getBoundingClientRect()
    const b = target.getBoundingClientRect()
    setCursor([
      ((b.left + b.width * (phase === 'aim' ? 0.62 : 0.55) - a.left) / a.width) * 100,
      ((b.top + b.height * 0.5 - a.top) / a.height) * 100,
    ])
  }, [phase])

  return (
    <figure className="demo">
      <div ref={frame} className="demo__stage">
        <PixelBox shadow className="demo__frame">
          <div className="scene" ref={scene} data-phase={phase} role="img" aria-label={part === 'drift' ? DRIFT_STORY : STORY}>
            <div className="scene__all" aria-hidden="true">
              <div className="win win--task">
                <div className="win__bar">
                  <span className="win__icon" />
                  Q3 report
                  <span className="win__ctl" />
                </div>
                <div className="win__body doc" key={loop}>
                  <span className="doc__tools">
                    <i />
                    <i />
                    <i />
                    <b />
                    <b />
                  </span>
                  <span className="doc__title" />
                  {LINE_WIDTHS.map((width, i) => (
                    <span key={i} className="doc__line" style={{ '--i': i, '--w': `${width}%` } as CSSProperties} />
                  ))}
                  <span className="doc__chart">
                    {[38, 62, 48, 80, 100].map((h, i) => (
                      <i key={i} style={{ '--h': `${h}%`, '--k': i } as CSSProperties} />
                    ))}
                    <em>Q3</em>
                  </span>
                </div>
              </div>

              <div className="scene__toast">
                <span className="scene__bell" />
                <span>
                  <b className="pixel">New for you</b>
                  <span className="pixel">10 hours of funny cats</span>
                </span>
              </div>

              <div className="win win--drift">
                <div className="win__bar">
                  <span className="win__icon win__icon--peach" />
                  Videos · funny cats
                  <span className="win__ctl" />
                </div>
                <div className="win__body tube">
                  <div className="tube__main">
                    <span className="tube__screen">
                      <span className="tube__cat" />
                      <span className="tube__live pixel">Playing</span>
                    </span>
                    <span className="tube__bar">
                      <i />
                    </span>
                    <span className="tube__title">
                      <b />
                      <b />
                    </span>
                  </div>
                  <div className="tube__side">
                    <span className="pixel tube__next">Up next · autoplay</span>
                    {TILE_COLORS.slice(0, 3).map((color, i) => (
                      <span key={color} className="feed__tile">
                        <span className="feed__thumb" style={{ '--c': color } as CSSProperties}>
                          <small className="pixel">{TIMES[i]}</small>
                        </span>
                        <span className="feed__row">
                          <i />
                          <span>
                            <b />
                            <b />
                          </span>
                        </span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="win win--mail">
                <div className="win__bar">
                  <span className="win__icon win__icon--sky" />
                  Inbox
                  <span className="win__ctl" />
                </div>
                <div className="win__body mail">
                  <span className="mail__chips">
                    <em>Inbox</em>
                    <em>Work</em>
                    <em className="mail__new">New</em>
                  </span>
                  <span className="mail__from">
                    <i>S</i>
                    <b>Sam</b>
                    <small>3:12 PM</small>
                  </span>
                  <span className="mail__subject pixel">Today</span>
                  <p className="mail__text pixel">We have a meeting today.</p>
                  <span className="mail__line" />
                  <span className="mail__line mail__line--short" />
                </div>
              </div>

              <div className="scene__scan">
                <span className="scene__scantag pixel">Akyu is reading your screen</span>
              </div>

              <div className="scene__taskbar">
                <i />
                <i />
                <i />
                <i />
                <span className="scene__wifi" aria-hidden="true" />
                <span className="scene__clock pixel">3:14 PM</span>
              </div>

              <div className="scene__dock">
                <span className="scene__hello pixel">Welcome back.</span>
                <span className="scene__pill pixel" data-off={offTask ? '' : undefined}>
                  <span>{offTask ? 'Off task' : 'Report'}</span>
                  <b ref={time}>{clock(START_SEC)}</b>
                </span>
                <span className="scene__mic" data-mic data-pressed={phase === 'micClick' || phase === 'listen' ? '' : undefined}>
                  <PixelArt rows={MIC_ROWS} colors={MIC_COLORS} />
                </span>
                <GhostSprite className="scene__ghost" level={0.54} mood={blinked} bob={!calm} />
              </div>

              <div className="scene__nudge">
                <NudgePanel decorative line="Still on the report?" pressed={phase === 'click' ? 'back' : null} />
              </div>

              <div className="scene__voice pixel">
                <span className="scene__wave">
                  <i />
                  <i />
                  <i />
                  <i />
                  <i />
                </span>
                <span className="scene__heard">“Akyu, what should I reply?”</span>
              </div>

              <div className="scene__answer">
                <Glass className="answer" radius={24}>
                  <div className="nudge__say">
                    <GhostSprite className="nudge__ghost" level={0.55} mood="happy" bob />
                    <p className="nudge__line pixel">Meeting today. Try this:</p>
                  </div>
                  <p className="answer__reply pixel">“Got it, see you there.”</p>
                  <p className="answer__todo pixel">Added to your to-dos</p>
                  <div className="answer__plan">
                    <span className="answer__step pixel">Finish report</span>
                    <span className="answer__arrow" />
                    <span className="answer__step pixel">Prep for meeting</span>
                    <span className="answer__arrow" />
                    <span className="answer__step pixel answer__step--fixed">Meeting</span>
                  </div>
                </Glass>
              </div>

              <span className="scene__cursor" style={{ left: `${cursor[0]}%`, top: `${cursor[1]}%` }}>
                <PixelArt rows={CURSOR_ROWS} colors={CURSOR_COLORS} />
              </span>
            </div>
          </div>
        </PixelBox>
        {held !== 'off' && (
          <div className="holdnote" ref={holdNote} data-state={held} role="status">
            {held === 'on' ? (
              <>
                <span className="holdnote__line pixel">
                  <span className="holdnote__dot" aria-hidden="true" />
                  Akyu paused the page for a few seconds so you can watch this
                </span>
                <span className="holdnote__skip">
                  <span className="holdnote__bar" aria-hidden="true">
                    <i />
                  </span>
                  <span className="small">Keep scrolling to skip</span>
                </span>
              </>
            ) : (
              <span className="holdnote__line pixel">Page is all yours again</span>
            )}
          </div>
        )}
      </div>

      <figcaption className="demo__meta">
        <p className="small soft">
          {part === 'drift'
            ? 'Akyu checking in when you drift. This is a drawn illustration, not a screen recording: Akyu is not released yet.'
            : 'Akyu at work: ask it out loud about an email and it reads your screen, replies and plans; later it checks in when you drift. This is a drawn illustration, not a screen recording: Akyu is not released yet.'}
        </p>
        <div className="demo__ctl">
          <span className="demo__played" ref={played} aria-hidden="true" />
          <button type="button" className="demo__toggle" onClick={() => setPlaying((p) => !p)}>
            {playing ? 'Pause' : 'Play'}
            <span className="sr-only"> the illustration</span>
          </button>
        </div>
      </figcaption>
    </figure>
  )
}
