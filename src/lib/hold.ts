let navigationTarget: Element | null = null
let navigationTimer = 0
const activeHolds = new Set<() => void>()

/** Lets in-page navigation pass through animated sections without being held. */
export function preparePageNavigation(target: Element) {
  navigationTarget = target
  window.clearTimeout(navigationTimer)
  navigationTimer = window.setTimeout(() => {
    navigationTarget = null
  }, 10_000)
  for (const release of [...activeHolds]) release()
}

/** True until the requested destination is reached or the navigation times out. */
export function pageNavigationPending(): boolean {
  if (!navigationTarget) return false
  const box = navigationTarget.getBoundingClientRect()
  const header = document.querySelector('header')?.getBoundingClientRect().bottom ?? 0
  if (box.top <= window.innerHeight * 0.75 && box.bottom > header) {
    window.clearTimeout(navigationTimer)
    navigationTarget = null
    return false
  }
  return true
}

export function registerPageHold(release: () => void): () => void {
  activeHolds.add(release)
  return () => activeHolds.delete(release)
}

/**
 * Keeps the page still on `el` while something plays, and turns any attempt to scroll
 * into a nudge that the caller can use (to speed the scene up, say).
 *
 * The page is moved in one step so that all of `el` is in view below the sticky header,
 * and is pulled back to that spot if anything moves it. Escape lets go.
 * Returns the function that lets go.
 */
export function holdPage(
  el: HTMLElement,
  options: { onNudge: (amount: number) => void; onRelease?: () => void },
): () => void {
  let lockY = 0
  let released = false
  let lastTouchY: number | null = null
  let unregisterHold = () => {}

  const target = () => {
    const header = document.querySelector('header')?.getBoundingClientRect().height ?? 0
    const box = el.getBoundingClientRect()
    const room = window.innerHeight - header
    const gap = Math.max(8, (room - box.height) / 2)
    return Math.max(0, Math.round(window.scrollY + box.top - header - gap))
  }
  const keep = () => {
    if (Math.abs(window.scrollY - lockY) > 1) window.scrollTo({ top: lockY, behavior: 'instant' })
  }
  const refit = () => {
    lockY = target()
    keep()
  }
  const wheel = (event: WheelEvent) => {
    event.preventDefault()
    options.onNudge(Math.abs(event.deltaY) / 100)
  }
  const touchStart = (event: TouchEvent) => {
    lastTouchY = event.touches[0]?.clientY ?? null
  }
  const touchMove = (event: TouchEvent) => {
    event.preventDefault()
    const y = event.touches[0]?.clientY
    if (y === undefined) return
    if (lastTouchY !== null) options.onNudge(Math.abs(y - lastTouchY) / 60)
    lastTouchY = y
  }
  const keys = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      release()
      options.onRelease?.()
      return
    }
    if ([' ', 'ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'End', 'Home'].includes(event.key)) {
      event.preventDefault()
      options.onNudge(1)
    }
  }
  function release() {
    if (released) return
    released = true
    unregisterHold()
    window.removeEventListener('wheel', wheel)
    window.removeEventListener('touchstart', touchStart)
    window.removeEventListener('touchmove', touchMove)
    window.removeEventListener('keydown', keys)
    window.removeEventListener('scroll', keep)
    window.removeEventListener('resize', refit)
  }
  const releaseForNavigation = () => {
    release()
    options.onRelease?.()
  }

  unregisterHold = registerPageHold(releaseForNavigation)
  lockY = target()
  window.scrollTo({ top: lockY, behavior: 'instant' })
  // Layout can settle a moment later (fonts, images): measure again once it has.
  window.requestAnimationFrame(refit)
  window.setTimeout(refit, 150)
  window.addEventListener('wheel', wheel, { passive: false })
  window.addEventListener('touchstart', touchStart, { passive: true })
  window.addEventListener('touchmove', touchMove, { passive: false })
  window.addEventListener('keydown', keys)
  window.addEventListener('scroll', keep, { passive: true })
  window.addEventListener('resize', refit)
  return release
}
