/**
 * TombstoneCard - Weathered grave marker card component
 * @module components/crypt/TombstoneCard
 */

import { forwardRef } from 'react';
import { Card, type CardProps } from '../../primitives/Card';
import { Badge } from '../../primitives/Badge';
import { Headstone } from '../../../assets/svg/base/Headstone';

/**
 * Tombstone weathering states
 */
export type TombstoneWeathering = 'pristine' | 'aged' | 'cracked' | 'crumbling';

/**
 * TombstoneCard component props
 */
export interface TombstoneCardProps extends Omit<CardProps, 'variant' | 'header'> {
  /** Main engraving text (name or title) */
  title: string;
  /** Secondary text (dates, epitaph) */
  subtitle?: string;
  /** Epitaph or additional text */
  epitaph?: string;
  /** Weathering state of the tombstone */
  weathering?: TombstoneWeathering;
  /** Show headstone icon */
  showIcon?: boolean;
  /** Status badge text */
  status?: string;
  /** Status badge variant */
  statusVariant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
}

/**
 * TombstoneCard - A weathered grave marker themed card component.
 * 
 * Composes Card, Badge, and Headstone primitives into a themed component
 * representing a gravestone with engraving-style text and weathering effects.
 * 
 * Perfect for displaying memorial-style content, user cards with a gothic
 * aesthetic, or any content that benefits from a stone-carved appearance.
 * 
 * @example Basic usage
 * ```tsx
 * <TombstoneCard
 *   title="Here Lies..."
 *   subtitle="1847 - 1923"
 *   epitaph="Rest in Peace"
 * />
 * ```
 * 
 * @example With weathering and status
 * ```tsx
 * <TombstoneCard
 *   title="Ancient Tomb"
 *   subtitle="Discovered 2024"
 *   weathering="cracked"
 *   status="Active"
 *   statusVariant="success"
 *   showIcon
 * />
 * ```
 * 
 * @example Interactive card
 * ```tsx
 * <TombstoneCard
 *   title="Click Me"
 *   subtitle="Interactive Grave"
 *   interactive
 *   onClick={handleClick}
 *   weathering="aged"
 * />
 * ```
 */
export const TombstoneCard = forwardRef<HTMLDivElement, TombstoneCardProps>(
  (
    {
      title,
      subtitle,
      epitaph,
      weathering = 'aged',
      showIcon = false,
      status,
      statusVariant = 'default',
      children,
      className = '',
      ...cardProps
    },
    ref
  ) => {
    // Build weathering-specific classes
    const weatheringClasses = {
      pristine: 'grave-tombstone--pristine',
      aged: 'grave-tombstone--aged',
      cracked: 'grave-tombstone--cracked',
      crumbling: 'grave-tombstone--crumbling',
    };

    const tombstoneClasses = [
      'grave-tombstone',
      weatheringClasses[weathering],
      className,
    ].filter(Boolean).join(' ');

    return (
      <Card
        ref={ref}
        variant="outlined"
        padding="lg"
        className={tombstoneClasses}
        {...cardProps}
      >
        {/* Header section with optional icon and status */}
        <div className="grave-tombstone__header">
          {showIcon && (
            <div className="grave-tombstone__icon">
              <Headstone 
                size={48} 
                color="currentColor"
                className="opacity-50"
              />
            </div>
          )}
          {status && (
            <div className="grave-tombstone__status">
              <Badge variant={statusVariant} size="sm">
                {status}
              </Badge>
            </div>
          )}
        </div>

        {/* Main engraving section */}
        <div className="grave-tombstone__engraving">
          <h3 className="grave-tombstone__title">
            {title}
          </h3>
          {subtitle && (
            <p className="grave-tombstone__subtitle">
              {subtitle}
            </p>
          )}
          {epitaph && (
            <p className="grave-tombstone__epitaph">
              {epitaph}
            </p>
          )}
        </div>

        {/* Optional custom content */}
        {children && (
          <div className="grave-tombstone__content">
            {children}
          </div>
        )}
      </Card>
    );
  }
);

TombstoneCard.displayName = 'TombstoneCard';
