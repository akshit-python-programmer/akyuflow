import { useId, useState } from 'react'
import { INK } from '../ghost/sprite'
import { copy } from '../lib/copy'
import { PixelArt } from './PixelArt'
import { PixelBox } from './PixelBox'
import './Privacy.css'

/*
  Privacy statements on this page, in two parts.
    Always on:        Akyu reads the active app's name and its window title.
                      That activity log is stored only on the PC.
    Only when asked:  Akyu reads the window in front and sends its text to a
                      cloud AI service to write the answer.
  Also stated, as confirmed earlier by Akyu's maker: plan text goes to a cloud
  AI service, and account and licence checks contact a server.
  Keep this in step with the FAQ. Do not add claims that are merely likely.
  The dev-mode checklist asks the owner to confirm all of it (site.privacyConfirmed).

  The section is compact: the promise and the two kinds of looking in one card,
  with the full detail one click away.
*/

const EXAMPLE_LOG = [
  ['2:02 pm', 'Writer', 'Q3 report.docx'],
  ['2:31 pm', 'Browser', 'Videos: ten hours of rain sounds'],
  ['2:33 pm', 'Writer', 'Q3 report.docx'],
] as const

const LOCK_ROWS = [
  '...#####...',
  '..##...##..',
  '..#.....#..',
  '..#.....#..',
  '###########',
  '#ooooooooo#',
  '#oooo#oooo#',
  '#oooo#oooo#',
  '#ooooooooo#',
  '###########',
]
const LOCK_COLORS = { '#': INK, o: '#5fe3c0' }

export function Privacy() {
  const [open, setOpen] = useState(false)
  const detailId = useId()
  const c = copy()

  return (
    <section className="section privacy" id="privacy" data-recap="Privacy">
      <div className="wrap">
        <div className="privacy__card">
          <span className="privacy__lock" aria-hidden="true">
            <PixelArt rows={LOCK_ROWS} colors={LOCK_COLORS} />
          </span>
          <div className="privacy__head">
            <p className="privacy__kicker pixel">Privacy</p>
            <h2>
              <mark className="privacy__mark">Akyu reads your screen only when you ask.</mark>
            </h2>
            <ul className="privacy__brief">
              <li>
                <strong className="pixel">Always on</strong>
                App name and window title only. Stored on your PC.
              </li>
              <li>
                <strong className="pixel privacy__ask">Only when you ask</strong>
                The window in front, sent to a cloud AI to write the answer.
              </li>
            </ul>
            <button
              type="button"
              className="privacy__toggle"
              aria-expanded={open}
              aria-controls={detailId}
              onClick={() => setOpen((o) => !o)}
            >
              {open ? 'Hide the details' : 'See exactly what it reads'}
              <span className="privacy__chev" aria-hidden="true" />
            </button>
          </div>
        </div>

        <div className="privacy__grid" id={detailId} hidden={!open}>
          <div className="privacy__part">
            <p className="privacy__kind pixel">Always on</p>
            <h3>App name and window title. Stored only on your PC.</h3>
            <p>{c.privacy.always}</p>
            <PixelBox className="privacy__pc">
              <div className="privacy__pc-in">
                <p className="privacy__where pixel">Stays on your PC</p>
                <table className="privacy__log">
                  <caption className="sr-only">An example of what the activity log holds</caption>
                  <thead>
                    <tr>
                      <th scope="col">Time</th>
                      <th scope="col">App</th>
                      <th scope="col">Window title</th>
                    </tr>
                  </thead>
                  <tbody>
                    {EXAMPLE_LOG.map(([time, app, title]) => (
                      <tr key={time}>
                        <td className="pixel">{time}</td>
                        <td className="pixel">{app}</td>
                        <td className="pixel">{title}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p className="small soft">An example of the log. App name and window title: that is all it holds.</p>
              </div>
            </PixelBox>
          </div>

          <div className="privacy__part">
            <p className="privacy__kind privacy__kind--ask pixel">Only when you ask</p>
            <h3>The window in front, read when you ask for help.</h3>
            <p>
              When you ask Akyu for help, it reads the window in front and sends its text to a cloud AI service, which
              writes the answer.
            </p>
            <div className="privacy__out">
              <p className="privacy__where pixel">Leaves your PC</p>
              <ul>
                <li>
                  <strong>The window's text, when you ask.</strong> Sent to a cloud AI service to write the answer.
                </li>
                <li>
                  <strong>Your plan.</strong> What you tell Akyu about your day goes to a cloud AI service, which builds
                  the plan.
                </li>
                <li>
                  <strong>Account and licence checks.</strong> Akyu contacts a server to check your account and licence.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
