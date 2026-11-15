import { site } from '../site.config'
import { visitorSource } from './utm'
import { headlineVariant } from './variant'

export type WaitlistResult = { ok: true } | { ok: false; reason: 'not-connected' | 'rejected' | 'network' }

/** Posts one email address to the form endpoint named in site.config.ts. */
export async function joinWaitlist(email: string, answer?: string): Promise<WaitlistResult> {
  const endpoint = site.waitlist.endpoint.trim()
  if (!endpoint) return { ok: false, reason: 'not-connected' }

  const body = new FormData()
  body.set('email', email)
  // Stored with every signup: which headline they saw, and (on the follow-up) their answer.
  body.set('headline_variant', headlineVariant())
  if (answer) body.set('first_thing_to_hand_over', answer)
  for (const [name, value] of Object.entries(visitorSource())) body.set(name, value)
  for (const [name, value] of Object.entries(site.waitlist.extraFields)) body.set(name, value)

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      body,
      headers: { Accept: 'application/json' },
    })
    return response.ok ? { ok: true } : { ok: false, reason: 'rejected' }
  } catch {
    return { ok: false, reason: 'network' }
  }
}
