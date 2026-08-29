import { defineConfig, mergeConfig } from 'vitest/config';
import viteConfig from './vite.config';

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: 'jsdom',
      include: ['src/**/*_test.{ts,tsx}'],
      setupFiles: ['./src/test_setup.ts'],
      passWithNoTests: true,
      coverage: {
        provider: 'v8',
        reporter: ['text', 'html'],
        all: true,
        include: ['src/**/*.{ts,tsx}'],
        exclude: ['src/test_setup.ts'],
        thresholds: {
          statements: 70,
          functions: 70,
          lines: 70,
          branches: 50,
        },
      },
    },
  }),
);
