import { Component, Suspense, lazy, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { ghostLook, setOnStage, useVisit } from '../lib/visit'
import { GhostSprite, useBlink } from './GhostSprite'
import './HeroGhost.css'

const Ghost3D = lazy(() => import('./Ghost3D'))

/** The stage is 21 sprite pixels wide: the 17-pixel ghost plus room to turn. */
const STAGE_UNITS = 21

function webglAvailable(): boolean {
  try {
    const canvas = document.createElement('canvas')
    return Boolean(canvas.getContext('webgl2') || canvas.getContext('webgl'))
  } catch {
    return false
  }
}

/** If the 3D ghost fails for any reason, the flat sprite simply stays. */
class Quiet extends Component<{ onError: () => void; children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  componentDidCatch() {
    this.props.onError()
  }
  render() {
    return this.state.failed ? null : this.props.children
  }
}

/**
 * The big ghost in the hero. It is the same timer as the small one in the
 * corner: its fill level is the time left on this page.
 */
export function HeroGhost() {
  const visit = useVisit()
  const { level, tone } = ghostLook(visit)
  const stage = useRef<HTMLDivElement>(null)
  const [unit, setUnit] = useState(0)
  const [inView, setInView] = useState(true)
  const [use3d, setUse3d] = useState(false)
  const [ready, setReady] = useState(false)
  const [spins, setSpins] = useState(0)
  const [cheering, setCheering] = useState(false)
  const mood = useBlink(cheering ? 'happy' : visit.phase === 'break' ? 'rest' : 'idle')

  useLayoutEffect(() => {
    const el = stage.current
    if (!el) return
    const measure = () => setUnit(el.clientWidth / STAGE_UNITS)
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const el = stage.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting)
        setOnStage('hero', entry.isIntersecting)
      },
      { threshold: 0.4 },
    )
    observer.observe(el)
    return () => {
      observer.disconnect()
      setOnStage('hero', false)
    }
  }, [])

  // Bring in the 3D ghost only where it adds something and costs nothing.
  useEffect(() => {
    const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } })
      .connection
    // The 3D ghost costs about 250 kB of three.js. Skip it for anyone saving data or on a slow link.
    const frugal = connection?.saveData || /(^|-)2g$|^3g$/.test(connection?.effectiveType ?? '')
    if (calm || frugal || !webglAvailable()) return
    const timer = window.setTimeout(() => setUse3d(true), 300)
    return () => window.clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (!cheering) return
    const timer = window.setTimeout(() => setCheering(false), 1300)
    return () => window.clearTimeout(timer)
  }, [cheering, spins])

  function spin() {
    setSpins((n) => n + 1)
    setCheering(true)
  }

  const live = use3d && ready

  return (
    <div className="heroghost" onClick={spin}>
      <div className="heroghost__stage" ref={stage}>
        {/* Stays in place, invisible, once the 3D ghost has drawn its first frame. */}
        <GhostSprite
          className={live ? 'heroghost__flat heroghost__flat--hidden' : 'heroghost__flat'}
          level={level}
          tone={tone}
          mood={mood}
          bob={!use3d}
        />
        {use3d && unit > 0 && (
          <div className="heroghost__3d">
            <Quiet
              onError={() => {
                setUse3d(false)
                setReady(false)
              }}
            >
              <Suspense fallback={null}>
                <Ghost3D
                  unit={unit}
                  level={level}
                  tone={tone}
                  mood={mood}
                  active={inView}
                  spins={spins}
                  onReady={() => setReady(true)}
                />
              </Suspense>
            </Quiet>
          </div>
        )}
      </div>
      <div className={`heroghost__shadow notch ${live ? 'heroghost__shadow--live' : ''}`} />
    </div>
  )
}
