/**
 * BloodVialProgress - Vampire blood vial progress bar
 * @module components/sanguine/BloodVialProgress
 */

import { forwardRef, type HTMLAttributes } from 'react';
import { palette } from '../../../tokens';

/**
 * Blood liquid gradients and glow, composed from the sanguine palette tokens
 * so the fill color stays consistent with the rest of the design system.
 */
/** What fills the vial: blood, or green ectoplasm for the grove theme. */
export type VialLiquid = 'blood' | 'ectoplasm';

const liquidFill: Record<VialLiquid, { vertical: string; horizontal: string; glowStrong: string; glowSoft: string; meniscus: string; text: string }> = {
  blood: {
    vertical: `linear-gradient(180deg, ${palette.sanguine.plasma} 0%, ${palette.sanguine.crimson} 40%, ${palette.sanguine.coagulated} 100%)`,
    horizontal: `linear-gradient(90deg, ${palette.sanguine.coagulated} 0%, ${palette.sanguine.blood} 50%, ${palette.sanguine.crimson} 90%, ${palette.sanguine.plasma} 100%)`,
    glowStrong: `0 0 16px ${palette.sanguine.crimson}`,
    glowSoft: `0 0 12px ${palette.sanguine.crimson}`,
    meniscus: palette.sanguine.plasma,
    text: palette.sanguine.plasma,
  },
  ectoplasm: {
    vertical: `linear-gradient(180deg, ${palette.grove.glow} 0%, ${palette.witch.emerald} 40%, ${palette.crypt.moss} 100%)`,
    horizontal: `linear-gradient(90deg, ${palette.crypt.moss} 0%, ${palette.crypt.lichen} 50%, ${palette.witch.emerald} 90%, ${palette.grove.glow} 100%)`,
    glowStrong: `0 0 16px ${palette.witch.emerald}`,
    glowSoft: `0 0 10px ${palette.witch.emerald}`,
    meniscus: palette.grove.glow,
    text: palette.grove.glow,
  },
};

export interface BloodVialProgressProps extends HTMLAttributes<HTMLDivElement> {
  /** Progress percentage (0 - 100) */
  value: number;
  /** Maximum capacity */
  max?: number;
  /** Label */
  label?: string;
  /** Show numerical percentage text */
  showPercentage?: boolean;
  /** Glass vial orientation */
  orientation?: 'horizontal' | 'vertical';
  /** What fills the vial. @default 'blood' */
  liquid?: VialLiquid;
}

export const BloodVialProgress = forwardRef<HTMLDivElement, BloodVialProgressProps>(
  (
    {
      value,
      max = 100,
      label = 'Sanguine Essence',
      showPercentage = true,
      orientation = 'horizontal',
      liquid = 'blood',
      className = '',
      ...props
    },
    ref
  ) => {
    const bloodFill = liquidFill[liquid];
    const percentage = Math.min(100, Math.max(0, Math.round((value / max) * 100)));

    if (orientation === 'vertical') {
      return (
        <div
          ref={ref}
          className={`inline-flex flex-col items-center gap-3 select-none ${className}`}
          {...props}
        >
          {label && (
            <span className="text-xs font-mono uppercase tracking-widest text-grave-mist-300">
              {label}
            </span>
          )}

          {/* Vertical Glass Test Tube */}
          <div className="relative w-8 h-48 rounded-b-full rounded-t-sm border-2 border-grave-mist-500/60 bg-grave-dark-850/80 backdrop-blur-md p-1 flex flex-col justify-end overflow-hidden shadow-[inset_0_0_12px_rgba(0,0,0,0.8),0_4px_16px_rgba(0,0,0,0.6)]">
            {/* Rubber / Cork Stopper at Top */}
            <div className="absolute top-0 inset-x-0 h-2 bg-[#6b4226] border-b border-[#3e2515]" />

            {/* Measurement Graduations */}
            <div className="absolute inset-y-4 right-1 flex flex-col justify-between pointer-events-none opacity-40">
              <span className="w-2 h-0.5 bg-white" />
              <span className="w-1.5 h-0.5 bg-white" />
              <span className="w-2 h-0.5 bg-white" />
              <span className="w-1.5 h-0.5 bg-white" />
              <span className="w-2 h-0.5 bg-white" />
            </div>

            {/* Rising Blood Liquid */}
            <div
              className="w-full rounded-b-full transition-all duration-700 ease-out relative overflow-hidden"
              style={{
                height: `${percentage}%`,
                background: bloodFill.vertical,
                boxShadow: bloodFill.glowStrong,
              }}
            >
              {/* Liquid Meniscus Curve */}
              <div className="absolute top-0 inset-x-0 h-2 rounded-full opacity-80" style={{ background: bloodFill.meniscus }} />

              {/* Bubbles floating inside blood */}
              <div className="absolute bottom-2 left-1.5 w-1.5 h-1.5 rounded-full bg-white/40 animate-ping" style={{ animationDuration: '2s' }} />
              <div className="absolute bottom-6 right-1.5 w-1 h-1 rounded-full bg-white/50 animate-pulse" />
            </div>
          </div>

          {showPercentage && (
            <span className="text-xs font-mono font-bold" style={{ color: bloodFill.text }}>
              {percentage}%
            </span>
          )}
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={`w-full flex flex-col gap-2 select-none ${className}`}
        {...props}
      >
        <div className="flex justify-between items-center text-xs">
          {label && (
            <span className="font-mono uppercase tracking-widest text-grave-mist-300 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: bloodFill.meniscus }} />
              {label}
            </span>
          )}
          {showPercentage && (
            <span className="font-mono font-bold" style={{ color: bloodFill.text }}>
              {percentage}%
            </span>
          )}
        </div>

        {/* Horizontal Glass Tube */}
        <div className="relative h-6 rounded-full border-2 border-grave-mist-500/60 bg-grave-dark-850/90 p-0.5 overflow-hidden shadow-[inset_0_2px_8px_rgba(0,0,0,0.8),0_2px_12px_rgba(189,8,28,0.2)]">
          {/* Blood fill */}
          <div
            className="h-full rounded-full transition-all duration-700 ease-out relative flex items-center justify-end pr-2 overflow-hidden"
            style={{
              width: `${percentage}%`,
              background: bloodFill.horizontal,
              boxShadow: bloodFill.glowSoft,
            }}
          >
            {/* Specular glass reflection bar across blood */}
            <div className="absolute top-0.5 inset-x-2 h-1 rounded-full bg-white/30" />
          </div>
        </div>
      </div>
    );
  }
);

BloodVialProgress.displayName = 'BloodVialProgress';
