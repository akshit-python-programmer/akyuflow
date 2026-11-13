import { checkoutOpen, site, waitlistOpen } from '../site.config'
import './SetupChecklist.css'

/**
 * Shown only while `npm run dev` is running, never on the published site.
 * It lists what is still empty in src/site.config.ts.
 */
export function SetupChecklist() {
  if (!import.meta.env.DEV) return null

  const items: ReadonlyArray<readonly [string, string, boolean]> = [
    ['checkoutUrl', 'Checkout link for the deposit. Until it is set the page says deposits are not open.', checkoutOpen],
    ['waitlist.endpoint', 'Where the email form posts. Until it is set the waitlist is hidden on the live site.', waitlistOpen],
    ['analytics', 'Counts visits, CTA clicks and deposits. Until it is set nothing is counted.', site.analytics.provider !== 'none'],
    ['supportEmail', 'Contact address for refund requests. Until it is set no address is shown.', site.supportEmail.trim() !== ''],
    ['privacyConfirmed', 'Confirm privacy claims: check the Privacy section and the FAQ answers about what Akyu sees and reads against the real app, then set this to true.', site.privacyConfirmed],
    ['demoVideo.src', 'Your 20-second recording. Until it is set the hero plays the drawn illustration.', site.demoVideo.src.trim() !== ''],
  ]
  const missing = items.filter(([, , done]) => !done)
  if (missing.length === 0) return null

  return (
    <details className="setup">
      <summary>
        Only you see this (dev mode): {missing.length} {missing.length === 1 ? 'thing' : 'things'} to fill in before
        publishing
      </summary>
      <ul>
        {missing.map(([key, why]) => (
          <li key={key}>
            <code>{key}</code> {why}
          </li>
        ))}
      </ul>
      <p>
        All of them live in <code>src/site.config.ts</code>.
      </p>
    </details>
  )
}
