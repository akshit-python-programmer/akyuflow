import type { ReactNode } from 'react'
import { dollars, shipDateLabel } from '../lib/format'
import { site } from '../site.config'
import { showWaitlist } from './Cta'
import { isLaunch } from './DemoTag'
import './Faq.css'

export function Faq() {
  const ship = shipDateLabel()
  const deposit = dollars(site.price.deposit)
  const email = site.supportEmail.trim()

  const items: ReadonlyArray<{ q: string; a: ReactNode }> = [
    {
      q: 'Is Akyu out yet?',
      a: (
        <p>
          Not yet. Akyu ships {ship}. Until then you can reserve it with a refundable {deposit} deposit
          {showWaitlist ? ', or join the waitlist' : ''}.
        </p>
      ),
    },
    {
      q: 'Does Akyu run on Mac or Linux?',
      a: (
        <p>
          Windows comes first, in {ship}. The Mac version follows in {shipDateLabel(site.macShipDate)}. There is no
          Linux version planned.
        </p>
      ),
    },
    {
      q: `Can I get my ${deposit} back?`,
      a: (
        <p>
          Yes. The deposit is fully refundable any time before Akyu launches.
          {email && (
            <>
              {' '}
              Email{' '}
              <a className="link" href={`mailto:${email}`}>
                {email}
              </a>{' '}
              and we'll send it back.
            </>
          )}
        </p>
      ),
    },
    {
      // Keep in step with the Privacy section. Confirm with the app before publishing (site.privacyConfirmed).
      q: "What can Akyu see, and what can't it?",
      a: (
        <>
          <p>
            All the time, Akyu reads two things: the name of the app you have in front, and the title of its window.
            In a browser, that title usually includes the name of the page you're on. These go into an activity log
            that is stored only on your PC.
          </p>
          <p>
            Only when you ask it for help, Akyu reads the window in front and sends its text to a cloud AI service to
            write the answer.
          </p>
          <p>
            The plan you give Akyu also goes to a cloud AI service, which builds your plan, and Akyu contacts a server
            for account and licence checks.
          </p>
        </>
      ),
    },
    {
      q: 'Can Akyu read my screen all the time?',
      a: (
        <>
          <p>
            No. On its own, Akyu only reads the app name and window title, and keeps them on your PC. It reads what is
            in a window only when you ask it for help, and it shows on screen while it is looking.
          </p>
          <p>When you do ask, the text of the window in front is sent to a cloud AI service to write the answer.</p>
        </>
      ),
    },
    {
      q: 'Will Akyu send emails for me?',
      a: (
        <p>
          No. Akyu never sends or submits anything without your OK. When you ask, it writes a draft, and if you press
          Insert it types the draft into the reply box. Pressing Send is always your click.
          {!isLaunch('emailReply') && ' Drafting email replies is planned for after launch, not for day one.'}
        </p>
      ),
    },
    {
      q: 'Is Akyu a treatment for ADHD?',
      a: (
        <p>
          No. Akyu is a personal assistant that helps you plan, follow through and stay aware of time, built for ADHD
          brains. It is not a medical device, and it does not diagnose or treat anything.
        </p>
      ),
    },
  ]

  return (
    <section className="section faq" id="faq" data-recap="the questions">
      <div className="wrap">
        <h2>Fair questions</h2>
        <div className="faq__list">
          {items.map((item) => (
            <details className="faq__item" key={item.q}>
              <summary>{item.q}</summary>
              <div className="faq__answer">{item.a}</div>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}
