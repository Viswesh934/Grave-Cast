/**
 * Animation tokens for Grave-UI
 * Timing functions, durations, and keyframe definitions for horror micro-interactions
 * @module tokens/animations
 */

/**
 * Animation system for horror-themed motion and transitions.
 * 
 * - **Durations**: Horror-appropriate timing names
 * - **Easing**: Custom curves for supernatural motion
 * - **Keyframes**: Reusable animation definitions
 * 
 * @example
 * ```tsx
 * import { animations } from '@gravecast/grave-ui/tokens';
 * 
 * const ghost = {
 *   animation: `${animations.keyframes.flicker} ${animations.durations.haunt} ${animations.easing.easeOutCurse} infinite`,
 *   transition: `opacity ${animations.durations.creep} ${animations.easing.easeInOutCrypt}`,
 * };
 * ```
 */
export const animations = {
  /**
   * Animation durations with horror-themed naming
   * From quick flickers to prolonged hauntings
   */
  durations: {
    /** 100ms - Quick flicker */
    flicker: '100ms',
    
    /** 200ms - Fast pulse */
    pulse: '200ms',
    
    /** 300ms - Creeping movement */
    creep: '300ms',
    
    /** 500ms - Haunt effect */
    haunt: '500ms',
    
    /** 700ms - Apparition appearance */
    apparition: '700ms',
    
    /** 1000ms - Full manifestation */
    manifest: '1000ms',
    
    /** 2000ms - Extended presence */
    linger: '2000ms',
  },

  /**
   * Easing functions for supernatural motion
   * Custom cubic-bezier curves for horror aesthetics
   */
  easing: {
    /** Standard ease */
    ease: 'ease',
    
    /** Linear for mechanical motion */
    linear: 'linear',
    
    /** Ease in - creeping acceleration */
    easeIn: 'ease-in',
    
    /** Ease out - sudden stop */
    easeOut: 'ease-out',
    
    /** Ease in-out - ghostly motion */
    easeInOut: 'ease-in-out',
    
    /** Crypt door - slow open, slower close */
    easeInOutCrypt: 'cubic-bezier(0.65, 0, 0.35, 1)',
    
    /** Curse - sharp start, trailing end */
    easeOutCurse: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    
    /** Coffin - heavy, weighted motion */
    easeInOutCoffin: 'cubic-bezier(0.85, 0, 0.15, 1)',
    
    /** Spectral - ethereal float */
    easeOutSpectral: 'cubic-bezier(0.16, 1, 0.3, 1)',
    
    /** Blood drip - gravity-driven fall */
    easeInBloodDrip: 'cubic-bezier(0.6, 0.04, 0.98, 0.34)',
  },

  /**
   * Keyframe animation names
   * Reference these in CSS animations or styled components
   */
  keyframes: {
    /** Candle flame flicker */
    flicker: 'grave-ui-flicker',
    
    /** Creepy heartbeat pulse */
    heartbeat: 'grave-ui-heartbeat',
    
    /** Cobweb sway in wind */
    webSway: 'grave-ui-web-sway',
    
    /** Fog drift across surface */
    fogDrift: 'grave-ui-fog-drift',
    
    /** Fade in from darkness */
    fadeIn: 'grave-ui-fade-in',
    
    /** Fade out to void */
    fadeOut: 'grave-ui-fade-out',
    
    /** Slide up from grave */
    slideUp: 'grave-ui-slide-up',
    
    /** Slide down into abyss */
    slideDown: 'grave-ui-slide-down',
    
    /** Scale pulse (breathing effect) */
    scalePulse: 'grave-ui-scale-pulse',
    
    /** Rotate skeleton key */
    rotate: 'grave-ui-rotate',
    
    /** Shake/tremble effect */
    tremble: 'grave-ui-tremble',
  },

  /**
   * CSS keyframe definitions
   * Can be injected into stylesheets or used with CSS-in-JS
   */
  keyframeDefinitions: {
    flicker: `
      @keyframes grave-ui-flicker {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.8; }
      }
    `,
    
    heartbeat: `
      @keyframes grave-ui-heartbeat {
        0%, 100% { transform: scale(1); }
        10% { transform: scale(1.05); }
        20% { transform: scale(1); }
        30% { transform: scale(1.05); }
        40% { transform: scale(1); }
      }
    `,
    
    webSway: `
      @keyframes grave-ui-web-sway {
        0%, 100% { transform: translateX(0) rotate(0deg); }
        50% { transform: translateX(2px) rotate(1deg); }
      }
    `,
    
    fogDrift: `
      @keyframes grave-ui-fog-drift {
        0% { transform: translateX(-100%); opacity: 0; }
        50% { opacity: 0.3; }
        100% { transform: translateX(100%); opacity: 0; }
      }
    `,
    
    fadeIn: `
      @keyframes grave-ui-fade-in {
        from { opacity: 0; }
        to { opacity: 1; }
      }
    `,
    
    fadeOut: `
      @keyframes grave-ui-fade-out {
        from { opacity: 1; }
        to { opacity: 0; }
      }
    `,
    
    slideUp: `
      @keyframes grave-ui-slide-up {
        from { transform: translateY(100%); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
      }
    `,
    
    slideDown: `
      @keyframes grave-ui-slide-down {
        from { transform: translateY(-100%); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
      }
    `,
    
    scalePulse: `
      @keyframes grave-ui-scale-pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.05); }
      }
    `,
    
    rotate: `
      @keyframes grave-ui-rotate {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
    `,
    
    tremble: `
      @keyframes grave-ui-tremble {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-2px); }
        75% { transform: translateX(2px); }
      }
    `,
  },

  /**
   * Pre-composed animation strings for common patterns
   */
  presets: {
    /** Subtle candle flicker */
    candleFlicker: 'grave-ui-flicker 3s ease-in-out infinite',
    
    /** Heartbeat pulse */
    heartbeatPulse: 'grave-ui-heartbeat 2s ease-in-out infinite',
    
    /** Gentle cobweb sway */
    cobwebSway: 'grave-ui-web-sway 4s ease-in-out infinite',
    
    /** Drifting fog */
    driftingFog: 'grave-ui-fog-drift 10s linear infinite',
    
    /** Fade in appearance */
    fadeIn: 'grave-ui-fade-in 500ms ease-out forwards',
    
    /** Fade out disappearance */
    fadeOut: 'grave-ui-fade-out 500ms ease-in forwards',
    
    /** Slide up from below */
    slideUp: 'grave-ui-slide-up 500ms cubic-bezier(0.16, 1, 0.3, 1) forwards',
    
    /** Continuous rotation */
    spin: 'grave-ui-rotate 2s linear infinite',
    
    /** Trembling effect */
    tremble: 'grave-ui-tremble 200ms ease-in-out',
  },
} as const;

/**
 * Transition utilities for common state changes
 */
export const transitions = {
  /** All properties */
  all: 'all 300ms ease-in-out',
  
  /** Color transitions */
  colors: 'color 300ms ease-in-out, background-color 300ms ease-in-out, border-color 300ms ease-in-out',
  
  /** Transform transitions */
  transform: 'transform 300ms cubic-bezier(0.16, 1, 0.3, 1)',
  
  /** Opacity fade */
  opacity: 'opacity 300ms ease-in-out',
  
  /** Shadow changes */
  shadow: 'box-shadow 300ms ease-in-out',
  
  /** Combined common properties */
  interactive: 'transform 200ms cubic-bezier(0.16, 1, 0.3, 1), box-shadow 200ms ease-in-out, opacity 200ms ease-in-out',
} as const;
