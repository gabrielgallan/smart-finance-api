
import swc from 'unplugin-swc'
import { defineConfig } from 'vitest/config'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  test: {
    include: [
      "**/*.spec.ts",
      "**/*.test.ts",
    ],
    exclude: [
      "node_modules",
      "dist",
      "src/infra/http/controllers/*"
    ],
    globals: true,
    root: './',
  },
  plugins: [
    tsconfigPaths(),
    // This is required to build the test files with SWC
    swc.vite({
      // Explicitly set the module type to avoid inheriting this value from a `.swcrc` config file
      module: { type: 'es6' },
    }),
  ],
  resolve: {
    alias: {
      // Ensure Vitest correctly resolves TypeScript path aliases
      'src': './src',
    },
  },
})