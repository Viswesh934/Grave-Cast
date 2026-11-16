import { useMemo } from 'react'
import { encode } from 'uqr'

/** The blank margin a QR code needs around it to be read, in modules. */
const QUIET_ZONE = 4

/** A QR code for `value`, drawn as one SVG path: dark squares on a light ground, with a margin so phones can read it. */
export function Qr({ value, label, className = '' }: { value: string; label: string; className?: string }) {
  const { side, path } = useMemo(() => {
    const code = encode(value, { ecc: 'M', border: 0 })
    let d = ''
    code.data.forEach((row, y) =>
      row.forEach((dark, x) => {
        if (dark) d += `M${x + QUIET_ZONE} ${y + QUIET_ZONE}h1v1h-1z`
      }),
    )
    return { side: code.size + QUIET_ZONE * 2, path: d }
  }, [value])

  return (
    <svg viewBox={`0 0 ${side} ${side}`} role="img" aria-label={label} className={className} shapeRendering="crispEdges">
      <rect width={side} height={side} className="fill-grave-bone-100" />
      <path d={path} className="fill-grave-dark-950" />
    </svg>
  )
}