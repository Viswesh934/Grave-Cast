/**
 * Badge - Primitive label/status component
 * @module components/primitives/Badge
 */

import React, { forwardRef } from 'react';
import type { HTMLAttributes } from 'react';

/**
 * Badge variant types
 */
export type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'wax-seal' | 'talisman';

/**
 * Badge size options
 */
export type BadgeSize = 'sm' | 'md' | 'lg';

/**
 * Badge component props
 */
export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  /** Visual variant */
  variant?: BadgeVariant;
  /** Size preset */
  size?: BadgeSize;
  /** Show dot indicator */
  dot?: boolean;
  /** Removable badge with close button */
  removable?: boolean;
  /** Callback when badge is removed */
  onRemove?: () => void;
}

/**
 * Primitive badge component for labels and status indicators.
 * Composable base for tags, chips, and status badges.
 * 
 * Uses token system for all styling values.
 * Designed for maximum flexibility across use cases.
 * 
 * @example
 * ```tsx
 * <Badge variant="success">Active</Badge>
 * ```
 * 
 * @example With dot indicator
 * ```tsx
 * <Badge variant="warning" dot>
 *   Pending
 * </Badge>
 * ```
 * 
 * @example Removable
 * ```tsx
 * <Badge
 *   variant="default"
 *   removable
 *   onRemove={() => console.log('removed')}
 * >
 *   Tag
 * </Badge>
 * ```
 */
export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  (
    {
      variant = 'default',
      size = 'md',
      dot = false,
      removable = false,
      onRemove,
      children,
      className = '',
      ...props
    },
    ref
  ) => {
    const baseClasses = [
      // Base styles
      'grave-badge',
      'inline-flex',
      'items-center',
      'gap-1',
      'font-medium',
      'whitespace-nowrap',
      
      // Variant styles (will be enhanced by Tailwind plugin)
      `grave-badge--${variant}`,
      
      // Size styles
      `grave-badge--${size}`,
      
      // Custom classes
      className,
    ].filter(Boolean).join(' ');

    const handleRemove = (e: React.MouseEvent) => {
      e.stopPropagation();
      onRemove?.();
    };

    return (
      <span
        ref={ref}
        className={baseClasses}
        {...props}
      >
        {dot && (
          <span
            className="grave-badge__dot"
            aria-hidden="true"
          />
        )}
        <span className="grave-badge__content">{children}</span>
        {removable && (
          <button
            type="button"
            className="grave-badge__remove"
            onClick={handleRemove}
            aria-label="Remove"
          >
            ×
          </button>
        )}
      </span>
    );
  }
);

Badge.displayName = 'Badge';
