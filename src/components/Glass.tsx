import { useId, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { canRefract, lensMap } from '../lib/glass'
import './Glass.css'

interface GlassProps {
  children: ReactNode
  className?: string
  /** Corner radius in CSS pixels. Keep it in step with --glass-radius if you restyle. */
  radius?: number
  /** How far in from the edge the bending reaches, in CSS pixels. */
  bezel?: number
  /** How hard the rim bends the backdrop. */
  strength?: number
}

interface Lens {
  url: string
  width: number
  height: number
}

/** A frosted panel that refracts what is behind it along its rim. */
export function Glass({ children, className = '', radius = 22, bezel = 16, strength = 44 }: GlassProps) {
  const ref = useRef<HTMLDivElement>(null)
  const filterId = `lens-${useId().replace(/[^a-zA-Z0-9]/g, '')}`
  const [lens, setLens] = useState<Lens | null>(null)

  useLayoutEffect(() => {
    const el = ref.current
    if (!el || !canRefract) return
    const measure = () => {
      const width = Math.round(el.offsetWidth)
      const height = Math.round(el.offsetHeight)
      if (width < 8 || height < 8) return
      const r = Math.min(radius, height / 2)
      const url = lensMap(width, height, r, Math.min(bezel, height / 2))
      if (url) setLens((prev) => (prev && prev.url === url ? prev : { url, width, height }))
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(el)
    return () => observer.disconnect()
  }, [radius, bezel])

  const style: CSSProperties | undefined = lens
    ? { backdropFilter: `url(#${filterId}) saturate(1.5)`, borderRadius: radius }
    : { borderRadius: radius }

  return (
    <div ref={ref} className={`glass ${className}`} style={style}>
      {lens && (
        <svg className="glass__defs" aria-hidden="true" focusable="false" width="0" height="0">
          <filter id={filterId} x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
            <feImage
              href={lens.url}
              x="0"
              y="0"
              width={lens.width}
              height={lens.height}
              preserveAspectRatio="none"
              result="lens"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="lens"
              scale={strength}
              xChannelSelector="R"
              yChannelSelector="G"
              result="bent"
            />
            <feGaussianBlur in="bent" stdDeviation="5" />
          </filter>
        </svg>
      )}
      {children}
    </div>
  )
}
