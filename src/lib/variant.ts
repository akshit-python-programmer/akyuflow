/**
 * Which hero headline this visitor sees, for the headline test.
 *   a  "You don't need another productivity system. You need an assistant."
 *   b  "Built for ADHD brains that lose track of time."
 * ?h=a or ?h=b forces one. Otherwise the visitor is given one at random, and it is
 * remembered in this browser so they see the same headline every time.
 */
export type Variant = 'a' | 'b'

const KEY = 'akyu-headline'
let chosen: Variant | null = null

export function headlineVariant(): Variant {
  if (chosen) return chosen
  let found: Variant | null = null
  try {
    const param = new URLSearchParams(window.location.search).get('h')?.toLowerCase()
    if (param === 'a' || param === 'b') found = param
  } catch {
    /* no URL access */
  }
  let stored: Variant | null = null
  try {
    const saved = window.localStorage.getItem(KEY)
    if (saved === 'a' || saved === 'b') stored = saved
  } catch {
    /* storage blocked: the choice just lasts for this page view */
  }
  chosen = found ?? stored ?? (Math.random() < 0.5 ? 'a' : 'b')
  try {
    window.localStorage.setItem(KEY, chosen)
  } catch {
    /* ignore */
  }
  return chosen
}
