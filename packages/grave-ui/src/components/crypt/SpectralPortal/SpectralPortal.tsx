/**
 * SpectralPortal - Flexible portal/modal with render props
 * @module components/crypt/SpectralPortal
 */

import { useState, useEffect, useRef, type ReactNode, type CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import { Card } from '../../primitives/Card';
import { Button } from '../../primitives/Button';
import { Cross } from '../../../assets/svg/base/Cross';
import { useAnimationState } from '../../../hooks/useAnimationState';
import { animations } from '../../../tokens';
import { portalTokens } from './tokens';

/**
 * Portal container type
 */
export type PortalContainer = 'body' | 'custom' | Element;

/**
 * Render prop for portal content
 */
export type PortalRenderProp = (props: {
  /** Whether the portal is open */
  isOpen: boolean;
  /** Function to close the portal */
  close: () => void;
  /** Whether the portal is currently animating */
  isAnimating: boolean;
}) => ReactNode;

/**
 * Render prop for portal trigger
 */
export type PortalTriggerRenderProp = (props: {
  /** Whether the portal is open */
  isOpen: boolean;
  /** Function to open the portal */
  open: () => void;
  /** Function to close the portal */
  close: () => void;
  /** Function to toggle the portal */
  toggle: () => void;
}) => ReactNode;

/**
 * SpectralPortal component props
 */
export interface SpectralPortalProps {
  /** Portal content - can be ReactNode or render prop for full control */
  children: ReactNode | PortalRenderProp;
  /** Optional custom trigger - render prop for full control */
  trigger?: PortalTriggerRenderProp;
  /** Whether portal is open (controlled mode) */
  open?: boolean;
  /** Callback when open state changes */
  onOpenChange?: (open: boolean) => void;
  /** Default open state (uncontrolled mode) */
  defaultOpen?: boolean;
  /** Where to render the portal */
  container?: PortalContainer;
  /** Whether to show default overlay backdrop */
  showOverlay?: boolean;
  /** Whether clicking overlay closes portal */
  closeOnOverlayClick?: boolean;
  /** Whether pressing Escape closes portal */
  closeOnEscape?: boolean;
  /** Whether to show default close button */
  showCloseButton?: boolean;
  /** Whether to use default Card wrapper */
  useDefaultWrapper?: boolean;
  /** Additional CSS classes for wrapper */
  className?: string;
  /** Custom styles for wrapper */
  style?: CSSProperties;
}

/**
 * SpectralPortal - A flexible portal/modal component with render props.
 * 
 * Demonstrates advanced patterns:
 * - Render props for maximum customization
 * - Portal rendering to custom containers
 * - Controlled/uncontrolled modes
 * - Flexible composition (with or without default wrapper)
 * 
 * Can render anywhere in the DOM tree while maintaining React context.
 * Perfect for modals, tooltips, popovers, or any content that needs
 * to escape parent overflow constraints.
 * 
 * @example Basic modal with defaults
 * ```tsx
 * <SpectralPortal trigger={({ open }) => (
 *   <button onClick={open}>Open Portal</button>
 * )}>
 *   <h2>Portal Content</h2>
 *   <p>This content is rendered in a portal</p>
 * </SpectralPortal>
 * ```
 * 
 * @example Custom styled portal with render prop
 * ```tsx
 * <SpectralPortal
 *   useDefaultWrapper={false}
 *   showOverlay={false}
 *   trigger={({ toggle, isOpen }) => (
 *     <Button onClick={toggle}>
 *       {isOpen ? 'Close' : 'Open'} Custom Portal
 *     </Button>
 *   )}
 * >
 *   {({ close, isOpen, isAnimating }) => (
 *     <div className={`custom-portal ${isAnimating ? 'animating' : ''}`}>
 *       <h2>Fully Custom Content</h2>
 *       <button onClick={close}>Close</button>
 *     </div>
 *   )}
 * </SpectralPortal>
 * ```
 * 
 * @example Controlled portal
 * ```tsx
 * const [open, setOpen] = useState(false);
 * 
 * <SpectralPortal
 *   open={open}
 *   onOpenChange={setOpen}
 * >
 *   Portal content here
 * </SpectralPortal>
 * ```
 * 
 * @example Tooltip-style portal
 * ```tsx
 * <SpectralPortal
 *   showOverlay={false}
 *   useDefaultWrapper={false}
 *   closeOnEscape
 *   trigger={({ open }) => (
 *     <span onMouseEnter={open}>Hover me</span>
 *   )}
 * >
 *   {({ close }) => (
 *     <div className="tooltip" onMouseLeave={close}>
 *       Tooltip content
 *     </div>
 *   )}
 * </SpectralPortal>
 * ```
 */
export const SpectralPortal = ({
  children,
  trigger,
  open: controlledOpen,
  onOpenChange,
  defaultOpen = false,
  container = 'body',
  showOverlay = true,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  showCloseButton = true,
  useDefaultWrapper = true,
  className = '',
  style,
}: SpectralPortalProps) => {
  // Determine if controlled
  const isControlled = controlledOpen !== undefined;

  // Internal open state
  const [internalOpen, setInternalOpen] = useState(defaultOpen);

  // Actual open state
  const isOpen = isControlled ? controlledOpen : internalOpen;

  // Animation state
  const { isAnimating, startAnimation } = useAnimationState();

  // Portal container ref
  const containerRef = useRef<Element | null>(null);

  // Initialize container
  useEffect(() => {
    if (container === 'body') {
      containerRef.current = document.body;
    } else if (container === 'custom') {
      // Custom container would be provided by consumer
      containerRef.current = document.body; // Fallback
    } else {
      containerRef.current = container;
    }
  }, [container]);

  // Open handler
  const open = () => {
    startAnimation();
    if (!isControlled) {
      setInternalOpen(true);
    }
    onOpenChange?.(true);
  };

  // Close handler
  const close = () => {
    startAnimation();
    if (!isControlled) {
      setInternalOpen(false);
    }
    onOpenChange?.(false);
  };

  // Toggle handler
  const toggle = () => {
    if (isOpen) {
      close();
    } else {
      open();
    }
  };

  // Handle escape key
  useEffect(() => {
    if (!isOpen || !closeOnEscape) return () => {};

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        close();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, closeOnEscape]); // eslint-disable-line react-hooks/exhaustive-deps

  // Handle overlay click
  const handleOverlayClick = () => {
    if (closeOnOverlayClick) {
      close();
    }
  };

  // Render portal content
  const renderContent = () => {
    const content = typeof children === 'function'
      ? (children as PortalRenderProp)({ isOpen, close, isAnimating })
      : children;

    if (!useDefaultWrapper) {
      return content;
    }

    return (
      <>
        {showOverlay && (
          <div
            className={`grave-spectral-portal__overlay ${isOpen ? 'grave-spectral-portal__overlay--visible' : ''}`}
            onClick={handleOverlayClick}
            aria-hidden="true"
          />
        )}
        <div
          className={`grave-spectral-portal__wrapper ${isOpen ? 'grave-spectral-portal__wrapper--open' : ''} ${className}`}
          role="dialog"
          aria-modal="true"
          style={style}
        >
          <Card
            variant="elevated"
            className="grave-spectral-portal__content"
          >
            {showCloseButton && (
              <div className="grave-spectral-portal__header">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={close}
                  aria-label="Close portal"
                  className="grave-spectral-portal__close"
                >
                  <Cross size={16} color="currentColor" />
                </Button>
              </div>
            )}
            <div className="grave-spectral-portal__body">
              {content}
            </div>
          </Card>
        </div>
      </>
    );
  };

  return (
    <>
      {/* Render trigger if provided */}
      {trigger && trigger({ isOpen, open, close, toggle })}

      {/* Render portal when open */}
      {isOpen && containerRef.current && createPortal(
        renderContent(),
        containerRef.current
      )}
    </>
  );
};

/**
 * SpectralPortal.Overlay - Reusable overlay component
 * 
 * Can be used independently for custom portal layouts.
 */
export interface OverlayProps {
  /** Whether the overlay is visible */
  visible?: boolean;
  /** Click handler */
  onClick?: () => void;
  /** Additional CSS classes */
  className?: string;
  /** Custom styles */
  style?: CSSProperties;
}

SpectralPortal.Overlay = ({
  visible = true,
  onClick,
  className = '',
  style,
}: OverlayProps) => (
  <div
    className={`grave-spectral-portal__overlay ${visible ? 'grave-spectral-portal__overlay--visible' : ''} ${className}`}
    onClick={onClick}
    aria-hidden="true"
    style={{
      position: 'fixed',
      inset: '0',
      backgroundColor: portalTokens.overlay.backgroundColor,
      transition: `opacity ${animations.durations.creep} ${animations.easing.easeInOut}`,
      opacity: visible ? portalTokens.overlay.opacity.visible : portalTokens.overlay.opacity.hidden,
      zIndex: portalTokens.zIndex.overlay,
      ...style,
    }}
  />
);

/**
 * SpectralPortal.Content - Reusable content wrapper
 * 
 * Can be used with useDefaultWrapper={false} for custom layouts.
 */
export interface ContentWrapperProps {
  /** Content children */
  children: ReactNode;
  /** Whether the portal is open */
  isOpen?: boolean;
  /** Close handler for close button */
  onClose?: () => void;
  /** Whether to show close button */
  showCloseButton?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Custom styles */
  style?: CSSProperties;
}

SpectralPortal.Content = ({
  children,
  isOpen = true,
  onClose,
  showCloseButton = true,
  className = '',
  style,
}: ContentWrapperProps) => (
  <div
    className={`grave-spectral-portal__wrapper ${isOpen ? 'grave-spectral-portal__wrapper--open' : ''} ${className}`}
    role="dialog"
    aria-modal="true"
    style={{
      position: 'fixed',
      inset: '0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: portalTokens.zIndex.content,
      ...style,
    }}
  >
    <Card variant="elevated" className="grave-spectral-portal__content">
      {showCloseButton && onClose && (
        <div className="grave-spectral-portal__header">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            aria-label="Close portal"
            className="grave-spectral-portal__close"
          >
            <Cross size={16} color="currentColor" />
          </Button>
        </div>
      )}
      <div className="grave-spectral-portal__body">
        {children}
      </div>
    </Card>
  </div>
);
