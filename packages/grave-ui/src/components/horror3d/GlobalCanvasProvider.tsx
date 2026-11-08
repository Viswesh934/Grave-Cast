import { createContext, useContext, type ReactNode } from 'react';
import { Canvas } from '@react-three/fiber';
import { View } from '@react-three/drei';

/**
 * Global Canvas Context
 * Provides access to the single shared WebGL canvas
 */
interface GlobalCanvasContextValue {
  ready: boolean;
}

const GlobalCanvasContext = createContext<GlobalCanvasContextValue>({
  ready: false,
});

export const useGlobalCanvas = () => useContext(GlobalCanvasContext);

export interface GlobalCanvasProviderProps {
  /**
   * Child components that may contain 3D View ports
   */
  children: ReactNode;
  
  /**
   * Additional className for the canvas container
   */
  className?: string;
}

/**
 * GlobalCanvasProvider
 * 
 * Provides a single WebGL canvas for all 3D horror components.
 * Uses @react-three/drei's View system for multiple render targets.
 * 
 * This dramatically improves performance compared to one canvas per component.
 * 
 * @example
 * ```tsx
 * <GlobalCanvasProvider>
 *   <App>
 *     <TombstoneCard />
 *     <BloodVial />
 *   </App>
 * </GlobalCanvasProvider>
 * ```
 */
export function GlobalCanvasProvider({ 
  children, 
  className 
}: GlobalCanvasProviderProps) {
  return (
    <GlobalCanvasContext.Provider value={{ ready: true }}>
      {children}
      
      {/* Single shared WebGL canvas */}
      <Canvas
        className={className}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: -1,
        }}
        eventSource={document.documentElement}
        eventPrefix="client"
      >
        {/* View.Port components will bind to this canvas */}
        <View.Port />
      </Canvas>
    </GlobalCanvasContext.Provider>
  );
}
