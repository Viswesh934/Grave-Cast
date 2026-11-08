import { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Vector3, type PointLight } from 'three';
import type { HorrorIntensity } from '../../tokens/types';
import { TORCHLIGHT_CONFIG, SCENE_CONFIG } from './horror3d.config';

export interface TorchlightCursorProps {
  /**
   * Horror intensity affects light flicker and color
   */
  intensity?: HorrorIntensity;
  
  /**
   * Enable/disable the torchlight
   * @default true
   */
  enabled?: boolean;
}

/**
 * TorchlightCursor
 * 
 * Dynamic point light that follows the mouse cursor like a flickering lantern.
 * Creates the primary lighting source for all 3D horror components.
 * 
 * - "ghastly": Steady warm light, minimal flicker
 * - "cursed": Flickering amber torch (default)
 * - "abyssal": Unstable cold blue-green flame
 * 
 * @example
 * ```tsx
 * <Canvas>
 *   <TorchlightCursor intensity="cursed" />
 * </Canvas>
 * ```
 */
export function TorchlightCursor({ 
  intensity = 'cursed', 
  enabled = true 
}: TorchlightCursorProps) {
  const lightRef = useRef<PointLight>(null);
  const targetPosition = useRef(new Vector3(0, 0, SCENE_CONFIG.cursorDepth));
  const currentPosition = useRef(new Vector3(0, 0, SCENE_CONFIG.cursorDepth));
  const { size, viewport } = useThree();

  const config = TORCHLIGHT_CONFIG[intensity];

  // Update target position based on mouse
  useEffect(() => {
    if (!enabled) return;

    const handleMouseMove = (event: MouseEvent) => {
      // Convert screen coordinates to normalized device coordinates (-1 to +1)
      const x = (event.clientX / size.width) * 2 - 1;
      const y = -(event.clientY / size.height) * 2 + 1;

      // Convert to 3D space
      targetPosition.current.set(
        x * viewport.width / 2,
        y * viewport.height / 2,
        SCENE_CONFIG.cursorDepth
      );
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [enabled, size, viewport]);

  // Smooth follow and flicker animation
  useFrame((state) => {
    if (!lightRef.current || !enabled) return;

    const time = state.clock.elapsedTime;
    
    // Smooth damped movement toward mouse
    currentPosition.current.lerp(targetPosition.current, SCENE_CONFIG.dampingFactor);
    lightRef.current.position.copy(currentPosition.current);

    // Intensity-based flicker
    const flicker = Math.sin(time * config.flickerSpeed) * 
                    Math.sin(time * config.flickerSpeed * 2.3) * 
                    config.flickerAmount;
    
    lightRef.current.intensity = config.baseIntensity + flicker;
  });

  if (!enabled) return null;

  return (
    <pointLight
      ref={lightRef}
      color={config.color}
      intensity={config.baseIntensity}
      distance={SCENE_CONFIG.lightDistance}
      decay={SCENE_CONFIG.lightDecay}
      castShadow
    />
  );
}
