import { useState } from 'react';
import {
  Button,
  TombstoneCard,
  ExcavationLoader,
  MausoleumDrawer,
  BoneOssuaryDivider,
  CoffinAccordion,
} from 'groove-ui';

export function CryptPage() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-grave-bone-100 mb-2">
          Crypt Components
        </h1>
        <p className="text-grave-mist-400">
          Advanced components with complex interactions
        </p>
      </div>

      {/* TombstoneCard */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-grave-bone-100 mb-6">
          TombstoneCard
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <TombstoneCard
            title="Jonathan Harker"
            subtitle="1854 - 1925"
            epitaph="Forever in the shadows"
          />
          <TombstoneCard
            title="Mina Murray"
            subtitle="1860 - 1932"
            epitaph="Her light guides us still"
          />
        </div>
      </section>

      {/* ExcavationLoader */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-grave-bone-100 mb-6">
          ExcavationLoader
        </h2>
        <div className="flex flex-wrap gap-8 items-center bg-grave-dark-800 p-8 rounded-lg">
          <div className="text-center">
            <ExcavationLoader size="sm" speed="fast" />
            <p className="text-grave-mist-400 mt-2 text-sm">Small / Fast</p>
          </div>
          <div className="text-center">
            <ExcavationLoader size="md" speed="normal" />
            <p className="text-grave-mist-400 mt-2 text-sm">Medium / Normal</p>
          </div>
          <div className="text-center">
            <ExcavationLoader size="lg" speed="slow" />
            <p className="text-grave-mist-400 mt-2 text-sm">Large / Slow</p>
          </div>
        </div>
      </section>

      {/* MausoleumDrawer */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-grave-bone-100 mb-6">
          MausoleumDrawer
        </h2>
        <Button variant="primary" onClick={() => setIsDrawerOpen(true)}>
          Open Drawer
        </Button>
        <MausoleumDrawer
          open={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          title="Drawer Title"
        >
          <div className="space-y-4">
            <p className="text-grave-mist-300">
              This is a drawer component with dark, atmospheric styling.
            </p>
            <p className="text-grave-mist-300">
              Perfect for side panels and overlays.
            </p>
            <Button variant="secondary" onClick={() => setIsDrawerOpen(false)}>
              Close
            </Button>
          </div>
        </MausoleumDrawer>
      </section>

      {/* BoneOssuaryDivider */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-grave-bone-100 mb-6">
          BoneOssuaryDivider
        </h2>
        <div className="bg-grave-dark-800 p-8 rounded-lg">
          <p className="text-grave-mist-300 mb-4">Content above the divider</p>
          <BoneOssuaryDivider />
          <p className="text-grave-mist-300 mt-4">Content below the divider</p>
        </div>
      </section>

      {/* CoffinAccordion */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-grave-bone-100 mb-6">
          CoffinAccordion
        </h2>
        <CoffinAccordion>
          <CoffinAccordion.Item value="item1">
            <CoffinAccordion.Trigger>First Section</CoffinAccordion.Trigger>
            <CoffinAccordion.Content>
              <p className="text-grave-mist-300">
                This is the content of the first section. It expands and collapses
                smoothly.
              </p>
            </CoffinAccordion.Content>
          </CoffinAccordion.Item>
          <CoffinAccordion.Item value="item2">
            <CoffinAccordion.Trigger>Second Section</CoffinAccordion.Trigger>
            <CoffinAccordion.Content>
              <p className="text-grave-mist-300">
                Here's another section with different content. Only one section can
                be open at a time.
              </p>
            </CoffinAccordion.Content>
          </CoffinAccordion.Item>
          <CoffinAccordion.Item value="item3">
            <CoffinAccordion.Trigger>Third Section</CoffinAccordion.Trigger>
            <CoffinAccordion.Content>
              <p className="text-grave-mist-300">
                The accordion pattern is perfect for FAQs and collapsible content.
              </p>
            </CoffinAccordion.Content>
          </CoffinAccordion.Item>
        </CoffinAccordion>
      </section>
    </div>
  );
}
