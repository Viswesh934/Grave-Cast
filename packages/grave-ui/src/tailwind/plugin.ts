/**
 * Tailwind CSS plugin for Grave-UI
 * Maps design tokens to Tailwind utilities
 * @module tailwind/plugin
 */

import plugin from 'tailwindcss/plugin';

/**
 * Grave-UI Tailwind Plugin
 * 
 * Extends Tailwind with horror-themed utilities based on design tokens.
 * Includes custom components for Button, Card, and Badge primitives.
 * 
 * @example tailwind.config.js
 * ```js
 * import { graveUIPlugin } from '@gravecast/grave-ui/tailwind';
 * 
 * export default {
 *   plugins: [graveUIPlugin],
 * };
 * ```
 */
export const graveUIPlugin = plugin(
  // Add component styles
  function ({ addComponents, theme }) {
    addComponents({
      // Button component styles
      '.grave-button': {
        borderRadius: theme('borderRadius.md'),
        fontFamily: theme('fontFamily.sans'),
        fontWeight: theme('fontWeight.medium'),
        transition: `all ${theme('transitionDuration.200')} ease`,
        
        '&:focus-visible': {
          outline: '2px solid',
          outlineColor: theme('colors.purple.400'),
          outlineOffset: '2px',
        },
      },
      
      '.grave-button--sm': {
        padding: `${theme('spacing.2')} ${theme('spacing.4')}`,
        fontSize: theme('fontSize.sm'),
        lineHeight: theme('lineHeight.tight'),
      },
      
      '.grave-button--md': {
        padding: `${theme('spacing.3')} ${theme('spacing.6')}`,
        fontSize: theme('fontSize.base'),
        lineHeight: theme('lineHeight.normal'),
      },
      
      '.grave-button--lg': {
        padding: `${theme('spacing.4')} ${theme('spacing.8')}`,
        fontSize: theme('fontSize.lg'),
        lineHeight: theme('lineHeight.relaxed'),
      },
      
      '.grave-button--primary': {
        backgroundColor: theme('colors.purple.600'),
        color: theme('colors.gray.50'),
        
        '&:hover:not(:disabled)': {
          backgroundColor: theme('colors.purple.700'),
        },
        
        '&:active:not(:disabled)': {
          backgroundColor: theme('colors.purple.800'),
        },
      },
      
      '.grave-button--secondary': {
        backgroundColor: theme('colors.gray.600'),
        color: theme('colors.gray.50'),
        
        '&:hover:not(:disabled)': {
          backgroundColor: theme('colors.gray.700'),
        },
        
        '&:active:not(:disabled)': {
          backgroundColor: theme('colors.gray.800'),
        },
      },
      
      '.grave-button--ghost': {
        backgroundColor: 'transparent',
        color: theme('colors.gray.700'),
        border: `1px solid ${theme('colors.gray.300')}`,
        
        '&:hover:not(:disabled)': {
          backgroundColor: theme('colors.gray.50'),
        },
        
        '&:active:not(:disabled)': {
          backgroundColor: theme('colors.gray.100'),
        },
      },
      
      '.grave-button--danger': {
        backgroundColor: theme('colors.red.600'),
        color: theme('colors.gray.50'),
        
        '&:hover:not(:disabled)': {
          backgroundColor: theme('colors.red.700'),
        },
        
        '&:active:not(:disabled)': {
          backgroundColor: theme('colors.red.800'),
        },
      },
      
      '.grave-button--disabled': {
        opacity: '0.5',
        cursor: 'not-allowed',
      },
      
      // Card component styles
      '.grave-card': {
        borderRadius: theme('borderRadius.lg'),
        transition: `all ${theme('transitionDuration.200')} ease`,
      },
      
      '.grave-card--default': {
        backgroundColor: theme('colors.gray.50'),
        border: `1px solid ${theme('colors.gray.200')}`,
      },
      
      '.grave-card--elevated': {
        backgroundColor: theme('colors.white'),
        boxShadow: theme('boxShadow.lg'),
      },
      
      '.grave-card--outlined': {
        backgroundColor: 'transparent',
        border: `2px solid ${theme('colors.gray.400')}`,
      },
      
      '.grave-card--flat': {
        backgroundColor: theme('colors.white'),
      },
      
      '.grave-card--padding-sm': {
        padding: theme('spacing.4'),
      },
      
      '.grave-card--padding-md': {
        padding: theme('spacing.6'),
      },
      
      '.grave-card--padding-lg': {
        padding: theme('spacing.8'),
      },
      
      '.grave-card--interactive': {
        cursor: 'pointer',
        
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: theme('boxShadow.xl'),
        },
      },
      
      '.grave-card--disabled': {
        opacity: '0.6',
        pointerEvents: 'none',
      },
      
      '.grave-card__header': {
        marginBottom: theme('spacing.4'),
        paddingBottom: theme('spacing.4'),
        borderBottom: `1px solid ${theme('colors.gray.200')}`,
      },
      
      '.grave-card__footer': {
        marginTop: theme('spacing.4'),
        paddingTop: theme('spacing.4'),
        borderTop: `1px solid ${theme('colors.gray.200')}`,
      },
      
      // Badge component styles
      '.grave-badge': {
        borderRadius: theme('borderRadius.full'),
        fontSize: theme('fontSize.xs'),
        fontWeight: theme('fontWeight.semibold'),
        textTransform: 'uppercase',
        letterSpacing: theme('letterSpacing.wide'),
      },
      
      '.grave-badge--sm': {
        padding: `${theme('spacing.0.5')} ${theme('spacing.2')}`,
      },
      
      '.grave-badge--md': {
        padding: `${theme('spacing.1')} ${theme('spacing.3')}`,
      },
      
      '.grave-badge--lg': {
        padding: `${theme('spacing.1.5')} ${theme('spacing.4')}`,
      },
      
      '.grave-badge--default': {
        backgroundColor: theme('colors.gray.100'),
        color: theme('colors.gray.800'),
      },
      
      '.grave-badge--success': {
        backgroundColor: theme('colors.green.100'),
        color: theme('colors.green.800'),
      },
      
      '.grave-badge--warning': {
        backgroundColor: theme('colors.yellow.100'),
        color: theme('colors.yellow.800'),
      },
      
      '.grave-badge--danger': {
        backgroundColor: theme('colors.red.100'),
        color: theme('colors.red.800'),
      },
      
      '.grave-badge--info': {
        backgroundColor: theme('colors.blue.100'),
        color: theme('colors.blue.800'),
      },
      
      '.grave-badge__dot': {
        display: 'inline-block',
        width: theme('spacing.2'),
        height: theme('spacing.2'),
        borderRadius: theme('borderRadius.full'),
        backgroundColor: 'currentColor',
      },
      
      '.grave-badge__remove': {
        marginLeft: theme('spacing.1'),
        padding: '0',
        background: 'transparent',
        border: 'none',
        color: 'currentColor',
        opacity: '0.7',
        cursor: 'pointer',
        fontSize: theme('fontSize.base'),
        lineHeight: '1',
        
        '&:hover': {
          opacity: '1',
        },
      },
    });
  },
  
  // Extend theme with Grave-UI design tokens.
  // These map the canonical palette (mirrored in src/styles/grave-ui.css
  // and the `palette` token export) onto Tailwind color utilities, so that
  // classes like `bg-grave-dark-850`, `text-grave-mist-300`, and
  // `border-grave-crypt-granite` resolve instead of falling back to
  // arbitrary `[#hex]` values in components.
  {
    theme: {
      extend: {
        colors: {
          grave: {
            crypt: {
              stone: '#16161a',
              slate: '#22232a',
              granite: '#343642',
              moss: '#3d5a45',
              lichen: '#5b8a68',
            },
            sanguine: {
              blood: '#8a0303',
              crimson: '#bd081c',
              coagulated: '#4a0008',
              plasma: '#e63946',
            },
            witch: {
              void: '#0d0914',
              fire: '#8b5cf6',
              emerald: '#10b981',
              gold: '#d4af37',
            },
            bone: {
              100: '#f5f2eb',
              200: '#e8e0d5',
              300: '#d6ccbe',
              decayed: '#b8a99a',
              ash: '#6b625b',
            },
            dark: {
              950: '#060608',
              900: '#0a0a0f',
              850: '#0f1017',
              800: '#14151f',
              750: '#1b1c29',
              700: '#222434',
              600: '#2e3146',
            },
            mist: {
              100: '#e2e4ed',
              200: '#c2c5d4',
              300: '#9da1b6',
              400: '#6d7186',
              500: '#4a4d60',
            },
          },
        },
        boxShadow: {
          'grave-crypt': '0 10px 30px -5px rgba(0, 0, 0, 0.8), 0 0 1px rgba(255, 255, 255, 0.08)',
          'grave-glow-crimson': '0 0 20px rgba(189, 8, 28, 0.35)',
          'grave-glow-witchfire': '0 0 20px rgba(139, 92, 246, 0.35)',
        },
      },
    },
  }
);
