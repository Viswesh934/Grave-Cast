import { useState } from 'react';
import { ComponentDocPage } from '../../components/docs/ComponentDocPage';
import { ChickenLegStepper } from 'groove-ui';

export function ChickenLegDoc() {
  const [step, setStep] = useState(1);

  const steps = [
    { id: 'scan', title: 'Deep Scan' },
    { id: 'fossils', title: 'Find Dead Code' },
    { id: 'epitaph', title: 'Engrave Epitaph' },
    { id: 'radio', title: 'Broadcast Signal' },
  ];

  const codeSnippet = `<ChickenLegStepper
  steps={[
    { id: 'scan', title: 'Deep Scan' },
    { id: 'fossils', title: 'Find Dead Code' },
    { id: 'epitaph', title: 'Engrave Epitaph' },
    { id: 'radio', title: 'Broadcast Signal' }
  ]}
  currentStep={${step}}
  onChange={(newStep) => setStep(newStep)}
/>`;

  return (
    <ComponentDocPage
      title="ChickenLegStepper"
      category="The Slavic"
      description="Baba Yaga's iconic wooden hut standing on giant scaly chicken legs that stomp into the earth as you advance multi-stage workflows or repository scans."
      packageName="chicken-leg-stepper"
      preview={
        <div className="w-full max-w-xl">
          <ChickenLegStepper
            steps={steps}
            currentStep={step}
            onChange={(s: number) => setStep(s)}
          />
        </div>
      }
      codeSnippet={codeSnippet}
      propsList={[
        { name: 'steps', type: 'StepItem[]', description: 'Array of step objects with id and title' },
        { name: 'currentStep', type: 'number', description: 'Zero-based index of the currently active step' },
        { name: 'onChange', type: '(stepIndex: number) => void', description: 'Click handler when selecting a step' },
      ]}
      prevPage={{ title: 'LunarPhaseSelector', path: '/docs/components/lunar-phase' }}
      nextPage={{ title: 'CobwebCorner', path: '/docs/components/cobweb' }}
    />
  );
}
