import { site } from '../site.config'
import { track } from './track'

const KEY = 'akyu:reserved'

function remember(): boolean {
  try {
    return window.sessionStorage.getItem(KEY) === '1'
  } catch {
    return false
  }
}

/**
 * The checkout page sends people back here with ?reserved=1. That return is
 * the only signal a static site gets, so it is what the `deposit` event counts.
 * It fires once per browser tab, the flag is then removed from the address bar
 * so a refresh or a shared link cannot count it again.
 *
 * Your payment provider's dashboard stays the source of truth for money: this
 * number can run slightly low (someone closes the tab before the redirect) and
 * anyone can type the flag by hand.
 *
 * Returns true if this visitor has just reserved, so the page can say thanks.
 */
export function consumeDepositReturn(): boolean {
  const url = new URL(window.location.href)
  if (!url.searchParams.has(site.depositReturnFlag)) return remember()

  const alreadyCounted = remember()
  try {
    window.sessionStorage.setItem(KEY, '1')
  } catch {
    // Private mode without storage: the thank-you still shows for this page view.
  }
  url.searchParams.delete(site.depositReturnFlag)
  window.history.replaceState(null, '', `${url.pathname}${url.search}#reserve`)

  if (!alreadyCounted) track('deposit', { revenue: site.price.deposit, currency: 'USD' })
  return true
}
