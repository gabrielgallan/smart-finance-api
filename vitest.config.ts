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
          include: ['src/domain/application/use-cases/**/*.spec.ts'],
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
      }),

      // 🧩 Project 3: E2E tests with Prisma
      //   defineProject({
      //     // plugins: [tsconfigPaths()],
      //     test: {
      //       name: 'e2e',
      //       include: ['src/infra/http/controllers/**/*.spec.ts'],
      //       environment: 'prisma',
      //       testTimeout: 60000,
      //       hookTimeout: 60000,
      //       isolate: true,
      //       sequence: { concurrent: false },
      //     },
      //   }),
    ],
  },
})