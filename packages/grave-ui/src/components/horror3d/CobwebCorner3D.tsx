import { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import { type Group } from 'three';
import { playSound } from '../../audio';

export interface CobwebCorner3DProps {
  scale?: number;
}

/**
 * ArticulatedArachnid - 8-legged spider with realistic jointed legs, glowing red eyes,
 * and dynamic silk descent on hover.
 */
function ArticulatedArachnid({ hovered }: { hovered: boolean }) {
  const spiderRef = useRef<Group>(null);
  const silkThreadRef = useRef<Group>(null);

  useFrame((state) => {
    if (!spiderRef.current) return;
    const t = state.clock.elapsedTime;

    // Smooth descent on silk line when hovered
    const targetY = hovered ? -1.1 : 0.6;
    spiderRef.current.position.y += (targetY - spiderRef.current.position.y) * 0.08;

    // Subtle twitching & leg-creeping while suspended
    spiderRef.current.rotation.z = Math.sin(t * 2.5) * 0.06;
    spiderRef.current.rotation.x = Math.sin(t * 3.0) * 0.05;

    // Silk thread stretches dynamically
    if (silkThreadRef.current) {
      const dist = 1.4 - spiderRef.current.position.y;
      silkThreadRef.current.scale.y = Math.max(0.1, dist / 2.0);
      silkThreadRef.current.position.y = 1.4 - dist / 2.0;
    }
  });

  return (
    <group position={[0.85, 0.5, 0.1]}>
      {/* Dynamic Suspended Silk Thread */}
      <group ref={silkThreadRef} position={[0, 1.0, 0]}>
        <mesh>
          <cylinderGeometry args={[0.005, 0.005, 2.0, 6]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.7} />
        </mesh>
      </group>

      {/* Spider Body & 8 Legs */}
      <group ref={spiderRef} position={[0, 0.6, 0]}>
        {/* Abdomen (Ovoid posterior) */}
        <mesh position={[0, -0.16, 0]} castShadow>
          <sphereGeometry args={[0.2, 16, 16]} />
          <meshStandardMaterial color="#0b1017" roughness={0.4} metalness={0.2} />
        </mesh>

        {/* Cephalothorax (Head/Chest) */}
        <mesh position={[0, 0.06, 0]} castShadow>
          <sphereGeometry args={[0.13, 14, 14]} />
          <meshStandardMaterial color="#141c26" roughness={0.5} metalness={0.15} />
        </mesh>

        {/* Glowing Red Arachnid Eyes (4 anterior median/lateral eyes) */}
        <mesh position={[-0.045, 0.12, 0.11]}>
          <sphereGeometry args={[0.024, 8, 8]} />
          <meshBasicMaterial color="#ff1744" />
        </mesh>
        <mesh position={[0.045, 0.12, 0.11]}>
          <sphereGeometry args={[0.024, 8, 8]} />
          <meshBasicMaterial color="#ff1744" />
        </mesh>
        <mesh position={[-0.08, 0.09, 0.09]}>
          <sphereGeometry args={[0.018, 8, 8]} />
          <meshBasicMaterial color="#ef4444" />
        </mesh>
        <mesh position={[0.08, 0.09, 0.09]}>
          <sphereGeometry args={[0.018, 8, 8]} />
          <meshBasicMaterial color="#ef4444" />
        </mesh>

        {/* Chelicerae & Fangs */}
        <mesh position={[-0.03, 0.0, 0.13]} rotation={[0.4, 0, 0]}>
          <coneGeometry args={[0.02, 0.08, 6]} />
          <meshStandardMaterial color="#05080c" roughness={0.3} />
        </mesh>
        <mesh position={[0.03, 0.0, 0.13]} rotation={[0.4, 0, 0]}>
          <coneGeometry args={[0.02, 0.08, 6]} />
          <meshStandardMaterial color="#05080c" roughness={0.3} />
        </mesh>

        {/* 8 Articulated Segmented Legs */}
        {[-1, 1].map((side) =>
          [-0.12, -0.04, 0.04, 0.12].map((y, legIdx) => {
            const angleSpread = (legIdx - 1.5) * 0.35;
            return (
              <group
                key={`${side}-${legIdx}`}
                position={[side * 0.12, y, 0]}
                rotation={[0, 0, side * (0.4 + angleSpread)]}
              >
                {/* Femur (Upper leg) */}
                <mesh position={[side * 0.18, 0.08, 0]} rotation={[0, 0, side * 0.5]}>
                  <cylinderGeometry args={[0.016, 0.012, 0.38, 6]} />
                  <meshStandardMaterial color="#0f172a" roughness={0.4} />
                </mesh>
                {/* Knee Joint */}
                <mesh position={[side * 0.32, 0.18, 0]}>
                  <sphereGeometry args={[0.022, 6, 6]} />
                  <meshStandardMaterial color="#334155" />
                </mesh>
                {/* Tibia & Tarsus (Lower leg bent downward) */}
                <mesh position={[side * 0.44, 0.04, 0]} rotation={[0, 0, -side * 0.6]}>
                  <cylinderGeometry args={[0.012, 0.007, 0.36, 6]} />
                  <meshStandardMaterial color="#090d16" roughness={0.4} />
                </mesh>
              </group>
            );
          })
        )}
      </group>
    </group>
  );
}

/**
 * CobwebCorner3D
 * 
 * 3D Intricate procedural silk cobweb corner with 18+ radial structural spokes,
 * 15+ concentric capture rings with catenary curvature, glistening dew droplets,
 * and an articulated 8-legged spider that lowers dynamically on hover.
 */
export function CobwebCorner3D({ scale = 1.65 }: CobwebCorner3DProps) {
  const groupRef = useRef<Group>(null);
  const [hovered, setHovered] = useState(false);

  // 19 Radial structural silk spokes (0 to 95 degrees at 5-deg intervals)
  const radialSpokes = useMemo(() => {
    const list = [];
    for (let deg = 0; deg <= 95; deg += 5) {
      const rad = (deg * Math.PI) / 180;
      // Slight 3D z-depth variance for a realistic corner hammock shape
      const zOffset = Math.sin(rad * 2) * 0.18 - 0.08;
      list.push({ deg, rad, zOffset });
    }
    return list;
  }, []);

  // 15 Concentric spiral capture thread arcs
  const concentricArcs = useMemo(() => {
    const arcs = [];
    for (let r = 0.22; r <= 2.45; r += 0.15) {
      arcs.push(r);
    }
    return arcs;
  }, []);

  // 24 Glistening dewdrop bead coordinates
  const dewDrops = useMemo(() => [
    [0.35, 0.25, 0.05],
    [0.2, 0.5, 0.04],
    [0.6, 0.3, 0.07],
    [0.45, 0.65, 0.06],
    [0.8, 0.45, 0.08],
    [0.55, 0.95, 0.07],
    [1.1, 0.5, 0.09],
    [0.75, 1.25, 0.08],
    [1.35, 0.65, 0.1],
    [0.9, 1.55, 0.07],
    [1.65, 0.75, 0.08],
    [1.15, 1.85, 0.06],
    [0.3, 0.9, 0.05],
    [0.95, 0.95, 0.08],
    [1.4, 1.15, 0.07],
    [0.7, 0.7, 0.06],
    [1.2, 0.3, 0.08],
    [0.4, 1.3, 0.05],
    [1.55, 0.4, 0.07],
    [0.85, 0.15, 0.06],
  ], []);

  const handlePointerEnter = () => {
    setHovered(true);
    playSound('boneClick');
  };

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;
    // Subtle draft breeze flutter on the cobweb
    groupRef.current.position.z = Math.sin(t * 1.5) * 0.02;
  });

  return (
    <group ref={groupRef} scale={[scale, scale, scale]} position={[0, 0, 0]}>
      {/* Lighting for glistening silk reflections */}
      <ambientLight intensity={0.5} color="#15241b" />
      <directionalLight position={[2, 3, 2]} intensity={0.8} color="#f0fdf4" />
      <pointLight position={[1, 1, 1.5]} intensity={1.5} color="#67e8f9" distance={4.5} />

      <Float speed={0.9} rotationIntensity={0.02} floatIntensity={0.04}>
        <group
          onPointerEnter={handlePointerEnter}
          onPointerLeave={() => setHovered(false)}
        >
          {/* Dense Radial Structural Silk Spokes */}
          {radialSpokes.map(({ rad, zOffset }, i) => (
            <mesh
              key={i}
              position={[Math.cos(rad) * 1.2, Math.sin(rad) * 1.2, zOffset]}
              rotation={[0, 0, rad]}
            >
              <cylinderGeometry args={[0.007, 0.007, 2.5, 6]} />
              <meshStandardMaterial
                color="#f1f5f9"
                emissive="#67e8f9"
                emissiveIntensity={0.35}
                transparent
                opacity={0.8}
              />
            </mesh>
          ))}

          {/* 15 Dense Concentric Capture Spiral Threads */}
          {concentricArcs.map((r, idx) => (
            <mesh key={idx} position={[0, 0, Math.sin(idx * 0.4) * 0.05]} rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[r, r + 0.012, 48, 1, 0, Math.PI / 2 + 0.08]} />
              <meshStandardMaterial
                color="#e2e8f0"
                emissive="#67e8f9"
                emissiveIntensity={0.3}
                transparent
                opacity={0.7}
              />
            </mesh>
          ))}

          {/* Cross-bracing Gossamer Anchor Fibers */}
          {[0.6, 1.2, 1.8].map((d, i) => (
            <mesh key={i} position={[d * 0.5, d * 0.5, 0.05]} rotation={[0, 0, -Math.PI / 4]}>
              <cylinderGeometry args={[0.005, 0.005, d * 1.4, 4]} />
              <meshBasicMaterial color="#ffffff" transparent opacity={0.45} />
            </mesh>
          ))}

          {/* Glistening Dewdrop Beads */}
          {dewDrops.map(([x, y, z], i) => (
            <mesh key={i} position={[x, y, z]}>
              <sphereGeometry args={[0.032, 10, 10]} />
              <meshStandardMaterial
                color="#ffffff"
                emissive="#67e8f9"
                emissiveIntensity={0.9}
                roughness={0.1}
                metalness={0.2}
              />
            </mesh>
          ))}

          {/* Articulated 8-Legged Spider */}
          <ArticulatedArachnid hovered={hovered} />
        </group>
      </Float>
    </group>
  );
}
