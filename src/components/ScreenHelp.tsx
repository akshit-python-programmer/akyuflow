import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from 'react'
import { GhostSprite } from '../ghost/GhostSprite'
import type { Mood } from '../ghost/sprite'
import {
  calm,
  demoAction,
  demoCompleted,
  demoStarted,
  useDemoRequest,
  useTimers,
  type DemoId,
  type Target,
} from '../lib/akyu'
import type { Capability } from '../site.config'
import { CapTag, DemoTag } from './DemoTag'
import { PixelBox } from './PixelBox'
import './ScreenHelp.css'

/*
  Everything in this section is scripted: the "drafts", the corrections and
  the explanation are fixed text typed out in the browser. No AI service or
  network call is involved. The made-up people and companies are fictional.
*/

type TabId = 'reply' | 'fix' | 'explain'

const TABS: ReadonlyArray<{ id: TabId; label: string; capability: Capability; window: string }> = [
  { id: 'reply', label: 'Reply to an email', capability: 'emailReply', window: 'Mail' },
  { id: 'fix', label: 'Fix my message', capability: 'fixMessage', window: 'Team chat' },
  { id: 'explain', label: 'Explain this', capability: 'explainThis', window: 'Setup' },
]

const LOOK_MS = 1500

/** Reveals `text` a few characters at a time while `running`; all at once with reduced motion. */
function useTyped(text: string, running: boolean, onDone?: () => void, cps = 90, run = 0) {
  const [count, setCount] = useState(0)
  const done = useRef(onDone)
  done.current = onDone
  useEffect(() => {
    if (!running) {
      setCount(0)
      return
    }
    if (calm()) {
      setCount(text.length)
      done.current?.()
      return
    }
    setCount(0)
    let n = 0
    const step = Math.max(1, Math.round(cps / 30))
    const id = window.setInterval(() => {
      n = Math.min(text.length, n + step)
      setCount(n)
      if (n >= text.length) {
        window.clearInterval(id)
        done.current?.()
      }
    }, 1000 / 30)
    return () => window.clearInterval(id)
  }, [text, running, cps, run])
  return text.slice(0, count)
}

/** The "Akyu is looking" indicator and the scan that passes over the window. */
function Looking({ on }: { on: boolean }) {
  if (!on) return null
  return (
    <>
      <span className="scan" aria-hidden="true" />
      <span className="looking pixel">
        <span className="looking__dot" aria-hidden="true" />
        Akyu is looking at this window
      </span>
    </>
  )
}

function Say({ mood = 'idle', children }: { mood?: Mood; children: ReactNode }) {
  return (
    <div className="ask__say">
      <GhostSprite unit={3} level={0.6} mood={mood} />
      <div className="ask__bubble">{children}</div>
    </div>
  )
}

type Step = 'idle' | 'looking' | 'writing' | 'ready'

/** Runs a look, then hands over to the result. Reports start and finish. */
function useAsk(demo: DemoId) {
  const timers = useTimers()
  const [step, setStep] = useState<Step>('idle')
  const [runs, setRuns] = useState(0)
  return {
    step,
    setStep,
    /** Goes up on every ask, so typing restarts even when the text is the same. */
    runs,
    start(via: 'page' | 'ghost' = 'page') {
      timers.clear()
      setRuns((n) => n + 1)
      demoStarted(demo, via)
      if (calm()) {
        setStep('writing')
        return
      }
      setStep('looking')
      timers.after(LOOK_MS, () => setStep('writing'))
    },
    reset() {
      timers.clear()
      setStep('idle')
    },
  }
}

/* ---------- 1. Reply to an email ---------- */

const DRAFTS = {
  normal:
    "Hi Dana,\n\nNext Tuesday works for us. I'll move the deck review to Tuesday and let the team know.\n\nThanks for the heads-up,\nSam",
  shorter: 'Hi Dana, Tuesday works. I’ll move the review. Thanks, Sam',
  formal:
    'Dear Dana,\n\nThank you for letting us know. Moving the deadline to next Tuesday is no problem on our side, and I have updated our schedule accordingly.\n\nKind regards,\nSam',
} as const

type Tone = keyof typeof DRAFTS

function ReplyDemo({ register }: { register: (start: (via: 'ghost') => void) => void }) {
  const ask = useAsk('reply')
  const [tone, setTone] = useState<Tone>('normal')
  const [inserting, setInserting] = useState(false)
  const [inserted, setInserted] = useState(false)
  const [sent, setSent] = useState(false)
  const reported = useRef(false)
  const sendRef = useRef<HTMLButtonElement>(null)

  register((via) => begin(via))

  function begin(via: 'page' | 'ghost' = 'page') {
    setTone('normal')
    setInserting(false)
    setInserted(false)
    setSent(false)
    reported.current = false
    ask.start(via)
  }

  const draft = useTyped(
    DRAFTS[tone],
    ask.step === 'writing' || ask.step === 'ready',
    () => ask.setStep('ready'),
    90,
    ask.runs,
  )
  const typedIn = useTyped(DRAFTS[tone], inserting, () => {
    setInserting(false)
    setInserted(true)
    if (!reported.current) {
      reported.current = true
      demoCompleted('reply', 'Draft is in. Sending is your call.')
    }
    sendRef.current?.focus()
  }, 140)

  const reply = inserted ? DRAFTS[tone] : inserting ? typedIn : ''

  return (
    <div className="ask__grid">
      <div className="screen" data-looking={ask.step === 'looking' ? '' : undefined}>
        <Looking on={ask.step === 'looking'} />
        <div className="mail">
          <p className="mail__meta small">
            <strong>Dana Okafor</strong> <span className="soft">· Juniper Studio · 9:52 am</span>
          </p>
          <p className="mail__subject">Can we move Thursday’s deadline?</p>
          <div className="mail__body small">
            <p>Hi Sam,</p>
            <p>
              Our director wants to add a section to the brand deck. Could we push the deadline from Thursday to next
              Tuesday? Let me know if that causes problems on your side.
            </p>
            <p>Thanks, Dana</p>
          </div>
          <label className="mail__label small" htmlFor="reply-box">
            Reply
          </label>
          <textarea
            id="reply-box"
            className="mail__reply field"
            rows={5}
            value={reply}
            readOnly
            data-typing={inserting ? '' : undefined}
            placeholder="Your reply"
          />
          <div className="mail__send">
            <button
              ref={sendRef}
              type="button"
              className="chip mail__sendbtn"
              data-ready={inserted && !sent ? '' : undefined}
              onClick={() => {
                if (!inserted) return
                setSent(true)
                demoAction('reply', 'send')
              }}
              aria-disabled={!inserted}
            >
              Send
            </button>
            <span className="small soft" role="status">
              {sent
                ? 'You pressed Send. In this demo nothing goes anywhere. In Akyu, this click is always yours.'
                : inserted
                  ? 'Akyu stops here. Send is your click.'
                  : ''}
            </span>
          </div>
        </div>
      </div>

      <div className="ask__side">
        {ask.step === 'idle' ? (
          <>
            <Say>
              <p className="pixel">Need a reply to this? Ask, and I'll read the email and draft one.</p>
            </Say>
            <button type="button" className="btn" onClick={() => begin()}>
              <span className="btn__face">Ask Akyu to reply</span>
            </button>
          </>
        ) : ask.step === 'looking' ? (
          <Say mood="right">
            <p className="pixel">Reading the email...</p>
          </Say>
        ) : (
          <>
            <Say mood={ask.step === 'ready' ? 'happy' : 'idle'}>
              <p className="pixel ask__label">Draft reply</p>
              <p className="ask__draft" aria-live="off">
                {draft}
                {ask.step === 'writing' && <span className="caret" aria-hidden="true" />}
              </p>
            </Say>
            {ask.step === 'ready' && (
              <>
                <p className="sr-only" role="status">
                  Draft ready.
                </p>
                <div className="ask__actions" role="group" aria-label="Change the draft">
                  <button
                    type="button"
                    className="chip"
                    aria-pressed={tone === 'shorter'}
                    disabled={inserting}
                    onClick={() => {
                      setInserted(false)
                      setTone(tone === 'shorter' ? 'normal' : 'shorter')
                      ask.setStep('writing')
                      demoAction('reply', 'shorter')
                    }}
                  >
                    Shorter
                  </button>
                  <button
                    type="button"
                    className="chip"
                    aria-pressed={tone === 'formal'}
                    disabled={inserting}
                    onClick={() => {
                      setInserted(false)
                      setTone(tone === 'formal' ? 'normal' : 'formal')
                      ask.setStep('writing')
                      demoAction('reply', 'formal')
                    }}
                  >
                    More formal
                  </button>
                  <button
                    type="button"
                    className="chip chip--go"
                    disabled={inserting}
                    onClick={() => {
                      setInserted(false)
                      setSent(false)
                      setInserting(true)
                      demoAction('reply', 'insert')
                    }}
                  >
                    Insert
                  </button>
                </div>
              </>
            )}
            {inserting && (
              <p className="pixel ask__note" role="status">
                Typing it into your reply box...
              </p>
            )}
          </>
        )}
      </div>
    </div>
  )
}

/* ---------- 2. Fix my message ---------- */

const ROUGH = 'hey can u send me teh latest numbrs before the meting tmrw?? i need them for the slids'

/** The corrected message, word by word. `true` marks what Akyu changed. */
const FIXED: ReadonlyArray<readonly [string, boolean]> = [
  ['Hey,', true],
  [' can ', false],
  ['you', true],
  [' send me ', false],
  ['the', true],
  [' latest ', false],
  ['numbers', true],
  [' before the ', false],
  ['meeting tomorrow?', true],
  [' ', false],
  ['I', true],
  [' need them for the ', false],
  ['slides.', true],
]

const FIXED_TEXT = FIXED.map(([t]) => t).join('')
const CHANGES = FIXED.filter(([, c]) => c).length

function FixDemo({ register }: { register: (start: (via: 'ghost') => void) => void }) {
  const ask = useAsk('fix')
  const [used, setUsed] = useState(false)
  const reported = useRef(false)

  register((via) => begin(via))

  function begin(via: 'page' | 'ghost' = 'page') {
    setUsed(false)
    reported.current = false
    ask.start(via)
  }

  useEffect(() => {
    if (ask.step !== 'writing') return
    ask.setStep('ready')
    if (!reported.current) {
      reported.current = true
      demoCompleted('fix', 'Fixed. Your words, minus the typos.')
    }
  }, [ask.step]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="ask__grid">
      <div className="screen" data-looking={ask.step === 'looking' ? '' : undefined}>
        <Looking on={ask.step === 'looking'} />
        <div className="chat">
          <p className="chat__msg small">
            <strong>Lee</strong> <span className="soft">10:14 am</span>
            <br />
            Morning! Are we still on for the 11 o’clock?
          </p>
          <label className="chat__label small" htmlFor="chat-box">
            Your message
          </label>
          <textarea
            id="chat-box"
            className="field chat__box"
            rows={3}
            readOnly
            value={used ? FIXED_TEXT : ROUGH}
          />
          <p className="small soft">{used ? 'Fixed text is in. Press Enter yourself when you are ready.' : ''}</p>
        </div>
      </div>

      <div className="ask__side">
        {ask.step === 'idle' ? (
          <>
            <Say>
              <p className="pixel">Typed that in a rush? I can tidy it up and keep your meaning.</p>
            </Say>
            <button type="button" className="btn" onClick={() => begin()}>
              <span className="btn__face">Fix my message</span>
            </button>
          </>
        ) : ask.step === 'looking' ? (
          <Say mood="right">
            <p className="pixel">Reading your message...</p>
          </Say>
        ) : (
          <>
            <Say mood="happy">
              <p className="pixel ask__label">
                Fixed · {CHANGES} changes, highlighted
              </p>
              <p className="ask__draft fixed" role="status">
                {FIXED.map(([text, changed], i) =>
                  changed ? (
                    <mark key={i}>
                      {text}
                      <span className="sr-only"> (changed)</span>
                    </mark>
                  ) : (
                    <span key={i}>{text}</span>
                  ),
                )}
              </p>
            </Say>
            <div className="ask__actions">
              <button
                type="button"
                className="chip chip--go"
                disabled={used}
                onClick={() => {
                  setUsed(true)
                  demoAction('fix', 'use')
                }}
              >
                {used ? 'Used' : 'Use this'}
              </button>
              <button type="button" className="chip" onClick={() => ask.reset()}>
                Keep mine
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

/* ---------- 3. Explain this ---------- */

function ExplainDemo({ register }: { register: (start: (via: 'ghost') => void) => void }) {
  const ask = useAsk('explain')
  const reported = useRef(false)

  register((via) => begin(via))

  function begin(via: 'page' | 'ghost' = 'page') {
    reported.current = false
    ask.start(via)
  }

  useEffect(() => {
    if (ask.step !== 'writing') return
    ask.setStep('ready')
    if (!reported.current) {
      reported.current = true
      demoCompleted('explain', 'Explained. One step to try.')
    }
  }, [ask.step]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="ask__grid">
      <div className="screen" data-looking={ask.step === 'looking' ? '' : undefined}>
        <Looking on={ask.step === 'looking'} />
        <div className="dialog" role="group" aria-label="Example error dialog">
          <p className="dialog__title">
            <span className="dialog__icon" aria-hidden="true">
              !
            </span>
            Setup could not finish
          </p>
          <p className="small">
            Error 0x80070005: Access is denied. The installer could not write to C:\Program Files\NoteBox.
          </p>
          <div className="dialog__btns" aria-hidden="true">
            <span className="chip">Retry</span>
            <span className="chip">Cancel</span>
          </div>
        </div>
      </div>

      <div className="ask__side">
        {ask.step === 'idle' ? (
          <>
            <Say>
              <p className="pixel">Error messages are written for computers. Want it in plain words?</p>
            </Say>
            <button type="button" className="btn" onClick={() => begin()}>
              <span className="btn__face">Explain this</span>
            </button>
          </>
        ) : ask.step === 'looking' ? (
          <Say mood="right">
            <p className="pixel">Reading the error...</p>
          </Say>
        ) : (
          <Say mood="happy">
            <div role="status">
              <p className="ask__draft">
                The installer wasn’t allowed to put files in a protected folder. Windows blocks that unless the
                installer runs with administrator rights.
              </p>
              <p className="ask__next">
                <strong>Next step:</strong> close this, right-click the installer and choose “Run as administrator”.
              </p>
            </div>
          </Say>
        )}
      </div>
    </div>
  )
}

/* ---------- the section ---------- */

const PROMISES = [
  ['Only when you ask.', 'Akyu reads the window in front only when you ask it for help.'],
  ['You can see it looking.', 'While it reads, Akyu says so on screen.'],
  ['Nothing goes without your OK.', 'Akyu never sends or submits anything for you. The last click is yours.'],
] as const

export function ScreenHelp() {
  const [tab, setTab] = useState<TabId>('reply')
  const starters = useRef<Partial<Record<TabId, (via: 'ghost') => void>>>({})
  const pending = useRef<TabId | null>(null)
  const tabRefs = useRef<Record<TabId, HTMLButtonElement | null>>({ reply: null, fix: null, explain: null })

  useDemoRequest(['reply', 'fix', 'explain'], (request) => {
    const id = request.target as Exclude<Target, 'plan' | 'lost'>
    setTab(id)
    if (request.start) pending.current = id
  })

  // A start requested by the ghost runs once its tab is showing.
  useEffect(() => {
    if (pending.current !== tab) return
    pending.current = null
    starters.current[tab]?.('ghost')
  })

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const i = TABS.findIndex((t) => t.id === tab)
    let next = i
    if (event.key === 'ArrowRight') next = (i + 1) % TABS.length
    else if (event.key === 'ArrowLeft') next = (i - 1 + TABS.length) % TABS.length
    else if (event.key === 'Home') next = 0
    else if (event.key === 'End') next = TABS.length - 1
    else return
    event.preventDefault()
    setTab(TABS[next].id)
    tabRefs.current[TABS[next].id]?.focus()
  }

  const current = TABS.find((t) => t.id === tab)!
  const register = (id: TabId) => (start: (via: 'ghost') => void) => {
    starters.current[id] = start
  }

  return (
    <section className="section ask" id="screen" data-recap="Ask Akyu">
      <div className="wrap">
        <h2>Talk to Akyu. It reads your screen and helps.</h2>
        <p className="lede ask__lede">
          Press the mic or type. Stuck on an email, a message or an error? Akyu reads the window in front and drafts, fixes or explains.
        </p>

        <ul className="ask__promises">
          {PROMISES.map(([title, body]) => (
            <li key={title}>
              <strong>{title}</strong> {body}
            </li>
          ))}
        </ul>

        <div className="ask__demo" id="screen-demo" tabIndex={-1} aria-label="Screen help demo">
          <div className="ask__tabs" role="tablist" aria-label="What to ask Akyu" onKeyDown={onKeyDown}>
            {TABS.map((t) => (
              <button
                key={t.id}
                ref={(el) => {
                  tabRefs.current[t.id] = el
                }}
                type="button"
                role="tab"
                id={`ask-tab-${t.id}`}
                aria-selected={tab === t.id}
                aria-controls={`ask-panel-${t.id}`}
                tabIndex={tab === t.id ? 0 : -1}
                className="ask__tab"
                onClick={() => setTab(t.id)}
              >
                {t.label}
                <CapTag capability={t.capability} />
              </button>
            ))}
          </div>

          <PixelBox shadow className="ask__frame">
            <div className="ask__window">
              <div className="ask__bar" aria-hidden="true">
                <span className="ask__icon" />
                {current.window}
              </div>
              {TABS.map((t) => (
                <div
                  key={t.id}
                  role="tabpanel"
                  id={`ask-panel-${t.id}`}
                  aria-labelledby={`ask-tab-${t.id}`}
                  hidden={tab !== t.id}
                  className="ask__panel"
                >
                  {t.id === 'reply' && <ReplyDemo register={register('reply')} />}
                  {t.id === 'fix' && <FixDemo register={register('fix')} />}
                  {t.id === 'explain' && <ExplainDemo register={register('explain')} />}
                </div>
              ))}
            </div>
          </PixelBox>
          <div className="ask__meta">
            <DemoTag capability={current.capability} />
          </div>
        </div>
      </div>
    </section>
  )
}
