/**
 * ChickenLegStepper - Baba Yaga's walking hut stepper
 * @module components/slavic/ChickenLegStepper
 */

import { forwardRef, type HTMLAttributes } from 'react';
import { playSound } from '../../../audio';

export interface StepItem {
  id: string;
  title: string;
  description?: string;
}

export interface ChickenLegStepperProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  /** Steps list */
  steps: StepItem[];
  /** Active step index (0-based) */
  currentStep: number;
  /** Step click callback */
  onChange?: (stepIndex: number) => void;
}

export const ChickenLegStepper = forwardRef<HTMLDivElement, ChickenLegStepperProps>(
  ({ steps, currentStep, onChange, className = '', ...props }, ref) => {
    const handleStepClick = (index: number) => {
      playSound('boneClick');
      onChange?.(index);
    };

    return (
      <div
        ref={ref}
        className={`w-full bg-[#12131b] border border-[#2b2d3d] rounded-2xl p-6 shadow-xl select-none ${className}`}
        {...props}
      >
        <div className="flex items-center justify-between mb-8">
          <div>
            <h4 className="font-serif font-bold text-lg text-grave-bone-100 flex items-center gap-2">
              <span>🏚️ Baba Yaga's Hut Stepper</span>
            </h4>
            <p className="text-xs text-grave-mist-400 font-mono mt-0.5">
              Step {currentStep + 1} of {steps.length} · Standing on chicken claws
            </p>
          </div>
          <div className="text-3xl">🐔</div>
        </div>

        {/* Stepper Track */}
        <div className="relative flex items-center justify-between">
          {/* Background Rail */}
          <div className="absolute top-1/2 left-0 right-0 h-1 bg-[#232536] -translate-y-1/2 z-0" />

          {steps.map((step, idx) => {
            const isCompleted = idx < currentStep;
            const isCurrent = idx === currentStep;

            return (
              <div
                key={step.id}
                className="relative z-10 flex flex-col items-center cursor-pointer group"
                onClick={() => handleStepClick(idx)}
              >
                {/* Step Circle / Hut Marker */}
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-sm transition-all duration-300 border-2 ${
                    isCurrent
                      ? 'bg-amber-600 border-amber-400 text-white shadow-[0_0_20px_rgba(245,158,11,0.6)] scale-110'
                      : isCompleted
                      ? 'bg-emerald-950 border-emerald-500 text-emerald-300'
                      : 'bg-[#181a26] border-[#313548] text-grave-mist-400 hover:border-grave-mist-300'
                  }`}
                >
                  {isCompleted ? '🦴' : isCurrent ? '🏚️' : idx + 1}
                </div>

                {/* Step Title */}
                <span
                  className={`mt-3 text-xs font-semibold tracking-wide text-center max-w-[100px] truncate ${
                    isCurrent
                      ? 'text-amber-400'
                      : isCompleted
                      ? 'text-emerald-300'
                      : 'text-grave-mist-400'
                  }`}
                >
                  {step.title}
                </span>

                {/* Baba Yaga's Scaly Yellow Chicken Claws underneath active step */}
                {isCurrent && (
                  <div className="mt-2 flex gap-3 text-amber-500 animate-bounce text-sm" style={{ animationDuration: '1.2s' }}>
                    <span title="Left Talon">🐾</span>
                    <span title="Right Talon">🐾</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }
);

ChickenLegStepper.displayName = 'ChickenLegStepper';

