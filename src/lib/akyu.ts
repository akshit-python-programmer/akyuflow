import { useEffect, useRef, useSyncExternalStore } from 'react'
import { track } from './track'

/**
 * The page's live Akyu: what the corner ghost is reacting to, and which demo
 * someone has asked it to open. Every demo on the page is scripted in the
 * browser. Nothing here calls an AI service or the network.
 *
 * Analytics events (see README):
 *   ghost_choice   a choice in the ghost's speech bubble   { choice }
 *   demo_start     a demo was started                      { demo, via }
 *   demo_complete  a demo reached its end                  { demo }
 *   demo_action    something done inside a finished demo   { demo, action }
 */

export type DemoId = 'plan' | 'replan' | 'reply' | 'fix' | 'explain' | 'nudge'
export type Target = 'plan' | 'lost' | 'reply' | 'fix' | 'explain'
export type AkyuMood = 'focused' | 'peeking' | 'asleep' | 'celebrating'

interface Reaction {
  line: string
  mood: AkyuMood
  n: number
}

interface Request {
  target: Target
  /** True to run the demo, false to only open it. */
  start: boolean
  n: number
}

interface AkyuState {
  reaction: Reaction | null
  request: Request | null
}

let state: AkyuState = { reaction: null, request: null }
let counter = 0
let reactionTimer = 0
const listeners = new Set<() => void>()

function set(patch: Partial<AkyuState>) {
  state = { ...state, ...patch }
  for (const listener of listeners) listener()
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function useAkyu(): AkyuState {
  return useSyncExternalStore(subscribe, () => state)
}

/** True when the visitor asked for less motion. Read it at the moment you animate. */
export function calm(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/** The corner ghost says something for a few seconds. */
export function react(line: string, mood: AkyuMood = 'celebrating', ms = 4200) {
  window.clearTimeout(reactionTimer)
  set({ reaction: { line, mood, n: ++counter } })
  reactionTimer = window.setTimeout(() => set({ reaction: null }), ms)
}

const ANCHOR: Record<Target, string> = {
  plan: 'plan-demo',
  lost: 'plan-demo',
  reply: 'screen-demo',
  fix: 'screen-demo',
  explain: 'screen-demo',
}

/** Scrolls to a demo and asks it to open (and, with start, to run). */
export function requestDemo(target: Target, start: boolean) {
  const el = document.getElementById(ANCHOR[target])
  if (el) {
    el.scrollIntoView({ behavior: calm() ? 'auto' : 'smooth', block: 'start' })
    // Keyboard and screen reader users land where the page went.
    el.focus({ preventScroll: true })
  }
  set({ request: { target, start, n: ++counter } })
}

/** Calls `run` once for each new request for one of `targets`. */
export function useDemoRequest(targets: readonly Target[], run: (request: Request) => void) {
  const { request } = useAkyu()
  const seen = useRef(0)
  const latest = useRef(run)
  latest.current = run
  useEffect(() => {
    if (!request || request.n === seen.current || !targets.includes(request.target)) return
    seen.current = request.n
    latest.current(request)
  }, [request, targets])
}

export function demoStarted(demo: DemoId, via: 'page' | 'ghost' = 'page') {
  track('demo_start', { demo, via })
}

export function demoCompleted(demo: DemoId, line: string) {
  track('demo_complete', { demo })
  react(line)
}

export function demoAction(demo: DemoId, action: string) {
  track('demo_action', { demo, action })
}

/** setTimeout that the caller can cancel all at once (on reset or unmount). */
export function useTimers() {
  const ids = useRef<number[]>([])
  useEffect(() => () => ids.current.forEach((id) => window.clearTimeout(id)), [])
  return {
    after(ms: number, fn: () => void) {
      ids.current.push(window.setTimeout(fn, ms))
    },
    clear() {
      ids.current.forEach((id) => window.clearTimeout(id))
      ids.current = []
    },
  }
}
