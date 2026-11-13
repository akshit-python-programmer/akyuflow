// Draws the favicon, the home-screen icon and the link-preview image straight
// from the ghost's bitmap, so they can never drift from the sprite on the page.
//
//   npm run icons
//
// Needs Node 23.6 or newer (it imports the TypeScript sprite file directly).
// The results are committed in /public; rerun this only if the ghost changes.

import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { deflateSync } from 'node:zlib'
import { GRID_H, GRID_W, INK, pixels } from '../src/ghost/sprite.ts'

const OUT = join(dirname(fileURLToPath(import.meta.url)), '..', 'public')
const LINE = '#dcd9ef'
const WHITE = '#ffffff'

// ---------- a very small PNG writer ----------

const CRC_TABLE = new Uint32Array(256).map((_, n) => {
  let c = n
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
  return c >>> 0
})

function crc32(buffer) {
  let c = 0xffffffff
  for (const byte of buffer) c = CRC_TABLE[(c ^ byte) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}

function chunk(type, data) {
  const length = Buffer.alloc(4)
  length.writeUInt32BE(data.length)
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data])
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(body))
  return Buffer.concat([length, body, crc])
}

class Canvas {
  constructor(width, height, background = WHITE) {
    this.width = width
    this.height = height
    this.data = Buffer.alloc(width * height * 4)
    this.rect(0, 0, width, height, background)
  }

  rect(x, y, w, h, hex) {
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)
    for (let py = Math.max(0, y); py < Math.min(this.height, y + h); py++) {
      for (let px = Math.max(0, x); px < Math.min(this.width, x + w); px++) {
        const i = (py * this.width + px) * 4
        this.data[i] = r
        this.data[i + 1] = g
        this.data[i + 2] = b
        this.data[i + 3] = 255
      }
    }
  }

  ghost(x, y, unit, level) {
    for (const [gx, gy, color] of pixels(level, 'mint', 'idle')) {
      this.rect(x + gx * unit, y + gy * unit, unit, unit, color)
    }
  }

  png() {
    const stride = this.width * 4 + 1
    const raw = Buffer.alloc(stride * this.height)
    for (let y = 0; y < this.height; y++) {
      this.data.copy(raw, y * stride + 1, y * this.width * 4, (y + 1) * this.width * 4)
    }
    const header = Buffer.alloc(13)
    header.writeUInt32BE(this.width, 0)
    header.writeUInt32BE(this.height, 4)
    header[8] = 8 // bit depth
    header[9] = 6 // RGBA
    return Buffer.concat([
      Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
      chunk('IHDR', header),
      chunk('IDAT', deflateSync(raw, { level: 9 })),
      chunk('IEND', Buffer.alloc(0)),
    ])
  }
}

// ---------- the three files ----------

mkdirSync(OUT, { recursive: true })

// favicon.svg: the sprite itself, one <path> per colour.
{
  const byColor = new Map()
  for (const [x, y, color] of pixels(0.6, 'mint', 'idle')) {
    byColor.set(color, `${byColor.get(color) ?? ''}M${x} ${y}h1v1h-1z`)
  }
  const paths = [...byColor].map(([color, d]) => `<path fill="${color}" d="${d}"/>`).join('')
  // A square viewBox with the 17 x 15 ghost centred in it.
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-1 -2 ${GRID_W + 2} ${GRID_W + 2}" shape-rendering="crispEdges">` +
    `${paths}</svg>\n`
  writeFileSync(join(OUT, 'favicon.svg'), svg)
}

// apple-touch-icon.png: 180 x 180, ghost on white.
{
  const size = 180
  const unit = 9
  const canvas = new Canvas(size, size)
  canvas.ghost(Math.round((size - GRID_W * unit) / 2), Math.round((size - GRID_H * unit) / 2), unit, 0.6)
  writeFileSync(join(OUT, 'apple-touch-icon.png'), canvas.png())
}

// og.png: 1200 x 630 link preview. The ghost, its floor shadow, and twenty
// squares of time with twelve still to go.
{
  const width = 1200
  const height = 630
  const unit = 24
  const canvas = new Canvas(width, height)
  const ghostX = Math.round((width - GRID_W * unit) / 2)
  const ghostY = 70
  canvas.ghost(ghostX, ghostY, unit, 0.6)

  const shadowY = ghostY + GRID_H * unit + unit
  canvas.rect(width / 2 - 132, shadowY, 264, 12, LINE)
  canvas.rect(width / 2 - 144, shadowY + 12, 288, 12, LINE)
  canvas.rect(width / 2 - 132, shadowY + 24, 264, 12, LINE)

  const square = 18
  const gap = 10
  const total = 20 * square + 19 * gap
  const startX = Math.round((width - total) / 2)
  for (let i = 0; i < 20; i++) {
    canvas.rect(startX + i * (square + gap), 548, square, square, i < 12 ? INK : LINE)
  }
  writeFileSync(join(OUT, 'og.png'), canvas.png())
}

console.log('Wrote favicon.svg, apple-touch-icon.png and og.png to /public')
