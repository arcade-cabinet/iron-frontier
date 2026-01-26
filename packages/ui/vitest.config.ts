import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    exclude: ['node_modules', 'src/native/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/web/**/*.tsx', 'src/combat/**/*.tsx', 'src/dialogue/**/*.tsx', 'src/hud/**/*.tsx', 'src/menus/**/*.tsx'],
      exclude: ['src/**/*.test.tsx', 'src/**/index.ts', 'src/test/**'],
    },
  },
});
