import { site } from '../site.config'

/**
 * One small wrapper around whichever analytics service site.config.ts names.
 *
 *   visits        counted by the provider's script as soon as it loads
 *   cta_click     any "Reserve for $5" or "Join the waitlist" control
 *                 { cta: 'reserve' | 'waitlist', placement: 'header' | 'hero' | ... }
 *   checkout_start the Reserve button that leaves for the payment page
 *   deposit       the visitor came back from checkout (?reserved=1)
 *   waitlist_signup the email form was accepted
 *
 * Email addresses are never passed to analytics.
 */

type Props = Record<string, string | number | boolean>
type Sender = (event: string, props?: Props) => void

interface PlausibleFn {
  (event: string, options?: { props?: Props }): void
  q?: unknown[]
  o?: unknown
  init?: (options?: unknown) => void
}

declare global {
  interface Window {
    plausible?: PlausibleFn
    umami?: { track: (event: string, data?: Props) => void }
  }
}

let sender: Sender | null = null
let started = false
const waiting: Array<[string, Props | undefined]> = []

function ready(next: Sender) {
  sender = next
  for (const [event, props] of waiting.splice(0)) next(event, props)
}

function loadScript(src: string, attributes: Record<string, string>, onLoad?: () => void) {
  const script = document.createElement('script')
  script.defer = true
  script.src = src
  for (const [name, value] of Object.entries(attributes)) script.setAttribute(name, value)
  if (onLoad) script.addEventListener('load', onLoad)
  document.head.appendChild(script)
}

export function initAnalytics() {
  if (started) return
  started = true
  const config = site.analytics

  if (config.provider === 'umami') {
    loadScript(config.scriptSrc, { 'data-website-id': config.websiteId }, () =>
      ready((event, props) => window.umami?.track(event, props)),
    )
  }

  if (config.provider === 'plausible') {
    // Plausible's own queue stub: calls made before the script arrives are replayed by it.
    const stub: PlausibleFn = function (...args: unknown[]) {
      ;(stub.q = stub.q || []).push(args)
    } as PlausibleFn
    stub.init = (options?: unknown) => {
      stub.o = options || {}
    }
    window.plausible = window.plausible || stub
    loadScript(config.scriptSrc, config.domain ? { 'data-domain': config.domain } : {})
    if (!config.domain) window.plausible.init?.()
    ready((event, props) => window.plausible?.(event, props ? { props } : undefined))
  }
}

export function track(event: string, props?: Props) {
  // Lets any other tool on the page (a tag manager, a test) listen in.
  window.dispatchEvent(new CustomEvent('akyu:track', { detail: { event, props } }))
  if (import.meta.env.DEV) console.info('[akyu:track]', event, props ?? {})
  if (site.analytics.provider === 'none') return
  if (sender) sender(event, props)
  else waiting.push([event, props])
}
