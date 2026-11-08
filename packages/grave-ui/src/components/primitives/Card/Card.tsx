/**
 * Card - Primitive container component
 * @module components/primitives/Card
 */

import React, { forwardRef } from 'react';
import type { HTMLAttributes } from 'react';

/**
 * Card variant types
 */
export type CardVariant = 'default' | 'elevated' | 'outlined' | 'flat';

/**
 * Card padding options
 */
export type CardPadding = 'none' | 'sm' | 'md' | 'lg';

/**
 * Card component props
 */
export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Visual variant */
  variant?: CardVariant;
  /** Padding preset */
  padding?: CardPadding;
  /** Make card interactive (hoverable/clickable) */
  interactive?: boolean;
  /** Disable card interactions */
  disabled?: boolean;
  /** Card header content */
  header?: React.ReactNode;
  /** Card footer content */
  footer?: React.ReactNode;
}

/**
 * Primitive card component for content containers.
 * Composable base for complex card-based layouts.
 * 
 * Uses token system for all styling values.
 * Designed for maximum flexibility and reusability.
 * 
 * @example
 * ```tsx
 * <Card variant="elevated" padding="md">
 *   <h2>Card Title</h2>
 *   <p>Card content goes here</p>
 * </Card>
 * ```
 * 
 * @example With header and footer
 * ```tsx
 * <Card
 *   variant="outlined"
 *   header={<h3>Header</h3>}
 *   footer={<Button>Action</Button>}
 * >
 *   Main content
 * </Card>
 * ```
 */
export const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      variant = 'default',
      padding = 'md',
      interactive = false,
      disabled = false,
      header,
      footer,
      children,
      className = '',
      ...props
    },
    ref
  ) => {
    const baseClasses = [
      // Base styles
      'grave-card',
      'block',
      
      // Variant styles (will be enhanced by Tailwind plugin)
      `grave-card--${variant}`,
      
      // Padding styles
      padding !== 'none' ? `grave-card--padding-${padding}` : '',
      
      // Interactive states
      interactive && !disabled ? 'grave-card--interactive' : '',
      disabled ? 'grave-card--disabled' : '',
      
      // Custom classes
      className,
    ].filter(Boolean).join(' ');

    return (
      <div
        ref={ref}
        className={baseClasses}
        aria-disabled={disabled}
        {...props}
      >
        {header && (
          <div className="grave-card__header">
            {header}
          </div>
        )}
        <div className="grave-card__body">
          {children}
        </div>
        {footer && (
          <div className="grave-card__footer">
            {footer}
          </div>
        )}
      </div>
    );
  }
);

Card.displayName = 'Card';
