import { useSyncExternalStore } from 'react'

/**
 * The page's own little Akyu session.
 *
 * The ghost gives this page two minutes, drains while you read, asks its
 * three-button question if you leave the tab and come back, offers a one-click
 * replan when the two minutes are up, and keeps a recap of the visit.
 *
 * All of it lives in memory in this tab. None of it is stored or sent anywhere.
 */

const PAGE_BUDGET_MS = 2 * 60_000
const REPLAN_MS = 60_000
const BREAK_MS = 5 * 60_000
/** Shorter absences than this are not treated as drift. */
const DRIFT_MIN_MS = 5_000
const NOTE_MS = 4_500
const AWAY_TITLE = 'Akyu is keeping your place'

export type Choice = 'back' | 'break' | 'part'

export interface Visit {
  phase: 'running' | 'over' | 'break'
  /** Length of the current block, in seconds. */
  budgetSec: number
  /** Seconds left in the block (frozen while on a break, 0 once over). */
  leftSec: number
  /** Seconds past the end of the block. */
  overSec: number
  breakLeftSec: number
  /** Set when the visitor comes back after leaving the tab. */
  nudge: { awaySec: number } | null
  /** True while the ghost is offering the one-click replan. */
  askReplan: boolean
  replans: number
  /** A short line from the ghost that clears itself. */
  note: string | null
  ghostHidden: boolean
  /** True while the hero's big ghost or the demo's ghost is on screen. */
  ghostOnStage: boolean
}

let state: Visit = {
  phase: 'running',
  budgetSec: PAGE_BUDGET_MS / 1000,
  leftSec: PAGE_BUDGET_MS / 1000,
  overSec: 0,
  breakLeftSec: 0,
  nudge: null,
  askReplan: false,
  replans: 0,
  note: null,
  ghostHidden: false,
  ghostOnStage: true,
}

const listeners = new Set<() => void>()

let budgetMs = PAGE_BUDGET_MS
let blockStart = 0
let visitStart = 0
let lastTick = 0
let breakUntil = 0
let frozenLeftMs = 0
let awaySince = 0
let pageTitle = ''
let noteTimer = 0
let started = false
let replanOffered = false
const dwellMs = new Map<string, number>()
const driftsMs: number[] = []

function set(patch: Partial<Visit>) {
  let changed = false
  for (const key of Object.keys(patch) as Array<keyof Visit>) {
    const a = state[key]
    const b = patch[key]
    if (a === b) continue
    if (key === 'nudge' && a && b && (a as Visit['nudge'])!.awaySec === (b as Visit['nudge'])!.awaySec) continue
    changed = true
  }
  if (!changed) return
  state = { ...state, ...patch }
  for (const listener of listeners) listener()
}

function say(note: string) {
  window.clearTimeout(noteTimer)
  set({ note })
  noteTimer = window.setTimeout(() => set({ note: null }), NOTE_MS)
}

/** The section whose box contains the middle of the viewport. */
function sectionInView(): string | null {
  const middle = window.innerHeight / 2
  for (const el of document.querySelectorAll<HTMLElement>('[data-recap]')) {
    const box = el.getBoundingClientRect()
    if (box.top <= middle && box.bottom >= middle) return el.dataset.recap ?? null
  }
  return null
}

function tick() {
  const now = Date.now()
  const dt = now - lastTick
  lastTick = now

  if (document.visibilityState === 'visible') {
    const name = sectionInView()
    // Capped so a throttled timer or a slept laptop cannot credit a section with hours.
    if (name) dwellMs.set(name, (dwellMs.get(name) ?? 0) + Math.min(dt, 1000))
  }

  if (state.phase === 'break') {
    if (now >= breakUntil) {
      endBreak("Break's over. Back to it.")
      return
    }
    set({ breakLeftSec: Math.ceil((breakUntil - now) / 1000) })
    return
  }

  const leftMs = budgetMs - (now - blockStart)
  if (leftMs > 0) {
    set({ phase: 'running', leftSec: Math.ceil(leftMs / 1000), overSec: 0 })
    return
  }

  const offer = !replanOffered && !state.nudge
  if (offer) replanOffered = true
  set({
    phase: 'over',
    leftSec: 0,
    overSec: Math.floor(-leftMs / 1000),
    ...(offer ? { askReplan: true } : {}),
  })
}

function onVisibility() {
  const now = Date.now()
  if (document.visibilityState === 'hidden') {
    awaySince = now
    if (document.title !== AWAY_TITLE) pageTitle = document.title
    document.title = AWAY_TITLE
    return
  }
  if (pageTitle) document.title = pageTitle
  if (awaySince) {
    const away = now - awaySince
    awaySince = 0
    if (away >= DRIFT_MIN_MS) {
      driftsMs.push(away)
      if (state.phase !== 'break' && !state.ghostHidden) {
        set({ nudge: { awaySec: Math.round(away / 1000) }, askReplan: false, note: null })
      }
    }
  }
  lastTick = now
  tick()
}

function endBreak(note: string) {
  const now = Date.now()
  blockStart = now - (budgetMs - frozenLeftMs)
  breakUntil = 0
  set({ phase: 'running', breakLeftSec: 0 })
  say(note)
  tick()
}

export function startVisit() {
  if (started) return
  started = true
  const now = Date.now()
  blockStart = visitStart = lastTick = now
  window.setInterval(tick, 250)
  document.addEventListener('visibilitychange', onVisibility)
}

/** The visitor answered the nudge. */
export function choose(choice: Choice) {
  const now = Date.now()
  set({ nudge: null })
  if (choice === 'back') say('Welcome back.')
  if (choice === 'part') say('Got it. Carry on.')
  if (choice === 'break') {
    frozenLeftMs = Math.max(0, budgetMs - (now - blockStart))
    breakUntil = now + BREAK_MS
    set({ phase: 'break', breakLeftSec: BREAK_MS / 1000, leftSec: Math.ceil(frozenLeftMs / 1000) })
    say("Five minutes. I'll come and get you.")
  }
}

export function backFromBreak() {
  if (state.phase === 'break') endBreak('Welcome back.')
}

/** One-click replan: a fresh, shorter block starting now. */
export function replan() {
  budgetMs = REPLAN_MS
  blockStart = Date.now()
  set({
    phase: 'running',
    budgetSec: REPLAN_MS / 1000,
    leftSec: REPLAN_MS / 1000,
    overSec: 0,
    askReplan: false,
    replans: state.replans + 1,
  })
  say('Replanned. One more minute.')
}

export function dismissReplan() {
  set({ askReplan: false })
}

export function setGhostHidden(hidden: boolean) {
  set({ ghostHidden: hidden, ...(hidden ? { nudge: null, askReplan: false, note: null } : {}) })
}

const onStage = new Set<string>(['hero'])

/**
 * Tells the corner ghost that a ghost is already on screen (the big one in the
 * hero, or the one inside the demo), so it waits its turn instead of doubling up.
 */
export function setOnStage(who: string, visible: boolean) {
  if (visible) onStage.add(who)
  else onStage.delete(who)
  set({ ghostOnStage: onStage.size > 0 })
}

export interface Recap {
  totalSec: number
  longest: { name: string; sec: number } | null
  drifts: number
  driftSec: number
  replans: number
}

/** A recap of this visit so far. Read it whenever you render it. */
export function recap(): Recap {
  let longest: Recap['longest'] = null
  for (const [name, ms] of dwellMs) {
    if (!longest || ms / 1000 > longest.sec) longest = { name, sec: ms / 1000 }
  }
  return {
    totalSec: visitStart ? (Date.now() - visitStart) / 1000 : 0,
    longest,
    drifts: driftsMs.length,
    driftSec: driftsMs.reduce((sum, ms) => sum + ms, 0) / 1000,
    replans: state.replans,
  }
}

/** How full the ghost is (0 to 1) and which colour it wears, for any view of it. */
export function ghostLook(visit: Visit): { level: number; tone: 'mint' | 'peach' | 'lilac' } {
  if (visit.phase === 'over') return { level: 0, tone: 'peach' }
  const level = visit.budgetSec > 0 ? visit.leftSec / visit.budgetSec : 0
  if (visit.phase === 'break') return { level, tone: 'lilac' }
  return { level, tone: level <= 0.2 ? 'peach' : 'mint' }
}

/** The time the ghost is showing, and a few words about it. */
export function readout(visit: Visit): { time: string; caption: string } {
  const mmss = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
  if (visit.phase === 'break') return { time: mmss(visit.breakLeftSec), caption: 'On a break.' }
  if (visit.phase === 'over') return { time: `+${mmss(visit.overSec)}`, caption: 'Over time. It happens.' }
  return {
    time: mmss(visit.leftSec),
    caption: visit.replans > 0 ? 'Replanned. Still timing this page.' : 'Akyu is timing this page.',
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function useVisit(): Visit {
  return useSyncExternalStore(subscribe, () => state)
}
