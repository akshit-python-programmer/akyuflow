import { capabilities, type Capability } from '../site.config'
import './DemoTag.css'

export const LAUNCH_LABEL = 'At launch'
export const LATER_LABEL = 'Coming after launch'

export function isLaunch(capability: Capability): boolean {
  return capabilities[capability] === 'launch'
}

/** "At launch" or "Coming after launch", read from `capabilities` in site.config.ts. */
export function CapTag({ capability, className = '' }: { capability: Capability; className?: string }) {
  const launch = isLaunch(capability)
  return (
    <span className={`captag pixel ${className}`} data-when={launch ? 'launch' : 'later'}>
      {launch ? LAUNCH_LABEL : LATER_LABEL}
    </span>
  )
}

/** The tag plus the line every scripted demo carries. */
export function DemoTag({ capability }: { capability: Capability }) {
  return (
    <p className="demotag">
      <CapTag capability={capability} />
      <span className="small soft">Scripted demo. Akyu is not released yet.</span>
    </p>
  )
}
