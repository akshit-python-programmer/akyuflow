import { site } from '../site.config'
import { track } from './track'

/** What the visitor has just paid for, if anything. */
export type Purchase = 'deposit' | 'lifetime' | null

const KEY = 'akyu:reserved'

function remember(): Purchase {
  try {
    const value = window.sessionStorage.getItem(KEY)
    if (value === 'lifetime') return 'lifetime'
    if (value === '1' || value === 'deposit') return 'deposit'
  } catch {
    // Storage blocked: nothing remembered.
  }
  return null
}

/**
 * The checkout pages send people back here with ?reserved=1 (the deposit) or
 * ?founder=1 (the lifetime deal). That return is the only signal a static site
 * gets, so it is what the `deposit` and `lifetime` events count. Each fires
 * once per browser tab, and the flag is then removed from the address bar so a
 * refresh or a shared link cannot count it again.
 *
 * Your payment provider's dashboard stays the source of truth for money: these
 * numbers can run slightly low (someone closes the tab before the redirect) and
 * anyone can type the flag by hand.
 *
 * Returns what this visitor has just bought, so the page can say thanks.
 */
export function consumeDepositReturn(): Purchase {
  const url = new URL(window.location.href)
  const kind: Purchase = url.searchParams.has(site.lifetime.returnFlag)
    ? 'lifetime'
    : url.searchParams.has(site.depositReturnFlag)
      ? 'deposit'
      : null
  if (!kind) return remember()

  const before = remember()
  try {
    window.sessionStorage.setItem(KEY, kind)
  } catch {
    // Private mode without storage: the thank-you still shows for this page view.
  }
  url.searchParams.delete(site.depositReturnFlag)
  url.searchParams.delete(site.lifetime.returnFlag)
  window.history.replaceState(null, '', `${url.pathname}${url.search}#reserve`)

  if (before !== kind) {
    if (kind === 'lifetime') track('lifetime', { revenue: site.lifetime.price, currency: 'USD' })
    else track('deposit', { revenue: site.price.deposit, currency: 'USD' })
  }
  return kind
}

/**
 * The checkout link with a way back. Dodo Payments static links (and several
 * other providers) accept a redirect_url: we point it at this exact page with
 * the return flag, so whatever address the site is published at, the buyer
 * lands on the thank-you message. A redirect_url already in the link wins.
 */
export function checkoutHref(link: string, flag: string): string {
  try {
    const url = new URL(link)
    if (url.hostname.endsWith('dodopayments.com') && !url.searchParams.has('redirect_url')) {
      const back = new URL(window.location.pathname, window.location.origin)
      back.searchParams.set(flag, '1')
      url.searchParams.set('redirect_url', back.toString())
    }
    return url.toString()
  } catch {
    return link
  }
}
