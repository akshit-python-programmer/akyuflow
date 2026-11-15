/**
 * Where this visitor came from, read from the UTM tags on the link they arrived by
 * (?utm_source=...&utm_medium=...&utm_campaign=...). Umami reads the same tags from the
 * address by itself; this copy is kept so they can also be saved with a waitlist signup,
 * even after the visitor has scrolled around or reloaded without the tags.
 */
const KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'] as const
const STORE = 'akyu-utm'

export function visitorSource(): Record<string, string> {
  const found: Record<string, string> = {}
  try {
    const params = new URLSearchParams(window.location.search)
    for (const key of KEYS) {
      const value = params.get(key)
      if (value) found[key] = value.slice(0, 100)
    }
  } catch {
    /* no URL access */
  }
  try {
    if (Object.keys(found).length > 0) {
      window.sessionStorage.setItem(STORE, JSON.stringify(found))
      return found
    }
    const saved = window.sessionStorage.getItem(STORE)
    if (saved) return JSON.parse(saved) as Record<string, string>
  } catch {
    /* storage blocked: only the tags on this page view are used */
  }
  return found
}
