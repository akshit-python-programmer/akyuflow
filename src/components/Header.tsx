import { GhostSprite } from '../ghost/GhostSprite'
import { ReserveLink, WaitlistLink } from './Cta'
import './Header.css'

export function Header() {
  return (
    <header className="header">
      <div className="wrap header__in">
        <a className="header__brand" href="#top" aria-label="Akyu, back to the top">
          <GhostSprite unit={2} level={0.6} />
          <span className="pixel">akyu</span>
          <span className="header__say" aria-hidden="true">
            ack-u
          </span>
        </a>
        <nav className="header__nav" aria-label="Get Akyu">
          <WaitlistLink placement="header" />
          <ReserveLink placement="header" small />
        </nav>
      </div>
    </header>
  )
}
