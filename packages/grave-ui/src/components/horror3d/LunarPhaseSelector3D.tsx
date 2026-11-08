import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, Text } from '@react-three/drei';
import { type Group, Vector3 } from 'three';
import type { MoonPhase } from '../lycan/LunarPhaseSelector/LunarPhaseSelector';
import { playSound } from '../../audio';

export interface LunarPhaseSelector3DProps {
  value?: MoonPhase;
  onChange?: (phase: MoonPhase) => void;
  radius?: number;
}

const PHASE_ANGLES: Record<MoonPhase, { angle: number; isBlood: boolean; name: string }> = {
  'new': { angle: Math.PI, isBlood: false, name: 'New Moon' },
  'waxing-crescent': { angle: Math.PI * 0.75, isBlood: false, name: 'Waxing Crescent' },
  'first-quarter': { angle: Math.PI * 0.5, isBlood: false, name: 'First Quarter' },
  'waxing-gibbous': { angle: Math.PI * 0.25, isBlood: false, name: 'Waxing Gibbous' },
  'full': { angle: 0, isBlood: false, name: 'Full Moon' },
  'blood-moon': { angle: 0, isBlood: true, name: 'Blood Eclipse Moon' },
  'waning-gibbous': { angle: -Math.PI * 0.25, isBlood: false, name: 'Waning Gibbous' },
  'third-quarter': { angle: -Math.PI * 0.5, isBlood: false, name: 'Third Quarter' },
  'waning-crescent': { angle: -Math.PI * 0.75, isBlood: false, name: 'Waning Crescent' },
};

const ALL_PHASES: MoonPhase[] = [
  'new',
  'waxing-crescent',
  'first-quarter',
  'waxing-gibbous',
  'full',
  'blood-moon',
  'waning-gibbous',
  'third-quarter',
  'waning-crescent',
];

/**
 * LunarPhaseSelector3D
 * 
 * 3D Celestial Moon Sphere with physically calculated shadow terminator lines
 * mapping all lunar phases up to the Crimson Eclipse Blood Moon.
 */
export function LunarPhaseSelector3D({
  value = 'blood-moon',
  onChange,
  radius = 1.6,
}: LunarPhaseSelector3DProps) {
  const moonRef = useRef<Group>(null);
  const ringRef = useRef<Group>(null);

  const phaseData = useMemo(() => PHASE_ANGLES[value] || PHASE_ANGLES['blood-moon'], [value]);

  // Sun light position based on phase angle
  const sunPos = useMemo(() => {
    const x = Math.sin(phaseData.angle) * 8;
    const z = Math.cos(phaseData.angle) * 8;
    return new Vector3(x, 1, z);
  }, [phaseData.angle]);

  useFrame((state) => {
    if (!moonRef.current || !ringRef.current) return;
    const t = state.clock.elapsedTime;

    // Slow celestial axial rotation
    moonRef.current.rotation.y = t * 0.08;
    ringRef.current.rotation.z = t * 0.04;
    ringRef.current.rotation.x = 0.4 + Math.sin(t * 0.5) * 0.05;
  });

  const handleNextPhase = () => {
    const currentIndex = ALL_PHASES.indexOf(value);
    const nextIndex = (currentIndex + 1) % ALL_PHASES.length;
    playSound('stoneGrind');
    onChange?.(ALL_PHASES[nextIndex]);
  };

  const isBlood = phaseData.isBlood;

  return (
    <group position={[0, 0, 0]}>
      {/* Ambient starlight */}
      <ambientLight intensity={isBlood ? 0.35 : 0.2} color={isBlood ? '#3b0811' : '#1e1b4b'} />

      {/* Dynamic Directional Sunlight creating physical spherical shadows */}
      <directionalLight
        position={sunPos}
        intensity={isBlood ? 1.8 : 1.4}
        color={isBlood ? '#ef4444' : '#f8fafc'}
      />

      <Float speed={1.3} rotationIntensity={0.06} floatIntensity={0.12}>
        {/* Interactive Moon Sphere */}
        <group
          ref={moonRef}
          onClick={handleNextPhase}
        >
          <mesh castShadow receiveShadow>
            <sphereGeometry args={[radius, 36, 36]} />
            <meshStandardMaterial
              color={isBlood ? '#7f1d1d' : '#94a3b8'}
              emissive={isBlood ? '#dc2626' : '#000000'}
              emissiveIntensity={isBlood ? 0.45 : 0}
              roughness={0.92}
              metalness={0.05}
            />
          </mesh>

          {/* Blood Moon Eclipse Corona Flare */}
          {isBlood && (
            <mesh scale={[1.08, 1.08, 1.08]}>
              <sphereGeometry args={[radius, 24, 24]} />
              <meshBasicMaterial
                color="#ef4444"
                transparent
                opacity={0.25}
                depthWrite={false}
              />
            </mesh>
          )}
        </group>

        {/* Ethereal Floating Celestial Ring */}
        <group ref={ringRef}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[radius * 1.35, radius * 1.42, 48]} />
            <meshBasicMaterial
              color={isBlood ? '#fca5a5' : '#cbd5e1'}
              transparent
              opacity={0.35}
              depthWrite={false}
            />
          </mesh>
        </group>

        {/* Inscribed Phase Title */}
        <Text
          position={[0, -radius * 1.55, 0]}
          fontSize={0.25}
          letterSpacing={0.08}
          color={isBlood ? '#fca5a5' : '#f8fafc'}
          outlineWidth={0.012}
          outlineColor="#09090e"
          anchorX="center"
          anchorY="middle"
        >
          {phaseData.name}
        </Text>
        <Text
          position={[0, -radius * 1.78, 0]}
          fontSize={0.13}
          color="#94a3b8"
          anchorX="center"
          anchorY="middle"
        >
          Click moon sphere to advance lunar cycle
        </Text>
      </Float>
    </group>
  );
}
