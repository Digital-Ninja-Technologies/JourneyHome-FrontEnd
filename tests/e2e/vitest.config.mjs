// tests/e2e/vitest.config.mjs
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/e2e/suites/**/*.test.mjs'],
    environment: 'node',
    testTimeout: 15000,
    globals: true
  }
});
