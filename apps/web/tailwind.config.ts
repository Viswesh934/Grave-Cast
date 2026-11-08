import type { Config } from 'tailwindcss';
import groovyPlugin from 'groove-ui/tailwind';

export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
    './node_modules/@gravecast/groovy/dist/**/*.js',
  ],
  theme: {
    extend: {},
  },
  plugins: [groovyPlugin],
} satisfies Config;
