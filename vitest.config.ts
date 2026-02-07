import { defineConfig, defineProject } from 'vitest/config'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  test: {
    projects: [
      // 🧩 Project 1: Unit tests (use cases)
      defineProject({
        plugins: [tsconfigPaths()],
        test: {
          name: 'unit',
          globals: true,
          include: ['src/domain/finance-manager/application/use-cases/**/*.spec.ts'],
          environment: 'node',
        },
      }),

      // 🧩 Project 2: All tests files
      defineProject({
        plugins: [tsconfigPaths()],
        test: {
          name: 'all',
          globals: true,
          include: ['**/*.spec.ts'],
          environment: 'node',
        },
      })
    ],
  },
})