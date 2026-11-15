import { ComponentDocPage } from '../../../components/docs/ComponentDocPage';
import { SealRite, sealRite } from 'groove-ui';
import { riteNeighbors } from './paths';

const codeSnippet = `import { SealRite, sealText, openSeal } from 'groove-ui/grimoire';

// The whole rite.
<SealRite />

// Or seal things yourself.
const sealed = await sealText('Meet at midnight', passphrase);
const text = await openSeal(sealed, passphrase); // throws SealError if wrong`;

export function SealDoc() {
  return (
    <ComponentDocPage
      title={sealRite.name}
      category="The Grimoire"
      description={`${sealRite.tagline} The passphrase is stretched with PBKDF2 into an AES-GCM key, so a wrong passphrase or a changed message is always caught.`}
      packageName="grimoire"
      preview={
        <div className="w-full max-w-3xl">
          <SealRite headingLevel={3} />
        </div>
      }
      codeSnippet={codeSnippet}
      propsList={[
        { name: 'headingLevel', type: '2 | 3 | 4', default: '2', description: 'The heading level of the rite’s name' },
        { name: 'sealText(text, passphrase)', type: 'function', default: '—', description: 'Locks text into a versioned, paste-anywhere string starting with seal1' },
        { name: 'openSeal(sealed, passphrase)', type: 'function', default: '—', description: 'Opens it again, or throws a SealError that says what went wrong' },
        { name: 'useSeal()', type: 'hook', default: '—', description: 'The same, with a busy flag and plain errors' },
        { name: 'judgePassphrase(passphrase)', type: 'function', default: '—', description: 'A rough, offline strength check' },
      ]}
      {...riteNeighbors(sealRite.id)}
    />
  );
}
