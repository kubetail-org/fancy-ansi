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


import { copyFileSync } from 'fs';
import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['src/main.ts', 'src/colors.ts', 'src/plugin.ts', 'src/react.tsx'],
  format: ['esm', 'cjs'],
  dts: true,
  fixedExtension: false,
  deps: { neverBundle: ['react', 'react/jsx-runtime'] },
  tsconfig: 'tsconfig.build.json',
  // plugin.css is a pre-generated asset, not an entry, so tsdown won't emit it on its own
  hooks: {
    'build:done': () => copyFileSync('src/plugin.css', 'dist/plugin.css'),
  },
});
