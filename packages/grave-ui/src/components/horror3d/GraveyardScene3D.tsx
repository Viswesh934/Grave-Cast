/**
 * GraveyardScene3D - A moonlit graveyard to set behind a page
 * @module components/horror3d/GraveyardScene3D
 */
import { useMemo, useRef, type ReactNode } from 'react';
import { useFrame } from '@react-three/fiber';
import { ExtrudeGeometry, Shape, Vector3, type Group, type Mesh, type PointLight } from 'three';
import { palette } from '../../tokens/colors';
import { BestiaryCharacter3D } from './BestiaryCharacter3D';

/** Where the camera stands and what it looks at. */
export interface GraveyardCameraPose {
  position: readonly [number, number, number];
  target: readonly [number, number, number];
}

/** The default focus points, from the gate to the far end of the yard. */
export const GRAVEYARD_POSES: readonly GraveyardCameraPose[] = [
  { position: [0, 1.6, 9], target: [0, 0.6, 0] },
  { position: [-3.2, 1.2, 5.5], target: [-1.5, 0.3, -1] },
  { position: [2.6, 0.9, 3.2], target: [1.2, 0.2, -3] },
  { position: [0, 2.6, 2], target: [0, 0, -7] },
  { position: [-1.2, 0.8, -1.5], target: [2, 0.6, -10] },
];

/** The colours of one look of the yard. */
export interface GraveyardSceneColors {
  sky: string;
  ground: string;
  mound: string;
  stone: string;
  cross: string;
  trees: string;
  mist: string;
  ambient: string;
  skyLight: string;
  moonlight: string;
  moon: string;
  halo: string;
  lantern: string;
  post: string;
  wisp: string;
}

/** Ready-made looks: a cold blue moonlit night, or the docs' green grove. */
export const GRAVEYARD_SCENE_THEMES = {
  moonlit: {
    sky: palette.dark[950],
    ground: palette.dark[850],
    mound: palette.dark[800],
    stone: palette.crypt.granite,
    cross: palette.crypt.slate,
    trees: palette.dark[900],
    mist: palette.mist[400],
    ambient: palette.mist[400],
    skyLight: palette.mist[300],
    moonlight: palette.mist[200],
    moon: palette.bone[200],
    halo: palette.mist[500],
    lantern: palette.bone.decayed,
    post: palette.dark[700],
    wisp: palette.mist[300],
  },
  grove: {
    sky: palette.grove[950],
    ground: palette.grove[850],
    mound: palette.grove[800],
    stone: palette.grove[600],
    cross: palette.grove[700],
    trees: palette.grove[900],
    mist: palette.grove.mist400,
    ambient: palette.grove.mist400,
    skyLight: palette.grove.mist300,
    moonlight: palette.grove.mist200,
    moon: palette.grove.bone200,
    halo: palette.grove.mist500,
    lantern: palette.grove.glow,
    post: palette.grove[700],
    wisp: palette.grove.glow,
  },
} as const satisfies Record<string, GraveyardSceneColors>;

export type GraveyardSceneTheme = keyof typeof GRAVEYARD_SCENE_THEMES;

export interface GraveyardScene3DProps {
  /** The yard's look. @default 'moonlit' */
  theme?: GraveyardSceneTheme;
  /** Index into `poses`. The camera glides there. @default 0 */
  focus?: number;
  /** Camera poses to glide between. @default GRAVEYARD_POSES */
  poses?: readonly GraveyardCameraPose[];
  /**
   * Reads how far the page has scrolled, 0 to 1. Read every frame, so pass a
   * function over a ref instead of state: the scene never re-renders on scroll.
   */
  getScroll?: () => number;
  /** How many headstones stand in the yard. @default 28 */
  stones?: number;
  /** Lanterns left burning among the graves. @default 4 */
  lanterns?: number;
  /** A wisp drifting over the far graves. @default true */
  wisp?: boolean;
  /** Stop the camera drifting and the mist moving, for reduced motion. */
  still?: boolean;
  /** Extra things to place in the yard. */
  children?: ReactNode;
}

const FOG_NEAR = 6;
const FOG_FAR = 26;
const CAMERA_EASE = 2.2; // per second
const SCROLL_DOLLY = 4; // how far the camera walks in over a full scroll
const YARD = { width: 16, depth: 18, back: -14 } as const;
const STONES_PER_ROW = 6;
/** Where the moon hangs: high and to the right, behind the tree line. */
const MOON = [10, 8.5, -30] as const;
const ROW_GAP = 3.1;

/** A small seeded random, so the yard is laid out the same on every visit. */
const seeded = (seed: number) => {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
};

type StoneKind = 'arch' | 'cross' | 'slab';

interface Headstone {
  kind: StoneKind;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: number;
}

const layoutYard = (count: number): Headstone[] => {
  const random = seeded(1847);
  const stones: Headstone[] = [];
  for (let i = 0; i < count; i++) {
    const row = Math.floor(i / STONES_PER_ROW);
    const column = i % STONES_PER_ROW;
    const x = (column - (STONES_PER_ROW - 1) / 2) * (YARD.width / STONES_PER_ROW) + (random() - 0.5) * 1.2;
    const z = 1.5 - row * ROW_GAP + (random() - 0.5) * 0.9;
    // Leave the path down the middle clear.
    const clear = Math.abs(x) < 0.9 ? x + Math.sign(x || 1) * 1.1 : x;
    const roll = random();
    stones.push({
      kind: roll < 0.55 ? 'arch' : roll < 0.8 ? 'cross' : 'slab',
      position: [clear, 0, z],
      rotation: [(random() - 0.5) * 0.12, (random() - 0.5) * 0.5, (random() - 0.5) * 0.16],
      scale: 0.75 + random() * 0.45,
    });
  }
  return stones;
};

/** One shared arched headstone shape for every arch in the yard. */
let archShape: ExtrudeGeometry | null = null;
const archGeometry = (): ExtrudeGeometry => {
  if (archShape) return archShape;
  const s = new Shape();
  s.moveTo(-0.38, 0);
  s.lineTo(0.38, 0);
  s.lineTo(0.38, 0.72);
  s.quadraticCurveTo(0.36, 1.08, 0, 1.08);
  s.quadraticCurveTo(-0.36, 1.08, -0.38, 0.72);
  s.lineTo(-0.38, 0);
  archShape = new ExtrudeGeometry(s, { depth: 0.16, bevelEnabled: true, bevelSize: 0.03, bevelThickness: 0.03, bevelSegments: 2 });
  archShape.translate(0, 0, -0.08);
  return archShape;
};

function Stone({ stone, colors }: { stone: Headstone; colors: GraveyardSceneColors }) {
  return (
    <group position={stone.position} rotation={stone.rotation} scale={stone.scale}>
      {stone.kind === 'arch' && (
        <mesh geometry={archGeometry()}>
          <meshStandardMaterial color={colors.stone} roughness={0.92} />
        </mesh>
      )}
      {stone.kind === 'cross' && (
        <>
          <mesh position={[0, 0.6, 0]}>
            <boxGeometry args={[0.12, 1.2, 0.12]} />
            <meshStandardMaterial color={colors.cross} roughness={0.95} />
          </mesh>
          <mesh position={[0, 0.85, 0]}>
            <boxGeometry args={[0.62, 0.12, 0.12]} />
            <meshStandardMaterial color={colors.cross} roughness={0.95} />
          </mesh>
        </>
      )}
      {stone.kind === 'slab' && (
        <mesh position={[0, 0.42, 0]}>
          <boxGeometry args={[0.7, 0.84, 0.18]} />
          <meshStandardMaterial color={colors.stone} roughness={0.9} />
        </mesh>
      )}
      {/* The mound in front of the stone. */}
      <mesh position={[0, 0.02, 0.7]} scale={[0.5, 0.08, 0.85]}>
        <sphereGeometry args={[1, 12, 8]} />
        <meshStandardMaterial color={colors.mound} roughness={1} />
      </mesh>
    </group>
  );
}

function Lantern({ position, still, colors }: { position: [number, number, number]; still: boolean; colors: GraveyardSceneColors }) {
  const light = useRef<PointLight>(null);
  const seed = position[0] * 13.1 + position[2] * 7.7;
  useFrame(({ clock }) => {
    if (!light.current || still) return;
    const t = clock.elapsedTime + seed;
    light.current.intensity = 1.1 + Math.sin(t * 2.3) * 0.12 + Math.sin(t * 5.1) * 0.06;
  });
  return (
    <group position={position}>
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[0.03, 1, 0.03]} />
        <meshStandardMaterial color={colors.post} />
      </mesh>
      <mesh position={[0, 1.05, 0]}>
        <boxGeometry args={[0.16, 0.2, 0.16]} />
        <meshBasicMaterial color={colors.lantern} transparent opacity={0.85} />
      </mesh>
      <pointLight ref={light} position={[0, 1.05, 0]} color={colors.lantern} intensity={1.1} distance={4.5} decay={2} />
    </group>
  );
}

/** A slow sheet of mist low over the ground. */
function MistLayer({ y, z, speed, still, color }: { y: number; z: number; speed: number; still: boolean; color: string }) {
  const mesh = useRef<Mesh>(null);
  useFrame(({ clock }) => {
    if (!mesh.current || still) return;
    mesh.current.position.x = Math.sin(clock.elapsedTime * speed) * 2.5;
  });
  return (
    <mesh ref={mesh} position={[0, y, z]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[40, 7]} />
      <meshBasicMaterial color={color} transparent opacity={0.07} depthWrite={false} />
    </mesh>
  );
}

/** The far tree line, as flat dark shapes against the sky. */
function TreeLine({ color }: { color: string }) {
  const trees = useMemo(() => {
    const random = seeded(77);
    return Array.from({ length: 26 }, (_, i) => ({
      x: -26 + i * 2 + (random() - 0.5) * 1.4,
      height: 2.5 + random() * 3.5,
      width: 0.8 + random() * 0.9,
    }));
  }, []);
  return (
    <group position={[0, 0, -22]}>
      {trees.map((tree, i) => (
        <mesh key={i} position={[tree.x, tree.height / 2, 0]}>
          <coneGeometry args={[tree.width, tree.height, 5]} />
          <meshBasicMaterial color={color} />
        </mesh>
      ))}
    </group>
  );
}

function CameraRig({ pose, getScroll, still }: { pose: GraveyardCameraPose; getScroll?: () => number; still: boolean }) {
  const target = useRef(new Vector3(...pose.target));
  const wantedPosition = useMemo(() => new Vector3(), []);
  const wantedTarget = useMemo(() => new Vector3(), []);
  const placed = useRef(false);
  useFrame(({ camera, clock, pointer }, delta) => {
    const scroll = Math.min(1, Math.max(0, getScroll?.() ?? 0));
    const sway = still ? 0 : Math.sin(clock.elapsedTime * 0.25) * 0.15;
    wantedPosition.set(
      pose.position[0] + sway + (still ? 0 : pointer.x * 0.35),
      pose.position[1] + (still ? 0 : pointer.y * 0.2) - scroll * 0.4,
      pose.position[2] - scroll * SCROLL_DOLLY,
    );
    wantedTarget.set(pose.target[0], pose.target[1], pose.target[2] - scroll * SCROLL_DOLLY);
    const ease = !placed.current || still ? 1 : 1 - Math.exp(-CAMERA_EASE * delta);
    placed.current = true;
    camera.position.lerp(wantedPosition, ease);
    target.current.lerp(wantedTarget, ease);
    camera.lookAt(target.current);
  });
  return null;
}

/**
 * A moonlit graveyard: rows of headstones and crosses, a few lanterns, low
 * mist, a far tree line and a wisp. It is scenery only and shows no data.
 *
 * Place it inside a `Canvas`. The camera glides to `poses[focus]` and walks
 * in as `getScroll()` goes from 0 to 1.
 *
 * @example
 * ```tsx
 * const scroll = useRef(0);
 * <Canvas camera={{ fov: 45 }}>
 *   <GraveyardScene3D focus={step} getScroll={() => scroll.current} />
 * </Canvas>
 * ```
 */
export function GraveyardScene3D({
  theme = 'moonlit',
  focus = 0,
  poses = GRAVEYARD_POSES,
  getScroll,
  stones = 28,
  lanterns = 4,
  wisp = true,
  still = false,
  children,
}: GraveyardScene3DProps) {
  const colors: GraveyardSceneColors = GRAVEYARD_SCENE_THEMES[theme];
  const yard = useMemo(() => layoutYard(stones), [stones]);
  const lanternSpots = useMemo(() => {
    const random = seeded(311);
    return Array.from({ length: lanterns }, (_, i): [number, number, number] => [
      (i % 2 === 0 ? -1 : 1) * (0.9 + random() * 0.5),
      0,
      2 - i * (YARD.depth / Math.max(1, lanterns)) * 0.7,
    ]);
  }, [lanterns]);
  const wispGroup = useRef<Group>(null);
  useFrame(({ clock }) => {
    if (!wispGroup.current || still) return;
    const t = clock.elapsedTime;
    wispGroup.current.position.set(4.5 + Math.sin(t * 0.18) * 2.5, 1.8 + Math.sin(t * 0.7) * 0.25, -8 + Math.cos(t * 0.18) * 2);
  });
  const pose = poses[Math.min(Math.max(0, focus), poses.length - 1)];

  return (
    <>
      <color attach="background" args={[colors.sky]} />
      <fog attach="fog" args={[colors.sky, FOG_NEAR, FOG_FAR]} />
      <CameraRig pose={pose} getScroll={getScroll} still={still} />

      {/* Moonlight: cool, low and from behind, so stones stand out as shapes. */}
      <ambientLight color={colors.ambient} intensity={0.5} />
      <hemisphereLight args={[colors.skyLight, colors.sky, 0.35]} />
      <directionalLight position={[MOON[0] * 0.8, 9, -12]} color={colors.moonlight} intensity={1.3} />
      <directionalLight position={[-4, 5, 10]} color={colors.moonlight} intensity={0.35} />

      {/* The moon. Fog is off so it stays visible far away. */}
      <mesh position={[MOON[0], MOON[1], MOON[2]]}>
        <sphereGeometry args={[1.6, 32, 16]} />
        <meshBasicMaterial color={colors.moon} fog={false} />
      </mesh>
      <mesh position={[MOON[0], MOON[1], MOON[2] - 0.5]}>
        <circleGeometry args={[3.2, 40]} />
        <meshBasicMaterial color={colors.halo} transparent opacity={0.12} fog={false} depthWrite={false} />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, YARD.back / 2]}>
        <planeGeometry args={[80, 60]} />
        <meshStandardMaterial color={colors.ground} roughness={1} />
      </mesh>

      <TreeLine color={colors.trees} />
      {yard.map((stone, i) => (
        <Stone key={i} stone={stone} colors={colors} />
      ))}
      {lanternSpots.map((spot, i) => (
        <Lantern key={i} position={spot} still={still} colors={colors} />
      ))}
      <MistLayer y={0.25} z={0} speed={0.05} still={still} color={colors.mist} />
      <MistLayer y={0.45} z={-6} speed={-0.04} still={still} color={colors.mist} />
      <MistLayer y={0.35} z={-12} speed={0.03} still={still} color={colors.mist} />

      {wisp && (
        <group ref={wispGroup} position={[4.5, 1.8, -8]}>
          <BestiaryCharacter3D characterId="wisp" hauntMode="whisper" accentColor={colors.wisp} scale={0.45} ownLights={false} />
        </group>
      )}
      {children}
    </>
  );
}
