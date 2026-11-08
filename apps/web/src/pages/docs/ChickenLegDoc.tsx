import { useState } from 'react';
import { ComponentDocPage } from '../../components/docs/ComponentDocPage';
import { ChickenLegStepper, ChickenLegStepper3D, Canvas, OrbitControls } from 'groove-ui';

export function ChickenLegDoc() {
  const [is3DMode, setIs3DMode] = useState(true);
  const [step, setStep] = useState(1);

  const steps = [
    { id: 'scan', title: 'Deep Crypt Scan' },
    { id: 'fossils', title: 'Find Dead Branches' },
    { id: 'epitaph', title: 'Carve Gothic Relief' },
    { id: 'radio', title: 'Broadcast Gravecast' },
  ];

  const codeSnippet2D = `<ChickenLegStepper
  steps={[
    { id: 'scan', title: 'Deep Crypt Scan' },
    { id: 'fossils', title: 'Find Dead Branches' },
    { id: 'epitaph', title: 'Carve Gothic Relief' },
    { id: 'radio', title: 'Broadcast Gravecast' }
  ]}
  currentStep={${step}}
  onChange={(newStep) => setStep(newStep)}
/>`;

  const codeSnippet3D = `import { Canvas, OrbitControls, ChickenLegStepper3D } from 'groove-ui';

<div style={{ width: '100%', height: '380px' }}>
  <Canvas camera={{ position: [0, 0, 5.8], fov: 42 }}>
    <ChickenLegStepper3D
      currentStep={${step + 1}}
      totalSteps={${steps.length}}
      stepTitle="${steps[step]?.title || 'Deep Crypt Scan'}"
      onNext={() => setStep((s) => (s + 1) % ${steps.length})}
    />
    <OrbitControls enableZoom={false} enablePan={false} />
  </Canvas>
</div>`;

  return (
    <ComponentDocPage
      title="ChickenLegStepper"
      category="The Slavic"
      description="Baba Yaga's iconic wooden hut standing on giant scaly chicken legs that stomp into the earth as you advance multi-stage workflows or repository scans."
      packageName="chicken-leg-stepper"
      has3DMode={true}
      is3DMode={is3DMode}
      onToggle3D={setIs3DMode}
      gothicPhilosophy={{
        influence: 'Slavic Dark Folklore & Walking Hut Architecture',
        movement: 'Alternating Scaly Talon Stomp Cycle & Chimney Smoke Puffs',
      }}
      preview={
        <div className="w-full max-w-3xl space-y-5">
          {is3DMode ? (
            <div className="w-full h-[440px] rounded-2xl overflow-hidden border border-[#1b3d2b] bg-[#08120e] relative shadow-2xl">
              <Canvas camera={{ position: [0, 0, 5.8], fov: 42 }}>
                <ChickenLegStepper3D
                  currentStep={step + 1}
                  totalSteps={steps.length}
                  stepTitle={steps[step]?.title || 'Deep Crypt Scan'}
                  onNext={() => setStep((s) => (s + 1) % steps.length)}
                />
                <OrbitControls enableZoom={false} enablePan={false} maxPolarAngle={Math.PI / 2 + 0.15} minPolarAngle={0.3} />
              </Canvas>
              <div className="absolute bottom-2.5 inset-x-0 text-center pointer-events-none text-[11px] font-mono text-emerald-300/80 bg-[#08120e]/80 py-1 border-t border-[#1b3d2b]">
                Click walking hut to stomp forward to the next step
              </div>
            </div>
          ) : (
            <div className="w-full p-6 rounded-2xl bg-[#0c1813] border border-[#183425] shadow-2xl">
              <ChickenLegStepper
                steps={steps}
                currentStep={step}
                onChange={(s: number) => setStep(s)}
              />
            </div>
          )}

          {/* Stepper Step Selector Controls */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2 bg-[#0c1813] border border-[#183425] rounded-2xl p-3 shadow-xl">
            {steps.map((st, idx) => (
              <button
                key={st.id}
                type="button"
                onClick={() => setStep(idx)}
                className={`px-3 py-1.5 text-xs rounded-xl font-mono transition-all cursor-pointer ${
                  step === idx
                    ? 'bg-emerald-950/80 text-emerald-200 border border-emerald-600/80 font-bold shadow-md shadow-emerald-950/40'
                    : 'bg-[#102219] text-stone-300 border border-[#1b3a2a] hover:border-emerald-700/60 hover:text-white'
                }`}
              >
                {idx + 1}. {st.title}
              </button>
            ))}
          </div>
        </div>
      }
      codeSnippet={is3DMode ? codeSnippet3D : codeSnippet2D}
      propsList={[
        { name: 'currentStep', type: 'number', description: 'Zero-based active step index' },
        { name: 'totalSteps', type: 'number', description: 'Total workflow count' },
        { name: 'stepTitle', type: 'string', description: 'Active step headline text (3D mode)' },
        { name: 'onNext', type: '() => void', description: 'Step advancement click callback' },
        { name: 'steps', type: 'StepItem[]', description: 'Array of step items (2D mode)' },
      ]}
      prevPage={{ title: 'LunarPhaseSelector', path: '/docs/components/lunar-phase' }}
      nextPage={{ title: 'CobwebCorner', path: '/docs/components/cobweb' }}
    />
  );
}
