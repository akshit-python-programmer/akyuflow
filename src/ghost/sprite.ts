/**
 * Akyu, drawn by hand on a 17 x 15 grid. This bitmap is the single source for
 * the SVG sprite, the 3D voxel ghost, the favicon and the link-preview image.
 *
 *   '#' outline   'o' body   '.' nothing
 *
 * The body doubles as a vessel: rows below the "cut" are filled with colour,
 * rows above it are empty. That fill level is how the ghost shows time left.
 */
export const ROWS = [
  '.....######......',
  '...##oooooo##....',
  '..#oooooooooo#...',
  '.#oooooooooooo#..',
  '.#oooooooooooo#..',
  '#oooooooooooooo#.',
  '#oooooooooooooo#.',
  '#oooooooooooooo#.',
  '#oooooooooooooo#.',
  '#oooooooooooooo#.',
  '#oooooooooooooo#.',
  '#ooooooooooooooo#',
  '#ooo#oooo#oooooo#',
  '#oo#.#oo#.#oooo#.',
  '.##...##...####..',
] as const

export const GRID_W = 17
export const GRID_H = 15

/** First and last rows that contain body pixels. */
export const BODY_TOP = 1
export const BODY_BOTTOM = 13

export type Cell = '.' | '#' | 'o'
export type Mood = 'idle' | 'blink' | 'left' | 'right' | 'happy' | 'rest'
export type ToneName = 'mint' | 'peach' | 'lilac'

export const INK = '#1e1b4b'
export const EMPTY = '#ffffff'
export const EMPTY_SHADE = '#e7e5f4'
export const BLUSH = '#ff8fa8'

export const TONES: Record<ToneName, { base: string; shade: string; light: string }> = {
  mint: { base: '#5fe3c0', shade: '#35c3a0', light: '#a9f2dd' },
  peach: { base: '#ffb58c', shade: '#f5935f', light: '#ffd9c2' },
  lilac: { base: '#b9b0ff', shade: '#988cf0', light: '#dad5ff' },
}

export function cell(x: number, y: number): Cell {
  const row = ROWS[y]
  if (!row) return '.'
  return (row[x] as Cell | undefined) ?? '.'
}

/** Row where the fill starts for a level between 0 (empty) and 1 (full). */
export function cutRow(level: number): number {
  const clamped = Math.min(1, Math.max(0, level))
  const rows = BODY_BOTTOM - BODY_TOP + 1
  return BODY_TOP + Math.round((1 - clamped) * rows)
}

/** Colour of one pixel of the body and outline, or null where there is nothing. */
export function colorAt(x: number, y: number, cut: number, tone: ToneName): string | null {
  const c = cell(x, y)
  if (c === '.') return null
  if (c === '#') return INK
  const t = TONES[tone]
  const edge = cell(x + 1, y) !== 'o' || cell(x, y + 1) !== 'o'
  if (y < cut) return edge ? EMPTY_SHADE : EMPTY
  if (y === cut) return t.light
  if (edge) return t.shade
  if (cell(x - 1, y) !== 'o' && y < 8) return t.light
  return t.base
}

type Point = readonly [number, number]

const EYES: Record<Mood, readonly Point[]> = {
  idle: [[4, 6], [4, 7], [11, 6], [11, 7]],
  blink: [[4, 7], [11, 7]],
  left: [[3, 6], [3, 7], [10, 6], [10, 7]],
  right: [[5, 6], [5, 7], [12, 6], [12, 7]],
  happy: [[3, 7], [4, 6], [5, 7], [10, 7], [11, 6], [12, 7]],
  rest: [[3, 7], [4, 7], [11, 7], [12, 7]],
}

const CHEEKS: readonly Point[] = [[2, 9], [3, 9], [12, 9], [13, 9]]

export function eyePixels(mood: Mood): readonly Point[] {
  return EYES[mood]
}

export function cheekPixels(): readonly Point[] {
  return CHEEKS
}

/** Every painted pixel of the ghost, face included, as [x, y, colour]. */
export function pixels(level: number, tone: ToneName, mood: Mood): Array<[number, number, string]> {
  const cut = cutRow(level)
  const grid = new Map<string, string>()
  for (let y = 0; y < GRID_H; y++) {
    for (let x = 0; x < GRID_W; x++) {
      const color = colorAt(x, y, cut, tone)
      if (color) grid.set(`${x},${y}`, color)
    }
  }
  for (const [x, y] of CHEEKS) grid.set(`${x},${y}`, BLUSH)
  for (const [x, y] of EYES[mood]) grid.set(`${x},${y}`, INK)
  return [...grid].map(([key, color]) => {
    const [x, y] = key.split(',').map(Number)
    return [x, y, color]
  })
}
