/**
 * ExcavationLoader component tokens
 *
 * The spade illustration uses representational tool-material colors (wood
 * handle, forged steel blade, turned earth) that have no equivalent in the
 * core horror palette. Per the "component-specific token extension" rule,
 * they are named and centralized here rather than scattered as inline hex.
 *
 * @module components/crypt/ExcavationLoader/tokens
 */

export const excavationTokens = {
  /** Icon pixel size per loader size variant */
  iconSizes: {
    sm: 24,
    md: 32,
    lg: 48,
  },
  /** Representational material colors for the forged spade illustration */
  spade: {
    handleGrip: '#5c4033',
    handleGripEdge: '#2b1d0c',
    handleShaft: '#8c6239',
    handleShaftEdge: '#3d2b1b',
    collar: '#475569',
    collarEdge: '#1e293b',
    blade: '#334155',
    bladeEdge: '#1e293b',
    bladeHighlight: '#94a3b8',
  },
  /** Turned-earth dirt mound colors */
  dirt: {
    mound: '#2b1e13',
    moundEdge: '#3d2b1b',
  },
} as const;
