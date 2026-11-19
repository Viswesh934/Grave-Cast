/**
 * The yard around the graves: ground, path, iron fence with a gate, trees,
 * lanterns, low mist and the moon. Scenery only. None of it is a grave, so
 * nothing here can be mistaken for a finding.
 * @module components/horror3d/GraveyardWalk3D/Scenery
 */
import { useCallback, useLayoutEffect, useMemo, useRef, type ReactNode } from 'react';
import { useFrame, type ThreeEvent } from '@react-three/fiber';
import { Object3D, type InstancedMesh, type Mesh } from 'three';
import { Lantern, seeded, type GraveyardSceneColors } from '../GraveyardScene3D';
import { DriftingClouds, HauntedGround, NightSky, PhasedMoon, WatchingEyes } from '../Haunting/Haunting';
import type { WalkYardLayout } from './layout';
import { walkCamera, walkColors, walkHaunt, walkMaterial, walkScenery, walkYard } from './tokens';

type Box = WalkYardLayout['fence'];

/** Points every `gap` along a line, leaving out any that `skip` rejects. */
const postsAlong = (from: [number, number], to: [number, number], gap: number, skip: (x: number, z: number) => boolean): [number, number][] => {
  const length = Math.hypot(to[0] - from[0], to[1] - from[1]);
  const count = Math.max(1, Math.round(length / gap));
  const points: [number, number][] = [];
  for (let i = 0; i <= count; i += 1) {
    const x = from[0] + ((to[0] - from[0]) * i) / count;
    const z = from[1] + ((to[1] - from[1]) * i) / count;
    if (!skip(x, z)) points.push([x, z]);
  }
  return points;
};

/** One draw call for many copies of the same shape. */
function Instances({ items, children }: { items: Object3D[]; children: ReactNode }) {
  const mesh = useRef<InstancedMesh>(null);
  useLayoutEffect(() => {
    const target = mesh.current;
    if (!target) return;
    items.forEach((item, i) => {
      item.updateMatrix();
      target.setMatrixAt(i, item.matrix);
    });
    target.instanceMatrix.needsUpdate = true;
  }, [items]);
  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, items.length]}>
      {children}
    </instancedMesh>
  );
}

const placed = (x: number, y: number, z: number, scale?: [number, number, number]): Object3D => {
  const item = new Object3D();
  item.position.set(x, y, z);
  if (scale) item.scale.set(...scale);
  return item;
};

function IronMaterial({ colors }: { colors: GraveyardSceneColors }) {
  return <meshStandardMaterial color={colors.post} roughness={walkMaterial.iron.roughness} metalness={walkMaterial.iron.metalness} />;
}

function Fence({ box, colors, onGate }: { box: Box; colors: GraveyardSceneColors; onGate?: () => void }) {
  const { fence: f, gate: g } = walkScenery;
  const gateEdge = walkYard.gateHalfWidth;
  const posts = useMemo(() => {
    const corners: [number, number][] = [
      [box.minX, box.maxZ],
      [box.maxX, box.maxZ],
      [box.maxX, box.minZ],
      [box.minX, box.minZ],
    ];
    const inGate = (x: number, z: number) => z === box.maxZ && Math.abs(x) < gateEdge;
    return corners
      .flatMap((corner, i) => postsAlong(corner, corners[(i + 1) % corners.length], walkYard.postGap, inGate))
      .map(([x, z]) => placed(x, f.postHeight / 2, z));
  }, [box, f.postHeight, gateEdge]);
  const spikes = useMemo(() => posts.map((post) => placed(post.position.x, f.postHeight + f.spikeHeight / 2, post.position.z)), [posts, f.postHeight, f.spikeHeight]);
  const width = box.maxX - box.minX;
  const depth = box.maxZ - box.minZ;
  const centreX = (box.minX + box.maxX) / 2;
  const centreZ = (box.minZ + box.maxZ) / 2;
  // The front rail is two pieces, one each side of the gate.
  const leftPiece = -gateEdge - box.minX;
  const rightPiece = box.maxX - gateEdge;
  const rails = f.rails.flatMap((y) => [
    { position: [centreX, y, box.minZ], size: [width, f.railSize, f.railSize] },
    { position: [box.minX, y, centreZ], size: [f.railSize, f.railSize, depth] },
    { position: [box.maxX, y, centreZ], size: [f.railSize, f.railSize, depth] },
    { position: [box.minX + leftPiece / 2, y, box.maxZ], size: [leftPiece, f.railSize, f.railSize] },
    { position: [gateEdge + rightPiece / 2, y, box.maxZ], size: [rightPiece, f.railSize, f.railSize] },
  ] as { position: [number, number, number]; size: [number, number, number] }[]);
  return (
    <group>
      <Instances items={posts}>
        <boxGeometry args={[f.postSize, f.postHeight, f.postSize]} />
        <IronMaterial colors={colors} />
      </Instances>
      <Instances items={spikes}>
        <coneGeometry args={[f.spikeRadius, f.spikeHeight, walkMaterial.segments.spike]} />
        <IronMaterial colors={colors} />
      </Instances>
      {rails.map((rail, i) => (
        <mesh key={i} position={rail.position}>
          <boxGeometry args={rail.size} />
          <IronMaterial colors={colors} />
        </mesh>
      ))}
      {/* The gate: two stone pillars and an iron arch between them. Clicking it goes back to the start. */}
      <group
        onClick={(event: ThreeEvent<MouseEvent>) => {
          // A press that turned the view is not a click on the gate.
          if (!onGate || event.delta > walkCamera.clickSlopPx) return;
          event.stopPropagation();
          onGate();
        }}
      >
      {[-1, 1].map((side) => (
        <mesh key={side} position={[side * (gateEdge + g.pillarSize / 2), g.pillarHeight / 2, box.maxZ]}>
          <boxGeometry args={[g.pillarSize, g.pillarHeight, g.pillarSize]} />
          <meshStandardMaterial color={colors.stone} roughness={walkMaterial.stone.roughness} />
        </mesh>
      ))}
      <mesh position={[0, g.archLift, box.maxZ]}>
        <torusGeometry args={[gateEdge, g.archTube, walkMaterial.segments.arch[0], walkMaterial.segments.arch[1], Math.PI]} />
        <IronMaterial colors={colors} />
      </mesh>
      <GateEmblem archTop={g.archLift + gateEdge} ringY={g.archLift + gateEdge * walkScenery.emblem.at} z={box.maxZ} colors={colors} />
      </group>
    </group>
  );
}

/** The two sides of the emblem: left (-1) and right (1). */
const EMBLEM_SIDES = [-1, 1] as const;

/**
 * The wrought-iron sign hung in the arch over the gate: an hourglass in a
 * ring, with a wing fanned out each side (the winged hourglass carved on old
 * gravestones: time flies), a bar up to the arch, and a spike on top.
 */
function GateEmblem({ archTop, ringY, z, colors }: { archTop: number; ringY: number; z: number; colors: GraveyardSceneColors }) {
  const e = walkScenery.emblem;
  const h = e.hourglass;
  const sides = walkMaterial.segments.spike * 2;
  const ringTop = ringY + e.ring.radius;
  return (
    <group>
      <group position={[0, ringY, z]}>
        <mesh>
          <torusGeometry args={[e.ring.radius, e.ring.tube, walkMaterial.segments.arch[0], walkMaterial.segments.arch[1]]} />
          <IronMaterial colors={colors} />
        </mesh>
        {/* The hourglass: two bulbs meeting at the neck, a plate at each end, and the posts between the plates. */}
        <mesh position={[0, h.half / 2, 0]} rotation={[Math.PI, 0, 0]}>
          <coneGeometry args={[h.bulb, h.half, sides]} />
          <IronMaterial colors={colors} />
        </mesh>
        <mesh position={[0, -h.half / 2, 0]}>
          <coneGeometry args={[h.bulb, h.half, sides]} />
          <IronMaterial colors={colors} />
        </mesh>
        {EMBLEM_SIDES.map((side) => (
          <mesh key={`plate${side}`} position={[0, side * h.half, 0]}>
            <cylinderGeometry args={[h.plate, h.plate, h.plateThickness, sides]} />
            <IronMaterial colors={colors} />
          </mesh>
        ))}
        {EMBLEM_SIDES.map((side) => (
          <mesh key={`post${side}`} position={[side * h.plate, 0, 0]}>
            <cylinderGeometry args={[h.post, h.post, h.half * 2, walkMaterial.segments.spike]} />
            <IronMaterial colors={colors} />
          </mesh>
        ))}
        {/* The wings: feathers fanned up and out from the ring. */}
        {EMBLEM_SIDES.map((side) =>
          e.feathers.map((feather, i) => (
            <group key={`feather${side}${i}`} position={[side * e.ring.radius * e.featherFrom, 0, 0]} rotation={[0, 0, side * feather.angle]}>
              <mesh position={[(side * feather.length) / 2, 0, 0]}>
                <boxGeometry args={[feather.length, e.featherWidth, e.featherDepth]} />
                <IronMaterial colors={colors} />
              </mesh>
            </group>
          ))
        )}
      </group>
      {/* The bar from the ring up to the arch, and the spike on top. */}
      <mesh position={[0, (ringTop + archTop) / 2, z]}>
        <boxGeometry args={[e.bar, archTop - ringTop, e.bar]} />
        <IronMaterial colors={colors} />
      </mesh>
      <mesh position={[0, archTop + e.finial.height / 2, z]}>
        <coneGeometry args={[e.finial.radius, e.finial.height, walkMaterial.segments.spike]} />
        <IronMaterial colors={colors} />
      </mesh>
    </group>
  );
}

/** A band of dark pines all round the yard, outside the fence, with the view out of the gate left open. */
function Trees({ box, colors, seed }: { box: Box; colors: GraveyardSceneColors; seed: number }) {
  const t = walkScenery.trees;
  const trees = useMemo(() => {
    const random = seeded(seed);
    const sides = 4;
    const perimeter = 2 * (box.maxX - box.minX + (box.maxZ - box.minZ));
    const count = Math.round(perimeter / walkYard.treeEvery);
    const items: Object3D[] = [];
    for (let i = 0; i < count; i += 1) {
      const along = random();
      const out = t.offset + random() * t.band;
      const height = t.minHeight + random() * (t.maxHeight - t.minHeight);
      const radius = t.minRadius + random() * (t.maxRadius - t.minRadius);
      const side = i % sides;
      const acrossX = box.minX - t.offset + along * (box.maxX - box.minX + t.offset * 2);
      const acrossZ = box.minZ - t.offset + along * (box.maxZ - box.minZ + t.offset * 2);
      const x = side === 0 ? box.minX - out : side === 1 ? box.maxX + out : acrossX;
      const z = side === 0 || side === 1 ? acrossZ : side === 2 ? box.minZ - out : box.maxZ + out;
      if (side === sides - 1 && Math.abs(x) < t.offset * 2) continue;
      items.push(placed(x, height / 2, z, [radius, height, radius]));
    }
    return items;
  }, [box, seed, t]);
  return (
    <Instances items={trees}>
      <coneGeometry args={[1, 1, t.sides]} />
      <meshBasicMaterial color={colors.trees} />
    </Instances>
  );
}

/** A dead tree: a trunk and a few bare branches reaching up. */
function BareTree({ x, z, turn, colors }: { x: number; z: number; turn: number; colors: GraveyardSceneColors }) {
  const b = walkScenery.bareTree;
  const { taper, segments } = walkMaterial;
  return (
    <group position={[x, 0, z]} rotation={[0, turn, 0]}>
      <mesh position={[0, b.height / 2, 0]}>
        <cylinderGeometry args={[b.trunk * taper.trunk, b.trunk, b.height, segments.trunk]} />
        <meshStandardMaterial color={colors.trees} roughness={walkMaterial.bark.roughness} />
      </mesh>
      {Array.from({ length: b.count }, (_, i) => {
        const angle = (i / b.count) * Math.PI * 2;
        const y = b.height * (b.branchesFrom + (i / b.count) * (1 - b.branchesFrom) * walkMaterial.branchSpread);
        return (
          <group key={i} position={[0, y, 0]} rotation={[0, angle, b.rise]}>
            <mesh position={[0, b.branch / 2, 0]}>
              <cylinderGeometry args={[b.branchRadius * taper.branch, b.branchRadius, b.branch, segments.branch]} />
              <meshStandardMaterial color={colors.trees} roughness={walkMaterial.bark.roughness} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

/** Low sheets of mist drifting slowly across the yard. */
function Mist({ box, colors, still }: { box: Box; colors: GraveyardSceneColors; still: boolean }) {
  const m = walkScenery.mist;
  const sheets = useRef<(Mesh | null)[]>([]);
  useFrame(({ clock }) => {
    if (still) return;
    sheets.current.forEach((sheet, i) => {
      if (sheet) sheet.position.x = Math.sin(clock.elapsedTime * m.speed * (i % 2 === 0 ? 1 : -1) + i) * m.drift;
    });
  });
  const width = box.maxX - box.minX + walkScenery.trees.offset * 4;
  const step = (box.maxZ - box.minZ) / m.layers;
  return (
    <group>
      {Array.from({ length: m.layers }, (_, i) => (
        <mesh
          key={i}
          ref={(mesh) => {
            sheets.current[i] = mesh;
          }}
          position={[0, m.height + (i % 2) * m.rise, box.maxZ - step * (i + 0.5)]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <planeGeometry args={[width, Math.max(step, m.depth)]} />
          <meshBasicMaterial color={colors.mist} transparent opacity={m.opacity} depthWrite={false} />
        </mesh>
      ))}
    </group>
  );
}

/** Props for {@link WalkScenery}. */
export interface WalkSceneryProps {
  /** Where the fence, gate, path and lanterns go. */
  layout: WalkYardLayout;
  colors: GraveyardSceneColors;
  /** Places the trees, so the same yard always has the same trees. */
  seed: number;
  /** Stop the mist and lantern flicker, for reduced motion. */
  still: boolean;
  /** Add the black sky and stars, clouds over the moon, and eyes watching from the trees. */
  haunted?: boolean;
  /** Called when the gate is clicked. */
  onGate?: () => void;
}

/** Everything in the yard that isn't a grave or the witch. */
export function WalkScenery({ layout, colors, seed, still, haunted = false, onGate }: WalkSceneryProps) {
  const { fence: box } = layout;
  const s = walkScenery;
  const width = box.maxX - box.minX;
  const depth = box.maxZ - box.minZ;
  const pathLength = layout.start.z - box.maxZ + s.trees.offset * 2;
  const moonAt: [number, number, number] = [width * s.moon.right, s.moon.height, box.minZ - s.moon.behind];
  const light = haunted ? s.hauntedLight : s.light;
  // The worn ground leaves the graves, lanterns and path clear, so nothing hides a stone or the way in.
  const keepClear = useCallback(
    (x: number, z: number) => {
      const c = walkHaunt.groundClear;
      if (Math.abs(x) < s.path.width / 2 + c.pathMargin && z > box.maxZ) return true;
      if (layout.graves.some((grave) => Math.hypot(grave.x - x, grave.z - z) < c.grave)) return true;
      return layout.lanterns.some((spot) => Math.hypot(spot.x - x, spot.z - z) < c.lantern);
    },
    [layout, box, s.path.width]
  );
  const groundPlane = useMemo(
    () => ({ width: width + s.groundMargin * 2, depth: depth + s.groundMargin * 2, center: [(box.minX + box.maxX) / 2, (box.minZ + box.maxZ) / 2] as [number, number] }),
    [width, depth, box, s.groundMargin]
  );
  const bare = useMemo(() => {
    const random = seeded(seed ^ walkMaterial.bareTreeSeed);
    return Array.from({ length: walkYard.bareTrees }, (_, i) => ({
      x: i % 2 === 0 ? box.minX - s.bareTree.offset : box.maxX + s.bareTree.offset,
      z: box.maxZ - random() * depth,
      turn: random() * Math.PI * 2,
    }));
  }, [box, depth, seed, s.bareTree.offset]);
  return (
    <>
      <color attach="background" args={[colors.sky]} />
      <ambientLight color={colors.ambient} intensity={light.ambient} />
      <hemisphereLight args={[colors.skyLight, colors.sky, light.sky]} />
      <directionalLight position={moonAt} color={colors.moonlight} intensity={light.moon} />
      <directionalLight position={[-width / 4, s.moon.height / 2, layout.start.z + depth]} color={colors.moonlight} intensity={light.fill} />
      {/* The moon, high over the back of the yard. Fog is off so it stays visible. Haunted, it shows tonight's real phase. */}
      <group position={moonAt}>
        {haunted ? (
          <PhasedMoon radius={s.moon.radius} halo={s.moon.halo} haloColor={colors.halo} haloOpacity={s.moon.haloOpacity} />
        ) : (
          <>
            <mesh>
              <sphereGeometry args={[s.moon.radius, ...walkMaterial.segments.moon]} />
              <meshBasicMaterial color={colors.moon} fog={false} />
            </mesh>
            <mesh position={[0, 0, -s.moon.radius]}>
              <circleGeometry args={[s.moon.halo, walkMaterial.segments.halo]} />
              <meshBasicMaterial color={colors.halo} transparent opacity={s.moon.haloOpacity} fog={false} depthWrite={false} />
            </mesh>
          </>
        )}
      </group>
      {haunted ? (
        <HauntedGround bounds={box} plane={groundPlane} keepClear={keepClear} seed={seed} />
      ) : (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[groundPlane.center[0], 0, groundPlane.center[1]]}>
          <planeGeometry args={[groundPlane.width, groundPlane.depth]} />
          <meshStandardMaterial color={colors.ground} roughness={walkMaterial.ground.roughness} />
        </mesh>
      )}
      {/* The worn path from where the witch waits, in through the gate. */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, s.path.lift, box.maxZ + pathLength / 2 - s.trees.offset]}>
        <planeGeometry args={[s.path.width, pathLength]} />
        <meshStandardMaterial color={walkColors.path} roughness={walkMaterial.ground.roughness} />
      </mesh>
      <Fence box={box} colors={colors} onGate={onGate} />
      <Trees box={box} colors={colors} seed={seed} />
      {bare.map((tree, i) => (
        <BareTree key={i} x={tree.x} z={tree.z} turn={tree.turn} colors={colors} />
      ))}
      {layout.lanterns.map((spot, i) => (
        <Lantern key={i} position={[spot.x, 0, spot.z]} still={still} colors={colors} />
      ))}
      <Mist box={box} colors={colors} still={still} />
      {haunted && (
        <>
          <NightSky center={[(box.minX + box.maxX) / 2, 0, (box.minZ + box.maxZ) / 2]} seed={seed} />
          <DriftingClouds at={[moonAt[0], moonAt[1], moonAt[2] + walkHaunt.cloudsBefore]} seed={seed} still={still} />
          <WatchingEyes bounds={box} beyond={walkHaunt.eyesBeyond} watching={[(box.minX + box.maxX) / 2, 0, (box.minZ + box.maxZ) / 2]} seed={seed} still={still} />
        </>
      )}
    </>
  );
}
