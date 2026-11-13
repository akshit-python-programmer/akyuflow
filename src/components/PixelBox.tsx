import type { CSSProperties, ReactNode } from 'react'

interface PixelBoxProps {
  children: ReactNode
  className?: string
  /** Adds the offset block of colour behind the box. */
  shadow?: boolean
  style?: CSSProperties
}

/** A box outlined in ink with stepped pixel corners. Styles live in base.css. */
export function PixelBox({ children, className = '', shadow = false, style }: PixelBoxProps) {
  return (
    <div className={`pxbox ${shadow ? 'pxbox--shadow' : ''} ${className}`} style={style}>
      <div className="pxbox__frame notch">
        <div className="pxbox__in">{children}</div>
      </div>
    </div>
  )
}
