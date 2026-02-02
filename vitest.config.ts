import { defineConfig, defineProject } from 'vitest/config'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  test: {
    globals: true,
    projects: [
      // 🧩 Project 1: Unit tests
      defineProject({
        plugins: [tsconfigPaths()],
        test: {
          name: 'unit',
          include: ['src/domain/application/use-cases/**/*.spec.ts'],
          environment: 'node',
        },
      }),

      // 🧩 Project 2: E2E tests with Prisma
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