import { useEffect, useId, useRef, useState } from 'react'
import './Pronounce.css'

/**
 * "akyu · ack-u": how to say the name. A button that opens a small tooltip on
 * hover, focus or tap, and closes on Escape or a tap elsewhere.
 */
export function Pronounce() {
  const id = useId()
  const root = useRef<HTMLSpanElement>(null)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open) return
    const away = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false)
    }
    const key = (event: KeyboardEvent) => event.key === 'Escape' && setOpen(false)
    document.addEventListener('pointerdown', away)
    document.addEventListener('keydown', key)
    return () => {
      document.removeEventListener('pointerdown', away)
      document.removeEventListener('keydown', key)
    }
  }, [open])

  return (
    <span
      className="say"
      ref={root}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        className="say__btn"
        aria-expanded={open}
        aria-describedby={open ? id : undefined}
        onClick={() => setOpen((o) => !o)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
      >
        <span className="say__word pixel">akyu</span>
        <span className="say__sep" aria-hidden="true">
          ·
        </span>
        <span className="say__how pixel">
          <span className="sr-only">pronounced </span>ack-u
        </span>
        <span className="say__q pixel" aria-hidden="true">
          ?
        </span>
      </button>
      <span id={id} role="tooltip" className="say__tip" data-open={open ? '' : undefined}>
        Say it <strong>“ack-u”</strong>, short and soft, like a tiny hiccup from a ghost.
      </span>
    </span>
  )
}
