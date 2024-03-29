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
const testMap = new Map([['a', 1], ['b', 2], ['c', 3], ['d', 4]]);

// object benchmarks
(new Suite('object loops'))
  .add('obj-for', () => {
    const x = {};
    const y = { ...testObj };
    for (const key in y) {
      if (y.hasOwnProperty(key)) x[key] = y[key];
    }
  })
  .add('obj-spread', () => {
    const x = {};
    const y = { ...testObj };
    const _ = { ...x, ...y };
  })
  .add('obj-assign', () => {
    const x = {};
    const y = { ...testObj };
    Object.assign(x, y);
  })
  .add('obj-entries-foreach', () => {
    const x = {};
    const y = { ...testObj };
    Object.entries(y).forEach(([key, value]) => {
      x[key] = value;
    })
  })
  .add('obj-entries-for', () => {
    const x = {};
    const y = { ...testObj };
    for (const [key, value] of Object.entries(y)) {
      x[key] = value;
    }
  })
  .on('cycle', function (event) {
    console.log(event.target);
  })
  .on('complete', function () {
    console.log('Fastest is ' + this.filter('fastest').map('name'));
  })
  .run({ 'async': true });

// map benchmarks
(new Suite('map loops'))
  .add('map-for-loop', () => {
    const x = new Map();
    const y = new Map(testMap);
    for (const [key, val] of y.entries()) {
      x.set(key, val);
    }
  })
  .add('map-foreach-loop', () => {
    const x = new Map();
    const y = new Map(testMap);
    y.forEach((val, key) => {
      x.set(val, key);
    });
  })
  .add('map-spread', () => {
    const x = new Map();
    const y = new Map(testMap);
    const _ = new Map([...x, ...y]);
  })
  .on('cycle', function (event) {
    console.log(event.target);
  })
  .on('complete', function () {
    console.log('Fastest is ' + this.filter('fastest').map('name'));
  })
  .run({ 'async': true });

// comparison
(new Suite('map vs object - merge'))
  .add('merge: map', () => {
    const _1 = {};
    const _2 = { ...testObj };

    const x = new Map();
    const y = new Map(testMap);
    y.forEach((val, key) => {
      x.set(val, key);
    });
  })
  .add('merge: object', () => {
    const _1 = new Map();
    const _2 = new Map(testMap);

    const x = {};
    const y = { ...testObj };
    Object.assign(x, y);
  })
  .on('cycle', function (event) {
    console.log(event.target);
  })
  .on('complete', function () {
    console.log('Fastest is ' + this.filter('fastest').map('name'));
  })
  .run({ 'async': true });

(new Suite('map vs object - delete'))
  .add('delete: map', () => {
    const _ = { ...testObj };
    const x = new Map(testMap);
    x.delete('a');
  })
  .add('delete: object', () => {
    const x = { ...testObj };
    const _ = new Map(testMap);
    // @ts-ignore
    delete x['a'];
  })
  .on('cycle', function (event) {
    console.log(event.target);
  })
  .on('complete', function () {
    console.log('Fastest is ' + this.filter('fastest').map('name'));
  })
  .run({ 'async': true });

(new Suite('map vs object - set'))
  .add('set: map', () => {
    const _ = {};
    const x = new Map();
    x.set('a', 1);
  })
  .add('set: object', () => {
    const x = {} as any;
    const _ = new Map();
    x['a'] = 1;
  })
  .on('cycle', function (event) {
    console.log(event.target);
  })
  .on('complete', function () {
    console.log('Fastest is ' + this.filter('fastest').map('name'));
  })
  .run({ 'async': true });
