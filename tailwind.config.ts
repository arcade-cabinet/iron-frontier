// tailwind.config.ts - Tailwind CSS configuration for Expo unified app
import type { Config } from 'tailwindcss';
// @ts-ignore - nativewind/preset doesn't have types
import nativewindPreset from 'nativewind/preset';

const config: Config = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [nativewindPreset],
  theme: {
    extend: {
      colors: {
        // Steampunk color palette
        brass: {
          50: '#fefce8',
          100: '#fef9c3',
          200: '#fef08a',
          300: '#fde047',
          400: '#facc15',
          500: '#eab308',
          600: '#ca8a04',
          700: '#a16207',
          800: '#854d0e',
          900: '#713f12',
          950: '#422006',
        },
        copper: {
          500: '#b87333',
          600: '#a0522d',
          700: '#8b4513',
        },
        steam: {
          100: '#f5f5f4',
          200: '#e7e5e4',
          300: '#d6d3d1',
          400: '#a8a29e',
          500: '#78716c',
          600: '#57534e',
          700: '#44403c',
          800: '#292524',
          900: '#1c1917',
          950: '#0c0a09',
        },
      },
      fontFamily: {
        'steampunk': ['Cinzel', 'serif'],
      },
    },
  },
  plugins: [],
};

export default config;
