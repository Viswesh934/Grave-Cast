/**
 * Button - Primitive interactive component
 * @module components/primitives/Button
 */

import React, { forwardRef } from 'react';
import type { ButtonHTMLAttributes } from 'react';

/**
 * Button variant types
 */
export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

/**
 * Button size options
 */
export type ButtonSize = 'sm' | 'md' | 'lg';

/**
 * Button component props
 */
export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual variant */
  variant?: ButtonVariant;
  /** Size preset */
  size?: ButtonSize;
  /** Full width button */
  fullWidth?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Loading state */
  loading?: boolean;
  /** Left icon element */
  leftIcon?: React.ReactNode;
  /** Right icon element */
  rightIcon?: React.ReactNode;
}

/**
 * Primitive button component with horror-themed styling.
 * Composable base for interactive elements.
 * 
 * Uses token system for all styling values.
 * Designed for maximum reusability across components.
 * 
 * @example
 * ```tsx
 * <Button variant="primary" size="md" onClick={handleClick}>
 *   Click Me
 * </Button>
 * ```
 * 
 * @example With icons
 * ```tsx
 * <Button 
 *   variant="secondary" 
 *   leftIcon={<Skull size={16} />}
 * >
 *   Spooky Action
 * </Button>
 * ```
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      fullWidth = false,
      disabled = false,
      loading = false,
      leftIcon,
      rightIcon,
      children,
      className = '',
      ...props
    },
    ref
  ) => {
    const baseClasses = [
      // Base styles
      'grave-button',
      'inline-flex',
      'items-center',
      'justify-center',
      'gap-2',
      'font-medium',
      'transition-all',
      'cursor-pointer',
      'select-none',
      'outline-none',
      'focus:outline-none',
      
      // Variant styles (will be enhanced by Tailwind plugin)
      `grave-button--${variant}`,
      
      // Size styles
      `grave-button--${size}`,
      
      // State styles
      disabled || loading ? 'grave-button--disabled' : 'grave-button--active',
      
      // Width
      fullWidth ? 'w-full' : '',
      
      // Custom classes
      className,
    ].filter(Boolean).join(' ');

    return (
      <button
        ref={ref}
        className={baseClasses}
        disabled={disabled || loading}
        aria-disabled={disabled || loading}
        aria-busy={loading}
        {...props}
      >
        {loading && (
          <span className="grave-button__spinner" aria-hidden="true">
            ⟳
          </span>
        )}
        {!loading && leftIcon && (
          <span className="grave-button__icon-left" aria-hidden="true">
            {leftIcon}
          </span>
        )}
        <span className="grave-button__content">{children}</span>
        {!loading && rightIcon && (
          <span className="grave-button__icon-right" aria-hidden="true">
            {rightIcon}
          </span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
