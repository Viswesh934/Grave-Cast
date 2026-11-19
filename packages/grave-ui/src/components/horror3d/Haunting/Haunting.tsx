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
import { Billboard } from '@react-three/drei';
import { Bloom, EffectComposer, Noise, Vignette } from '@react-three/postprocessing';
import { AdditiveBlending, BackSide, BufferGeometry, CanvasTexture, Color, Float32BufferAttribute, SRGBColorSpace, type Group, type Mesh, type PointLight, type Texture } from 'three';
import type { TombstoneWeathering } from '../../crypt/TombstoneCard/TombstoneCard';
import type { MoonPhase } from '../../lycan/LunarPhaseSelector/LunarPhaseSelector';
import { moonPhaseOn, type MoonOnDay } from '../../lycan/LunarPhaseSelector/moonPhase';
import { seeded } from '../seeded';
import { graveGlow, hauntAura, hauntClouds, hauntEffects, hauntEyes, hauntMoon, hauntSky, hauntSoftSpot } from './tokens';

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

/** How each named phase lights the face: share of it lit and which side grows. Matches `MOON_PHASES`. */
const PHASE_LIGHT: Record<MoonPhase, { lit: number; waxing: boolean }> = {
  new: { lit: 0, waxing: true },
  'waxing-crescent': { lit: 0.25, waxing: true },
  'first-quarter': { lit: 0.5, waxing: true },
  'waxing-gibbous': { lit: 0.75, waxing: true },
  full: { lit: 1, waxing: true },
  'blood-moon': { lit: 1, waxing: true },
  'waning-gibbous': { lit: 0.75, waxing: false },
  'third-quarter': { lit: 0.5, waxing: false },
  'waning-crescent': { lit: 0.25, waxing: false },
};

/** Draws the moon's face: seas and craters, seeded so it is always the same face. */
const paintFace = (context: CanvasRenderingContext2D, centre: number, radius: number, blood: boolean) => {
  const m = hauntMoon;
  const random = seeded(m.seed);
  context.fillStyle = blood ? m.blood : m.face;
  context.beginPath();
  context.arc(centre, centre, radius, 0, TURN);
  context.fill();
  const blot = (spread: number, size: number, color: string, opacity: number) => {
    const angle = random() * TURN;
    const out = Math.sqrt(random()) * spread * radius;
    context.globalAlpha = opacity;
    context.fillStyle = color;
    context.beginPath();
    context.arc(centre + Math.cos(angle) * out, centre + Math.sin(angle) * out, size * radius, 0, TURN);
    context.fill();
  };
  for (let i = 0; i < m.sea.count; i += 1) blot(m.sea.spread, m.sea.minRadius + random() * m.sea.radiusRange, blood ? m.bloodSeas : m.seas, m.sea.opacity);
  for (let i = 0; i < m.crater.count; i += 1) blot(m.crater.spread, m.crater.minRadius + random() * m.crater.radiusRange, blood ? m.bloodSeas : m.craters, m.crater.opacity);
  context.globalAlpha = 1;
};

/**
 * The lit part of the face. The bright limb is a half circle; the terminator
 * is half an ellipse whose width follows how much is lit, bulging out for a
 * crescent and in for a gibbous moon. Waxing moons are lit on the right, as
 * seen from the northern half of the world.
 */
const litPath = (context: CanvasRenderingContext2D, centre: number, radius: number, lit: number, waxing: boolean) => {
  const across = radius * Math.abs(1 - lit * 2);
  context.save();
  context.translate(centre, centre);
  if (!waxing) context.scale(-1, 1);
  context.beginPath();
  context.arc(0, 0, radius, -Math.PI * HALF, Math.PI * HALF, false);
  if (lit < HALF) context.ellipse(0, 0, across, radius, 0, Math.PI * HALF, -Math.PI * HALF, true);
  else context.ellipse(0, 0, across, radius, 0, Math.PI * HALF, Math.PI * (1 + HALF), false);
  context.closePath();
  context.restore();
};

const moonTexture = (lit: number, waxing: boolean, blood: boolean): Texture => {
  const m = hauntMoon;
  const canvas = document.createElement('canvas');
  canvas.width = m.textureSize;
  canvas.height = m.textureSize;
  const context = canvas.getContext('2d');
  if (context) {
    const centre = m.textureSize * HALF;
    const radius = centre * m.faceShare;
    // The whole face, faint: the dark part lit only by light off the Earth.
    context.globalAlpha = m.earthshine;
    const faint = document.createElement('canvas');
    faint.width = m.textureSize;
    faint.height = m.textureSize;
    const faintContext = faint.getContext('2d');
    if (faintContext) {
      paintFace(faintContext, centre, radius, blood);
      context.drawImage(faint, 0, 0);
      context.globalAlpha = 1;
      // Then the sunlit part, at full strength.
      litPath(context, centre, radius, lit, waxing);
      context.save();
      context.clip();
      context.clearRect(0, 0, m.textureSize, m.textureSize);
      context.drawImage(faint, 0, 0);
      context.restore();
    }
  }
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  return texture;
};

/** Props for {@link PhasedMoon}. */
export interface PhasedMoonProps {
  /** The moon's radius, in scene units. */
  radius: number;
  /** The radius of the soft halo round it. */
  halo: number;
  /** The halo's colour. */
  haloColor: string;
  /** How strong the halo is at full moon, 0 to 1. */
  haloOpacity: number;
  /**
   * Which phase to show, from the Groove UI lunar phases. Leave it out for
   * tonight's real phase, worked out on the device from the date.
   */
  phase?: MoonPhase;
}

/**
 * The moon in a phase: a cratered face drawn once on the device, lit on the
 * side the sun is, with the unlit part faintly showing. It always turns to
 * face the camera and ignores fog. Place it at the moon's position.
 */
export function PhasedMoon({ radius, halo, haloColor, haloOpacity, phase }: PhasedMoonProps) {
  // Tonight's phase is read once when the moon is placed; it changes too slowly to watch.
  const tonight = useMemo<MoonOnDay | null>(() => (phase ? null : moonPhaseOn()), [phase]);
  const light = phase ? PHASE_LIGHT[phase] : { lit: tonight?.lit ?? 1, waxing: tonight?.waxing ?? true };
  const blood = phase === 'blood-moon';
  const texture = useMemo(() => moonTexture(light.lit, light.waxing, blood), [light.lit, light.waxing, blood]);
  const glow = useMemo(() => new Color(1, 1, 1).multiplyScalar(hauntMoon.brightness), []);
  const haloShare = hauntMoon.haloFloor + (1 - hauntMoon.haloFloor) * light.lit;
  return (
    <Billboard>
      <mesh position={[0, 0, -radius]} raycast={() => null}>
        <circleGeometry args={[halo, hauntSky.segments[0]]} />
        <meshBasicMaterial color={blood ? hauntMoon.blood : haloColor} transparent opacity={haloOpacity * haloShare} fog={false} depthWrite={false} />
      </mesh>
      <mesh raycast={() => null}>
        <planeGeometry args={[radius * 2, radius * 2]} />
        <meshBasicMaterial map={texture} color={glow} transparent fog={false} depthWrite={false} toneMapped={false} />
      </mesh>
    </Billboard>
  );
}
