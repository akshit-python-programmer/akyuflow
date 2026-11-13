import { useEffect, useMemo, useState, type CSSProperties } from 'react'
import { GRID_H, GRID_W, pixels, type Mood, type ToneName } from './sprite'
import './ghost.css'

interface GhostSpriteProps {
  /** CSS pixels per sprite pixel. Leave out to size the ghost from CSS instead. */
  unit?: number
  /** How full the ghost is, 0 to 1. */
  level?: number
  tone?: ToneName
  mood?: Mood
  /** Two-frame float, like an idle sprite. */
  bob?: boolean
  className?: string
  /** Give the ghost an accessible name; without one it is decorative. */
  label?: string
}

/** Merges each row's same-coloured neighbours into one rectangle per run. */
function buildPaths(level: number, tone: ToneName, mood: Mood): Array<[string, string]> {
  const rows = new Map<number, Map<number, string>>()
  for (const [x, y, color] of pixels(level, tone, mood)) {
    if (!rows.has(y)) rows.set(y, new Map())
    rows.get(y)!.set(x, color)
  }
  const byColor = new Map<string, string>()
  for (const [y, row] of rows) {
    let x = 0
    while (x < GRID_W) {
      const color = row.get(x)
      if (!color) {
        x++
        continue
      }
      let run = 1
      while (row.get(x + run) === color) run++
      byColor.set(color, `${byColor.get(color) ?? ''}M${x} ${y}h${run}v1h-${run}z`)
      x += run
    }
  }
  return [...byColor]
}

export function GhostSprite({
  unit,
  level = 1,
  tone = 'mint',
  mood = 'idle',
  bob = false,
  className = '',
  label,
}: GhostSpriteProps) {
  const paths = useMemo(() => buildPaths(level, tone, mood), [level, tone, mood])
  const style = unit ? ({ '--gpx': `${unit}px` } as CSSProperties) : undefined
  return (
    <svg
      className={`ghost ${bob ? 'ghost--bob' : ''} ${className}`}
      viewBox={`0 0 ${GRID_W} ${GRID_H}`}
      width={unit ? GRID_W * unit : undefined}
      height={unit ? GRID_H * unit : undefined}
      shapeRendering="crispEdges"
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      focusable="false"
      style={style}
    >
      {paths.map(([color, d]) => (
        <path key={color} d={d} fill={color} />
      ))}
    </svg>
  )
}

/** Returns `mood`, swapped for a blink every few seconds. */
export function useBlink(mood: Mood, enabled = true): Mood {
  const [blinking, setBlinking] = useState(false)
  useEffect(() => {
    if (!enabled) return
    let timer = 0
    const schedule = () => {
      timer = window.setTimeout(() => {
        setBlinking(true)
        timer = window.setTimeout(() => {
          setBlinking(false)
          schedule()
        }, 150)
      }, 2600 + Math.random() * 3200)
    }
    schedule()
    return () => window.clearTimeout(timer)
  }, [enabled])
  return blinking && mood === 'idle' ? 'blink' : mood
}
