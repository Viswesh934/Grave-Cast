import { useState } from 'react';
import { ComponentDocPage } from '../../components/docs/ComponentDocPage';
import { LunarPhaseSelector, type MoonPhase } from 'groove-ui';

export function LunarPhaseDoc() {
  const [phase, setPhase] = useState<MoonPhase>('full');

  const codeSnippet = `<LunarPhaseSelector
  value="${phase}"
  onChange={(newPhase) => console.log('Phase changed to:', newPhase)}
/>`;

  return (
    <ComponentDocPage
      title="LunarPhaseSelector"
      category="The Lycan"
      description="A werewolf celestial cycle dial mapping all 8 phases of the lunar cycle up to Blood Moon, with automatic beast frenzy danger detection."
      packageName="lunar-phase-selector"
      preview={
        <div className="w-full max-w-xl">
          <LunarPhaseSelector
            value={phase}
            onChange={(p: MoonPhase) => setPhase(p)}
          />
        </div>
      }
      codeSnippet={codeSnippet}
      propsList={[
        { name: 'value', type: 'MoonPhase', default: "'full'", description: 'Active selected moon phase identifier' },
        { name: 'onChange', type: '(phase: MoonPhase) => void', description: 'Callback fired when a moon phase is clicked' },
      ]}
      prevPage={{ title: 'BloodVialProgress', path: '/docs/components/blood-vial' }}
      nextPage={{ title: 'ChickenLegStepper', path: '/docs/components/chicken-legs' }}
    />
  );
}
