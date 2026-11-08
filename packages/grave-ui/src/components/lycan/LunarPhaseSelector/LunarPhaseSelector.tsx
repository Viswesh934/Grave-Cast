/**
 * LunarPhaseSelector - Werewolf moon phase dial selector
 * @module components/lycan/LunarPhaseSelector
 */

import { forwardRef, useState, type HTMLAttributes } from 'react';
import { playSound } from '../../../audio';

export type MoonPhase =
  | 'new'
  | 'waxing-crescent'
  | 'first-quarter'
  | 'waxing-gibbous'
  | 'full'
  | 'waning-gibbous'
  | 'third-quarter'
  | 'waning-crescent'
  | 'blood-moon';

export interface LunarPhaseOption {
  id: MoonPhase;
  name: string;
  icon: string;
  illumination: number;
  dangerLevel: 'low' | 'medium' | 'high' | 'lethal';
}

export const MOON_PHASES: LunarPhaseOption[] = [
  { id: 'new', name: 'New Moon', icon: '🌑', illumination: 0, dangerLevel: 'low' },
  { id: 'waxing-crescent', name: 'Waxing Crescent', icon: '🌒', illumination: 25, dangerLevel: 'low' },
  { id: 'first-quarter', name: 'First Quarter', icon: '🌓', illumination: 50, dangerLevel: 'medium' },
  { id: 'waxing-gibbous', name: 'Waxing Gibbous', icon: '🌔', illumination: 75, dangerLevel: 'high' },
  { id: 'full', name: 'Full Moon', icon: '🌕', illumination: 100, dangerLevel: 'lethal' },
  { id: 'blood-moon', name: 'Blood Full Moon', icon: '🩸', illumination: 100, dangerLevel: 'lethal' },
  { id: 'waning-gibbous', name: 'Waning Gibbous', icon: '🌖', illumination: 75, dangerLevel: 'high' },
  { id: 'third-quarter', name: 'Third Quarter', icon: '🌗', illumination: 50, dangerLevel: 'medium' },
  { id: 'waning-crescent', name: 'Waning Crescent', icon: '🌘', illumination: 25, dangerLevel: 'low' },
];

export interface LunarPhaseSelectorProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  /** Active phase */
  value?: MoonPhase;
  /** Phase change callback */
  onChange?: (phase: MoonPhase) => void;
}

export const LunarPhaseSelector = forwardRef<HTMLDivElement, LunarPhaseSelectorProps>(
  ({ value = 'full', onChange, className = '', ...props }, ref) => {
    const [selected, setSelected] = useState<MoonPhase>(value);

    const handleSelect = (phase: MoonPhase) => {
      setSelected(phase);
      playSound('stoneGrind');
      onChange?.(phase);
    };

    const activeOption = MOON_PHASES.find((p) => p.id === selected) || MOON_PHASES[4];

    return (
      <div
        ref={ref}
        className={`bg-[#12131b] border border-[#2b2d3d] rounded-2xl p-6 select-none shadow-xl ${className}`}
        {...props}
      >
        <div className="flex justify-between items-center mb-6">
          <div>
            <h4 className="font-serif font-bold text-lg text-grave-bone-100 flex items-center gap-2">
              <span>🐺 Lunar Cycle</span>
              {activeOption.dangerLevel === 'lethal' && (
                <span className="text-xs font-mono font-bold uppercase px-2 py-0.5 rounded bg-red-950 text-red-400 border border-red-800 animate-pulse">
                  Beast Frenzy Active
                </span>
              )}
            </h4>
            <p className="text-xs text-grave-mist-400 font-mono mt-0.5">
              Illumination: {activeOption.illumination}% · {activeOption.name}
            </p>
          </div>
          <div className="text-4xl filter drop-shadow-[0_0_12px_rgba(255,255,255,0.4)]">
            {activeOption.icon}
          </div>
        </div>

        {/* Phase Buttons Grid */}
        <div className="grid grid-cols-3 sm:grid-cols-9 gap-2">
          {MOON_PHASES.map((phase) => {
            const isSelected = selected === phase.id;
            return (
              <button
                key={phase.id}
                type="button"
                onClick={() => handleSelect(phase.id)}
                className={`flex flex-col items-center justify-center p-2.5 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-purple-950/50 border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.4)] text-white scale-105'
                    : 'bg-[#161824] border-[#252838] text-grave-mist-400 hover:border-grave-mist-400 hover:text-grave-bone-100'
                }`}
                title={phase.name}
              >
                <span className="text-2xl mb-1">{phase.icon}</span>
                <span className="text-[10px] font-mono tracking-tighter truncate max-w-full">
                  {phase.illumination}%
                </span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }
);

LunarPhaseSelector.displayName = 'LunarPhaseSelector';

