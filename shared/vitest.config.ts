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
      exclude: [
        'src/index.ts',
        'src/protocol/client_to_server_payloads.ts',
        'src/protocol/server_to_client_payloads.ts',
        'src/protocol/socket_typed_interfaces.ts',
        'src/domain_types/player_public_state.ts',
        'src/domain_types/room_public_state.ts',
      ],
      thresholds: {
        statements: 70,
        functions: 70,
        lines: 70,
        branches: 50,
      },
    },
  },
});
