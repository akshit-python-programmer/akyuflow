import { site } from '../site.config'

export type ContactResult = { ok: true } | { ok: false; reason: 'not-connected' | 'rejected' | 'network' }

/** Where the Contact page posts: its own endpoint if set, otherwise the waitlist's. */
export function contactEndpoint(): string {
  return site.contact.endpoint.trim() || site.waitlist.endpoint.trim()
}

export const contactOpen = contactEndpoint() !== ''

/** Posts one message to the form endpoint. Nothing here goes to analytics. */
export async function sendMessage(message: { name: string; email: string; topic: string; text: string }): Promise<ContactResult> {
  const endpoint = contactEndpoint()
  if (!endpoint) return { ok: false, reason: 'not-connected' }

  const body = new FormData()
  body.set('kind', 'contact')
  if (message.name) body.set('name', message.name)
  body.set('email', message.email)
  body.set('topic', message.topic)
  body.set('message', message.text)
  for (const [name, value] of Object.entries(site.contact.extraFields)) body.set(name, value)

  try {
    const response = await fetch(endpoint, { method: 'POST', body, headers: { Accept: 'application/json' } })
    return response.ok ? { ok: true } : { ok: false, reason: 'rejected' }
  } catch {
    return { ok: false, reason: 'network' }
  }
}
