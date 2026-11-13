import { useMemo } from 'react'

interface PixelArtProps {
  /** One string per row; each character is a key into `colors`. Unknown characters stay empty. */
  rows: readonly string[]
  colors: Record<string, string>
  /** CSS pixels per art pixel. Leave out to size it from CSS. */
  unit?: number
  className?: string
}

/** Draws a small hand-typed bitmap as crisp SVG. Decorative: hidden from assistive tech. */
export function PixelArt({ rows, colors, unit, className = '' }: PixelArtProps) {
  const width = Math.max(...rows.map((row) => row.length))
  const height = rows.length

  const paths = useMemo(() => {
    const byColor = new Map<string, string>()
    rows.forEach((row, y) => {
      let x = 0
      while (x < row.length) {
        const color = colors[row[x]]
        if (!color) {
          x++
          continue
        }
        let run = 1
        while (colors[row[x + run]] === color) run++
        byColor.set(color, `${byColor.get(color) ?? ''}M${x} ${y}h${run}v1h-${run}z`)
        x += run
      }
    })
    return [...byColor]
  }, [rows, colors])

  return (
    <svg
      className={className}
      viewBox={`0 0 ${width} ${height}`}
      width={unit ? width * unit : undefined}
      height={unit ? height * unit : undefined}
      shapeRendering="crispEdges"
      aria-hidden="true"
      focusable="false"
    >
      {paths.map(([color, d]) => (
        <path key={color} d={d} fill={color} />
      ))}
    </svg>
  )
}
