/**
 * GraveyardWalk3D - A graveyard you walk through as the witch on her broom, seen from behind
 * @module components/horror3d/GraveyardWalk3D
 */
import { Suspense, useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useFrame, useThree, type ThreeEvent } from '@react-three/fiber';
import { Html, Text } from '@react-three/drei';
import { DoubleSide, type Group, type Mesh, type PointLight } from 'three';
import { zLayers } from '../../../tokens/layers';
import type { TombstoneWeathering } from '../../crypt/TombstoneCard/TombstoneCard';
import { GRAVEYARD_SCENE_THEMES, Stone, type GraveyardSceneColors, type GraveyardSceneTheme, type YardStone } from '../GraveyardScene3D';
import { layoutWalkYard, routeTo, steer, turnToward, walkSeed, yawOf, type WalkGraveSpot, type WalkPoint, type WalkYardLayout } from './layout';
import { GraveAura, HauntEffects } from '../Haunting/Haunting';
import { graveGlow } from '../Haunting/tokens';
import { WalkScenery } from './Scenery';
import { walkCamera, walkColors, walkCracks, walkFog, walkMotion, walkRender, walkStone, walkWeathering, walkWitch } from './tokens';
import { useWitchTexture, WITCH_ASPECT } from './witchTexture';

/** One grave in the walk. Each stands for one finding. */
export interface GraveyardWalk3DGrave {
  /** Stable id. The yard's layout is seeded from the ids, so the same graves always stand in the same places. */
  id: string;
  /** Carved on the stone. Keep it short. */
  title: string;
  /** Carved under the title, such as a file name. */
  subtitle?: string;
  /** How worn the stone looks, from pristine to crumbling. */
  weathering: TombstoneWeathering;
}

/**
 * Props for {@link GraveyardWalk3D}.
 */
export interface GraveyardWalk3DProps {
  /** The graves. One stone is placed for each, so the count is always exact. */
  graves: readonly GraveyardWalk3DGrave[];
  /**
   * The grave the witch should fly to, by index. Leave it out to let clicks
   * steer her on their own; pass it (with `onPick`) to steer her from elsewhere
   * too, such as a list of the graves.
   */
  target?: number | null;
  /** Called when a grave is clicked. */
  onPick?: (index: number) => void;
  /** Called once she hangs beside the grave. */
  onArrive?: (index: number) => void;
  /** What to show above the grave she has reached, such as what is wrong there. */
  renderArrived?: (index: number) => ReactNode;
  /** The yard's look. @default 'grove' */
  theme?: GraveyardSceneTheme;
  /** No flying, drifting or flicker: she appears beside a grave at once. For reduced motion. */
  still?: boolean;
  /** Turn the view with the left and right arrow keys. @default true */
  turnKeys?: boolean;
  /**
   * Make the yard frightening: each grave glows in the colour of how serious it
   * is, with a candle at its foot; a black sky with stars, clouds over the moon,
   * eyes in the trees, closer fog, and glow, grain and a vignette over the picture.
   * @default true
   */
  haunted?: boolean;
}

/** What the flight keeps between frames. Kept out of React, so a frame never re-renders anything. */
interface Flight {
  pos: WalkPoint;
  vel: WalkPoint;
  /** The way she faces, as a yaw. */
  heading: number;
  /** The points still to fly through. The last is beside the grave. */
  path: WalkPoint[];
  /** The grave she is flying to or beside, or -1. */
  going: number;
  elapsed: number;
  expected: number;
  /** The camera's yaw and pitch, which the person turns by dragging. */
  yaw: number;
  pitch: number;
  /** The camera swings round behind her until it gets there or the person takes over. */
  follow: boolean;
  /** 1 when she faces right on screen, -1 when left. */
  facing: number;
  placed: boolean;
}

const startFlight = (layout: WalkYardLayout): Flight => ({
  pos: { ...layout.start },
  vel: { x: 0, z: 0 },
  heading: 0,
  path: [],
  going: -1,
  elapsed: 0,
  expected: 0,
  yaw: 0,
  pitch: 0,
  follow: false,
  facing: 1,
  placed: false,
});

const pathLength = (from: WalkPoint, path: readonly WalkPoint[]): number =>
  path.reduce((total, point, i) => {
    const previous = i === 0 ? from : path[i - 1];
    return total + Math.hypot(point.x - previous.x, point.z - previous.z);
  }, 0);

const isTyping = (target: EventTarget | null): boolean =>
  target instanceof HTMLElement && (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName));

/** The middle of a plane, as a share of its size: drawing positions are measured from here. */
const CENTRE = 0.5;

interface FindingGraveProps {
  grave: GraveyardWalk3DGrave;
  spot: WalkGraveSpot;
  index: number;
  colors: GraveyardSceneColors;
  hovered: boolean;
  current: boolean;
  onHover: (index: number | null) => void;
  onPick: (index: number) => void;
  haunted: boolean;
  still: boolean;
}

/** One finding's grave: a stone worn to its weathering, with its words carved on the face. */
function FindingGrave({ grave, spot, index, colors, hovered, current, onHover, onPick, haunted, still }: FindingGraveProps) {
  const look = walkWeathering[grave.weathering];
  // Haunted, the grave's own colour marks it: its carved title, and the ring round it.
  const marked = haunted ? graveGlow[grave.weathering].color : walkColors.ring;
  // Worn stones lean, each its own way.
  const lean = look.lean * (index % 2 === 0 ? 1 : -1);
  const stone: YardStone = { kind: spot.kind, position: [0, 0, 0], rotation: [0, 0, 0], scale: 1 };
  const ring = walkStone.ring;
  return (
    <group position={[spot.x, 0, spot.z]} rotation={[0, spot.turn, 0]}>
      <group
        position={[0, -look.sink, 0]}
        rotation={[0, 0, lean]}
        scale={walkStone.scale}
        onClick={(event: ThreeEvent<MouseEvent>) => {
          // A press that turned the view is not a click on the grave.
          if (event.delta > walkCamera.clickSlopPx) return;
          event.stopPropagation();
          onPick(index);
        }}
        onPointerOver={(event: ThreeEvent<PointerEvent>) => {
          event.stopPropagation();
          onHover(index);
        }}
        onPointerOut={() => onHover(null)}
      >
        <Stone stone={stone} colors={colors} tint={look.tint} />
        {/* The words wait for their font on their own, so the stone shows at once and the scene never stalls. */}
        <Suspense fallback={null}>
        <Text
          position={[0, walkStone.titleY, walkStone.faceZ]}
          fontSize={walkStone.titleSize}
          maxWidth={walkStone.textWidth}
          textAlign="center"
          anchorX="center"
          anchorY="middle"
          color={haunted ? marked : walkColors.text}
          outlineWidth={walkStone.titleSize * walkRender.outlineShare}
          outlineColor={walkColors.textOutline}
        >
          {grave.title}
        </Text>
        {grave.subtitle && (
          <Text
            position={[0, walkStone.subtitleY, walkStone.faceZ]}
            fontSize={walkStone.subtitleSize}
            maxWidth={walkStone.textWidth}
            textAlign="center"
            anchorX="center"
            anchorY="top"
            color={walkColors.text}
            outlineWidth={walkStone.subtitleSize * walkRender.outlineShare}
            outlineColor={walkColors.textOutline}
          >
            {grave.subtitle}
          </Text>
        )}
        </Suspense>
        {walkCracks.slice(0, look.cracks).map((crack, i) => (
          <mesh key={i} position={[crack.x, crack.y, walkStone.faceZ]} rotation={[0, 0, crack.turn]}>
            <boxGeometry args={[walkStone.crack.width, walkStone.crack.length, walkStone.crack.depth]} />
            <meshBasicMaterial color={walkColors.crack} />
          </mesh>
        ))}
      </group>
      {haunted && <GraveAura weathering={grave.weathering} lit={hovered || current} still={still} />}
      {(hovered || current) && (
        <mesh position={[0, ring.lift, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[ring.inner, ring.outer, ring.segments]} />
          <meshBasicMaterial color={marked} transparent opacity={current ? ring.current : ring.hover} depthWrite={false} />
        </mesh>
      )}
    </group>
  );
}

/**
 * GraveyardWalk3D - a fenced graveyard at night, walked as the witch on her broom.
 *
 * One grave stands for each item in `graves`, scattered through the yard with
 * room to walk between them, and worn to its weathering. The witch (the
 * `WitchOnBroom` drawing) starts outside the gate, facing in, with the camera
 * behind her shoulder, as in a third-person game.
 *
 * - **Look around:** hold the left mouse button and drag. The arrow keys turn too.
 * - **Go to a grave:** click it. She flies through the gate and round the
 *   other stones, and the camera swings in behind her. Once she is beside it,
 *   `onArrive` is called and `renderArrived` is shown above the grave.
 *
 * Place it inside a `Canvas`; use `walkCamera`'s `fov`, `near` and `far` for
 * the camera. Everything is drawn for the graves given and nothing else, so no
 * stone in the yard is there for show.
 *
 * @example
 * ```tsx
 * <Canvas camera={{ fov: walkCamera.fov, near: walkCamera.near, far: walkCamera.far }}>
 *   <GraveyardWalk3D
 *     graves={findings.map((f) => ({ id: f.id, title: f.kind, subtitle: f.file, weathering: 'aged' }))}
 *     renderArrived={(i) => <p>{findings[i].problem}</p>}
 *   />
 * </Canvas>
 * ```
 */
export function GraveyardWalk3D({
  graves,
  target,
  onPick,
  onArrive,
  renderArrived,
  theme = 'grove',
  still = false,
  turnKeys = true,
  haunted = true,
}: GraveyardWalk3DProps) {
  const colors: GraveyardSceneColors = GRAVEYARD_SCENE_THEMES[theme];
  const ids = graves.map((grave) => grave.id).join('\n');
  const seed = useMemo(() => walkSeed(ids), [ids]);
  const layout = useMemo(() => layoutWalkYard(ids === '' ? 0 : ids.split('\n').length, seed), [ids, seed]);
  const texture = useWitchTexture();
  const gl = useThree((state) => state.gl);

  const [ownTarget, setOwnTarget] = useState<number | null>(null);
  const [hovered, setHovered] = useState<number | null>(null);
  const [arrived, setArrived] = useState<number | null>(null);
  const goal = target !== undefined ? target : ownTarget;

  const flight = useRef<Flight>(startFlight(layout));
  const dragging = useRef(false);
  const hoveredRef = useRef<number | null>(null);
  const callbacks = useRef({ onArrive });
  callbacks.current = { onArrive };

  const witch = useRef<Group>(null);
  const billboard = useRef<Group>(null);
  const flip = useRef<Group>(null);
  const shadow = useRef<Mesh>(null);
  const lamp = useRef<PointLight>(null);

  const drawing = { width: walkWitch.width, height: walkWitch.width / WITCH_ASPECT };

  const arrive = useCallback(
    (index: number) => {
      const f = flight.current;
      const grave = layout.graves[index];
      f.path = [];
      f.vel = { x: 0, z: 0 };
      if (grave) f.heading = yawOf({ x: grave.x - f.pos.x, z: grave.z - f.pos.z });
      f.follow = true;
      setArrived(index);
      callbacks.current.onArrive?.(index);
    },
    [layout]
  );

  // A new set of graves is a new yard: back outside the gate.
  useEffect(() => {
    flight.current = startFlight(layout);
    setArrived(null);
    setOwnTarget(null);
  }, [layout]);

  // Set off for the grave asked for.
  useEffect(() => {
    if (goal === null || goal === undefined || !layout.graves[goal]) return;
    const f = flight.current;
    if (f.going === goal) return;
    f.going = goal;
    f.path = routeTo(f.pos, layout.graves[goal], layout);
    f.elapsed = 0;
    f.expected = pathLength(f.pos, f.path) / walkWitch.speed;
    f.follow = true;
    setArrived(null);
    if (still) {
      f.pos = { ...f.path[f.path.length - 1] };
      arrive(goal);
    }
  }, [goal, layout, still, arrive]);

  const pick = useCallback(
    (index: number) => {
      onPick?.(index);
      if (target === undefined) setOwnTarget(index);
    },
    [onPick, target]
  );

  const hover = useCallback(
    (index: number | null) => {
      hoveredRef.current = index;
      setHovered(index);
      if (!dragging.current) gl.domElement.style.cursor = index === null ? 'grab' : 'pointer';
    },
    [gl]
  );

  // Hold the left button and drag to look around. A short press is left alone, so it can click a grave.
  useEffect(() => {
    const element = gl.domElement;
    element.style.cursor = 'grab';
    element.style.touchAction = 'none';
    let press: { startX: number; startY: number; x: number; y: number; id: number; moved: boolean } | null = null;
    const down = (event: PointerEvent) => {
      if (event.button !== 0) return;
      press = { startX: event.clientX, startY: event.clientY, x: event.clientX, y: event.clientY, id: event.pointerId, moved: false };
    };
    const move = (event: PointerEvent) => {
      if (!press) return;
      if (!press.moved) {
        if (Math.hypot(event.clientX - press.startX, event.clientY - press.startY) < walkCamera.clickSlopPx) return;
        press.moved = true;
        dragging.current = true;
        flight.current.follow = false;
        element.setPointerCapture(press.id);
        element.style.cursor = 'grabbing';
      }
      const f = flight.current;
      f.yaw -= (event.clientX - press.x) * walkCamera.yawPerPx;
      f.pitch = Math.min(walkCamera.pitchMax, Math.max(walkCamera.pitchMin, f.pitch + (event.clientY - press.y) * walkCamera.pitchPerPx));
      press.x = event.clientX;
      press.y = event.clientY;
    };
    const up = () => {
      if (press?.moved && element.hasPointerCapture(press.id)) element.releasePointerCapture(press.id);
      press = null;
      dragging.current = false;
      element.style.cursor = hoveredRef.current === null ? 'grab' : 'pointer';
    };
    element.addEventListener('pointerdown', down);
    element.addEventListener('pointermove', move);
    element.addEventListener('pointerup', up);
    element.addEventListener('pointercancel', up);
    return () => {
      element.removeEventListener('pointerdown', down);
      element.removeEventListener('pointermove', move);
      element.removeEventListener('pointerup', up);
      element.removeEventListener('pointercancel', up);
      element.style.cursor = '';
    };
  }, [gl]);

  useEffect(() => {
    if (!turnKeys) return;
    const onKey = (event: KeyboardEvent) => {
      if (isTyping(event.target)) return;
      const turn = event.key === 'ArrowLeft' ? 1 : event.key === 'ArrowRight' ? -1 : 0;
      if (turn === 0) return;
      event.preventDefault();
      flight.current.yaw += turn * walkCamera.keyYaw;
      flight.current.follow = false;
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [turnKeys]);

  useFrame(({ camera, clock }, delta) => {
    const f = flight.current;
    const step = Math.min(delta, walkMotion.maxStepS);

    // The flight.
    if (f.path.length > 0) {
      f.elapsed += step;
      const next = f.path[0];
      const last = f.path.length === 1;
      const distance = Math.hypot(next.x - f.pos.x, next.z - f.pos.z);
      const stalled = f.elapsed > f.expected * walkWitch.stallFactor + walkWitch.stallGraceS;
      if (distance < walkWitch.arriveDistance || (last && stalled)) {
        if (last) {
          f.pos = { ...next };
          arrive(f.going);
        } else {
          f.path.shift();
        }
      } else {
        const direction = steer(f.pos, next, layout.graves);
        const speed = last ? Math.min(walkWitch.speed, distance * walkWitch.brake) : walkWitch.speed;
        const blend = 1 - Math.exp(-walkWitch.accel * step);
        f.vel = { x: f.vel.x + (direction.x * speed - f.vel.x) * blend, z: f.vel.z + (direction.z * speed - f.vel.z) * blend };
        f.pos = { x: f.pos.x + f.vel.x * step, z: f.pos.z + f.vel.z * step };
        if (Math.hypot(f.vel.x, f.vel.z) > walkMotion.turnSpeed) f.heading = yawOf(f.vel);
      }
    }

    // The camera swings in behind her while she flies, until the person turns it themselves.
    if (f.follow && !dragging.current) {
      f.yaw = still ? f.heading : turnToward(f.yaw, f.heading, 1 - Math.exp(-walkCamera.follow * step));
      if (f.path.length === 0 && Math.abs(turnToward(f.yaw, f.heading, 1) - f.yaw) < walkCamera.followDone) f.follow = false;
    }

    // Behind her and a little to the right, looking past her into the yard.
    const c = walkCamera;
    const forward = { x: -Math.sin(f.yaw), z: -Math.cos(f.yaw) };
    const right = { x: Math.cos(f.yaw), z: -Math.sin(f.yaw) };
    const wantX = f.pos.x - forward.x * c.distance + right.x * c.shoulder;
    const wantY = c.height + f.pitch * c.distance;
    const wantZ = f.pos.z - forward.z * c.distance + right.z * c.shoulder;
    const ease = still || !f.placed ? 1 : 1 - Math.exp(-c.ease * step);
    f.placed = true;
    camera.position.set(
      camera.position.x + (wantX - camera.position.x) * ease,
      camera.position.y + (wantY - camera.position.y) * ease,
      camera.position.z + (wantZ - camera.position.z) * ease
    );
    camera.lookAt(f.pos.x + forward.x * c.lookAhead + right.x * c.shoulder, c.lookHeight, f.pos.z + forward.z * c.lookAhead + right.z * c.shoulder);

    // The witch: where she is, turned to the camera, facing the way she goes.
    const bob = still ? 0 : Math.sin(clock.elapsedTime * Math.PI * 2 * walkWitch.bobHz) * walkWitch.bob;
    witch.current?.position.set(f.pos.x, bob, f.pos.z);
    const toCamera = Math.atan2(camera.position.x - f.pos.x, camera.position.z - f.pos.z);
    if (billboard.current) billboard.current.rotation.y = toCamera;
    // How far her heading points along the drawing's right edge, as the camera sees it.
    const sideways = -Math.sin(f.heading) * Math.cos(toCamera) + Math.cos(f.heading) * Math.sin(toCamera);
    if (sideways > walkWitch.flipThreshold) f.facing = 1;
    else if (sideways < -walkWitch.flipThreshold) f.facing = -1;
    flip.current?.scale.set(f.facing, 1, 1);
    shadow.current?.position.set(f.pos.x, walkStone.ring.lift, f.pos.z);
    lamp.current?.position.set(f.pos.x, walkWitch.lampHeight, f.pos.z);
  });

  const arrivedSpot = arrived === null ? null : layout.graves[arrived];

  return (
    <>
      <fog attach="fog" args={[colors.sky, haunted ? walkFog.haunted.near : walkFog.near, haunted ? walkFog.haunted.far : walkFog.far]} />
      <WalkScenery layout={layout} colors={colors} seed={seed} still={still} haunted={haunted} />
      {graves.map((grave, index) =>
        layout.graves[index] ? (
          <FindingGrave
            key={grave.id}
            grave={grave}
            spot={layout.graves[index]}
            index={index}
            colors={colors}
            hovered={hovered === index}
            current={arrived === index || goal === index}
            onHover={hover}
            onPick={pick}
            haunted={haunted}
            still={still}
          />
        ) : null
      )}
      <group ref={witch}>
        <group ref={billboard}>
          <group ref={flip}>
            <mesh
              position={[-(walkWitch.bodyAt - CENTRE) * drawing.width, walkWitch.broomHeight + (walkWitch.broomAt - CENTRE) * drawing.height, 0]}
              raycast={() => null}
            >
              <planeGeometry args={[drawing.width, drawing.height]} />
              <meshBasicMaterial map={texture} transparent alphaTest={walkRender.alphaTest} side={DoubleSide} toneMapped={false} />
            </mesh>
          </group>
        </group>
      </group>
      <mesh ref={shadow} rotation={[-Math.PI / 2, 0, 0]} raycast={() => null}>
        <circleGeometry args={[walkWitch.shadowRadius, walkStone.ring.segments]} />
        <meshBasicMaterial color={walkColors.shadow} transparent opacity={walkWitch.shadowOpacity} depthWrite={false} />
      </mesh>
      <pointLight ref={lamp} color={colors.lantern} intensity={walkWitch.lampIntensity} distance={walkWitch.lampDistance} decay={walkRender.lampDecay} />
      {arrivedSpot && renderArrived && arrived !== null && (
        <Html position={[arrivedSpot.x, walkStone.cardHeight, arrivedSpot.z]} zIndexRange={[zLayers.raised, zLayers.base]}>
          <div style={{ transform: 'translate(-50%, -100%)' }}>{renderArrived(arrived)}</div>
        </Html>
      )}
      {haunted && <HauntEffects still={still} />}
    </>
  );
}
