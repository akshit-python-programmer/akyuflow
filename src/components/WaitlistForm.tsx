import { useRef, useState, type FormEvent } from 'react'
import { joinWaitlist, type WaitlistResult } from '../lib/waitlist'
import { track } from '../lib/track'
import './WaitlistForm.css'

type Status = 'idle' | 'sending' | 'done' | 'error'

const PROBLEM: Record<Exclude<WaitlistResult, { ok: true }>['reason'], string> = {
  'not-connected': 'The waitlist is not connected yet. Set waitlist.endpoint in src/site.config.ts.',
  rejected: "The waitlist didn't accept that address. Check it and try again.",
  network: "Couldn't reach the waitlist. Check your connection and try again.",
}

export function WaitlistForm({ placement }: { placement: string }) {
  const [email, setEmail] = useState('')
  const [trap, setTrap] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [problem, setProblem] = useState('')
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
      setStatus('done')
      track('waitlist_signup', { placement })
    } else {
      setStatus('error')
      setProblem(PROBLEM[result.reason])
    }
  }

  if (status === 'done') {
    return (
      <p className="waitlist__done" id="waitlist" role="status">
        You're on the waitlist. We'll email you when Akyu ships.
      </p>
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
