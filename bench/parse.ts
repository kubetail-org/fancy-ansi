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

import { Parser } from '../src/parse';

const suite = new Suite('Parse function comparisons');

//const x = '\x1b[1mbold\x1b[0m';
const x = '[38;5;0008m[[0m[38;5;0007m17:19:30[0m[38;5;0008m [0m[38;5;0015mINF[0m[38;5;0008m] [0m[38;5;0045m<IP-ADDRESS>26[0m[38;5;0015m [0m[38;5;0045mhttps[0m[38;5;0015m [0m[38;5;0045m<HOSTNAME>[0m[38;5;0015m [0m[38;5;0045mGET[0m[38;5;0015m [0m[38;5;0045m/api/example[0m[38;5;0015m responded [0m[38;5;0200m200[0m[38;5;0015m in [0m[38;5;0200m0.1650[0m[38;5;0015m ms[0m';


suite
  .add('parse', () => {
    Array.from(new Parser(x));
  })
  .on('cycle', function (event) {
    console.log(event.target);
  })
  .on('complete', function () {
    console.log('Fastest is ' + this.filter('fastest').map('name'));
  })
  .run({ 'async': true });
