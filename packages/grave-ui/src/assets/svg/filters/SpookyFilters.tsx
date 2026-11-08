/**
 * SpookyFilters - SVG filter definitions for horror effects
 * @module assets/svg/filters/SpookyFilters
 */

/**
 * Reusable SVG filters for horror atmospheric effects.
 * 
 * Renders an invisible SVG containing filter definitions that can be
 * referenced by ID in CSS or inline styles throughout the application.
 * 
 * @example
 * ```tsx
 * // Add once to your app root
 * <SpookyFilters />
 * 
 * // Reference in components
 * <div style={{ filter: 'url(#stone-texture)' }}>Stone texture</div>
 * <div style={{ filter: 'url(#spectral-glow)' }}>Glowing element</div>
 * ```
 */
export const SpookyFilters = () => (
  <svg
    style={{
      position: 'absolute',
      width: 0,
      height: 0,
      pointerEvents: 'none',
    }}
    aria-hidden="true"
  >
    <defs>
      {/* Stone texture - weathered granite effect */}
      <filter id="stone-texture" x="-50%" y="-50%" width="200%" height="200%">
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.9"
          numOctaves="4"
          result="noise"
        />
        <feColorMatrix
          in="noise"
          type="matrix"
          values="0 0 0 0 0, 0 0 0 0 0, 0 0 0 0 0, 0 0 0 0.1 0"
          result="opacity"
        />
        <feBlend in="SourceGraphic" in2="opacity" mode="multiply" />
      </filter>

      {/* Spectral glow - ethereal supernatural glow */}
      <filter id="spectral-glow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="4" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>

      {/* Blood drip - viscous liquid effect */}
      <filter id="blood-drip" x="-50%" y="-50%" width="200%" height="200%">
        <feTurbulence
          type="turbulence"
          baseFrequency="0.05"
          numOctaves="2"
          result="turbulence"
        />
        <feDisplacementMap
          in="SourceGraphic"
          in2="turbulence"
          scale="5"
          xChannelSelector="R"
          yChannelSelector="G"
        />
      </filter>

      {/* Fog effect - drifting mist */}
      <filter id="fog-effect" x="-50%" y="-50%" width="200%" height="200%">
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.01"
          numOctaves="3"
          result="fog"
        />
        <feColorMatrix
          in="fog"
          type="matrix"
          values="1 0 0 0 0, 0 1 0 0 0, 0 0 1 0 0, 0 0 0 0.3 0"
        />
        <feBlend in="SourceGraphic" in2="fog" mode="screen" />
      </filter>

      {/* Cracked surface - weathered stone cracks */}
      <filter id="cracked-surface" x="-50%" y="-50%" width="200%" height="200%">
        <feTurbulence
          type="turbulence"
          baseFrequency="2"
          numOctaves="1"
          result="cracks"
        />
        <feColorMatrix
          in="cracks"
          type="matrix"
          values="0 0 0 0 0, 0 0 0 0 0, 0 0 0 0 0, 0 0 0 0.15 0"
        />
        <feBlend in="SourceGraphic" in2="cracks" mode="darken" />
      </filter>

      {/* Eldritch aura - mystical purple glow */}
      <filter id="eldritch-aura" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="6" result="blur" />
        <feColorMatrix
          in="blur"
          type="matrix"
          values="0.5 0 0.5 0 0, 0 0.2 0.3 0 0, 0.5 0 0.8 0 0, 0 0 0 1 0"
          result="coloredBlur"
        />
        <feMerge>
          <feMergeNode in="coloredBlur" />
          <feMergeNode in="coloredBlur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
  </svg>
);
