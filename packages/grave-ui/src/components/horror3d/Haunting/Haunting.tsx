/**
 * Haunting - what makes a 3D graveyard frightening rather than pretty: glow,
 * grain and a dark vignette over the picture, a black sky with stars, clouds
 * dragging across the moon, eyes that watch from the trees and blink, and a
 * glow round each grave in the colour of how serious it is.
 *
 * Every piece takes `still`: with reduced motion nothing drifts, blinks,
 * flickers or crawls, but everything is still there.
 * @module components/horror3d/Haunting
 */
import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Bloom, EffectComposer, Noise, Vignette } from '@react-three/postprocessing';
import { AdditiveBlending, BackSide, BufferGeometry, CanvasTexture, Color, Float32BufferAttribute, SRGBColorSpace, type Group, type Mesh, type PointLight, type Texture } from 'three';
import type { TombstoneWeathering } from '../../crypt/TombstoneCard/TombstoneCard';
import { seeded } from '../seeded';
import { graveGlow, hauntAura, hauntClouds, hauntEffects, hauntEyes, hauntSky, hauntSoftSpot } from './tokens';

/** Halfway down a sphere's texture is its horizon. */
const EQUATOR = 0.5;
/** Half, for centring things. */
const HALF = 0.5;
/** A full turn, in radians. */
const TURN = Math.PI * 2;
/** Coordinates per point in a position buffer. */
const XYZ = 3;
/** The four sides of a yard. */
const SIDES = 4;
/** Drawn white, so a material's colour tints it to anything. */
const white = (alpha: number) => `rgba(255, 255, 255, ${alpha})`;

let softSpot: Texture | null = null;
/** One soft white spot, bright in the middle and fading to nothing, shared by every glow and cloud. */
export const softSpotTexture = (): Texture => {
  if (softSpot) return softSpot;
  const { size, middle } = hauntSoftSpot;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext('2d');
  if (context) {
    const centre = size * HALF;
    const gradient = context.createRadialGradient(centre, centre, 0, centre, centre, centre);
    gradient.addColorStop(0, white(1));
    gradient.addColorStop(HALF, white(middle));
    gradient.addColorStop(1, white(0));
    context.fillStyle = gradient;
    context.fillRect(0, 0, size, size);
  }
  softSpot = new CanvasTexture(canvas);
  softSpot.colorSpace = SRGBColorSpace;
  return softSpot;
};

/** A colour made brighter than white, so the glow picks it up. */
const burning = (color: string, brightness: number) => new Color(color).multiplyScalar(brightness);

/** Props for {@link HauntEffects}. */
export interface HauntEffectsProps {
  /** Leave out the film grain, which moves every frame. For reduced motion. */
  still?: boolean;
}

/** Glow round bright things, a dark vignette, and film grain, over the whole picture. Place inside the `Canvas`. */
export function HauntEffects({ still = false }: HauntEffectsProps) {
  const { bloom, vignette, grain } = hauntEffects;
  const glow = <Bloom mipmapBlur luminanceThreshold={bloom.threshold} luminanceSmoothing={bloom.smoothing} intensity={bloom.intensity} radius={bloom.radius} />;
  const dark = <Vignette eskil={false} offset={vignette.offset} darkness={vignette.darkness} />;
  // Two composers rather than one with a missing child: the composer expects every child to be an effect.
  return still ? (
    <EffectComposer multisampling={0}>
      {glow}
      {dark}
    </EffectComposer>
  ) : (
    <EffectComposer multisampling={0}>
      {glow}
      {dark}
      <Noise premultiply opacity={grain} />
    </EffectComposer>
  );
}

const skyTexture = (): Texture => {
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = hauntSky.textureHeight;
  const context = canvas.getContext('2d');
  if (context) {
    const gradient = context.createLinearGradient(0, 0, 0, hauntSky.textureHeight);
    gradient.addColorStop(0, hauntSky.top);
    gradient.addColorStop(hauntSky.middleAt * EQUATOR, hauntSky.middle);
    gradient.addColorStop(EQUATOR, hauntSky.horizon);
    gradient.addColorStop(1, hauntSky.middle);
    context.fillStyle = gradient;
    context.fillRect(0, 0, 1, hauntSky.textureHeight);
  }
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  return texture;
};

/** Props for {@link NightSky}. */
export interface NightSkyProps {
  /** Where the dome is centred, usually the middle of the yard. @default [0, 0, 0] */
  center?: [number, number, number];
  /** Places the stars, so the same sky always has the same stars. @default 1 */
  seed?: number;
}

/** A dark dome over everything, with a sick glow on the horizon and a sky of stars. Unaffected by fog. */
export function NightSky({ center = [0, 0, 0], seed = 1 }: NightSkyProps) {
  const texture = useMemo(skyTexture, []);
  const s = hauntSky.stars;
  const stars = useMemo(() => {
    const random = seeded(seed);
    const radius = hauntSky.radius * s.radiusShare;
    const points: number[] = [];
    while (points.length < s.count * XYZ) {
      const turn = random() * TURN;
      // Spread evenly over the dome, not bunched at the top.
      const rise = Math.acos(1 - random());
      const y = Math.cos(rise) * radius;
      if (y < s.minHeight) continue;
      points.push(Math.sin(rise) * Math.cos(turn) * radius, y, Math.sin(rise) * Math.sin(turn) * radius);
    }
    const geometry = new BufferGeometry();
    geometry.setAttribute('position', new Float32BufferAttribute(points, XYZ));
    return geometry;
  }, [seed, s.count, s.minHeight, s.radiusShare]);
  return (
    <group position={center}>
      <mesh raycast={() => null}>
        <sphereGeometry args={[hauntSky.radius, ...hauntSky.segments]} />
        <meshBasicMaterial map={texture} side={BackSide} fog={false} depthWrite={false} />
      </mesh>
      <points geometry={stars} raycast={() => null}>
        <pointsMaterial color={s.color} size={s.size} transparent opacity={s.opacity} fog={false} depthWrite={false} />
      </points>
    </group>
  );
}

/** Props for {@link DriftingClouds}. */
export interface DriftingCloudsProps {
  /** Where the clouds hang: just in front of the moon. */
  at: [number, number, number];
  /** Places the clouds. @default 7 */
  seed?: number;
  /** Clouds hold still, for reduced motion. */
  still?: boolean;
}

/** Low black clouds dragging slowly across the moon. */
export function DriftingClouds({ at, seed = 7, still = false }: DriftingCloudsProps) {
  const c = hauntClouds;
  const clouds = useMemo(() => {
    const random = seeded(seed);
    return Array.from({ length: c.count }, () => ({
      x: (random() - HALF) * c.spreadX,
      y: (random() - HALF) * c.spreadY,
      phase: random() * TURN,
      scale: c.minScale + random() * c.scaleRange,
    }));
  }, [seed, c.count, c.spreadX, c.spreadY, c.minScale, c.scaleRange]);
  const meshes = useRef<(Mesh | null)[]>([]);
  useFrame(({ clock }) => {
    if (still) return;
    meshes.current.forEach((mesh, i) => {
      const cloud = clouds[i];
      if (mesh && cloud) mesh.position.x = cloud.x + Math.sin(clock.elapsedTime * c.speed + cloud.phase) * c.drift;
    });
  });
  const texture = softSpotTexture();
  return (
    <group position={at}>
      {clouds.map((cloud, i) => (
        <mesh
          key={i}
          ref={(mesh) => {
            meshes.current[i] = mesh;
          }}
          position={[cloud.x, cloud.y, i * c.layerGap]}
          scale={[cloud.scale, cloud.scale * c.flatness + c.flatness, 1]}
          raycast={() => null}
        >
          <planeGeometry args={[c.width, c.height]} />
          <meshBasicMaterial map={texture} color={c.color} transparent opacity={c.opacity} fog={false} depthWrite={false} />
        </mesh>
      ))}
    </group>
  );
}

/** Props for {@link WatchingEyes}. */
export interface WatchingEyesProps {
  /** The yard's edge. The eyes watch from beyond it. */
  bounds: { minX: number; maxX: number; minZ: number; maxZ: number };
  /** How far beyond the edge they hang. */
  beyond: number;
  /** Where they look: the middle of the yard. @default [0, 0, 0] */
  watching?: [number, number, number];
  /** Places the eyes. @default 13 */
  seed?: number;
  /** The eyes stay open, for reduced motion. */
  still?: boolean;
}

/** Pairs of eyes in the dark beyond the fence. They burn, watch the yard, and blink. */
export function WatchingEyes({ bounds, beyond, watching = [0, 0, 0], seed = 13, still = false }: WatchingEyesProps) {
  const e = hauntEyes;
  const pairs = useMemo(() => {
    const random = seeded(seed);
    return Array.from({ length: e.pairs }, (_, i) => {
      const side = i % SIDES;
      const along = random();
      const x = side === 0 ? bounds.minX - beyond : side === 1 ? bounds.maxX + beyond : bounds.minX + along * (bounds.maxX - bounds.minX);
      const z = side === 2 ? bounds.minZ - beyond : side === 3 ? bounds.maxZ + beyond : bounds.minZ + along * (bounds.maxZ - bounds.minZ);
      return {
        x,
        z,
        y: e.height + random() * e.heightJitter,
        color: burning(e.colors[i % e.colors.length], e.brightness),
        phase: random() * e.blinkEvery,
      };
    });
  }, [bounds, beyond, seed, e]);
  const groups = useRef<(Group | null)[]>([]);
  useFrame(({ clock }) => {
    groups.current.forEach((group, i) => {
      const pair = pairs[i];
      if (!group || !pair) return;
      const blink = !still && (clock.elapsedTime + pair.phase) % e.blinkEvery < e.blinkLength;
      group.scale.y = blink ? e.shut : 1;
      group.lookAt(watching[0], pair.y, watching[2]);
    });
  });
  return (
    <group>
      {pairs.map((pair, i) => (
        <group
          key={i}
          ref={(group) => {
            groups.current[i] = group;
          }}
          position={[pair.x, pair.y, pair.z]}
        >
          {[-1, 1].map((side) => (
            <mesh key={side} position={[side * e.gap, 0, 0]} raycast={() => null}>
              <sphereGeometry args={[e.size, ...e.segments]} />
              <meshBasicMaterial color={pair.color} toneMapped={false} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}

/** Props for {@link GraveAura}. */
export interface GraveAuraProps {
  /** How worn the grave is, which picks its colour. */
  weathering: TombstoneWeathering;
  /** The grave being pointed at, or reached: its colour lights the stone too. */
  lit?: boolean;
  /** The candle holds steady, for reduced motion. */
  still?: boolean;
}

/**
 * The glow round one grave, in its stone's own space: a soft light behind the
 * stone, a pool on the ground in front of it, and a small candle at its foot,
 * all in the colour of how serious the grave is.
 */
export function GraveAura({ weathering, lit = false, still = false }: GraveAuraProps) {
  const glow = graveGlow[weathering];
  const a = hauntAura;
  const k = a.candle;
  const texture = softSpotTexture();
  const flame = useRef<Mesh>(null);
  const light = useRef<PointLight>(null);
  const flameColor = useMemo(() => burning(glow.color, k.brightness), [glow.color, k.brightness]);
  // Each candle starts somewhere different in its flicker.
  const offset = useMemo(() => Math.random() * TURN, []);
  useFrame(({ clock }) => {
    if (still) return;
    const t = clock.elapsedTime + offset;
    const flicker = 1 + k.flickerSpeeds.reduce((sum, speed) => sum + Math.sin(t * speed) * k.flicker, 0);
    if (flame.current) flame.current.scale.setScalar(flicker);
    if (light.current) light.current.intensity = a.light.intensity * glow.strength * flicker;
  });
  return (
    <group>
      <mesh position={[0, a.behind.y, a.behind.z]} raycast={() => null}>
        <planeGeometry args={[a.behind.width, a.behind.height]} />
        <meshBasicMaterial map={texture} color={glow.color} transparent opacity={a.behind.opacity * glow.strength} blending={AdditiveBlending} depthWrite={false} />
      </mesh>
      <mesh position={[0, a.pool.lift, a.pool.z]} rotation={[-Math.PI / 2, 0, 0]} raycast={() => null}>
        <planeGeometry args={[a.pool.radius * 2, a.pool.radius * 2]} />
        <meshBasicMaterial map={texture} color={glow.color} transparent opacity={a.pool.opacity * glow.strength} blending={AdditiveBlending} depthWrite={false} />
      </mesh>
      <group position={[k.x, 0, k.z]}>
        <mesh position={[0, k.height * HALF, 0]} raycast={() => null}>
          <cylinderGeometry args={[k.radius, k.radius, k.height, k.segments]} />
          <meshStandardMaterial color={k.wax} roughness={k.waxRoughness} />
        </mesh>
        <mesh ref={flame} position={[0, k.height + k.flame, 0]} raycast={() => null}>
          <sphereGeometry args={[k.flame, ...k.flameSegments]} />
          <meshBasicMaterial color={flameColor} toneMapped={false} />
        </mesh>
      </group>
      {lit && <pointLight ref={light} position={[0, a.light.y, a.light.z]} color={glow.color} intensity={a.light.intensity * glow.strength} distance={a.light.distance} />}
    </group>
  );
}
