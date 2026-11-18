import { site, waitlistOpen } from '../site.config'
import { audienceHref } from '../lib/audience'
import { contactOpen } from '../lib/contact'
import { copy } from '../lib/copy'
import { HOME } from './PageShell'

/*
  The privacy policy. Two halves: this website (true today), and the Akyu app
  (not released; these are the same statements the home page's Privacy section
  and FAQ make, and nothing more).

  State only what is true. Every provider named here comes from site.config.ts;
  if you change how the site or the app handles data, change this page, the
  home page's Privacy section and the FAQ together, and bump legal.updated.
*/

const ANALYTICS_NAME = { umami: 'Umami', plausible: 'Plausible', none: '' } as const

export function PrivacyPage() {
  const analytics = ANALYTICS_NAME[site.analytics.provider]
  const waitlistFormProvider = site.legal.waitlistFormProvider
  const contactFormProvider = site.legal.contactFormProvider
  const pay = site.legal.paymentProvider
  const email = site.supportEmail.trim()
  const c = copy()

  return (
    <article className="doc">
      <p className="doc__kicker pixel">Privacy policy</p>
      <h1>What Akyu knows about you, and what it doesn't.</h1>
      <p className="doc__updated small soft">Last updated {site.legal.updated}</p>

      <div className="doc__short notch">
        <h2 className="doc__short-title pixel">The short version</h2>
        <ul className="doc__list">
          <li>
            This website does not use cookies
            {analytics ? '. It counts visits and button clicks without identifying you.' : ' and does not count visits.'}
          </li>
          <li>It only learns your email address if you give it: on the waitlist, in a message, or at checkout.</li>
          <li>The Akyu app reads your screen only when you ask it to. It is not released yet.</li>
          <li>Your details are never sold, and never used for advertising.</li>
        </ul>
      </div>

      <section>
        <h2>Who is responsible</h2>
        <p>
          Akyu is built by one person, {site.founder.name}. “We” on this page means that one person. To ask about
          anything here, use the{' '}
          <a className="link" href={audienceHref(`${HOME}contact/`)}>
            contact page
          </a>
          .
        </p>
      </section>

      <section>
        <h2>This website</h2>

        <h3>Visits and clicks</h3>
        {analytics ? (
          <>
            <p>
              The site uses {analytics}, an analytics service that does not use cookies and does not build a profile of
              you. It records which page was opened, the site you came from, any campaign tags on the link you
              followed, and your browser, device type and country.
            </p>
            <p>
              On top of that, the page reports when a button is pressed, when one of the demos is started or finished,
              and which version of the page you are reading: the one written for ADHD brains or the general productivity
              one. Your email address is never sent to analytics.
            </p>
          </>
        ) : (
          <p>The site does not count visits or clicks.</p>
        )}

        <h3>What is kept in your browser</h3>
        <p>The site can store two small things in your own browser. Neither of them is a cookie.</p>
        <ul className="doc__list">
          <li>
            The campaign tags from the link you arrived by, if it had any. These are cleared when you close the tab.
          </li>
          <li>
            A note that you have just come back from checkout, so the thank-you message stays on screen. This is also
            cleared when you close the tab.
          </li>
        </ul>
        <p>
          The timer and the “you've been here” recap on the home page are counted in the tab and are not stored or sent
          anywhere.
        </p>

        {(waitlistOpen || contactOpen) && (
          <>
            <h3>The waitlist and the contact form</h3>
            {waitlistOpen && (
              <p>
                If you join the waitlist, we receive your email address, which version of the page you were reading, the
                campaign tags from your link if there were any, and your answer to the one follow-up question if you
                choose to answer it.
                We use the address to tell you when Akyu ships and to send news about it.
              </p>
            )}
            {contactOpen && (
              <p>
                If you send a message from the contact page, we receive what you typed: your name, your email address,
                the topic and the message. We use them to reply.
              </p>
            )}
            <p>
              {waitlistOpen && (
                <>The waitlist form is delivered to our inbox by {waitlistFormProvider}. </>
              )}
              {contactOpen && (
                <>The contact form is delivered to our inbox by {contactFormProvider}. </>
              )}
              What you submit passes through the form service's servers. You can ask to be taken off the waitlist, or to
              have a message deleted, at any time.
            </p>
          </>
        )}

        <h3>Payments</h3>
        <p>
          Deposits and founding supporter payments are taken by {pay} on its own checkout page, not on this site. We
          never see or store your card details. {pay} tells us that you paid, how much, and the name and email address
          you entered, so we can keep your reservation and reach you. {pay}'s own privacy policy covers what it
          collects at checkout.
        </p>

        <h3>Hosting</h3>
        <p>
          The site is hosted on GitHub Pages. Like any web host, GitHub receives your IP address when your browser asks
          for a page, and may log it. The fonts and images are served from the site itself, not from a third party.
        </p>
      </section>

      <section>
        <h2>The Akyu app</h2>
        <p>
          <strong>Akyu is not released yet.</strong> This is what the app is built to do. A full policy for the app
          will be published here before it ships.
        </p>

        <h3>Always on</h3>
        <p>{c.pages.privacyAlways}</p>

        <h3>Only when you ask</h3>
        <p>
          When you ask Akyu for help, it reads the window in front and sends its text to a cloud AI service, which
          writes the answer. It shows on screen while it is looking.
        </p>

        <h3>What leaves your PC</h3>
        <ul className="doc__list">
          <li>
            <strong>The window's text, when you ask.</strong> Sent to a cloud AI service to write the answer.
          </li>
          <li>
            <strong>Your plan.</strong> What you tell Akyu about your day goes to a cloud AI service, which builds the
            plan.
          </li>
          <li>
            <strong>Account and licence checks.</strong> Akyu contacts a server to check your account and licence.
          </li>
        </ul>
      </section>

      <section>
        <h2>Your choices</h2>
        <ul className="doc__list">
          <li>Ask what we hold about you, and we will tell you.</li>
          <li>Ask us to correct or delete it, and we will.</li>
          <li>Leave the waitlist whenever you like.</li>
        </ul>
        <p>
          Write through the{' '}
          <a className="link" href={audienceHref(`${HOME}contact/`)}>
            contact page
          </a>
          {email && (
            <>
              {' '}
              or to{' '}
              <a className="link" href={`mailto:${email}`}>
                {email}
              </a>
            </>
          )}
          . Records of a payment may need to be kept for tax and accounting even after you ask.
        </p>
      </section>

      <section>
        <h2>Changes to this page</h2>
        <p>
          If how the site or the app handles your information changes, this page changes first, and the date at the top
          moves with it.
        </p>
      </section>
    </article>
  )
}
