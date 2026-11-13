import { site } from '../site.config'

/** 95 -> "1:35" */
export function clock(totalSeconds: number): string {
  const s = Math.max(0, Math.round(totalSeconds))
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

/** 95 -> "1 minute 35 seconds", for sentences and screen readers. */
export function spell(totalSeconds: number): string {
  const s = Math.max(0, Math.round(totalSeconds))
  const m = Math.floor(s / 60)
  const rest = s % 60
  const parts: string[] = []
  if (m > 0) parts.push(`${m} ${m === 1 ? 'minute' : 'minutes'}`)
  if (rest > 0 || m === 0) parts.push(`${rest} ${rest === 1 ? 'second' : 'seconds'}`)
  return parts.join(' ')
}

/** 95 -> "1m 35s", for the compact recap. */
export function short(totalSeconds: number): string {
  const s = Math.max(0, Math.round(totalSeconds))
  const m = Math.floor(s / 60)
  return m > 0 ? `${m}m ${String(s % 60).padStart(2, '0')}s` : `${s}s`
}

/** Turns site.shipDate into the words shown on the page. */
export function shipDateLabel(value: string = site.shipDate): string {
  const day = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (day) {
    const date = new Date(Date.UTC(Number(day[1]), Number(day[2]) - 1, Number(day[3])))
    return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(date)
  }
  const month = /^(\d{4})-(\d{2})$/.exec(value)
  if (month) {
    const date = new Date(Date.UTC(Number(month[1]), Number(month[2]) - 1, 1))
    return new Intl.DateTimeFormat('en-GB', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(date)
  }
  return value
}

export function dollars(amount: number): string {
  return `$${amount}`
}
