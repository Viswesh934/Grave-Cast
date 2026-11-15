import { BestiaryCharacter3D, Canvas, OrbitControls, palette, TombstoneCard3D, TorchlightCursor } from 'groove-ui'
import { fileName, MARKER_MEANING, MARKER_WEATHERING, STONES_IN_SCENE } from './markerWords'
import type { RepoGrave } from './repoScan'

const PER_ROW = 3
const STONE_SCALE = 0.72
const GAP_X = 2.9
const GAP_Z = 3.6
const EPITAPH_CHARS = 64

const epitaphFor = (grave: RepoGrave): string => {
  const text = grave.note || MARKER_MEANING[grave.kind]
  return text.length > EPITAPH_CHARS ? `${text.slice(0, EPITAPH_CHARS - 1)}\u2026` : text
}

export interface RepoGraveyard3DProps {
  graves: readonly RepoGrave[]
}

/**
 * The most serious graves as stones in a misty field, front row first.
 * A wisp drifts at the back. Drag to look around.
 */
export default function RepoGraveyard3D({ graves }: RepoGraveyard3DProps) {
  const shown = graves.slice(0, STONES_IN_SCENE)
  const rows = Math.ceil(shown.length / PER_ROW)

  return (
    <Canvas camera={{ position: [0, 1.2, 7.4], fov: 46 }} dpr={[1, 1.75]}>
      <color attach="background" args={[palette.dark[950]]} />
      <fog attach="fog" args={[palette.dark[950], 7, 17]} />
      <TorchlightCursor intensity="ghastly" />

      {shown.map((grave, index) => {
        const row = Math.floor(index / PER_ROW)
        const inRow = Math.min(PER_ROW, shown.length - row * PER_ROW)
        const column = index % PER_ROW
        const x = (column - (inRow - 1) / 2) * GAP_X + (row % 2 === 1 ? GAP_X / 4 : 0)
        const z = -row * GAP_Z
        return (
          <group key={grave.id} position={[x, -0.2 + row * 0.25, z]} scale={STONE_SCALE}>
            <TombstoneCard3D
              title={grave.kind}
              subtitle={`${fileName(grave.path)}:${grave.line}`}
              epitaph={epitaphFor(grave)}
              weathering={MARKER_WEATHERING[grave.kind]}
              intensity="ghastly"
              relief="none"
            />
          </group>
        )
      })}

      {/* The ground the stones stand on. */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.15, -GAP_Z * (rows - 1) / 2]}>
        <planeGeometry args={[40, 30]} />
        <meshStandardMaterial color={palette.dark[900]} roughness={1} />
      </mesh>

      <group position={[-GAP_X * 1.25, 2.3, -GAP_Z * (rows - 0.5)]}>
        <BestiaryCharacter3D characterId="wisp" hauntMode="whisper" accentColor={palette.mist[300]} scale={0.6} />
      </group>

      <OrbitControls
        enablePan={false}
        enableZoom={false}
        minAzimuthAngle={-0.45}
        maxAzimuthAngle={0.45}
        minPolarAngle={1.1}
        maxPolarAngle={1.62}
        target={[0, 0, -GAP_Z * (rows - 1) / 2]}
      />
    </Canvas>
  )
}