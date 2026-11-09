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
    'audio/index': 'src/audio/index.ts',
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
  splitting: false,
  minify: false, // Keep readable for initial development
});
