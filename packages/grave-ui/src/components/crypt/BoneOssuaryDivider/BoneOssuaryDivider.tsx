/**
 * BoneOssuaryDivider - Decorative section divider with bone arrangement
 * @module components/crypt/BoneOssuaryDivider
 */

import { forwardRef, type HTMLAttributes } from 'react';
import { Bone } from '../../../assets/svg/base/Bone';

/**
 * Bone arrangement patterns
 */
export type OssuaryPattern = 'scattered' | 'crossed' | 'stacked' | 'row';

/**
 * Divider size options
 */
export type DividerSize = 'sm' | 'md' | 'lg';

/**
 * BoneOssuaryDivider component props
 */
export interface BoneOssuaryDividerProps extends HTMLAttributes<HTMLDivElement> {
  /** Bone arrangement pattern */
  pattern?: OssuaryPattern;
  /** Divider size */
  size?: DividerSize;
  /** Optional label text */
  label?: string;
  /** Show horizontal rule */
  showRule?: boolean;
  /** Number of bones to display (for scattered/row patterns) */
  boneCount?: number;
}

/**
 * BoneOssuaryDivider - A decorative section divider using bone arrangements.
 * 
 * Creates visual separation between content sections using various bone
 * patterns inspired by historical ossuaries. Composes multiple Bone SVG
 * primitives in different arrangements.
 * 
 * Perfect for separating major content sections, creating thematic breaks,
 * or adding decorative elements to horror-themed layouts.
 * 
 * @example Simple divider
 * ```tsx
 * <BoneOssuaryDivider />
 * ```
 * 
 * @example Crossed bones with label
 * ```tsx
 * <BoneOssuaryDivider
 *   pattern="crossed"
 *   size="lg"
 *   label="Chapter II"
 * />
 * ```
 * 
 * @example Scattered bones
 * ```tsx
 * <BoneOssuaryDivider
 *   pattern="scattered"
 *   boneCount={5}
 *   showRule
 * />
 * ```
 * 
 * @example Row of bones
 * ```tsx
 * <BoneOssuaryDivider
 *   pattern="row"
 *   size="sm"
 *   boneCount={3}
 * />
 * ```
 */
export const BoneOssuaryDivider = forwardRef<HTMLDivElement, BoneOssuaryDividerProps>(
  (
    {
      pattern = 'crossed',
      size = 'md',
      label,
      showRule = false,
      boneCount = 3,
      className = '',
      ...props
    },
    ref
  ) => {
    // Pattern-specific classes
    const patternClasses = {
      scattered: 'grave-ossuary--scattered',
      crossed: 'grave-ossuary--crossed',
      stacked: 'grave-ossuary--stacked',
      row: 'grave-ossuary--row',
    };

    // Size-specific classes
    const sizeClasses = {
      sm: 'grave-ossuary--sm',
      md: 'grave-ossuary--md',
      lg: 'grave-ossuary--lg',
    };

    // Bone size mapping
    const boneSizes = {
      sm: 16,
      md: 24,
      lg: 32,
    };

    const dividerClasses = [
      'grave-ossuary',
      patternClasses[pattern],
      sizeClasses[size],
      className,
    ].filter(Boolean).join(' ');

    // Render bones based on pattern
    const renderBones = () => {
      const boneSize = boneSizes[size];

      switch (pattern) {
        case 'crossed':
          return (
            <div className="grave-ossuary__crossed-bones">
              <Bone
                size={boneSize}
                color="currentColor"
                className="grave-ossuary__bone grave-ossuary__bone--1"
              />
              <Bone
                size={boneSize}
                color="currentColor"
                className="grave-ossuary__bone grave-ossuary__bone--2"
              />
            </div>
          );

        case 'stacked':
          return (
            <div className="grave-ossuary__stacked-bones">
              {Array.from({ length: 3 }).map((_, i) => (
                <Bone
                  key={i}
                  size={boneSize}
                  color="currentColor"
                  className={`grave-ossuary__bone grave-ossuary__bone--${i + 1}`}
                />
              ))}
            </div>
          );

        case 'row':
          return (
            <div className="grave-ossuary__row-bones">
              {Array.from({ length: Math.min(boneCount, 7) }).map((_, i) => (
                <Bone
                  key={i}
                  size={boneSize}
                  color="currentColor"
                  className={`grave-ossuary__bone grave-ossuary__bone--${i + 1}`}
                />
              ))}
            </div>
          );

        case 'scattered':
          return (
            <div className="grave-ossuary__scattered-bones">
              {Array.from({ length: Math.min(boneCount, 7) }).map((_, i) => (
                <Bone
                  key={i}
                  size={boneSize}
                  color="currentColor"
                  className={`grave-ossuary__bone grave-ossuary__bone--${i + 1}`}
                />
              ))}
            </div>
          );

        default:
          return null;
      }
    };

    return (
      <div
        ref={ref}
        className={dividerClasses}
        role="separator"
        aria-label={label || 'Section divider'}
        {...props}
      >
        {/* Optional rule line */}
        {showRule && <hr className="grave-ossuary__rule grave-ossuary__rule--before" />}

        {/* Bone arrangement */}
        <div className="grave-ossuary__bones">
          {renderBones()}
        </div>

        {/* Optional label */}
        {label && (
          <span className="grave-ossuary__label">
            {label}
          </span>
        )}

        {/* Optional rule line */}
        {showRule && <hr className="grave-ossuary__rule grave-ossuary__rule--after" />}
      </div>
    );
  }
);

BoneOssuaryDivider.displayName = 'BoneOssuaryDivider';
