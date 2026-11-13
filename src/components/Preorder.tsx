import { useEffect } from 'react'
import { GhostSprite } from '../ghost/GhostSprite'
import { dollars, shipDateLabel } from '../lib/format'
import { track } from '../lib/track'
import { checkoutOpen, site } from '../site.config'
import { reserveLabel, showWaitlist } from './Cta'
import { PixelBox } from './PixelBox'
import { WaitlistForm } from './WaitlistForm'
import './Preorder.css'

interface PreorderProps {
  /** True when the visitor has just come back from checkout. */
  reserved: boolean
}

export function Preorder({ reserved }: PreorderProps) {
  const ship = shipDateLabel()
  const deposit = dollars(site.price.deposit)
  const locked = dollars(site.price.lockedPerMonth)
  const normal = dollars(site.price.normalPerMonth)
  const email = site.supportEmail.trim()

  useEffect(() => {
    if (reserved) document.getElementById('reserve')?.scrollIntoView({ block: 'start' })
  }, [reserved])

  return (
    <section className="section preorder" id="reserve" data-recap="Pre-order">
      <div className="wrap preorder__grid">
        <div className="preorder__copy">
          <h2>Reserve Akyu for {deposit}.</h2>
          <p className="lede">
            <strong>Akyu is not released yet.</strong> It ships {ship}.
          </p>
          <p className="preorder__more">
            A {deposit} refundable deposit locks your price at {locked} a month for life. The normal price is {normal} a
            month.
          </p>
          <p className="preorder__more">
            Changed your mind? Ask for the {deposit} back any time before launch.
            {email && (
              <>
                {' '}
                Write to{' '}
                <a className="link" href={`mailto:${email}`}>
                  {email}
                </a>
                .
              </>
            )}
          </p>
        </div>

        <PixelBox shadow className="preorder__ticket">
          <div className="preorder__ticket-in">
            {reserved ? (
              <div className="preorder__thanks" role="status">
                <GhostSprite unit={5} mood="happy" />
                <h3>Reserved. Thank you.</h3>
                <p>
                  Your price is locked at {locked} a month for life. We'll email you when Akyu ships in {ship}.
                </p>
                <p className="small soft">The deposit stays refundable any time before launch.</p>
              </div>
            ) : (
              <>
                <dl className="preorder__terms">
                  <div>
                    <dt>Today</dt>
                    <dd>
                      <span className="preorder__sum">{deposit}</span> deposit
                      <span className="small soft">Refundable any time before launch</span>
                    </dd>
                  </div>
                  <div>
                    <dt>Your price</dt>
                    <dd>
                      <span className="preorder__sum">{locked}</span> a month, for life
                    </dd>
                  </div>
                  <div>
                    <dt>Normal price</dt>
                    <dd>
                      <span className="preorder__sum">{normal}</span> a month
                    </dd>
                  </div>
                  <div>
                    <dt>Ships</dt>
                    <dd>{ship}</dd>
                  </div>
                </dl>

                {checkoutOpen ? (
                  <div className="preorder__pay">
                    <a
                      className="btn preorder__paybtn"
                      href={site.checkoutUrl}
                      onClick={() => {
                        track('cta_click', { cta: 'reserve', placement: 'preorder' })
                        track('checkout_start', { placement: 'preorder' })
                      }}
                    >
                      <span className="btn__face">{reserveLabel}</span>
                    </a>
                    <p className="small soft">This takes you to the checkout page.</p>
                  </div>
                ) : (
                  <p className="preorder__closed">Deposits are not open yet.</p>
                )}

                {showWaitlist && (
                  <div className="preorder__waitlist">
                    <p>
                      {checkoutOpen
                        ? `Not ready to put ${deposit} down? Join the waitlist and we'll email you when Akyu ships.`
                        : "Join the waitlist and we'll email you when Akyu ships."}
                    </p>
                    <WaitlistForm placement="preorder" />
                  </div>
                )}
              </>
            )}
          </div>
        </PixelBox>
      </div>
    </section>
  )
}
