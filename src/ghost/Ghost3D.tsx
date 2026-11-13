import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import { BoxGeometry, BufferAttribute, Color, MathUtils, Object3D, type Group, type InstancedMesh } from 'three'
import { GRID_H, GRID_W, cell, pixels, type Mood, type ToneName } from './sprite'

/**
 * The same 17 x 15 sprite, built out of blocks.
 *
 * Seen head-on through an orthographic camera it is pixel-for-pixel the flat
 * sprite. It only gives itself away when it turns to look at the cursor.
 * This file is loaded on demand, so three.js never blocks the first paint.
 */

export interface Ghost3DProps {
  /** CSS pixels per sprite pixel; the camera zoom. */
  unit: number
  level: number
  tone: ToneName
  mood: Mood
  /** Render frames only while the ghost is on screen. */
  active: boolean
  /** Each increment makes the ghost spin once. */
  spins: number
  onReady: () => void
}

interface Voxel {
  x: number
  y: number
  depth: number
}

/** Thickness of a column: the outline is thin, the body plumps up towards its middle. */
const DEPTH_BY_RING = [1.4, 2.3, 3.1, 3.7, 4.1]

function surroundedByBody(x: number, y: number, radius: number): boolean {
  for (let dy = -radius; dy <= radius; dy++) {
    for (let dx = -radius; dx <= radius; dx++) {
      if (cell(x + dx, y + dy) !== 'o') return false
    }
  }
  return true
}

function buildVoxels(): Voxel[] {
  const voxels: Voxel[] = []
  for (let y = 0; y < GRID_H; y++) {
    for (let x = 0; x < GRID_W; x++) {
      const kind = cell(x, y)
      if (kind === '.') continue
      let ring = 0
      if (kind === 'o') {
        ring = 1
        while (ring < DEPTH_BY_RING.length - 1 && surroundedByBody(x, y, ring)) ring++
      }
      voxels.push({ x, y, depth: DEPTH_BY_RING[ring] })
    }
  }
  return voxels
}

/** A unit cube whose faces carry their own shade, so no lights are needed and the front stays true to the palette. */
function shadedBox(): BoxGeometry {
  const geometry = new BoxGeometry(1, 1, 1)
  // Face order in BoxGeometry: +x, -x, +y, -y, +z (front), -z.
  const shades = [0.62, 0.8, 0.9, 0.5, 1, 0.4]
  const colors = new Float32Array(24 * 3)
  shades.forEach((shade, face) => colors.fill(shade, face * 12, face * 12 + 12))
  geometry.setAttribute('color', new BufferAttribute(colors, 3))
  return geometry
}

function Zoom({ unit }: { unit: number }) {
  const camera = useThree((s) => s.camera)
  const invalidate = useThree((s) => s.invalidate)
  useLayoutEffect(() => {
    camera.zoom = unit
    camera.updateProjectionMatrix()
    invalidate()
  }, [camera, unit, invalidate])
  return null
}

function Body({ level, tone, mood, spins, onReady }: Omit<Ghost3DProps, 'unit' | 'active'>) {
  const group = useRef<Group>(null)
  const mesh = useRef<InstancedMesh>(null)
  const voxels = useMemo(buildVoxels, [])
  const geometry = useMemo(shadedBox, [])
  const gl = useThree((s) => s.gl)
  const invalidate = useThree((s) => s.invalidate)
  const pointer = useRef({ x: 0, y: 0, at: 0 })
  const pose = useRef({ yaw: 0, pitch: 0, spin: 0 })
  const announced = useRef(false)

  useLayoutEffect(() => {
    const m = mesh.current
    if (!m) return
    const dummy = new Object3D()
    voxels.forEach((v, i) => {
      dummy.position.set(v.x - (GRID_W - 1) / 2, (GRID_H - 1) / 2 - v.y, 0)
      dummy.scale.set(1, 1, v.depth)
      dummy.updateMatrix()
      m.setMatrixAt(i, dummy.matrix)
    })
    m.instanceMatrix.needsUpdate = true
  }, [voxels])

  // Repaint when the fill level, colour or expression changes: same pixels as the flat sprite.
  useLayoutEffect(() => {
    const m = mesh.current
    if (!m) return
    const byCell = new Map(pixels(level, tone, mood).map(([x, y, color]) => [`${x},${y}`, color]))
    const color = new Color()
    voxels.forEach((v, i) => {
      color.set(byCell.get(`${v.x},${v.y}`) ?? '#ffffff')
      m.setColorAt(i, color)
    })
    if (m.instanceColor) m.instanceColor.needsUpdate = true
    invalidate()
  }, [voxels, level, tone, mood, invalidate])

  useEffect(() => {
    const onMove = (event: PointerEvent) => {
      const box = gl.domElement.getBoundingClientRect()
      const cx = box.left + box.width / 2
      const cy = box.top + box.height / 2
      pointer.current = {
        x: MathUtils.clamp((event.clientX - cx) / (window.innerWidth * 0.5), -1, 1),
        y: MathUtils.clamp((event.clientY - cy) / (window.innerHeight * 0.5), -1, 1),
        at: performance.now(),
      }
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [gl])

  useFrame((state, delta) => {
    const g = group.current
    if (!g) return
    if (!announced.current) {
      announced.current = true
      onReady()
    }
    const t = state.clock.elapsedTime
    // Follow the cursor; left alone for a moment, sway gently so the depth still shows.
    const alone = performance.now() - pointer.current.at > 2600
    const yaw = alone ? Math.sin(t * 0.75) * 0.4 : pointer.current.x * 0.6
    const pitch = alone ? Math.sin(t * 0.5) * 0.06 : pointer.current.y * 0.32
    const p = pose.current
    p.yaw = MathUtils.damp(p.yaw, yaw, 5, delta)
    p.pitch = MathUtils.damp(p.pitch, pitch, 5, delta)
    p.spin = MathUtils.damp(p.spin, spins * Math.PI * 2, 4.5, delta)
    g.rotation.set(p.pitch, p.yaw + p.spin, 0)
    g.position.y = Math.sin(t * 1.9) * 0.35
  })

  return (
    <group ref={group}>
      <instancedMesh ref={mesh} args={[geometry, undefined, voxels.length]} frustumCulled={false}>
        <meshBasicMaterial vertexColors toneMapped={false} />
      </instancedMesh>
    </group>
  )
}

export default function Ghost3D({ unit, active, ...body }: Ghost3DProps) {
  return (
    <Canvas
      flat
      orthographic
      dpr={[1, 2]}
      frameloop={active ? 'always' : 'never'}
      gl={{ alpha: true, antialias: true, powerPreference: 'low-power' }}
      camera={{ position: [0, 0, 60], near: 1, far: 200, zoom: unit }}
      style={{ pointerEvents: 'none' }}
      aria-hidden="true"
    >
      <Zoom unit={unit} />
      <Body {...body} />
    </Canvas>
  )
}
