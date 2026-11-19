import type { ReactNode } from 'react'
import { Canvas, GraveyardWalk3D, walkCamera, type GraveyardWalk3DGrave } from 'groove-ui'

export interface GraveyardWalkSceneProps {
  graves: readonly GraveyardWalk3DGrave[]
  target: number | null
  onPick: (index: number) => void
  onArrive: (index: number) => void
  renderArrived: (index: number) => ReactNode
  still: boolean
  /** Changes to send the witch back outside the gate. */
  returnKey: number
  /** The gate was clicked. */
  onGate: () => void
}

/** The 3D yard, in its own file so three.js loads only when the graveyard is opened. */
export default function GraveyardWalkScene(props: GraveyardWalkSceneProps) {
  return (
    <Canvas camera={{ fov: walkCamera.fov, near: walkCamera.near, far: walkCamera.far }} dpr={[1, 1.75]}>
      <GraveyardWalk3D {...props} />
    </Canvas>
  )
}
