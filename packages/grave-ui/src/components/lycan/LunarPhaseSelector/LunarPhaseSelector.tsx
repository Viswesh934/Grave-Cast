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
  illumination: number;
  dangerLevel: 'low' | 'medium' | 'high' | 'lethal';
}

export const MOON_PHASES: LunarPhaseOption[] = [
  { id: 'new', name: 'New Moon', illumination: 0, dangerLevel: 'low' },
  { id: 'waxing-crescent', name: 'Waxing Crescent', illumination: 25, dangerLevel: 'low' },
  { id: 'first-quarter', name: 'First Quarter', illumination: 50, dangerLevel: 'medium' },
  { id: 'waxing-gibbous', name: 'Waxing Gibbous', illumination: 75, dangerLevel: 'high' },
  { id: 'full', name: 'Full Moon', illumination: 100, dangerLevel: 'lethal' },
  { id: 'blood-moon', name: 'Blood Full Moon', illumination: 100, dangerLevel: 'lethal' },
  { id: 'waning-gibbous', name: 'Waning Gibbous', illumination: 75, dangerLevel: 'high' },
  { id: 'third-quarter', name: 'Third Quarter', illumination: 50, dangerLevel: 'medium' },
  { id: 'waning-crescent', name: 'Waning Crescent', illumination: 25, dangerLevel: 'low' },
];

export function MoonPhaseIcon({ id, className = "w-6 h-6" }: { id: MoonPhase; className?: string }) {
  if (id === 'blood-moon') {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="none">
        <circle cx="12" cy="12" r="9" fill="#dc2626" />
        <circle cx="12" cy="12" r="9" stroke="#991b1b" strokeWidth="1.5" />
      </svg>
    );
  }
  if (id === 'full') {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="none">
        <circle cx="12" cy="12" r="9" fill="#fef08a" />
        <circle cx="12" cy="12" r="9" stroke="#ca8a04" strokeWidth="1" />
      </svg>
    );
  }
  if (id === 'new') {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="none">
        <circle cx="12" cy="12" r="9" fill="#181a26" stroke="#475569" strokeWidth="1.5" />
      </svg>
    );
  }
  if (id === 'first-quarter') {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="none">
        <circle cx="12" cy="12" r="9" fill="#181a26" stroke="#475569" strokeWidth="1" />
        <path d="M12 3 A9 9 0 0 1 12 21 Z" fill="#e2e8f0" />
      </svg>
    );
  }
  if (id === 'third-quarter') {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="none">
        <circle cx="12" cy="12" r="9" fill="#181a26" stroke="#475569" strokeWidth="1" />
        <path d="M12 3 A9 9 0 0 0 12 21 Z" fill="#e2e8f0" />
      </svg>
    );
  }
  if (id === 'waxing-crescent') {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="none">
        <circle cx="12" cy="12" r="9" fill="#181a26" stroke="#475569" strokeWidth="1" />
        <path d="M12 3 A9 9 0 0 1 12 21 A6 9 0 0 0 12 3 Z" fill="#e2e8f0" />
      </svg>
    );
  }
  if (id === 'waning-crescent') {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="none">
        <circle cx="12" cy="12" r="9" fill="#181a26" stroke="#475569" strokeWidth="1" />
        <path d="M12 3 A9 9 0 0 0 12 21 A6 9 0 0 1 12 3 Z" fill="#e2e8f0" />
      </svg>
    );
  }
  if (id === 'waxing-gibbous') {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="none">
        <circle cx="12" cy="12" r="9" fill="#e2e8f0" />
        <path d="M12 3 A9 9 0 0 0 12 21 A5 9 0 0 1 12 3 Z" fill="#181a26" />
        <circle cx="12" cy="12" r="9" stroke="#475569" strokeWidth="1" fill="none" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none">
      <circle cx="12" cy="12" r="9" fill="#e2e8f0" />
      <path d="M12 3 A9 9 0 0 1 12 21 A5 9 0 0 0 12 3 Z" fill="#181a26" />
      <circle cx="12" cy="12" r="9" stroke="#475569" strokeWidth="1" fill="none" />
    </svg>
  );
}

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
        className={`bg-grave-dark-850 border border-grave-dark-600 rounded-2xl p-6 select-none shadow-xl ${className}`}
        {...props}
      >
        <div className="flex justify-between items-center mb-6">
          <div>
            <h4 className="font-serif font-bold text-lg text-grave-bone-100 flex items-center gap-2">
              <span>Lunar Cycle</span>
              {activeOption.dangerLevel === 'lethal' && (
                <span className="text-xs font-mono font-bold uppercase px-2 py-0.5 rounded bg-red-950 text-red-400 border border-red-800 animate-pulse">
                  Peak Frenzy
                </span>
              )}
            </h4>
            <p className="text-xs text-grave-mist-400 font-mono mt-0.5">
              Illumination: {activeOption.illumination}% · {activeOption.name}
            </p>
          </div>
          <div className="w-10 h-10 flex items-center justify-center filter drop-shadow-[0_0_12px_rgba(255,255,255,0.4)]">
            <MoonPhaseIcon id={activeOption.id} className="w-9 h-9" />
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
                    : 'bg-grave-dark-800 border-grave-dark-600 text-grave-mist-400 hover:border-grave-mist-400 hover:text-grave-bone-100'
                }`}
                title={phase.name}
              >
                <div className="mb-1.5 flex items-center justify-center">
                  <MoonPhaseIcon id={phase.id} className="w-5 h-5" />
                </div>
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

