/**
 * RunicButton - Arcane button with glowing Elder Futhark runes
 * @module components/coven/RunicButton
 */

import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { playSound } from '../../../audio';

export type RuneElement = 'fire' | 'frost' | 'blood' | 'spectral';

export interface RunicButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Magical element type */
  element?: RuneElement;
  /** Elder Futhark rune symbols shown on edges */
  sigils?: string;
  /** Sound on click */
  soundOnClick?: boolean;
}

export const RunicButton = forwardRef<HTMLButtonElement, RunicButtonProps>(
  (
    {
      element = 'spectral',
      sigils = 'ᚦ ᚨ ᚱ ᚲ ᚷ',
      soundOnClick = true,
      children,
      className = '',
      onClick,
      ...props
    },
    ref
  ) => {
    const elementGlow = {
      spectral: 'text-purple-400 group-hover:text-purple-300 drop-shadow-[0_0_8px_rgba(168,85,247,0.8)] border-purple-900/60 hover:border-purple-500/80',
      fire: 'text-amber-400 group-hover:text-amber-300 drop-shadow-[0_0_8px_rgba(245,158,11,0.8)] border-amber-900/60 hover:border-amber-500/80',
      blood: 'text-red-400 group-hover:text-red-300 drop-shadow-[0_0_8px_rgba(239,68,68,0.8)] border-red-900/60 hover:border-red-500/80',
      frost: 'text-cyan-400 group-hover:text-cyan-300 drop-shadow-[0_0_8px_rgba(6,182,212,0.8)] border-cyan-900/60 hover:border-cyan-500/80',
    };

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (soundOnClick) {
        playSound('boneClick');
      }
      onClick?.(e);
    };

    return (
      <button
        ref={ref}
        onClick={handleClick}
        className={`group relative inline-flex items-center justify-between gap-3 px-5 py-2.5 rounded-lg bg-grave-dark-850 hover:bg-grave-dark-800 border transition-all duration-300 cursor-pointer shadow-lg active:scale-[0.98] ${elementGlow[element]} ${className}`}
        {...props}
      >
        {/* Left sigils */}
        <span className="font-mono text-xs opacity-60 tracking-widest transition-opacity group-hover:opacity-100">
          {sigils}
        </span>

        {/* Content */}
        <span className="font-serif font-semibold tracking-wider text-grave-bone-100 text-sm">
          {children}
        </span>

        {/* Right sigils (reversed) */}
        <span className="font-mono text-xs opacity-60 tracking-widest transition-opacity group-hover:opacity-100">
          {sigils.split('').reverse().join('')}
        </span>
      </button>
    );
  }
);

RunicButton.displayName = 'RunicButton';

