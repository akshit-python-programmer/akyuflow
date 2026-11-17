import { useRef, useState, type FormEvent } from 'react'
import { PixelBox } from '../components/PixelBox'
import { GhostSprite } from '../ghost/GhostSprite'
import { contactOpen, sendMessage, type ContactResult } from '../lib/contact'
import { dollars } from '../lib/format'
import { site } from '../site.config'
import { HOME } from './PageShell'

type Status = 'idle' | 'sending' | 'done' | 'error'

const TOPICS = ['A question', 'A refund', 'Feedback or an idea', 'Something else'] as const

const PROBLEM: Record<Exclude<ContactResult, { ok: true }>['reason'], string> = {
  'not-connected': 'The message form is not connected yet. Set contact.endpoint or waitlist.endpoint in src/site.config.ts.',
  rejected: "That didn't go through. Check your email address and try again.",
  network: "Couldn't send that. Check your connection and try again.",
}

function ContactForm() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [topic, setTopic] = useState<string>(TOPICS[0])
  const [text, setText] = useState('')
  const [trap, setTrap] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [problem, setProblem] = useState('')
  const nameInput = useRef<HTMLInputElement>(null)
  const emailInput = useRef<HTMLInputElement>(null)
  const textInput = useRef<HTMLTextAreaElement>(null)

  function fail(message: string, focus?: HTMLElement | null) {
    setStatus('error')
    setProblem(message)
    focus?.focus()
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    if (status === 'sending') return
    if (!name.trim()) return fail('Enter your name.', nameInput.current)
    const address = email.trim()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address)) {
      return fail("That doesn't look like an email address. Check it so a reply can reach you.", emailInput.current)
    }
    if (text.trim().length < 2) return fail('Write a message first.', textInput.current)
    // A filled trap field means a bot; answer politely and send nothing.
    if (trap) return setStatus('done')

    setStatus('sending')
    const result = await sendMessage({ name: name.trim(), email: address, topic, text: text.trim() })
    if (result.ok) setStatus('done')
    else fail(PROBLEM[result.reason])
  }

  if (status === 'done') {
    return (
      <div className="contact__done" role="status">
        <GhostSprite unit={5} mood="happy" />
        <div>
          <h2>Sent. Thank you.</h2>
          <p>Your message is in the inbox. Replies go to {email.trim() || 'the address you gave'}.</p>
        </div>
      </div>
    )
  }

  return (
    <form className="contact__form" onSubmit={onSubmit} noValidate>
      <div className="contact__pair">
        <div>
          <label className="contact__label" htmlFor="contact-name">
            Your name
          </label>
          <input
            ref={nameInput}
            id="contact-name"
            className="field"
            type="text"
            name="name"
            required
            autoComplete="name"
            value={name}
            onChange={(e) => {
              setName(e.target.value)
              if (status === 'error') setStatus('idle')
            }}
          />
        </div>
        <div>
          <label className="contact__label" htmlFor="contact-email">
            Email address
          </label>
          <input
            ref={emailInput}
            id="contact-email"
            className="field"
            type="email"
            name="email"
            required
            autoComplete="email"
            inputMode="email"
            spellCheck={false}
            placeholder="you@example.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              if (status === 'error') setStatus('idle')
            }}
            aria-describedby="contact-problem"
          />
        </div>
      </div>

      <fieldset className="contact__topics">
        <legend className="contact__label">What is it about?</legend>
        <div className="contact__chips">
          {TOPICS.map((option) => (
            <label key={option} className="contact__chip">
              <input type="radio" name="topic" value={option} checked={topic === option} onChange={() => setTopic(option)} />
              <span>{option}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div>
        <label className="contact__label" htmlFor="contact-message">
          Your message
        </label>
        <textarea
          ref={textInput}
          id="contact-message"
          className="field contact__text"
          name="message"
          required
          rows={6}
          value={text}
          onChange={(e) => {
            setText(e.target.value)
            if (status === 'error') setStatus('idle')
          }}
          aria-describedby="contact-problem"
        />
        {topic === 'A refund' && (
          <p className="small soft contact__hint">Name the email address you paid with, if it is different from the one above.</p>
        )}
      </div>

      <div className="waitlist__trap" aria-hidden="true">
        <label>
          Leave this empty
          <input type="text" name="company" tabIndex={-1} autoComplete="off" value={trap} onChange={(e) => setTrap(e.target.value)} />
        </label>
      </div>

      <div className="contact__send">
        <button className="btn" type="submit" disabled={status === 'sending'}>
          <span className="btn__face">{status === 'sending' ? 'Sending…' : 'Send message'}</span>
        </button>
        <p className="contact__problem small" id="contact-problem" role="alert">
          {status === 'error' ? problem : ''}
        </p>
      </div>
    </form>
  )
}

export function ContactPage() {
  const email = site.supportEmail.trim()
  const website = site.founder.website.trim()
  const deposit = dollars(site.price.deposit)
  // Like the waitlist: the form shows once it has somewhere to post to (always while developing).
  const showForm = contactOpen || import.meta.env.DEV

  return (
    <article className="doc doc--contact">
      <p className="doc__kicker pixel">Contact</p>
      <h1>Say hello.</h1>
      <p className="lede doc__lede">
        Questions, refunds, ideas, or something that looks wrong. Your message goes straight to {site.founder.name}, the
        person building Akyu.
      </p>

      <div className="contact__grid">
        <div>
          {showForm ? (
            <PixelBox shadow className="contact__box">
              <div className="contact__box-in">
                <ContactForm />
              </div>
            </PixelBox>
          ) : (
            !email && <p className="contact__closed">The message form is not open yet.</p>
          )}
        </div>

        <aside className="contact__side">
          <div>
            <h2 className="contact__h pixel">Refunds</h2>
            <p>
              The {deposit} deposit comes back in full any time before launch. Pick “A refund” and name the email
              address you paid with.
            </p>
          </div>
          {(email || website) && (
            <div>
              <h2 className="contact__h pixel">Other ways</h2>
              {email && (
                <p>
                  <a className="link" href={`mailto:${email}`}>
                    {email}
                  </a>
                </p>
              )}
              {website && (
                <p>
                  <a className="link" href={website} rel="noopener">
                    {website.replace(/^https?:\/\//, '')}
                  </a>
                </p>
              )}
            </div>
          )}
          <div>
            <h2 className="contact__h pixel">Your message</h2>
            <p>
              It is used to reply to you and for nothing else. The{' '}
              <a className="link" href={`${HOME}privacy/`}>
                privacy policy
              </a>{' '}
              has the detail.
            </p>
          </div>
        </aside>
      </div>
    </article>
  )
}
