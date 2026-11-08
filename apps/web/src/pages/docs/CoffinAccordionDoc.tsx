import { useState } from 'react';
import { ComponentDocPage } from '../../components/docs/ComponentDocPage';
import { CoffinAccordion, CoffinAccordion3D, Canvas, OrbitControls } from 'groove-ui';

export function CoffinAccordionDoc() {
  const [is3DMode, setIs3DMode] = useState(true);

  const codeSnippet2D = `<CoffinAccordion type="single" collapsible defaultValue="grave1">
  <CoffinAccordion.Item value="grave1">
    <CoffinAccordion.Trigger>Count Dracula's Sarcophagus</CoffinAccordion.Trigger>
    <CoffinAccordion.Content>
      Resting within Transylvanian soil. Beware the sunset awakening.
    </CoffinAccordion.Content>
  </CoffinAccordion.Item>
  <CoffinAccordion.Item value="grave2">
    <CoffinAccordion.Trigger>Carmilla's Chamber</CoffinAccordion.Trigger>
    <CoffinAccordion.Content>
      Draped in velvet and nightshade flowers.
    </CoffinAccordion.Content>
  </CoffinAccordion.Item>
</CoffinAccordion>`;

  const codeSnippet3D = `import { Canvas, OrbitControls, CoffinAccordion3D } from 'groove-ui';

<div style={{ width: '100%', height: '380px' }}>
  <Canvas camera={{ position: [0, 0, 6.2], fov: 42 }}>
    <CoffinAccordion3D
      title="Count Dracula's Sarcophagus"
      content="Resting within Transylvanian soil. Sealed until sundown."
    />
    <OrbitControls enableZoom={false} enablePan={false} />
  </Canvas>
</div>`;

  return (
    <ComponentDocPage
      title="CoffinAccordion"
      category="The Crypt"
      description="A collapsible compound accordion component shaped like gothic caskets, expanding smoothly to reveal quilted crimson satin velvet lining and ancient sealed relics."
      packageName="coffin-accordion"
      has3DMode={true}
      is3DMode={is3DMode}
      onToggle3D={setIs3DMode}
      gothicPhilosophy={{
        influence: 'Iron-Bound Gothic Caskets & Crypt Sarcophagi',
        movement: 'Creaking 3D Hinged Lid Swing & Velvet Interior Disclosure',
      }}
      preview={
        <div className="w-full max-w-2xl">
          {is3DMode ? (
            <div className="w-full h-[440px] rounded-2xl overflow-hidden border border-[#1b3d2b] bg-[#08120e] relative shadow-2xl">
              <Canvas camera={{ position: [0, 0, 6.2], fov: 42 }}>
                <CoffinAccordion3D
                  title="Count Dracula's Sarcophagus"
                  content="Resting within Transylvanian soil. Sealed until sundown."
                />
                <OrbitControls enableZoom={false} enablePan={false} maxPolarAngle={Math.PI / 2 + 0.2} minPolarAngle={Math.PI / 2 - 0.2} />
              </Canvas>
              <div className="absolute bottom-2.5 inset-x-0 text-center pointer-events-none text-[11px] font-mono text-emerald-300/80 bg-[#08120e]/80 py-1 border-t border-[#1b3d2b]">
                Click casket to unseal lid · Drag to rotate in 3D
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-[#0c1813] border border-[#183425] shadow-xl">
              <CoffinAccordion type="single" collapsible defaultValue="grave1">
                <CoffinAccordion.Item value="grave1">
                  <CoffinAccordion.Trigger>Count Dracula's Sarcophagus</CoffinAccordion.Trigger>
                  <CoffinAccordion.Content>
                    Resting within Transylvanian soil. Beware the sunset awakening.
                  </CoffinAccordion.Content>
                </CoffinAccordion.Item>
                <CoffinAccordion.Item value="grave2">
                  <CoffinAccordion.Trigger>Carmilla's Chamber</CoffinAccordion.Trigger>
                  <CoffinAccordion.Content>
                    Draped in velvet and nightshade flowers.
                  </CoffinAccordion.Content>
                </CoffinAccordion.Item>
                <CoffinAccordion.Item value="grave3">
                  <CoffinAccordion.Trigger>Nosferatu's Crypt</CoffinAccordion.Trigger>
                  <CoffinAccordion.Content>
                    Infested with shadows and plague-carrying rats.
                  </CoffinAccordion.Content>
                </CoffinAccordion.Item>
              </CoffinAccordion>
            </div>
          )}
        </div>
      }
      codeSnippet={is3DMode ? codeSnippet3D : codeSnippet2D}
      propsList={[
        { name: 'title', type: 'string', description: 'Casket inscription header text (3D mode)' },
        { name: 'content', type: 'string', description: 'Internal revelation revealed upon opening (3D mode)' },
        { name: 'type', type: "'single' | 'multiple'", default: "'single'", description: 'Whether multiple caskets can be opened simultaneously (2D mode)' },
        { name: 'collapsible', type: 'boolean', default: 'true', description: 'Allow closing active item by clicking again (2D mode)' },
      ]}
      prevPage={{ title: 'MausoleumDrawer', path: '/docs/components/mausoleum' }}
      nextPage={{ title: 'CauldronBrew', path: '/docs/components/cauldron' }}
    />
  );
}
