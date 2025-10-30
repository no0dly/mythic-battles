import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.{ts,tsx}'],
    exclude: [
      'e2e/**',
      'playwright-report/**',
      'test-results/**',
      'node_modules/**',
      'dist/**',
      '.next/**',
    ],
  },
})