import { ComponentDocPage } from '../../../components/docs/ComponentDocPage';
import { CryptRite, cryptRite } from 'groove-ui';
import { riteNeighbors } from './paths';

const codeSnippet = `import { CryptRite, openCrypt, inspectStorage } from 'groove-ui/grimoire';

// The whole rite.
<CryptRite />

// Or keep things yourself.
const crypt = await openCrypt({ name: 'notes', stores: ['notes'] });
await crypt.bury('notes', 'today', { text: 'Buy milk' });
const note = await crypt.exhume('notes', 'today');

// And see what the site stores.
const report = await inspectStorage();`;

export function CryptDoc() {
  return (
    <ComponentDocPage
      title={cryptRite.name}
      category="The Grimoire"
      description={`${cryptRite.tagline} Bury a note, reload the page, and open the crypt again. It also shows how much this site stores and whether the browser may clear it.`}
      packageName="grimoire"
      preview={
        <div className="w-full max-w-3xl">
          <CryptRite headingLevel={3} />
        </div>
      }
      codeSnippet={codeSnippet}
      propsList={[
        { name: 'headingLevel', type: '2 | 3 | 4', default: '2', description: 'The heading level of the rite’s name' },
        { name: 'openCrypt({ name, stores })', type: 'function', default: '—', description: 'IndexedDB in simple promises: bury, exhume, list, forget, clear' },
        { name: 'inspectStorage()', type: 'function', default: '—', description: 'Storage used and allowed, databases, web storage, caches, and cookies' },
        { name: 'requestPersistence()', type: 'function', default: '—', description: 'Asks the browser to keep this site’s storage. Call it from a click' },
      ]}
      {...riteNeighbors(cryptRite.id)}
    />
  );
}
