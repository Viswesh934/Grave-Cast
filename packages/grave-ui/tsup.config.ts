import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    'components/primitives/index': 'src/components/primitives/index.ts',
    'components/crypt/index': 'src/components/crypt/index.ts',
    'components/coven/index': 'src/components/coven/index.ts',
    'components/arachnid/index': 'src/components/arachnid/index.ts',
    'components/sanguine/index': 'src/components/sanguine/index.ts',
    'components/lycan/index': 'src/components/lycan/index.ts',
    'components/slavic/index': 'src/components/slavic/index.ts',
    'components/bestiary/index': 'src/components/bestiary/index.ts',
    'components/horror3d/index': 'src/components/horror3d/index.ts',
    'components/effects/index': 'src/components/effects/index.ts',
    // The doodle system on its own, so a page that only draws comics loads no 3D code.
    'components/effects/Doodle/index': 'src/components/effects/Doodle/index.ts',
    'audio/index': 'src/audio/index.ts',
    // Signals that do a job (Morse, alarm tones, a beat, torch, compass), with no 3D code.
    'signal/index': 'src/signal/index.ts',
    'ascii/index': 'src/ascii/index.ts',
    'video/index': 'src/video/index.ts',
    'voice/index': 'src/voice/index.ts',
    'studio/index': 'src/studio/index.ts',
    'grimoire/index': 'src/grimoire/index.ts',
    'hooks/index': 'src/hooks/index.ts',
    'tokens/index': 'src/tokens/index.ts',
    'tailwind/index': 'src/tailwind/index.ts',
  },
  format: ['esm'],
  dts: false, // Will use tsc for declarations separately
  sourcemap: true,
  clean: true,
  external: ['react', 'react-dom'],
  treeshake: true,
  // Share code between entries as common chunks. Without this, every sub-path
  // (audio, hooks, effects, ...) bundles its own copy of shared modules, which
  // splits React contexts and singletons like the AudioContext in two.
  splitting: true,
  minify: false, // Keep readable for initial development
});
