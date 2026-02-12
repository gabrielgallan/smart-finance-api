
import { defineConfig } from 'vitest/config'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
    test: {
        name: 'UNIT',
        include: [
            './src/domain/**/*.spec.ts'
        ],
        globals: true,
    },
    plugins: [
        tsconfigPaths()
    ]
})