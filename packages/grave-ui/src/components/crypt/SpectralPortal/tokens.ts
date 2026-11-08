/**
 * Spectral Portal component tokens
 * @module components/crypt/SpectralPortal/tokens
 */

/**
 * Portal-specific visual tokens
 */
export const portalTokens = {
  /** Z-index for portal elements */
  zIndex: {
    overlay: 999,
    content: 1000,
  },
  
  /** Overlay backdrop styling */
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    opacity: {
      hidden: 0,
      visible: 1,
    },
  },
} as const;
