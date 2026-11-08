import { useRef, useMemo, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Float } from '@react-three/drei';
import { ShaderMaterial, type Mesh, Vector3, type Group, Shape } from 'three';
import type { HorrorIntensity } from '../../tokens/types';
import type { TombstoneWeathering } from '../crypt/TombstoneCard/TombstoneCard';
import { stoneVertexShader, stoneFragmentShader } from './shaders/StoneShader';
import { TORCHLIGHT_CONFIG } from './horror3d.config';
import { useHorrorFallback } from '../../hooks';

export type GothicRelief = 
  | 'sigil'          // Eldritch runic sigil with glowing spine
  | 'reaper'         // Grim Reaper hooded insignia
  | 'skull'          // Catacombs carved skull relief
  | 'gargoyle'       // Horned gargoyle stone visage
  | 'talisman'       // Occult crying eye talisman
  | 'none';

export interface TombstoneCard3DProps {
  title: string;
  subtitle?: string;
  epitaph?: string;
  weathering?: TombstoneWeathering;
  intensity?: HorrorIntensity;
  relief?: GothicRelief;
  fallback?: boolean;
  width?: number;
  height?: number;
  depth?: number;
}

/**
 * Gothic Relief Sculptor
 * Procedural 3D sculptural reliefs carved directly into the tombstone face.
 * Features intricate carved geometry, emissive occult accents, and gentle breathing.
 */
function ReliefSculpt({ relief, weatheringValue }: { relief: GothicRelief; weatheringValue: number }) {
  const reliefRef = useRef<Group>(null);

  useFrame((state) => {
    if (!reliefRef.current) return;
    const t = state.clock.elapsedTime;
    // Organic vein pulse through the relief
    const pulse = Math.sin(t * 3.0) * 0.05;
    reliefRef.current.scale.set(1 + pulse, 1 + pulse, 1);
  });

  if (relief === 'none') return null;

  const isEldritch = relief === 'sigil' || relief === 'talisman';
  const glowColor = isEldritch ? '#ff1e38' : '#e0e7ff';
  const emissiveIntensity = 0.5 + weatheringValue * 0.8;

  const isSigil = relief === 'sigil';
  const isTalisman = relief === 'talisman';
  const isSkull = relief === 'skull';
  const isReaper = relief === 'reaper';
  const isGargoyle = relief === 'gargoyle';

  return (
    <group ref={reliefRef} position={[0, 0.95, 0.21]}>
      {isSigil && (
        // Eldritch Runic Sigil
        <group scale={[0.22, 0.22, 0.22]}>
          {/* Central vertical spine */}
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[0.2, 2.2, 0.1]} />
            <meshStandardMaterial color="#3a080d" emissive={glowColor} emissiveIntensity={emissiveIntensity} roughness={0.4} />
          </mesh>
          {/* Upper left prong */}
          <mesh position={[-0.45, 0.55, 0]} rotation={[0, 0, 0.7]}>
            <boxGeometry args={[0.18, 1.1, 0.1]} />
            <meshStandardMaterial color="#3a080d" emissive={glowColor} emissiveIntensity={emissiveIntensity} roughness={0.4} />
          </mesh>
          {/* Upper right prong */}
          <mesh position={[0.45, 0.55, 0]} rotation={[0, 0, -0.7]}>
            <boxGeometry args={[0.18, 1.1, 0.1]} />
            <meshStandardMaterial color="#3a080d" emissive={glowColor} emissiveIntensity={emissiveIntensity} roughness={0.4} />
          </mesh>
          {/* Lower cross diamond */}
          <mesh position={[0, -0.2, 0]} rotation={[0, 0, 0.78]}>
            <boxGeometry args={[0.65, 0.65, 0.08]} />
            <meshStandardMaterial color="#1a0406" emissive={glowColor} emissiveIntensity={emissiveIntensity * 0.7} roughness={0.5} />
          </mesh>
          {/* Sacrificial Point light */}
          <pointLight color="#ff1744" intensity={0.8} distance={1.2} decay={2} />
        </group>
      )}

      {isTalisman && (
        // Occult Screaming Talisman
        <group scale={[0.28, 0.35, 0.2]}>
          {/* Talisman egg base */}
          <mesh position={[0, 0, 0]}>
            <sphereGeometry args={[0.7, 16, 16]} />
            <meshStandardMaterial color="#880e1c" roughness={0.3} metalness={0.1} emissive="#ff1a35" emissiveIntensity={0.35} />
          </mesh>
          {/* Carved eye */}
          <mesh position={[-0.22, 0.18, 0.55]} rotation={[0, 0, 0.3]}>
            <coneGeometry args={[0.16, 0.08, 12]} />
            <meshStandardMaterial color="#110204" emissive="#ff0022" emissiveIntensity={0.6} />
          </mesh>
          <mesh position={[0.22, 0.12, 0.55]} rotation={[0, 0, -0.2]}>
            <coneGeometry args={[0.16, 0.08, 12]} />
            <meshStandardMaterial color="#110204" emissive="#ff0022" emissiveIntensity={0.6} />
          </mesh>
          {/* Screaming mouth */}
          <mesh position={[0, -0.28, 0.52]}>
            <cylinderGeometry args={[0.22, 0.15, 0.12, 16]} />
            <meshStandardMaterial color="#050102" roughness={0.9} />
          </mesh>
          <pointLight color="#ff1133" intensity={0.9} distance={1.4} decay={2} />
        </group>
      )}

      {isSkull && (
        // Catacombs screaming skull relief
        <group scale={[0.3, 0.3, 0.18]}>
          <mesh position={[0, 0, 0]}>
            <sphereGeometry args={[0.75, 16, 16]} />
            <meshStandardMaterial color="#302b36" roughness={0.8} />
          </mesh>
          {/* Hollow eye sockets */}
          <mesh position={[-0.25, 0.15, 0.6]}>
            <sphereGeometry args={[0.14, 12, 12]} />
            <meshStandardMaterial color="#07070a" emissive="#00e5ff" emissiveIntensity={0.4} />
          </mesh>
          <mesh position={[0.25, 0.15, 0.6]}>
            <sphereGeometry args={[0.14, 12, 12]} />
            <meshStandardMaterial color="#07070a" emissive="#00e5ff" emissiveIntensity={0.4} />
          </mesh>
          {/* Agonized mouth */}
          <mesh position={[0, -0.3, 0.55]} scale={[1, 1.8, 1]}>
            <sphereGeometry args={[0.2, 12, 12]} />
            <meshStandardMaterial color="#000000" />
          </mesh>
        </group>
      )}

      {isReaper && (
        // Grim Reaper insignia
        <group scale={[0.3, 0.3, 0.2]}>
          <mesh position={[0, 0.05, 0]}>
            <sphereGeometry args={[0.65, 14, 14]} />
            <meshStandardMaterial color="#475569" roughness={0.7} />
          </mesh>
          {/* Horned crests */}
          <mesh position={[-0.45, 0.45, 0]} rotation={[0, 0, 0.6]}>
            <coneGeometry args={[0.15, 0.6, 8]} />
            <meshStandardMaterial color="#334155" roughness={0.6} />
          </mesh>
          <mesh position={[0.45, 0.45, 0]} rotation={[0, 0, -0.6]}>
            <coneGeometry args={[0.15, 0.6, 8]} />
            <meshStandardMaterial color="#334155" roughness={0.6} />
          </mesh>
          {/* Spectral Eye Flame */}
          <pointLight color="#38bdf8" intensity={0.7} distance={1.2} decay={2} />
        </group>
      )}

      {isGargoyle && (
        // Horned gargoyle stone visage
        <group scale={[0.32, 0.32, 0.2]}>
          <mesh position={[0, 0, 0]}>
            <cylinderGeometry args={[0.5, 0.4, 0.8, 6]} />
            <meshStandardMaterial color="#2d222e" roughness={0.8} />
          </mesh>
          {/* Curved horns */}
          <mesh position={[-0.55, 0.3, 0]} rotation={[0, 0, 1.1]}>
            <torusGeometry args={[0.3, 0.1, 8, 16, Math.PI]} />
            <meshStandardMaterial color="#1a121d" roughness={0.6} />
          </mesh>
          <mesh position={[0.55, 0.3, 0]} rotation={[0, 0, -1.1]}>
            <torusGeometry args={[0.3, 0.1, 8, 16, Math.PI]} />
            <meshStandardMaterial color="#1a121d" roughness={0.6} />
          </mesh>
          <pointLight color="#a855f7" intensity={0.8} distance={1.2} decay={2} />
        </group>
      )}
    </group>
  );
}

/**
 * TombstoneCard3D - Gothic horror monolith headstone
 * 
 * Features:
 * - Sculpted stone reliefs (sigil, reaper, skull, gargoyle, talisman)
 * - Living stone breathing animation (subtle ±1.8%)
 * - Flesh-stone fusion with pulsing crimson veins
 * - Balanced chiaroscuro lighting with high-contrast visibility
 * - Awakening tremble on pointer hover
 */
export function TombstoneCard3D({
  title,
  subtitle,
  epitaph,
  weathering = 'aged',
  intensity = 'cursed',
  relief = 'sigil',
  fallback = false,
  width = 3,
  height = 4.2,
  depth = 0.45,
}: TombstoneCard3DProps) {
  const meshRef = useRef<Mesh>(null);
  const groupRef = useRef<Group>(null);
  const [hovered, setHovered] = useState(false);
  const shouldFallback = useHorrorFallback(fallback);
  
  const weatheringValue = useMemo(() => {
    const weatheringMap: Record<TombstoneWeathering, number> = {
      pristine: 0.0,
      aged: 0.3,
      cracked: 0.6,
      crumbling: 0.9,
    };
    return weatheringMap[weathering];
  }, [weathering]);

  const stoneMaterial = useMemo(() => {
    const lightConfig = TORCHLIGHT_CONFIG[intensity];
    
    return new ShaderMaterial({
      vertexShader: stoneVertexShader,
      fragmentShader: stoneFragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uWeathering: { value: weatheringValue },
        uLightPosition: { value: new Vector3(0, 0, 5) },
        uLightColor: { value: new Vector3(1.0, 0.65, 0.35) },
        uLightIntensity: { value: lightConfig.baseIntensity * 1.2 },
      },
    });
  }, [weatheringValue, intensity]);

  // Subtle living stone physics
  useFrame((state) => {
    if (!meshRef.current || !groupRef.current) return;
    
    const time = state.clock.elapsedTime;
    stoneMaterial.uniforms.uTime.value = time;
    
    const mouse = state.mouse;
    stoneMaterial.uniforms.uLightPosition.value.set(
      mouse.x * 4.5,
      mouse.y * 4.5,
      4.5
    );

    // BREATHING: Slow rhythmic expand/contract
    const breathe = Math.sin(time * 0.45) * 0.018;
    groupRef.current.scale.setScalar(1 + breathe);

    // TREMBLING: Pointer hover awakening shake
    if (hovered) {
      const shake = Math.sin(time * 24) * 0.012;
      const twist = Math.sin(time * 18) * 0.006;
      groupRef.current.rotation.z = shake;
      groupRef.current.rotation.x = twist;
    } else {
      groupRef.current.rotation.z *= 0.88;
      groupRef.current.rotation.x *= 0.88;
    }

    // Subtle continuous ambient rotation
    const writhe = Math.sin(time * 0.35) * 0.004;
    groupRef.current.rotation.y = writhe;
  });

  if (shouldFallback) {
    return null;
  }

  const tombstoneShape = useMemo(() => {
    const s = new Shape();
    const w = width / 2;
    const h = height / 2;
    const shoulderY = h * 0.3;
    const peakY = h * 0.98;

    s.moveTo(-w, -h);
    s.lineTo(w, -h);
    s.lineTo(w, shoulderY);
    // Smooth arched crown curve to peak
    s.quadraticCurveTo(w * 0.95, peakY, 0, peakY);
    s.quadraticCurveTo(-w * 0.95, peakY, -w, shoulderY);
    s.lineTo(-w, -h);

    return s;
  }, [width, height]);

  const extrudeSettings = useMemo(() => ({
    depth: depth,
    bevelEnabled: true,
    bevelSegments: 4,
    steps: 1,
    bevelSize: 0.08,
    bevelThickness: 0.08,
  }), [depth]);

  const crackGlowIntensity = weatheringValue * 0.65;

  return (
    <group 
      ref={groupRef}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
    >
      {/* High-visibility ambient light fill */}
      <ambientLight intensity={0.6} color="#36453d" />
      <directionalLight position={[3, 5, 4]} intensity={0.7} color="#d1fae5" />
      <directionalLight position={[-3, -2, -3]} intensity={0.4} color="#059669" />

      {/* MIST: Rising fog */}
      <Float
        speed={1.2}
        rotationIntensity={0.2}
        floatIntensity={0.4}
        position={[0, -height * 0.42, 0.1]}
      >
        <mesh position={[0, -0.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[width * 1.6, 2.2]} />
          <meshBasicMaterial 
            color="#08140e" 
            transparent 
            opacity={0.45}
            depthWrite={false}
          />
        </mesh>
      </Float>

      {/* MAIN TOMBSTONE: Gothic stone monolith with arched top & beveled edges */}
      <mesh
        ref={meshRef}
        castShadow
        receiveShadow
        position={[0, 0, -depth * 0.5]}
      >
        <extrudeGeometry args={[tombstoneShape, extrudeSettings]} />
        <meshStandardMaterial
          color="#38443d"
          roughness={0.88}
          metalness={0.12}
        />
      </mesh>

      {/* Stepped Granite Base Pedestal Plinths */}
      <mesh position={[0, -height * 0.5 - 0.16, 0]} castShadow receiveShadow>
        <boxGeometry args={[width * 1.22, 0.32, depth * 1.6]} />
        <meshStandardMaterial
          color="#2d3731"
          roughness={0.92}
          metalness={0.1}
        />
      </mesh>
      <mesh position={[0, -height * 0.5 - 0.36, 0]} castShadow receiveShadow>
        <boxGeometry args={[width * 1.38, 0.22, depth * 1.9]} />
        <meshStandardMaterial
          color="#232b26"
          roughness={0.95}
          metalness={0.08}
        />
      </mesh>

      {/* Chiseled "R.I.P." arch crest */}
      <Text
        position={[0, height * 0.36, depth * 0.5 + 0.02]}
        fontSize={0.24}
        letterSpacing={0.22}
        color="#8fa396"
        outlineWidth={0.015}
        outlineColor="#131a16"
        anchorX="center"
        anchorY="middle"
      >
        R. I. P.
      </Text>

      {/* GOTHIC RELIEF SCULPT: Carved directly onto headstone crown */}
      <group position={[0, -0.15, 0]}>
        <ReliefSculpt relief={relief} weatheringValue={weatheringValue} />
      </group>

      {/* CRACK GLOW: Inner sacrificial embers */}
      {weatheringValue > 0.35 && (
        <pointLight
          position={[0, -0.2, depth * 0.6]}
          color="#10b981"
          intensity={crackGlowIntensity * 1.2}
          distance={2.5}
          decay={2}
        />
      )}

      {/* TITLE: Crisp carved gothic typography with high visibility */}
      {title && (
        <Float speed={2} rotationIntensity={0} floatIntensity={0.015}>
          <Text
            position={[0, -height * 0.04, depth * 0.5 + 0.02]}
            fontSize={0.26}
            maxWidth={width * 0.86}
            textAlign="center"
            anchorX="center"
            anchorY="middle"
            color="#f1f5f9"
            outlineWidth={0.016}
            outlineColor="#09090b"
            letterSpacing={0.04}
          >
            {title}
          </Text>
        </Float>
      )}

      {/* SUBTITLE */}
      {subtitle && (
        <Text
          position={[0, -height * 0.17, depth * 0.5 + 0.02]}
          fontSize={0.16}
          maxWidth={width * 0.86}
          textAlign="center"
          anchorX="center"
          anchorY="middle"
          color="#a7f3d0"
          outlineWidth={0.01}
          outlineColor="#064e3b"
        >
          {subtitle}
        </Text>
      )}

      {/* EPITAPH */}
      {epitaph && (
        <Text
          position={[0, -height * 0.31, depth * 0.5 + 0.02]}
          fontSize={0.13}
          maxWidth={width * 0.82}
          textAlign="center"
          anchorX="center"
          anchorY="middle"
          color="#cbd5e1"
          fontStyle="italic"
          outlineWidth={0.008}
          outlineColor="#1e293b"
        >
          {`"${epitaph}"`}
        </Text>
      )}
    </group>
  );
}
