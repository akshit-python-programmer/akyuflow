import type { MouseEvent, ReactNode } from 'react'
import { checkoutOpen, site, waitlistOpen } from '../site.config'
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

/** Scrolls to the email field and puts the cursor in it. Does nothing (the link works as a plain anchor) if it is not on the page. */
function toWaitlist(event: MouseEvent<HTMLAnchorElement>) {
  const input = document.getElementById('waitlist-email')
  if (!input) return
  event.preventDefault()
  const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  input.scrollIntoView({ behavior: calm ? 'auto' : 'smooth', block: 'center' })
  input.focus({ preventScroll: true })
}

/**
 * Primary call to action. Takes the visitor to the pre-order terms and the checkout button.
 * While deposits are not open it reads "Join the waitlist" and goes to the email field instead.
 */
export function ReserveLink({ placement, small = false }: ReserveLinkProps) {
  if (!checkoutOpen) {
    return (
      <a
        className={`btn ${small ? 'btn--small' : ''}`}
        href="#waitlist"
        onClick={(event) => {
          track('cta_click', { cta: 'waitlist', placement })
          toWaitlist(event)
        }}
      >
        <span className="btn__face">Join the waitlist</span>
      </a>
    )
  }
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
  // While deposits are closed the main button already says "Join the waitlist"; do not show it twice.
  if (!showWaitlist || !checkoutOpen) return null

  function onClick(event: MouseEvent<HTMLAnchorElement>) {
    track('cta_click', { cta: 'waitlist', placement })
    toWaitlist(event)
  }

  return (
    <a className="link" href="#waitlist" onClick={onClick}>
      {children}
    </a>
  )
}
