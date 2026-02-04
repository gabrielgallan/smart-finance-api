import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/infra/http/server.ts'],
  outDir: 'dist',

  format: ['esm'],
  clean: true,
  minify: false, 

  dts: false
})