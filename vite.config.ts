// Copyright 2024 Andres Morey
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/// <reference types="vitest" />
import typescript from '@rollup/plugin-typescript';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import autoExternal from 'rollup-plugin-auto-external';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [
    react(),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  build: {
    lib: {
      entry: [
        resolve(__dirname, 'src/main.ts'),
        resolve(__dirname, 'src/colors.ts'),
        resolve(__dirname, 'src/plugin.ts'),
        resolve(__dirname, 'src/react.tsx'),
      ],
      name: 'fancyAnsi',
      formats: ["es", "cjs"],
    },
    rollupOptions: {
      plugins: [
        typescript({
          sourceMap: false,
          declaration: true,
          outDir: "dist",
          include: ['src/**/*']
        }),
        autoExternal(),
      ],
      external: ['react', 'react-dom', 'react/jsx-runtime'],
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['vitest.setup.ts']
  }
});
