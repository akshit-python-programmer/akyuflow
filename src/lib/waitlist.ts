import { site } from '../site.config'
import { audience } from './audience'
import { visitorSource } from './utm'

export type WaitlistResult = { ok: true } | { ok: false; reason: 'not-connected' | 'rejected' | 'network' | 'timeout' }

/** Posts one email address to the form endpoint named in site.config.ts. */
export async function joinWaitlist(email: string, answer?: string): Promise<WaitlistResult> {
  const endpoint = site.waitlist.endpoint.trim()
  if (!endpoint) return { ok: false, reason: 'not-connected' }

  const body = new FormData()
  body.set('email', email)
  // Stored with every signup: which voice they read, and (on the follow-up) their answer.
  body.set('audience', audience())
  if (answer) body.set('first_thing_to_hand_over', answer)
  for (const [name, value] of Object.entries(visitorSource())) body.set(name, value)
  for (const [name, value] of Object.entries(site.waitlist.extraFields)) body.set(name, value)

  const controller = new AbortController()
  const timeout = window.setTimeout(() => controller.abort(), 15000)

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      body,
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    })
    if (!response.ok) return { ok: false, reason: 'rejected' }

    let result: unknown
    try {
      result = await response.json()
    } catch {
      return { ok: false, reason: 'rejected' }
    }

    if (typeof result !== 'object' || result === null || !('success' in result) || result.success !== true) {
      return { ok: false, reason: 'rejected' }
    }
    return { ok: true }
  } catch {
    if (controller.signal.aborted) return { ok: false, reason: 'timeout' }
    return { ok: false, reason: 'network' }
  } finally {
    window.clearTimeout(timeout)
  }
}
