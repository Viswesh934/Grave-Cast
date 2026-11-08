import { ComponentDocPage } from '../../components/docs/ComponentDocPage';
import { CoffinAccordion } from 'groove-ui';

export function CoffinAccordionDoc() {
  const codeSnippet = `<CoffinAccordion type="single" collapsible defaultValue="grave1">
  <CoffinAccordion.Item value="grave1">
    <CoffinAccordion.Trigger>⚰️ Count Dracula's Sarcophagus</CoffinAccordion.Trigger>
    <CoffinAccordion.Content>
      Resting within Transylvanian soil. Do not disturb before sunset.
    </CoffinAccordion.Content>
  </CoffinAccordion.Item>
  <CoffinAccordion.Item value="grave2">
    <CoffinAccordion.Trigger>⚰️ Carmilla's Vault</CoffinAccordion.Trigger>
    <CoffinAccordion.Content>
      Draped in velvet and nightshade flowers.
    </CoffinAccordion.Content>
  </CoffinAccordion.Item>
</CoffinAccordion>`;

  return (
    <ComponentDocPage
      title="CoffinAccordion"
      category="The Crypt"
      description="A collapsible compound accordion component shaped like gothic caskets, expanding smoothly to reveal velvet-lined contents."
      packageName="coffin-accordion"
      preview={
        <div className="w-full max-w-md">
          <CoffinAccordion type="single" collapsible defaultValue="grave1">
            <CoffinAccordion.Item value="grave1">
              <CoffinAccordion.Trigger>⚰️ Count Dracula's Sarcophagus</CoffinAccordion.Trigger>
              <CoffinAccordion.Content>
                Resting within Transylvanian soil. Beware the sunset awakening.
              </CoffinAccordion.Content>
            </CoffinAccordion.Item>
            <CoffinAccordion.Item value="grave2">
              <CoffinAccordion.Trigger>⚰️ Carmilla's Chamber</CoffinAccordion.Trigger>
              <CoffinAccordion.Content>
                Draped in velvet and nightshade flowers.
              </CoffinAccordion.Content>
            </CoffinAccordion.Item>
            <CoffinAccordion.Item value="grave3">
              <CoffinAccordion.Trigger>⚰️ Nosferatu's Crypt</CoffinAccordion.Trigger>
              <CoffinAccordion.Content>
                Infested with shadows and plague-carrying rats.
              </CoffinAccordion.Content>
            </CoffinAccordion.Item>
          </CoffinAccordion>
        </div>
      }
      codeSnippet={codeSnippet}
      propsList={[
        { name: 'type', type: "'single' | 'multiple'", default: "'single'", description: 'Whether multiple caskets can be opened simultaneously' },
        { name: 'collapsible', type: 'boolean', default: 'true', description: 'Allow closing active item by clicking again' },
        { name: 'defaultValue', type: 'string | string[]', description: 'Initially unsealed casket item value(s)' },
      ]}
      prevPage={{ title: 'MausoleumDrawer', path: '/docs/components/mausoleum' }}
      nextPage={{ title: 'CauldronBrew', path: '/docs/components/cauldron' }}
    />
  );
}

