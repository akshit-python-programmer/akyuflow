import { useRef, useState, type FormEvent } from 'react'
import { joinWaitlist, type WaitlistResult } from '../lib/waitlist'
import { track } from '../lib/track'
import './WaitlistForm.css'

type Status = 'idle' | 'sending' | 'done' | 'error'

const FIRST_THINGS = ['Planning my day', 'Keeping me on track', 'Help with emails and messages'] as const

const PROBLEM: Record<Exclude<WaitlistResult, { ok: true }>['reason'], string> = {
  'not-connected': 'The waitlist is not connected yet. Set waitlist.endpoint in src/site.config.ts.',
  rejected: "The waitlist didn't accept that address. Check it and try again.",
  network: "Couldn't reach the waitlist. Check your connection and try again.",
  timeout: "We didn't receive confirmation in time. Please check your connection and try again.",
}

export function WaitlistForm({ placement }: { placement: string }) {
  const [email, setEmail] = useState('')
  const [trap, setTrap] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [problem, setProblem] = useState('')
  const [joined, setJoined] = useState('')
  const [answer, setAnswer] = useState('')
  const input = useRef<HTMLInputElement>(null)

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    if (status === 'sending') return
    const value = email.trim()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      setStatus('error')
      setProblem("That doesn't look like an email address. Check it and try again.")
      input.current?.focus()
      return
    }
    // A filled trap field means a bot; answer politely and send nothing.
    if (trap) {
      setStatus('done')
      return
    }
    setStatus('sending')
    const result = await joinWaitlist(value)
    if (result.ok) {
      setJoined(value)
      setStatus('done')
      track('waitlist_signup', { placement })
    } else {
      setStatus('error')
      setProblem(PROBLEM[result.reason])
    }
  }

  if (status === 'done') {
    return (
      <div id="waitlist" role="status">
        <p className="waitlist__done">Successfully submitted. You're on the waitlist; we'll email you when Akyu ships.</p>
        {joined && (
          <div className="plandemo__chips" role="group" aria-label="What would you hand to Akyu first?">
            <span className="small soft">{answer ? 'Thanks, that helps.' : 'What would you hand to Akyu first?'}</span>
            {!answer &&
              FIRST_THINGS.map((thing) => (
                <button
                  key={thing}
                  type="button"
                  className="chip"
                  onClick={() => {
                    setAnswer(thing)
                    track('waitlist_answer', { placement, answer: thing })
                    void joinWaitlist(joined, thing)
                  }}
                >
                  {thing}
                </button>
              ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <form className="waitlist" id="waitlist" onSubmit={onSubmit} noValidate>
      <label className="waitlist__label" htmlFor="waitlist-email">
        Email address
      </label>
      <div className="waitlist__row">
        <input
          ref={input}
          id="waitlist-email"
          className="field"
          type="email"
          name="email"
          autoComplete="email"
          inputMode="email"
          spellCheck={false}
          placeholder="you@example.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value)
            if (status === 'error') setStatus('idle')
          }}
          aria-invalid={status === 'error'}
          aria-describedby="waitlist-problem"
        />
        <button className="btn" type="submit" disabled={status === 'sending'}>
          <span className="btn__face">{status === 'sending' ? 'Joining…' : 'Join the waitlist'}</span>
        </button>
      </div>
      <div className="waitlist__trap" aria-hidden="true">
        <label>
          Leave this empty
          <input type="text" name="company" tabIndex={-1} autoComplete="off" value={trap} onChange={(e) => setTrap(e.target.value)} />
        </label>
      </div>
      <p className="waitlist__problem small" id="waitlist-problem" role="alert">
        {status === 'error' ? problem : ''}
      </p>
    </form>
  )
}
