import type { Config } from 'tailwindcss';
import graveUIPlugin from '@gravecast/grave-ui/tailwind';

export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
    './node_modules/@gravecast/grave-ui/dist/**/*.js',
  ],
  theme: {
    extend: {},
  },
  plugins: [graveUIPlugin],
} satisfies Config;
