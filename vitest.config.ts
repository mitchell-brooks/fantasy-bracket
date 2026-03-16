// ABOUTME: Vitest configuration for unit and component tests
// ABOUTME: Mirrors tsconfig path aliases and uses jsdom for React component testing
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  css: {
    postcss: { plugins: [] },
  },
  test: {
    environment: 'jsdom',
    setupFiles: [],
    globals: true,
    css: false,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@lib': path.resolve(__dirname, './src/lib'),
      '@assets': path.resolve(__dirname, './src/assets'),
    },
  },
});
