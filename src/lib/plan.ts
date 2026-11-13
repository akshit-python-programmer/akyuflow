/**
 * The plan demo's "understanding", which is a handful of plain rules and
 * nothing more. It is not the app's planner and it calls no AI service.
 *
 *   tasks are separated by commas, semicolons, new lines or "then"
 *   "at 6" fixes a task at that time; "by 4" is a deadline
 *   "for 30m" / "for 1h" sets a length; otherwise a guess from the words
 *   hours 1 to 7 without am/pm are read as afternoon
 */

export interface PlanTask {
  id: number
  title: string
  minutes: number
  /** Fixed start, in minutes after midnight. */
  at?: number
  /** Deadline, in minutes after midnight. */
  by?: number
  start: number
  end: number
}

export const DAY_START = 9 * 60

const GUESSES: ReadonlyArray<readonly [RegExp, number]> = [
  [/\b(report|essay|thesis|proposal|study|revise|homework|code|build)/, 90],
  [/\b(slides?|deck|presentation|write|draft|design)/, 60],
  [/\b(gym|run|workout|yoga|swim|meeting|review)/, 60],
  [/\b(lunch|cook|dinner|groceries|shopping|clean)/, 45],
  [/\b(emails?|inbox|messages|call|laundry|walk|dog|read|admin|tidy)/, 30],
]

function guessMinutes(title: string): number {
  const lower = title.toLowerCase()
  for (const [pattern, minutes] of GUESSES) if (pattern.test(lower)) return minutes
  return 45
}

function toMinutes(hour: number, minute: number, meridiem: string | undefined): number | null {
  if (hour < 1 || hour > 12 || minute > 59) return null
  let h = hour
  const m = meridiem?.toLowerCase()
  if (m === 'pm' && h < 12) h += 12
  else if (m === 'am' && h === 12) h = 0
  else if (!m && h <= 7) h += 12
  return h * 60 + minute
}

const TIME = /\b(at|by|before)\s+(\d{1,2})(?:[:.](\d{2}))?\s*(am|pm)?\b/i
const LENGTH = /\bfor\s+(\d{1,3})\s*(m|min|mins|minutes|h|hr|hrs|hour|hours)\b/i
const FILLER = /^(?:and\s+)?(?:then\s+)?(?:first\s+)?|\s+(?:first|next|after that|later|and)$/gi

export type ParseResult = { ok: true; tasks: PlanTask[] } | { ok: false }

export function parseDay(input: string): ParseResult {
  const parts = input
    .split(/[,;\n]|\s+and then\s+|\s+then\s+/i)
    .map((part) => part.trim())
    .filter(Boolean)

  if (parts.length < 1 || parts.length > 8) return { ok: false }
  // One long sentence is not a list.
  if (parts.length === 1 && parts[0].split(/\s+/).length > 5) return { ok: false }

  const tasks: PlanTask[] = []
  for (const [i, raw] of parts.entries()) {
    let text = raw
    let at: number | undefined
    let by: number | undefined
    let minutes: number | undefined

    const time = TIME.exec(text)
    if (time) {
      const value = toMinutes(Number(time[2]), Number(time[3] ?? 0), time[4])
      if (value === null) return { ok: false }
      if (time[1].toLowerCase() === 'at') at = value
      else by = value
      text = text.replace(time[0], ' ')
    }

    const length = LENGTH.exec(text)
    if (length) {
      const n = Number(length[1])
      minutes = /^h/i.test(length[2]) ? n * 60 : n
      text = text.replace(length[0], ' ')
    }

    text = text.replace(/\s+/g, ' ').trim().replace(FILLER, '').trim()
    if (text.length < 2 || text.length > 40 || !/[a-z]/i.test(text)) return { ok: false }
    if (minutes !== undefined && (minutes < 5 || minutes > 240)) return { ok: false }

    const title = text[0].toUpperCase() + text.slice(1)
    tasks.push({ id: i, title, minutes: minutes ?? guessMinutes(title), at, by, start: 0, end: 0 })
  }

  return { ok: true, tasks: schedule(tasks) }
}

/**
 * Fixed tasks stay at their time. The rest run in the order given from the
 * start of the day (or from `from`), stepping around fixed ones.
 */
export function schedule(tasks: PlanTask[], extra: { id: number; minutes: number } | null = null): PlanTask[] {
  const length = (t: PlanTask) => t.minutes + (extra && extra.id === t.id ? extra.minutes : 0)
  const fixed = tasks.filter((t) => t.at !== undefined).map((t) => ({ start: t.at!, end: t.at! + length(t) }))
  let cursor = DAY_START
  return tasks.map((task) => {
    if (task.at !== undefined) return { ...task, start: task.at, end: task.at + length(task) }
    let start = cursor
    for (;;) {
      const clash = fixed.find((f) => start < f.end && start + length(task) > f.start)
      if (!clash) break
      start = clash.end
    }
    cursor = start + length(task)
    return { ...task, start, end: cursor }
  })
}

/** 545 -> "9:05", 780 -> "1:00" */
export function hm(minutes: number): string {
  const h = Math.floor(minutes / 60) % 24
  const m = minutes % 60
  return `${h % 12 === 0 ? 12 : h % 12}:${String(m).padStart(2, '0')}`
}

/** 545 -> "9:05 am" */
export function hmFull(minutes: number): string {
  return `${hm(minutes)} ${Math.floor(minutes / 60) % 24 < 12 ? 'am' : 'pm'}`
}

/** 90 -> "1h 30m" */
export function length(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h === 0) return `${m}m`
  return m === 0 ? `${h}h` : `${h}h ${String(m).padStart(2, '0')}m`
}
