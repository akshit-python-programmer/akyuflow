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
*/

const EXAMPLE_LOG = [
  ['2:02 pm', 'Writer', 'Q3 report.docx'],
  ['2:31 pm', 'Browser', 'Videos: ten hours of rain sounds'],
  ['2:33 pm', 'Writer', 'Q3 report.docx'],
] as const

export function Privacy() {
  return (
    <section className="section privacy" id="privacy" data-recap="Privacy">
      <div className="wrap">
        <div className="privacy__copy">
          <h2>Akyu keeps time on its own. It reads your screen only when you ask.</h2>
          <p className="lede">Two kinds of looking, kept apart.</p>
        </div>

        <div className="privacy__grid">
          <div className="privacy__part">
            <p className="privacy__kind pixel">Always on</p>
            <h3>App name and window title. Stored only on your PC.</h3>
            <p>
              To notice drift, Akyu reads the name of the app you have in front and the title of its window. It keeps
              them in an activity log that is stored only on your PC.
            </p>
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
