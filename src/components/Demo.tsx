import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { GhostSprite } from '../ghost/GhostSprite'
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
export function Demo() {
  return site.demoVideo.src ? <DemoVideo /> : <DemoScene />
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

const LOOP_MS = 36_000
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

const CUES: ReadonlyArray<readonly [number, Phase]> = [
  [0, 'work'],
  [2_400, 'micAim'],
  [4_000, 'micClick'],
  [4_600, 'listen'],
  [8_200, 'mail'],
  [10_200, 'look'],
  [12_800, 'answer'],
  [21_400, 'calm'],
  [23_000, 'drift'],
  [26_000, 'nudge'],
  [28_800, 'aim'],
  [30_600, 'click'],
  [31_300, 'back'],
  [34_200, 'calm'],
]

const DRIFT_STARTS = 23_000
const WORK_RESUMES = 31_300

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
}

/** Where the cursor rests, as percentages of the scene, when it is not heading for a button. */
const CURSOR_REST: Partial<Record<Phase, readonly [number, number]>> = {
  work: [38, 60],
  drift: [46, 42],
  nudge: [46, 42],
  calm: [38, 60],
  mail: [40, 50],
  look: [40, 50],
  answer: [30, 40],
}

const LINE_WIDTHS = [92, 97, 64, 95, 88, 99, 71, 93, 58]
const TILE_COLORS = ['#ffb58c', '#b9b0ff', '#ffe08a', '#ff8fa8', '#9fd8ff', '#a9f2dd']

const CURSOR_ROWS = [
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
const CURSOR_COLORS = { '#': INK, o: '#ffffff' }

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

function DemoScene() {
  const calm = useMemo(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches, [])
  const frame = useRef<HTMLDivElement>(null)
  const scene = useRef<HTMLDivElement>(null)
  const time = useRef<HTMLElement>(null)
  const played = useRef<HTMLSpanElement>(null)
  // With reduced motion the scene opens paused on its most telling frame: Akyu's answer.
  const t = useRef(calm ? 16_000 : 0)
  const phaseNow = useRef<Phase>(phaseAt(t.current))
  const [phase, setPhase] = useState<Phase>(phaseNow.current)
  const [loop, setLoop] = useState(0)
  const [playing, setPlaying] = useState(!calm)
  const [onScreen, setOnScreen] = useState(false)
  const [cursor, setCursor] = useState<readonly [number, number]>(CURSOR_REST.work!)

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
      t.current = (before + dt) % LOOP_MS
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
      <div ref={frame}>
        <PixelBox shadow className="demo__frame">
          <div className="scene" ref={scene} data-phase={phase} role="img" aria-label={STORY}>
            <div className="scene__all" aria-hidden="true">
              <div className="win win--task">
                <div className="win__bar">
                  <span className="win__icon" />
                  Q3 report
                </div>
                <div className="win__body doc" key={loop}>
                  <span className="doc__title" />
                  {LINE_WIDTHS.map((width, i) => (
                    <span key={i} className="doc__line" style={{ '--i': i, '--w': `${width}%` } as CSSProperties} />
                  ))}
                </div>
              </div>

              <div className="win win--drift">
                <div className="win__bar">
                  <span className="win__icon win__icon--peach" />
                  Videos
                </div>
                <div className="win__body feed">
                  {TILE_COLORS.map((color) => (
                    <span key={color} className="feed__tile">
                      <span className="feed__thumb" style={{ '--c': color } as CSSProperties} />
                      <b />
                      <b />
                    </span>
                  ))}
                </div>
              </div>

              <div className="win win--mail">
                <div className="win__bar">
                  <span className="win__icon win__icon--sky" />
                  Inbox
                </div>
                <div className="win__body mail">
                  <span className="mail__from">
                    <i />
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
                <span className="scene__clock pixel">3:14 PM</span>
              </div>

              <div className="scene__dock">
                <span className="scene__hello pixel">Welcome back.</span>
                <span className="scene__pill pixel">
                  <span>Report</span>
                  <b ref={time}>{clock(START_SEC)}</b>
                </span>
                <span className="scene__mic" data-mic data-pressed={phase === 'micClick' || phase === 'listen' ? '' : undefined}>
                  <PixelArt rows={MIC_ROWS} colors={MIC_COLORS} />
                </span>
                <GhostSprite className="scene__ghost" level={0.54} mood={MOOD[phase]} />
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
                    <GhostSprite className="nudge__ghost" level={0.55} mood="happy" />
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
      </div>

      <figcaption className="demo__meta">
        <p className="small soft">
          Akyu at work: ask it out loud about an email and it reads your screen, replies and plans; later it checks in when you drift. This is a drawn illustration, not a screen recording: Akyu is not released
          yet.
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
