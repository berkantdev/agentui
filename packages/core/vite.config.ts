import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'
import { resolve } from 'node:path'

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      formats: ['es', 'cjs'],
      fileName: (format) => (format === 'es' ? 'index.js' : 'index.cjs'),
    },
    rollupOptions: {
      external: ['zod'],
    },
    minify: false,
    sourcemap: true,
    target: 'es2022',
    outDir: 'dist',
    emptyOutDir: true,
  },
  plugins: [
    dts({
      include: ['src/**/*.ts'],
      rollupTypes: true,
      tsconfigPath: './tsconfig.json',
    }),
  ],
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.ts'],
  },
})
