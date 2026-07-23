import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*_test.{ts,tsx}'],
    passWithNoTests: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      all: true,
      include: ['src/**/*.ts'],
      thresholds: {
        statements: 70,
        functions: 70,
        lines: 70,
        branches: 50,
      },
    },
  },
});
