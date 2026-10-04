import { fileURLToPath } from 'node:url';

import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    tsconfigPaths: true,

    alias: {
      'server-only': fileURLToPath(
        new URL(
          './vitest.server-only.ts',
          import.meta.url
        )
      ),
    },
  },

  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    clearMocks: true,
    restoreMocks: true,
  },
});