/**
 * 3D Horror Component Infrastructure
 * @module horror3d
 */

export * from './GlobalCanvasProvider';
export * from './TorchlightCursor';
export * from './TombstoneCard3D';
export * from './BloodVialProgress3D';
export * from './CauldronBrew3D';
export * from './RunicButton3D';
export * from './BoneOssuaryDivider3D';
export * from './LunarPhaseSelector3D';
export * from './ExcavationLoader3D';
export * from './MausoleumVault3D';
export * from './CoffinAccordion3D';
export * from './CobwebCorner3D';
export * from './WitchOnBroom3D';
export * from './ChickenLegStepper3D';
export * from './horror3d.config';

// Re-export core 3D helpers so apps/web has a single unified Three.js instance
export { Canvas, useFrame, useThree } from '@react-three/fiber';
export { OrbitControls, Text, Center, Float, View } from '@react-three/drei';
