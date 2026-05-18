/// <reference types="vitest" />
import { resolve } from 'path';
import { defineConfig } from 'vite';
import typescript from '@rollup/plugin-typescript';

export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  build: {
    lib: {
      entry: resolve(__dirname, 'src/main.ts'),
      name: 'fancyAnsi',
      fileName: (format) => `fancy-ansi.${format}.js`,
      formats: ['umd'],
    },
    rollupOptions: {
      plugins: [
        typescript({
          sourceMap: false,
          declaration: false,
          outDir: "dist",
          include: ['src/**/*']
        }),
      ],
    },
  },
});
