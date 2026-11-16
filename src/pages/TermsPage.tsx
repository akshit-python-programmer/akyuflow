import { dollars, shipDateLabel } from '../lib/format'
import { lifetimeOpen, site, waitlistOpen } from '../site.config'
import { HOME } from './PageShell'

/*
  Plain-language terms for the website and for money taken before launch.
  Every number and promise here is read from site.config.ts or repeats what the
  home page's Pre-order box already says. Do not promise more here than there.
  This was written to be clear, not by a lawyer: have it checked before you
  rely on it, and fill in legal.governingLaw when you know it.
*/

export function TermsPage() {
  const deposit = dollars(site.price.deposit)
  const locked = dollars(site.price.lockedPerMonth)
  const normal = dollars(site.price.normalPerMonth)
  const lifetime = dollars(site.lifetime.price)
  const ship = shipDateLabel()
  const mac = shipDateLabel(site.macShipDate)
  const pay = site.legal.paymentProvider
  const law = site.legal.governingLaw.trim()
  const refundNote = site.lifetime.refundNote.trim()

  return (
    <article className="doc">
      <p className="doc__kicker pixel">Terms</p>
      <h1>The terms, in plain words.</h1>
      <p className="doc__updated small soft">Last updated {site.legal.updated}</p>

      <div className="doc__short notch">
        <h2 className="doc__short-title pixel">The short version</h2>
        <ul className="doc__list">
          <li>Akyu is not fully released yet. A founding supporter payment includes access to the unfinished beta.</li>
          <li>The {deposit} deposit is refundable in full, any time before launch.</li>
          <li>Ship dates are plans, not guarantees.</li>
          <li>Akyu is a productivity tool. It is not a medical device and does not treat anything.</li>
        </ul>
      </div>

      <section>
        <h2>Who you are dealing with</h2>
        <p>
          Akyu is built by one person, {site.founder.name}. “We” on this page means that one person. By using this
          site, joining the waitlist or paying a deposit, you agree to these terms.
        </p>
      </section>

      <section>
        <h2>Where Akyu stands</h2>
        <p>
          Akyu is a desktop app that is still being built. The Windows version is planned for {ship}, and the Mac
          version for {mac}. These dates are our honest plan. They can move, and if they do, this site will say so.
        </p>
        <p>
          The demos on this site are scripted: fixed text and simple rules that show what Akyu is being built to do.
          Anything marked “Coming after launch” is planned for later and is not part of what ships on day one.
        </p>
      </section>

      <section>
        <h2>The {deposit} deposit</h2>
        <ul className="doc__list">
          <li>
            <strong>What it is.</strong> A single {deposit} payment that reserves Akyu for you. It is not a subscription
            and does not renew.
          </li>
          <li>
            <strong>What it locks in.</strong> Your price is {locked} a month for your first year, instead of the
            normal {normal} a month. Seats at this price are limited.
          </li>
          <li>
            <strong>What comes with it.</strong> Weekly progress updates, sneak peeks of live demos, and a community
            for your feedback.
          </li>
          <li>
            <strong>Refunds.</strong> Ask for your {deposit} back any time before Akyu launches and you get all of it.
            That includes if Akyu is late, or never ships.
          </li>
        </ul>
        <p>
          To ask for a refund, write through the{' '}
          <a className="link" href={`${HOME}contact/`}>
            contact page
          </a>{' '}
          and name the email address you paid with.
        </p>
      </section>

      <section>
        <h2>The founding supporter deal</h2>
        <ul className="doc__list">
          <li>
            <strong>What it is.</strong> One payment of {lifetime} to use Akyu for life, with no monthly fee. “For life”
            means for as long as Akyu is offered.
          </li>
          {site.lifetime.betaAccess && (
            <li>
              <strong>Beta access.</strong> Founding supporters get access to the beta before launch. A beta is
              unfinished: it may have bugs and missing pieces.
            </li>
          )}
          {refundNote && (
            <li>
              <strong>Refunds.</strong> {refundNote}.
            </li>
          )}
        </ul>
        {!lifetimeOpen && <p>Founding supporter spots are not open yet.</p>}
      </section>

      <section>
        <h2>Payments</h2>
        <p>
          Payments are taken by {pay} on its own checkout page. Its terms apply to the payment itself, and it may add
          tax depending on where you live. We never see or store your card details.
        </p>
      </section>

      {waitlistOpen && (
        <section>
          <h2>The waitlist</h2>
          <p>
            The waitlist is free and commits you to nothing. We email you when Akyu ships and with news about it, and
            you can leave whenever you like.
          </p>
        </section>
      )}

      <section>
        <h2>Not medical advice</h2>
        <p>
          Akyu is built for ADHD brains and time blindness, but it is a productivity tool. It is not a medical device,
          and it does not diagnose, treat or cure anything. Nothing on this site is medical advice.
        </p>
      </section>

      <section>
        <h2>The app's own terms</h2>
        <p>
          These terms cover this website and money taken before launch. When the app is released it will come with its
          own terms, which you can read before you install it or pay for a subscription.
        </p>
      </section>

      <section>
        <h2>This website</h2>
        <p>
          The words, the code and the pixel ghost on this site belong to Akyu. You are welcome to link to the site and
          to share screenshots of it; please don't pass the ghost or the writing off as your own.
        </p>
        <p>
          The site is offered as it is. We work to keep it accurate and running, but we cannot promise it will never be
          wrong or unavailable. Nothing here takes away rights the law gives you as a customer.
        </p>
      </section>

      <section>
        <h2>Changes and questions</h2>
        <p>
          If these terms change, the date at the top changes with them. A change never takes away a refund you were
          already promised.{law && ` These terms are governed by the laws of ${law}.`}
        </p>
        <p>
          Questions go through the{' '}
          <a className="link" href={`${HOME}contact/`}>
            contact page
          </a>
          . How your information is handled is in the{' '}
          <a className="link" href={`${HOME}privacy/`}>
            privacy policy
          </a>
          .
        </p>
      </section>
    </article>
  )
}
