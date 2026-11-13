/**
 * Liquid-glass refraction for the nudge panel.
 *
 * The panel bends whatever is behind it, live, with an SVG displacement map
 * used as a backdrop-filter. The map is a picture of a lens: neutral grey in
 * the flat middle, and along the rounded rim each pixel encodes "sample the
 * backdrop from a little further in", which is what a thick glass edge does.
 *
 * Only Chromium-based browsers (Chrome, Edge, Opera, Brave) accept an SVG
 * filter as a backdrop-filter. Everywhere else the panel keeps the plain
 * frosted blur set in CSS, which is why this is an enhancement and not a
 * requirement.
 */

export const canRefract: boolean = (() => {
  if (typeof navigator === 'undefined' || typeof document === 'undefined') return false
  const ua = navigator.userAgent
  return /Chrom(e|ium)\//.test(ua) && !/Firefox\//.test(ua)
})()

const cache = new Map<string, string>()

/**
 * Builds the displacement map for a rounded rectangle and returns it as a data URL.
 * Red carries the horizontal shift, green the vertical one; 128 means "no shift".
 */
export function lensMap(width: number, height: number, radius: number, bezel: number): string {
  const key = `${width}x${height}r${radius}b${bezel}`
  const hit = cache.get(key)
  if (hit) return hit

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) return ''

  const image = ctx.createImageData(width, height)
  const r = Math.min(radius, width / 2, height / 2)
  const halfX = width / 2 - r
  const halfY = height / 2 - r

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const px = x + 0.5 - width / 2
      const py = y + 0.5 - height / 2
      const qx = Math.abs(px) - halfX
      const qy = Math.abs(py) - halfY
      const ox = Math.max(qx, 0)
      const oy = Math.max(qy, 0)
      const outside = Math.hypot(ox, oy)
      // Signed distance to the rounded rectangle's edge; positive depth = inside.
      const depth = -(outside + Math.min(Math.max(qx, qy), 0) - r)

      let dx = 0
      let dy = 0
      if (depth >= 0 && depth < bezel) {
        let nx = 0
        let ny = 0
        if (qx > 0 && qy > 0 && outside > 0) {
          nx = (ox / outside) * Math.sign(px)
          ny = (oy / outside) * Math.sign(py)
        } else if (qx > qy) {
          nx = Math.sign(px)
        } else {
          ny = Math.sign(py)
        }
        // Steep right at the rim, flat by the time the bezel ends.
        const t = 1 - depth / bezel
        const bend = t * t
        dx = -nx * bend
        dy = -ny * bend
      }

      const i = (y * width + x) * 4
      image.data[i] = Math.round(128 + dx * 127)
      image.data[i + 1] = Math.round(128 + dy * 127)
      image.data[i + 2] = 128
      image.data[i + 3] = 255
    }
  }

  ctx.putImageData(image, 0, 0)
  const url = canvas.toDataURL('image/png')
  cache.set(key, url)
  return url
}
