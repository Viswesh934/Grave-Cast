import { useState } from 'react';
import { ComponentDocPage } from '../../components/docs/ComponentDocPage';
import { MausoleumDrawer, Button } from 'groove-ui';

export function MausoleumDrawerDoc() {
  const [open, setOpen] = useState(false);

  const codeSnippet = `const [open, setOpen] = useState(false);

<Button variant="primary" onClick={() => setOpen(true)}>
  Unseal Tomb Door
</Button>

<MausoleumDrawer
  open={open}
  onClose={() => setOpen(false)}
  title="Mausoleum Inner Vault"
>
  <div className="space-y-4">
    <p>Inside the sealed crypt lies the lost knowledge of old commits...</p>
    <Button variant="secondary" onClick={() => setOpen(false)}>
      Reseal Crypt
    </Button>
  </div>
</MausoleumDrawer>`;

  return (
    <ComponentDocPage
      title="MausoleumDrawer"
      category="The Crypt"
      description="An animated drawer and overlay component themed as a heavy stone tomb entrance with dark atmospheric mist backdrop and smooth entrance slide transitions."
      packageName="mausoleum-drawer"
      preview={
        <div className="flex flex-col items-center gap-4">
          <Button variant="primary" onClick={() => setOpen(true)}>
            🚪 Unseal Tomb Door
          </Button>

          <MausoleumDrawer
            open={open}
            onClose={() => setOpen(false)}
            title="Mausoleum Inner Vault"
          >
            <div className="space-y-4 text-stone-300 text-sm">
              <p>
                Inside the sealed crypt lies ancient knowledge from dead branches and abandoned repositories.
              </p>
              <div className="p-4 rounded-xl bg-[#090a0f] border border-[#232537] space-y-2 font-mono text-xs">
                <div className="text-red-400 font-bold">Unclaimed Heritage:</div>
                <div>· 48 unmerged pull requests</div>
                <div>· 12 deprecated NPM packages</div>
                <div>· 3 cursed circular dependencies</div>
              </div>
              <Button variant="secondary" onClick={() => setOpen(false)} fullWidth>
                Reseal Crypt Door
              </Button>
            </div>
          </MausoleumDrawer>
        </div>
      }
      codeSnippet={codeSnippet}
      propsList={[
        { name: 'open', type: 'boolean', description: 'Whether the drawer is currently open' },
        { name: 'onClose', type: '() => void', description: 'Callback fired when drawer backdrop or close button is clicked' },
        { name: 'title', type: 'string', description: 'Vault title in header' },
        { name: 'position', type: "'left' | 'right' | 'top' | 'bottom'", default: "'right'", description: 'Slide-in anchor edge' },
      ]}
      prevPage={{ title: 'BoneOssuaryDivider', path: '/docs/components/ossuary' }}
      nextPage={{ title: 'CoffinAccordion', path: '/docs/components/coffin-accordion' }}
    />
  );
}

