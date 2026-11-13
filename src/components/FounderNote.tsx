import { GhostSprite } from '../ghost/GhostSprite'
import { dollars } from '../lib/format'
import { site } from '../site.config'
import './FounderNote.css'

/**
 * A handwritten letter from the founder, pinned above the pricing.
 * Written in A.K's own voice: edit the words freely, they are the founder's,
 * not the product's. Keep anything about refunds in step with the Preorder box.
 */
export function FounderNote() {
  if (!site.founder.show) return null
  const deposit = dollars(site.price.deposit)

  return (
    <section className="section founder" id="founder" data-recap="A note from the founder">
      <div className="wrap founder__wrap">
        <h2 className="sr-only">A note from the founder</h2>
        <figure className="founder__paper">
          <span className="founder__tape" aria-hidden="true" />
          <blockquote className="hand founder__note">
            <p className="founder__hi">Hey, I'm A.K.</p>
            <p>
              I'm a college student, and I'm building Akyu <mark>by hand</mark>. Line by line, late at night, between classes and
              assignments. <mark>It isn't vibe coded.</mark> Every pixel of that little ghost, every nudge, every word on this page is
              something I sat with until it felt right.
            </p>
            <p>
              I'm building it because I know the feeling. You look up and the afternoon is gone. You meant to start, and
              you didn't, and then you feel bad about it. Again. I wanted something that sits next to you and{' '}
              <u>gently</u> brings you back, <mark>without the guilt</mark>.
            </p>
            <p>
              I'll be honest with you. I'm doing this <mark>on my own</mark> while <mark>paying my way through college</mark>. Every {deposit}{' '}
              reservation <mark>tells me this is worth building</mark>, and helps me keep going: for my fees, for the late nights,
              and for the dream of finally making something that's <em>actually</em> worth it.
            </p>
            <p>
              If Akyu sounds like something you've needed, <mark>please reserve it</mark>. And if you change your mind, you get your{' '}
              {deposit} back any time before launch. <mark>That's a promise.</mark>
            </p>
            <p>Thank you for reading this far. It means more than you know.</p>
          </blockquote>
          <figcaption className="founder__sign">
            <span className="hand founder__sig">{site.founder.signature}</span>
            <span className="small soft">{site.founder.name}, founder of Akyu</span>
            <span className="founder__ghost" aria-hidden="true">
              <GhostSprite unit={3} mood="happy" />
            </span>
          </figcaption>
        </figure>
      </div>
    </section>
  )
}
