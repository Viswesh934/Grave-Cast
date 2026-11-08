import { useState } from 'react';
import { Button, TombstoneCard, ExcavationLoader, MausoleumDrawer, BoneOssuaryDivider, CoffinAccordion } from '@gravecast/grave-ui';

export function CryptShowcase() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="space-y-12">
      <div>
        <h1 className="text-4xl font-bold mb-2">⚰️ Crypt Components</h1>
        <p className="text-stone-400">6 horror-themed components</p>
      </div>

      <section>
        <h2 className="text-2xl font-bold mb-4">TombstoneCard</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <TombstoneCard title="Here Lies..." subtitle="1847 - 1923">
            <p className="text-sm text-stone-400">Composition example</p>
          </TombstoneCard>
          <TombstoneCard title="Eternal Rest" subtitle="Beloved Dev" status="Legacy" statusVariant="warning">
            <p className="text-sm text-stone-400">With status badge</p>
          </TombstoneCard>
        </div>
      </section>

      <BoneOssuaryDivider pattern="scattered" />

      <section>
        <h2 className="text-2xl font-bold mb-4">ExcavationLoader</h2>
        <div className="flex gap-8 items-center">
          <ExcavationLoader size="sm" />
          <ExcavationLoader size="md" />
          <ExcavationLoader size="lg" />
        </div>
      </section>

      <BoneOssuaryDivider pattern="row" />

      <section>
        <h2 className="text-2xl font-bold mb-4">MausoleumDrawer</h2>
        <Button onClick={() => setDrawerOpen(true)}>Open Drawer</Button>
        <MausoleumDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title="Drawer">
          <p>Sliding panel with animations</p>
        </MausoleumDrawer>
      </section>

      <BoneOssuaryDivider pattern="stacked" />

      <section>
        <h2 className="text-2xl font-bold mb-4">CoffinAccordion</h2>
        <CoffinAccordion type="single" collapsible className="max-w-2xl">
          <CoffinAccordion.Item value="1">
            <CoffinAccordion.Trigger>First Secret</CoffinAccordion.Trigger>
            <CoffinAccordion.Content>
              <p className="p-4">Compound component pattern</p>
            </CoffinAccordion.Content>
          </CoffinAccordion.Item>
          <CoffinAccordion.Item value="2">
            <CoffinAccordion.Trigger>Second Secret</CoffinAccordion.Trigger>
            <CoffinAccordion.Content>
              <p className="p-4">Smooth animations</p>
            </CoffinAccordion.Content>
          </CoffinAccordion.Item>
        </CoffinAccordion>
      </section>

      <BoneOssuaryDivider pattern="crossed" />
    </div>
  );
}
