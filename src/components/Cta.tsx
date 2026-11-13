import type { MouseEvent, ReactNode } from 'react'
import { site, waitlistOpen } from '../site.config'
import { dollars } from '../lib/format'
import { track } from '../lib/track'

/** The waitlist is shown once it has somewhere to post to (always while developing). */
export const showWaitlist = waitlistOpen || import.meta.env.DEV

export const reserveLabel = `Reserve for ${dollars(site.price.deposit)}`

interface ReserveLinkProps {
  /** Where on the page this button sits; sent with the click event. */
  placement: string
  small?: boolean
}

/** Primary call to action. Takes the visitor to the pre-order terms and the checkout button. */
export function ReserveLink({ placement, small = false }: ReserveLinkProps) {
  return (
    <a
      className={`btn ${small ? 'btn--small' : ''}`}
      href="#reserve"
      onClick={() => track('cta_click', { cta: 'reserve', placement })}
    >
      <span className="btn__face">{reserveLabel}</span>
    </a>
  )
}

interface WaitlistLinkProps {
  placement: string
  children?: ReactNode
}

/** Secondary call to action. Scrolls to the email field and puts the cursor in it. */
export function WaitlistLink({ placement, children = 'Join the waitlist' }: WaitlistLinkProps) {
  if (!showWaitlist) return null

  function onClick(event: MouseEvent<HTMLAnchorElement>) {
    track('cta_click', { cta: 'waitlist', placement })
    const input = document.getElementById('waitlist-email')
    if (!input) return
    event.preventDefault()
    const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    input.scrollIntoView({ behavior: calm ? 'auto' : 'smooth', block: 'center' })
    input.focus({ preventScroll: true })
  }

  return (
    <a className="link" href="#waitlist" onClick={onClick}>
      {children}
    </a>
  )
}
