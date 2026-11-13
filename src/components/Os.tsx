import './Os.css'

/** The title bar of a drawn desktop window: icon, name, and the three window buttons. */
export function OsBar({ title }: { title: string }) {
  return (
    <div className="osbar" aria-hidden="true">
      <span className="osbar__icon" />
      {title}
      <span className="osbar__ctl" />
    </div>
  )
}

/** A drawn taskbar to close off a mock desktop: app squares, a signal icon and the clock. */
export function OsTask({ time = '2:14 PM' }: { time?: string }) {
  return (
    <div className="ostask" aria-hidden="true">
      <i />
      <i />
      <i />
      <i />
      <span className="ostask__wifi" />
      <span className="ostask__clock pixel">{time}</span>
    </div>
  )
}
