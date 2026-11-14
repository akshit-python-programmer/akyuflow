import { useEffect, useRef, useState } from 'react'
import { GhostSprite } from '../ghost/GhostSprite'
import type { Purchase } from '../lib/deposit'
import { dollars } from '../lib/format'
import { site } from '../site.config'
import { PixelBox } from './PixelBox'
import './PurchaseThanks.css'

/** The pop-up shown once when a visitor comes back from a successful checkout. */
export function PurchaseThanks({ purchase }: { purchase: Purchase }) {
  const [open, setOpen] = useState(purchase === 'deposit')
  const button = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return
    button.current?.focus()
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  if (!open) return null

  return (
    <div className="thanks" onClick={() => setOpen(false)}>
      <div
        className="thanks__card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="thanks-title"
        onClick={(event) => event.stopPropagation()}
      >
        <PixelBox shadow>
          <div className="thanks__in">
            <span className="thanks__ghost">
              <GhostSprite unit={5} mood="happy" />
            </span>
            <p className="thanks__ok pixel">Payment successful</p>
            <h2 id="thanks-title">Thank you. Your spot is reserved.</h2>
            <p>
              Your {dollars(site.price.deposit)} deposit is in, and your {dollars(site.price.lockedPerMonth)} a month price
              is locked for your first year. A receipt is on its way to your email.
            </p>
            <p className="hand thanks__signed">
              This genuinely made my day. I'll make it worth it.
              <span> — {site.founder.signature}</span>
            </p>
            <button ref={button} type="button" className="btn" onClick={() => setOpen(false)}>
              <span className="btn__face">Close</span>
            </button>
          </div>
        </PixelBox>
      </div>
    </div>
  )
}
