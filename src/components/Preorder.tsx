import { useEffect, type CSSProperties } from 'react'
import { GhostSprite } from '../ghost/GhostSprite'
import { checkoutHref, type Purchase } from '../lib/deposit'
import { dollars, shipDateLabel } from '../lib/format'
import { track } from '../lib/track'
import { checkoutOpen, lifetimeOpen, site } from '../site.config'
import { reserveLabel, showWaitlist } from './Cta'
import { PixelBox } from './PixelBox'
import { WaitlistForm } from './WaitlistForm'
import './Preorder.css'

interface PreorderProps {
  /** What the visitor has just paid for, when they have just come back from checkout. */
  purchase: Purchase
}

/** A few pixel sparks that burst around the ghost once, when someone has just paid. */
function Sparks() {
  return (
    <span className="sparks" aria-hidden="true">
      {Array.from({ length: 8 }, (_, i) => (
        <i key={i} style={{ '--i': i } as CSSProperties} />
      ))}
    </span>
  )
}

function Signed({ line }: { line: string }) {
  return (
    <p className="hand preorder__signed">
      {line}
      <span className="preorder__sig">— {site.founder.signature}</span>
    </p>
  )
}

export function Preorder({ purchase }: PreorderProps) {
  const ship = shipDateLabel()
  const deposit = dollars(site.price.deposit)
  const locked = dollars(site.price.lockedPerMonth)
  const normal = dollars(site.price.normalPerMonth)
  const save = site.price.normalPerMonth - site.price.lockedPerMonth
  const founderPrice = dollars(site.lifetime.price)
  const email = site.supportEmail.trim()

  useEffect(() => {
    if (purchase) document.getElementById('reserve')?.scrollIntoView({ block: 'start' })
  }, [purchase])

  return (
    <section className="section preorder" id="reserve" data-recap="Pre-order">
      <div className="wrap preorder__grid">
        <div className="preorder__copy">
          <h2>Reserve Akyu for {deposit}.</h2>
          <p className="lede">
            <strong>Akyu is not released yet.</strong> The Windows version ships {ship}, on Christmas Day.
          </p>
          <p className="preorder__more">
            A {deposit} refundable reservation supports development and locks your price at {locked} a month for your
            first year. Seats are limited. The normal price is {normal} a month.
          </p>
          <div className="preorder__perks">
            <h3 className="preorder__perks-title">What your {deposit} gets you</h3>
            <ul>
              <li>
                <span className="preorder__perk-ico pixel" aria-hidden="true">
                  1
                </span>
                <span>
                  <strong>Weekly progress updates.</strong> See what got built, what broke and what's next, every week.
                </span>
              </li>
              <li>
                <span className="preorder__perk-ico pixel" aria-hidden="true">
                  2
                </span>
                <span>
                  <strong>Sneak peeks of live demos.</strong> See Akyu taking shape before launch.
                </span>
              </li>
              <li>
                <span className="preorder__perk-ico pixel" aria-hidden="true">
                  3
                </span>
                <span>
                  <strong>A community for your feedback.</strong> Tell me what to fix, keep or add, and help shape what ships.
                </span>
              </li>
            </ul>
          </div>
          <p className="preorder__more">
            It's the price of a coffee, and to a one-person team it says something no survey can: <em>yes, build this,
            I'll use it.</em>
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
            {purchase === 'deposit' ? (
              <div className="preorder__thanks" role="status">
                <span className="preorder__stamp pixel">Reserved</span>
                <span className="preorder__ghost">
                  <Sparks />
                  <GhostSprite unit={5} mood="happy" />
                </span>
                <h3>You just made Akyu a little more real.</h3>
                <p>Thank you. Here's what's yours now:</p>
                <ul className="preorder__got">
                  <li>
                    <strong>
                      <s className="preorder__was preorder__was--small">{normal}</s> {locked} a month, for your first year.
                    </strong>{' '}
                    Everyone after launch pays {normal}.
                  </li>
                  <li>
                    <strong>Weekly progress updates, sneak peeks of live demos and the feedback community.</strong>{' '}
                    Look out for your first update.
                  </li>
                  <li>
                    <strong>First to hear when it ships.</strong> We'll email you the moment Akyu is out, {ship}.
                  </li>
                  <li>
                    <strong>Your {deposit} stays refundable</strong> any time before launch.
                  </li>
                </ul>
                <Signed line="This genuinely made my day. I'll make it worth it." />
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
                      <s className="preorder__was" aria-label={`Normal price ${normal}`}>
                        {normal}
                      </s>{' '}
                      <span className="preorder__sum">{locked}</span> a month, for your first year
                      <span className="small soft">Limited seats</span>
                      {save > 0 && <span className="preorder__save pixel">You save {dollars(save)} every month</span>}
                    </dd>
                  </div>
                  <div>
                    <dt>Includes</dt>
                    <dd>
                      Weekly updates, live demo sneak peeks and a feedback community
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
                      href={checkoutHref(site.checkoutUrl, site.depositReturnFlag)}
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

      <PixelBox shadow className="lifetime">
        <div className="lifetime__in">
          <div className="lifetime__grid">
            <div>
              <span className="lifetime__tag pixel">Founder Program</span>
              <h2 className="lifetime__title">Try the beta now. Help shape what comes next.</h2>
              <p className="lifetime__why">
                Become a founding supporter with a one-time payment of {founderPrice} and get lifetime use of Akyu,
                with no monthly fee. Your feedback will help guide development before the Windows launch.
              </p>
            </div>
            <div className="lifetime__offer">
              <p className="lifetime__price">
                <strong className="preorder__sum">{founderPrice}</strong>
                <span className="small soft">One time · lifetime access</span>
              </p>
              <ul className="lifetime__list">
                {site.lifetime.betaAccess && <li>Access to the current beta before launch</li>}
                <li>Share feedback and help shape Akyu's development</li>
                <li>Lifetime use with no monthly fee</li>
              </ul>
              {site.lifetime.betaAccess && <p className="lifetime__beta">The beta is unfinished and may have bugs or missing features.</p>}
              {purchase === 'lifetime' ? (
                <p className="lifetime__beta" role="status">
                  You're in! {site.lifetime.betaDelivery}
                </p>
              ) : lifetimeOpen ? (
                <a
                  className="btn"
                  href={checkoutHref(site.lifetime.checkoutUrl, site.lifetime.returnFlag)}
                  onClick={() => {
                    track('cta_click', { cta: 'founder_program', placement: 'preorder' })
                    track('checkout_start', { placement: 'founder_program' })
                  }}
                >
                  <span className="btn__face">Join the Founder Program for {founderPrice}</span>
                </a>
              ) : (
                <p className="preorder__closed">Founder Program spots are not open yet.</p>
              )}
              {site.lifetime.refundNote.trim() && <p className="small soft">{site.lifetime.refundNote}</p>}
            </div>
          </div>
        </div>
      </PixelBox>

    </section>
  )
}
