/**
 * MausoleumDrawer - Animated drawer/panel component with tomb door theme
 * @module components/crypt/MausoleumDrawer
 */

import { forwardRef, useEffect, useState } from 'react';
import { Card, type CardProps } from '../../primitives/Card';
import { Button } from '../../primitives/Button';
import { Cross } from '../../../assets/svg/base/Cross';

/**
 * Drawer position options
 */
export type DrawerPosition = 'left' | 'right' | 'top' | 'bottom';

/**
 * Drawer size options
 */
export type DrawerSize = 'sm' | 'md' | 'lg' | 'full';

/**
 * MausoleumDrawer component props
 */
export interface MausoleumDrawerProps extends Omit<CardProps, 'variant'> {
  /** Whether the drawer is open */
  open: boolean;
  /** Callback when drawer should close */
  onClose?: () => void;
  /** Drawer position */
  position?: DrawerPosition;
  /** Drawer size */
  size?: DrawerSize;
  /** Drawer title */
  title?: string;
  /** Show close button */
  showCloseButton?: boolean;
  /** Show tomb door decoration */
  showDecoration?: boolean;
  /** Prevent closing on overlay click */
  preventOverlayClose?: boolean;
  /** Prevent closing on escape key */
  preventEscapeClose?: boolean;
}

/**
 * MausoleumDrawer - An animated drawer component themed as a tomb entrance.
 * 
 * Slides in from any edge with smooth animations, featuring optional
 * tomb door decorations and overlay backdrop. Composes Card and Button
 * primitives with animation token integration.
 * 
 * Perfect for side panels, navigation drawers, detailed views, or any
 * content that should slide in like opening a mausoleum door.
 * 
 * @example Basic drawer
 * ```tsx
 * const [open, setOpen] = useState(false);
 * 
 * <MausoleumDrawer
 *   open={open}
 *   onClose={() => setOpen(false)}
 *   title="Vault Contents"
 * >
 *   <p>Drawer content here</p>
 * </MausoleumDrawer>
 * ```
 * 
 * @example Right side with decoration
 * ```tsx
 * <MausoleumDrawer
 *   open={isOpen}
 *   onClose={handleClose}
 *   position="right"
 *   size="lg"
 *   title="Ancient Secrets"
 *   showDecoration
 * >
 *   <div>Detailed content...</div>
 * </MausoleumDrawer>
 * ```
 * 
 * @example Full-screen drawer
 * ```tsx
 * <MausoleumDrawer
 *   open={isOpen}
 *   onClose={handleClose}
 *   size="full"
 *   preventOverlayClose
 *   showCloseButton
 * >
 *   <article>Full content...</article>
 * </MausoleumDrawer>
 * ```
 */
export const MausoleumDrawer = forwardRef<HTMLDivElement, MausoleumDrawerProps>(
  (
    {
      open,
      onClose,
      position = 'right',
      size = 'md',
      title,
      showCloseButton = true,
      showDecoration = false,
      preventOverlayClose = false,
      preventEscapeClose = false,
      children,
      className = '',
      ...cardProps
    },
    ref
  ) => {
    const [isVisible, setIsVisible] = useState(open);
    const [isAnimating, setIsAnimating] = useState(false);

    // Handle open/close with animation delay
    useEffect(() => {
      if (open) {
        setIsVisible(true);
        setIsAnimating(true);
        return () => {}; // No cleanup needed when opening
      } else {
        setIsAnimating(false);
        const timer = setTimeout(() => setIsVisible(false), 300);
        return () => clearTimeout(timer);
      }
    }, [open]);

    // Handle escape key
    useEffect(() => {
      if (!open || preventEscapeClose) {
        return () => {}; // No-op cleanup
      }

      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose?.();
        }
      };

      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }, [open, onClose, preventEscapeClose]);

    // Handle overlay click
    const handleOverlayClick = () => {
      if (!preventOverlayClose) {
        onClose?.();
      }
    };

    // Position-specific classes
    const positionClasses = {
      left: 'grave-mausoleum--left',
      right: 'grave-mausoleum--right',
      top: 'grave-mausoleum--top',
      bottom: 'grave-mausoleum--bottom',
    };

    // Size-specific classes
    const sizeClasses = {
      sm: 'grave-mausoleum--sm',
      md: 'grave-mausoleum--md',
      lg: 'grave-mausoleum--lg',
      full: 'grave-mausoleum--full',
    };

    const drawerClasses = [
      'grave-mausoleum',
      positionClasses[position],
      sizeClasses[size],
      isAnimating ? 'grave-mausoleum--open' : 'grave-mausoleum--closed',
      className,
    ].filter(Boolean).join(' ');

    if (!isVisible) return null;

    return (
      <>
        {/* Overlay backdrop */}
        <div
          className={`grave-mausoleum__overlay ${isAnimating ? 'grave-mausoleum__overlay--visible' : ''}`}
          onClick={handleOverlayClick}
          aria-hidden="true"
        />

        {/* Drawer panel */}
        <aside
          className={drawerClasses}
          role="dialog"
          aria-modal="true"
          aria-labelledby={title ? 'mausoleum-title' : undefined}
        >
          <Card
            ref={ref}
            variant="elevated"
            padding="none"
            className="grave-mausoleum__panel"
            {...cardProps}
          >
            {/* Header with optional close button */}
            {(title || showCloseButton || showDecoration) && (
              <div className="grave-mausoleum__header">
                {showDecoration && (
                  <div className="grave-mausoleum__decoration">
                    <Cross size={24} color="currentColor" className="opacity-30" />
                  </div>
                )}
                {title && (
                  <h2 id="mausoleum-title" className="grave-mausoleum__title">
                    {title}
                  </h2>
                )}
                {showCloseButton && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClose}
                    aria-label="Close drawer"
                    className="grave-mausoleum__close"
                  >
                    ✕
                  </Button>
                )}
              </div>
            )}

            {/* Drawer content */}
            <div className="grave-mausoleum__content">
              {children}
            </div>
          </Card>
        </aside>
      </>
    );
  }
);

MausoleumDrawer.displayName = 'MausoleumDrawer';
