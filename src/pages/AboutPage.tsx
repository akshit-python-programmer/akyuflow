import { reserveLabel } from '../components/Cta'
import { isLaunch } from '../components/DemoTag'
import { GhostSprite } from '../ghost/GhostSprite'
import { audienceHref } from '../lib/audience'
import { copy } from '../lib/copy'
import { shipDateLabel } from '../lib/format'
import { checkoutOpen, site } from '../site.config'
import { HOME } from './PageShell'

/*
  What Akyu is, who makes it and where it stands. Same rules as the home page:
  no user counts, no testimonials, never say it treats ADHD, and only describe
  as available what site.config.ts marks 'launch'.
*/

const BELIEFS = [
  [
    'It asks. It never scolds.',
    'When you drift, Akyu checks in with a question and three buttons. No streaks to break, no red warnings, no guilt.',
  ],
  [
    'Nothing to maintain.',
    'You say your day in plain words and Akyu does the arranging. When the day changes, it rearranges.',
  ],
  [
    'Time you can see.',
    'The ghost sits on top of your screen and empties as your time runs down, so an hour never disappears quietly.',
  ],
  [
    'It looks only when you ask.',
    'On its own, Akyu knows the name of the app in front and its window title. It reads what is in a window only when you ask for help.',
  ],
] as const

export function AboutPage() {
  const ship = shipDateLabel()
  const mac = shipDateLabel(site.macShipDate)
  const website = site.founder.website.trim()
  const c = copy()

  return (
    <article className="doc doc--about">
      <p className="doc__kicker pixel">About</p>
      <h1>
        {c.pages.aboutHeadline.lead}
        <mark className="doc__mark">{c.pages.aboutHeadline.mark}</mark>.
      </h1>
      <p className="lede doc__lede">
        Akyu is a tiny ghost that lives on your screen. Tell it your day in plain words and it plans it, replans it
        when things change, and keeps time in view so the plan actually happens.
      </p>

      <section>
        <h2>What Akyu is</h2>
        <p>
          Akyu is a desktop app for Windows, with Mac to follow. It is for people who lose track of time, whose plans
          fall apart the moment one thing runs over, and who have set up more planner apps than they have kept.
        </p>
        <p>
          You talk to it. It turns one line about your day into small, timed blocks, puts a timer on top of your
          screen, and gently checks in if you wander off. Ask, and it fixes the wording of a message you are stuck on
          {isLaunch('emailReply') ? ' or drafts a reply' : ''}.
        </p>
        <p className="doc__aside small soft">{c.pages.aboutAside}</p>
      </section>

      <section>
        <h2>What it believes</h2>
        <ol className="doc__beliefs">
          {BELIEFS.map(([title, body], i) => (
            <li key={title}>
              <span className="doc__num pixel" aria-hidden="true">
                {i + 1}
              </span>
              <div>
                <h3>{title}</h3>
                <p>{body}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section>
        <h2>Who makes it</h2>
        <div className="doc__maker">
          <GhostSprite unit={5} mood="happy" />
          <div>
            <p>
              Akyu is built by one person, <strong>{site.founder.name}</strong>, a college student writing it by hand
              between classes and assignments. There is no team and no investor behind it: the pixel ghost, the app and
              this site all come from the same desk.
            </p>
            <p>
              <a className="link" href={audienceHref(`${HOME}#founder`)}>
                Read the founder's note
              </a>
              {website && (
                <>
                  {' · '}
                  <a className="link" href={website} rel="noopener">
                    {website.replace(/^https?:\/\//, '')}
                  </a>
                </>
              )}
            </p>
          </div>
        </div>
      </section>

      <section>
        <h2>Where it stands</h2>
        <p>
          <strong>Akyu is not released yet.</strong> The Windows version is planned for {ship}, and the Mac version for{' '}
          {mac}. Everything on the home page that can be tried is a scripted demo of what is being built.
        </p>
        <div className="doc__actions">
          {checkoutOpen && (
            <a className="btn" href={audienceHref(`${HOME}#reserve`)}>
              <span className="btn__face">{reserveLabel}</span>
            </a>
          )}
          <a className="link" href={audienceHref(`${HOME}contact/`)}>
            Ask a question
          </a>
        </div>
      </section>
    </article>
  )
}
