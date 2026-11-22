/**
 * IconButton - A button that shows only an icon
 * @module components/primitives/IconButton
 */

import { forwardRef, type ReactNode } from 'react';
import { Button, type ButtonProps } from '../Button/Button';

/**
 * IconButton props. `label` is required: with no words on the button, it is
 * the button's name for screen readers and the tooltip everyone else sees.
 */
export interface IconButtonProps extends Omit<ButtonProps, 'children' | 'leftIcon' | 'rightIcon' | 'aria-label'> {
  /** What the button does, such as "Play again". Read by screen readers and shown as the tooltip. */
  label: string;
  /** The icon. Keep it hidden from screen readers (`aria-hidden`), since `label` already names the button. */
  children: ReactNode;
}

/**
 * A Button with only an icon in it. It always has a name (`label`), which is
 * also its tooltip unless `title` says otherwise.
 *
 * @example
 * ```tsx
 * <IconButton label="Close the game" variant="gothic" size="sm" onClick={close}>
 *   <CloseMark size="0.9rem" />
 * </IconButton>
 * ```
 */
export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(({ label, title, children, ...props }, ref) => (
  <Button ref={ref} aria-label={label} title={title ?? label} {...props}>
    {children}
  </Button>
));
IconButton.displayName = 'IconButton';
