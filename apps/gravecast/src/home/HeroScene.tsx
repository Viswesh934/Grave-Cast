import { Canvas, GraveyardScene3D, GRAVEYARD_POSES, type GraveyardCameraPose } from 'groove-ui'

/** The form covers the left of the screen, so every pose looks a little to the left and the yard shows on the right. */
const LOOK_LEFT = 2.6
const POSES: readonly GraveyardCameraPose[] = GRAVEYARD_POSES.map((pose) => ({
  position: pose.position,
  target: [pose.target[0] - LOOK_LEFT, pose.target[1], pose.target[2]],
}))

export interface HeroSceneProps {
  focus: number
  getScroll: () => number
  still: boolean
}

/** The moonlit yard behind the whole page. Loaded on its own, so the page shows before three.js arrives. */
export default function HeroScene({ focus, getScroll, still }: HeroSceneProps) {
  const start = GRAVEYARD_POSES[0].position
  return (
    <Canvas camera={{ position: [start[0], start[1], start[2]], fov: 45, near: 0.1, far: 80 }} dpr={[1, 1.75]}>
      <GraveyardScene3D theme="grove" creature="vampire" creatureScale={0.6} poses={POSES} focus={focus} getScroll={getScroll} still={still} />
    </Canvas>
  )
}