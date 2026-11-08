/**
 * CobwebCorner - Decorative arachnid web component
 * @module components/arachnid/CobwebCorner
 */

import { forwardRef, type HTMLAttributes } from 'react';

export type CobwebPosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
export type CobwebSize = 'sm' | 'md' | 'lg';

export interface CobwebCornerProps extends HTMLAttributes<HTMLDivElement> {
  /** Corner position */
  position?: CobwebPosition;
  /** Size preset */
  size?: CobwebSize;
  /** Whether to show a dangling spider */
  hasSpider?: boolean;
  /** Web strand color */
  color?: string;
  /** Spider drop distance on hover */
  interactive?: boolean;
}

export const CobwebCorner = forwardRef<HTMLDivElement, CobwebCornerProps>(
  (
    {
      position = 'top-right',
      size = 'md',
      hasSpider = true,
      color = 'rgba(232, 224, 213, 0.45)',
      interactive = true,
      className = '',
      style,
      ...props
    },
    ref
  ) => {
    const sizeMap = {
      sm: { dimension: 70, spiderSize: 10 },
      md: { dimension: 110, spiderSize: 14 },
      lg: { dimension: 160, spiderSize: 18 },
    };

    const currentSize = sizeMap[size];

    const positionStyles: Record<CobwebPosition, string> = {
      'top-left': 'top-0 left-0 origin-top-left',
      'top-right': 'top-0 right-0 origin-top-right rotate-90',
      'bottom-right': 'bottom-0 right-0 origin-bottom-right rotate-180',
      'bottom-left': 'bottom-0 left-0 origin-bottom-left -rotate-90',
    };

    return (
      <div
        ref={ref}
        className={`absolute pointer-events-none select-none z-10 ${positionStyles[position]} ${className}`}
        style={{
          width: currentSize.dimension,
          height: currentSize.dimension,
          ...style,
        }}
        {...props}
      >
        {/* SVG Web Geometry */}
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full overflow-visible transition-opacity duration-300"
          style={{ stroke: color }}
          fill="none"
          strokeWidth="1.2"
          strokeLinecap="round"
        >
          {/* Main radial anchor lines */}
          <line x1="0" y1="0" x2="100" y2="0" strokeDasharray="1 1" />
          <line x1="0" y1="0" x2="96" y2="28" />
          <line x1="0" y1="0" x2="85" y2="53" />
          <line x1="0" y1="0" x2="68" y2="73" />
          <line x1="0" y1="0" x2="42" y2="91" />
          <line x1="0" y1="0" x2="0" y2="100" strokeDasharray="1 1" />

          {/* Spiral connective web arcs */}
          {/* Ring 1 (Center) */}
          <path d="M 22 0 Q 20 6 18 12 Q 15 16 12 18 Q 6 20 0 22" />
          {/* Ring 2 */}
          <path d="M 45 0 Q 42 12 37 23 Q 30 33 23 37 Q 12 42 0 45" />
          {/* Ring 3 */}
          <path d="M 68 0 Q 64 18 57 35 Q 46 50 35 57 Q 18 64 0 68" />
          {/* Ring 4 */}
          <path d="M 88 0 Q 83 24 74 46 Q 60 65 46 74 Q 24 83 0 88" />
          {/* Outer strands */}
          <path d="M 98 12 Q 88 38 78 58 Q 58 78 38 88 Q 12 98 0 100" strokeOpacity="0.6" />

          {/* Dangling Silk Thread & Spider */}
          {hasSpider && (
            <g className={interactive ? 'pointer-events-auto cursor-pointer group' : ''}>
              {/* Elastic silk thread */}
              <line
                x1="68"
                y1="73"
                x2="68"
                y2="95"
                stroke={color}
                strokeWidth="0.8"
                strokeDasharray="2 1"
                className="transition-all duration-300 group-hover:y2-[125]"
              />
              {/* Spider Body */}
              <g
                className="transition-transform duration-300 ease-out group-hover:translate-y-6"
                transform="translate(68, 96)"
              >
                {/* Spider Legs */}
                <path
                  d="M -5 -3 Q -10 -6 -8 -11 M -6 0 Q -12 0 -11 -4 M -6 2 Q -12 5 -9 9 M -4 4 Q -9 10 -6 13"
                  stroke={color}
                  strokeWidth="1.2"
                />
                <path
                  d="M 5 -3 Q 10 -6 8 -11 M 6 0 Q 12 0 11 -4 M 6 2 Q 12 5 9 9 M 4 4 Q 9 10 6 13"
                  stroke={color}
                  strokeWidth="1.2"
                />
                {/* Spider Abdomen */}
                <ellipse cx="0" cy="3" rx="4.5" ry="5.5" fill="#12131a" stroke={color} strokeWidth="1" />
                {/* Spider Cephalothorax */}
                <circle cx="0" cy="-2.5" r="2.8" fill="#1f212d" stroke={color} strokeWidth="1" />
                {/* Spider Eyes */}
                <circle cx="-1" cy="-3.5" r="0.6" fill="#bd081c" />
                <circle cx="1" cy="-3.5" r="0.6" fill="#bd081c" />
              </g>
            </g>
          )}
        </svg>
      </div>
    );
  }
);

CobwebCorner.displayName = 'CobwebCorner';

