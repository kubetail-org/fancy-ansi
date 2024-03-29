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

import { Suite } from 'benchmark';

const testObj = { a: '1', b: '2', c: '3', d: '4' };

(new Suite('object inner loops'))
  .add('obj-for', () => {
    const x = { ...testObj };
    let y: any;
    for (const key in x) {
      if (x.hasOwnProperty(key)) {
        y = x[key];
      };
    }
  })
  .add('obj-entries-foreach', () => {
    const x = { ...testObj };
    let y: any;
    Object.entries(x).forEach(([, value]) => {
      y = value;
    });
  })
  .add('obj-entries-for', () => {
    const x = { ...testObj };
    let y: any;
    for (const [, value] of Object.entries(x)) {
      y = value;
    };
  })
  .on('cycle', function (event) {
    console.log(event.target);
  })
  .on('complete', function () {
    console.log('Fastest is ' + this.filter('fastest').map('name'));
  })
  .run({ 'async': true });
