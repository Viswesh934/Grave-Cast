import { useRef } from 'react'
import { BestiaryCharacter3D, Canvas, GraveyardScene3D, palette, TombstoneCard3D, useFrame, type ThreeGroup } from 'groove-ui'
import type { StoryGrave } from './graves'

const RISE_SECONDS = 1.4
const STONE_SCALE = 0.42
const STONE_HEIGHT = 1.15
const STONE_DEPTH = 2.6
const EPITAPH_CHARS = 48

const ease = (t: number) => 1 - Math.pow(1 - Math.min(1, Math.max(0, t)), 3)
const short = (text: string) => (text.length > EPITAPH_CHARS ? `${text.slice(0, EPITAPH_CHARS - 1)}\u2026` : text)

/** One stone climbing out of the ground. Remount it (by key) to rise again. */
function RisingStone({ grave, still }: { grave: StoryGrave; still: boolean }) {
  const group = useRef<ThreeGroup>(null)
  const age = useRef(still ? RISE_SECONDS : 0)
  useFrame((_, delta) => {
    if (!group.current) return
    age.current += delta
    const t = ease(age.current / RISE_SECONDS)
    group.current.position.y = -2.4 + (STONE_HEIGHT + 2.4) * t
    group.current.rotation.z = (1 - t) * 0.08
  })
  const serious = grave.weathering === 'crumbling' || grave.weathering === 'cracked'
  return (
    <group position={[0, 0, STONE_DEPTH]}>
      <group ref={group} scale={STONE_SCALE}>
        <TombstoneCard3D
          title={grave.title}
          subtitle={grave.label}
          epitaph={short(grave.evidence)}
          weathering={grave.weathering}
          intensity="ghastly"
          relief="none"
          torchColor={palette.grove.bone100}
        />
      </group>
      {serious && (
        <group position={[1.9, 2.1, -0.6]}>
          <BestiaryCharacter3D characterId="ghost" hauntMode="whisper" accentColor={palette.grove.glow} scale={0.42} ownLights={false} />
        </group>
      )}
    </group>
  )
}

export interface StoryStone3DProps {
  /** The grave to raise, or none for the empty yard. */
  grave: StoryGrave | null
  still: boolean
}

export default function StoryStone3D({ grave, still }: StoryStone3DProps) {
  return (
    <Canvas camera={{ position: [0, 1.6, 9], fov: 42, near: 0.1, far: 80 }} dpr={[1, 1.75]}>
      <GraveyardScene3D theme="grove" stones={12} lanterns={2} still={still}>
        {grave && <RisingStone key={grave.id} grave={grave} still={still} />}
      </GraveyardScene3D>
    </Canvas>
  )
}