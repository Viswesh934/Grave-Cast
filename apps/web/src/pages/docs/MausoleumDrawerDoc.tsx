import { useState } from 'react';
import { ComponentDocPage } from '../../components/docs/ComponentDocPage';
import { MausoleumDrawer, MausoleumVault3D, Button, Canvas, OrbitControls } from 'groove-ui';

export function MausoleumDrawerDoc() {
  const [is3DMode, setIs3DMode] = useState(true);
  const [vaultUnsealed, setVaultUnsealed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const codeSnippet2D = `const [open, setOpen] = useState(false);

<Button variant="primary" onClick={() => setOpen(true)}>
  Unseal Ancient Mausoleum Vault
</Button>

<MausoleumDrawer
  open={open}
  onClose={() => setOpen(false)}
  title="Mausoleum Inner Sanctum"
>
  <div className="space-y-4">
    <p>Inside the sealed vault lies the forgotten archives of the elders...</p>
    <Button variant="secondary" onClick={() => setOpen(false)}>
      Reseal Crypt
    </Button>
  </div>
</MausoleumDrawer>`;

  const codeSnippet3D = `import { Canvas, OrbitControls, MausoleumVault3D } from 'groove-ui';

const [unsealed, setUnsealed] = useState(false);

<div style={{ width: '100%', height: '420px' }}>
  <Canvas camera={{ position: [0, 0.2, 5.8], fov: 42 }}>
    <MausoleumVault3D
      unsealed={unsealed}
      onToggleUnseal={setUnsealed}
    />
    <OrbitControls enableZoom={false} enablePan={false} />
  </Canvas>
</div>`;

  return (
    <ComponentDocPage
      title="MausoleumVault"
      category="The Crypt"
      description="An authentic monolithic subterranean stone mausoleum entrance featuring massive twin sliding basalt slabs, iron rivet banding, billowing crypt mist, and a radiant inner sanctum."
      packageName="mausoleum-vault"
      has3DMode={true}
      is3DMode={is3DMode}
      onToggle3D={setIs3DMode}
      gothicPhilosophy={{
        influence: 'Subterranean Crypt Architecture & Basalt Portals',
        movement: 'Heavy Stone Grinding Displacement & Billowing Ethereal Mist',
      }}
      preview={
        <div className="w-full max-w-3xl flex flex-col items-center gap-5">
          {is3DMode ? (
            <div className="w-full h-[450px] rounded-2xl overflow-hidden border border-[#224430] bg-[#0d1c15] relative shadow-2xl">
              <Canvas camera={{ position: [0, 0.2, 5.8], fov: 42 }}>
                <MausoleumVault3D
                  unsealed={vaultUnsealed}
                  onToggleUnseal={setVaultUnsealed}
                />
                <OrbitControls enableZoom={false} enablePan={false} maxPolarAngle={Math.PI / 2 + 0.15} minPolarAngle={Math.PI / 2 - 0.2} />
              </Canvas>
              <div className="absolute bottom-2.5 inset-x-0 text-center pointer-events-none text-[11px] font-mono text-emerald-300/80 bg-[#0d1c15]/85 py-1 border-t border-[#224430]">
                Click stone slabs or button below to grind doors apart · Drag to inspect basalt portal
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4 py-8">
              <Button variant="primary" onClick={() => setDrawerOpen(true)}>
                Unseal 2D Mausoleum Drawer
              </Button>

              <MausoleumDrawer
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                title="Mausoleum Inner Sanctum"
              >
                <div className="space-y-4 text-stone-300 text-sm">
                  <p>
                    Inside the sealed crypt lies the forgotten archives of dead branches and ancient sacrificial repositories.
                  </p>
                  <div className="p-5 rounded-2xl bg-[#0c1813] border border-[#183425] space-y-2 font-mono text-xs">
                    <div className="text-emerald-400 font-bold">Heretical Artifacts:</div>
                    <div>· 48 unmerged pull requests</div>
                    <div>· 12 deprecated NPM packages</div>
                    <div>· 1 Ancient Relic dormant in shadows</div>
                  </div>
                  <Button variant="secondary" onClick={() => setDrawerOpen(false)} fullWidth>
                    Reseal Crypt Monolith
                  </Button>
                </div>
              </MausoleumDrawer>
            </div>
          )}

          {/* Interactive controls */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2 bg-[#0c1813] border border-[#183425] rounded-2xl p-3 shadow-xl">
            {is3DMode ? (
              <button
                type="button"
                onClick={() => setVaultUnsealed(!vaultUnsealed)}
                className={`px-4 py-2 text-xs rounded-xl font-mono uppercase tracking-wider transition-all cursor-pointer font-bold ${
                  vaultUnsealed
                    ? 'bg-amber-950/80 text-amber-200 border border-amber-600/80 shadow-md shadow-amber-950/50'
                    : 'bg-emerald-950/80 text-emerald-200 border border-emerald-600/80 shadow-md shadow-emerald-950/50'
                }`}
              >
                {vaultUnsealed ? 'Reseal Vault Monolith' : 'Unseal Subterranean Slabs'}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setDrawerOpen(true)}
                className="px-4 py-2 text-xs rounded-xl font-mono uppercase tracking-wider bg-emerald-950/80 text-emerald-200 border border-emerald-600/80 font-bold shadow-md cursor-pointer"
              >
                Open Drawer Panel
              </button>
            )}
          </div>
        </div>
      }
      codeSnippet={is3DMode ? codeSnippet3D : codeSnippet2D}
      propsList={[
        { name: 'unsealed', type: 'boolean', default: 'false', description: 'Whether the twin basalt stone slabs are parted' },
        { name: 'onToggleUnseal', type: '(unsealed: boolean) => void', description: 'Callback fired when vault doors are clicked' },
        { name: 'scale', type: 'number', default: '1.05', description: 'Overall 3D dimension scale' },
      ]}
      prevPage={{ title: 'BoneOssuaryDivider', path: '/docs/components/ossuary' }}
      nextPage={{ title: 'CoffinAccordion', path: '/docs/components/coffin-accordion' }}
    />
  );
}
