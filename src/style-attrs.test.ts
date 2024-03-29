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

import { StyleAttrs, StyleAttrsKeys } from './style-attrs';

describe('StyleAttrs', () => {
  describe('instance methods', () => {
    describe('.get()', () => {
      it('returns undefined when attr not present', () => {
        const attrs = new StyleAttrs();
        expect(attrs.get(StyleAttrsKeys.Color)).toEqual(undefined);
      });

      it('returns value when attr present', () => {
        const attrs = new StyleAttrs();
        attrs.set(StyleAttrsKeys.Color, 'red');
        expect(attrs.get(StyleAttrsKeys.Color)).toEqual('red');
      });
    });

    describe('.set()', () => {
      it('sets value and updates size on new attributes', () => {
        const attrs = new StyleAttrs();
        attrs.set(StyleAttrsKeys.Color, 'red');
        expect(attrs.get(StyleAttrsKeys.Color)).toEqual('red');
        expect(attrs.size).toEqual(1);
      });

      it('doesnt set value or updates size when input is undefined', () => {
        const attrs = new StyleAttrs();
        // @ts-ignore
        attrs.set(StyleAttrsKeys.Color, undefined);
        expect(attrs.get(StyleAttrsKeys.Color)).toEqual(undefined);
        expect(attrs.size).toEqual(0);
      });

      it('sets value but doesnt update size input is already defined', () => {
        const attrs = new StyleAttrs();

        attrs.set(StyleAttrsKeys.Color, 'red');
        expect(attrs.get(StyleAttrsKeys.Color)).toEqual('red');
        expect(attrs.size).toEqual(1);

        attrs.set(StyleAttrsKeys.Color, 'green');
        expect(attrs.get(StyleAttrsKeys.Color)).toEqual('green');
        expect(attrs.size).toEqual(1);
      });
    });

    describe('.delete()', () => {
      it('doesnt change value or size when attribute not present', () => {
        const attrs = new StyleAttrs();
        attrs.delete(StyleAttrsKeys.Color);
        expect(attrs.get(StyleAttrsKeys.Color)).toEqual(undefined);
        expect(attrs.size).toEqual(0);
      });

      it('deletes value and updates size when attribute is present', () => {
        const attrs = new StyleAttrs();

        attrs.set(StyleAttrsKeys.Color, 'red');
        expect(attrs.size).toEqual(1);

        attrs.delete(StyleAttrsKeys.Color);
        expect(attrs.get(StyleAttrsKeys.Color)).toEqual(undefined);
        expect(attrs.size).toEqual(0);
      });
    });

    describe('.update()', () => {
      it('sets values and updates size on one new attributes', () => {
        const attrs = new StyleAttrs();
        attrs.update({
          [StyleAttrsKeys.Color]: 'red',
        });
        expect(attrs.get(StyleAttrsKeys.Color)).toEqual('red');
        expect(attrs.size).toEqual(1);
      });

      it('sets values and updates size on multiple new attributes', () => {
        const attrs = new StyleAttrs();
        attrs.update({
          [StyleAttrsKeys.Color]: 'red',
          [StyleAttrsKeys.BackgroundColor]: 'green',
        });
        expect(attrs.get(StyleAttrsKeys.Color)).toEqual('red');
        expect(attrs.get(StyleAttrsKeys.BackgroundColor)).toEqual('green');
        expect(attrs.size).toEqual(2);
      });

      it('ignores values that are undefined', () => {
        const attrs = new StyleAttrs();
        attrs.update({
          [StyleAttrsKeys.Color]: 'red',
          [StyleAttrsKeys.BackgroundColor]: undefined,
        });
        expect(attrs.get(StyleAttrsKeys.Color)).toEqual('red');
        expect(attrs.get(StyleAttrsKeys.BackgroundColor)).toEqual(undefined);
        expect(attrs.size).toEqual(1);
      });
    });

    describe('.clear()', () => {
      it('resets values and size when called', () => {
        const attrs = new StyleAttrs();
        attrs.update({
          [StyleAttrsKeys.Color]: 'red',
          [StyleAttrsKeys.BackgroundColor]: 'green',
        });
        expect(attrs.get(StyleAttrsKeys.Color)).toEqual('red');
        expect(attrs.get(StyleAttrsKeys.BackgroundColor)).toEqual('green');
        expect(attrs.size).toEqual(2);

        attrs.clear();
        expect(attrs.get(StyleAttrsKeys.Color)).toEqual(undefined);
        expect(attrs.get(StyleAttrsKeys.BackgroundColor)).toEqual(undefined);
        expect(attrs.size).toEqual(0);
      });
    });

    describe('.toString()', () => {
      it('returns emtpy string when object is empty', () => {
        const attrs = new StyleAttrs();
        expect(attrs.toString()).toEqual('');
      });

      it('returns stringified attribute when one is present', () => {
        const attrs = new StyleAttrs();
        attrs.set(StyleAttrsKeys.Color, 'red');
        expect(attrs.toString()).toEqual('color:red;');
      });

      it('returns stringified attributes when multiple are present', () => {
        const attrs = new StyleAttrs();
        attrs.set(StyleAttrsKeys.Color, 'red');
        attrs.set(StyleAttrsKeys.BackgroundColor, 'green');
        expect(attrs.toString()).toEqual('background-color:green;color:red;');
      });
    });
  });

  describe('class methods', () => {
    describe('.delete()', () => {
      it('returns attribute modifier that deletes attributes', () => {
        const attrs = new StyleAttrs();
        attrs.set(StyleAttrsKeys.Color, 'red');
        expect(attrs.get(StyleAttrsKeys.Color)).toEqual('red');
        expect(attrs.size).toEqual(1);

        const fn = StyleAttrs.delete(StyleAttrsKeys.Color);
        fn(attrs);
        expect(attrs.get(StyleAttrsKeys.Color)).toEqual(undefined);
        expect(attrs.size).toEqual(0);
      });

      it('supports deletion of multiple keys', () => {
        const attrs = new StyleAttrs();
        attrs.set(StyleAttrsKeys.Color, 'red');
        attrs.set(StyleAttrsKeys.BackgroundColor, 'green');
        expect(attrs.get(StyleAttrsKeys.Color)).toEqual('red');
        expect(attrs.get(StyleAttrsKeys.BackgroundColor)).toEqual('green');
        expect(attrs.size).toEqual(2);
        
        const fn = StyleAttrs.delete(StyleAttrsKeys.Color, StyleAttrsKeys.BackgroundColor);
        fn(attrs);
        expect(attrs.get(StyleAttrsKeys.Color)).toEqual(undefined);
        expect(attrs.get(StyleAttrsKeys.BackgroundColor)).toEqual(undefined);
        expect(attrs.size).toEqual(0);
      });

    });

    describe('.appendVal()', () => {
      it('returns attribute modifier that sets attribute when empty', () => {
        const attrs = new StyleAttrs();
        const fn = StyleAttrs.appendVal(StyleAttrsKeys.Color, 'red');
        fn(attrs);
        expect(attrs.get(StyleAttrsKeys.Color)).toEqual('red');
      });

      it('returns attribute modifier that appends attribute when present', () => {
        const attrs = new StyleAttrs();
        attrs.set(StyleAttrsKeys.Color, 'red');

        const fn = StyleAttrs.appendVal(StyleAttrsKeys.Color, 'green');
        fn(attrs);
        expect(attrs.get(StyleAttrsKeys.Color)).toEqual('red green');
      });
    });

    describe('.removeVal()', () => {
      it('returns attribute modifier that does nothing when attribute is empty', () => {
        const attrs = new StyleAttrs();
        const fn = StyleAttrs.removeVal(StyleAttrsKeys.Color, 'red');
        fn(attrs);
        expect(attrs.get(StyleAttrsKeys.Color)).toEqual(undefined);
      });

      it('returns attribute modifier that clears attributes when only value is removed', () => {
        const attrs = new StyleAttrs();
        attrs.set(StyleAttrsKeys.Color, 'red');

        const fn = StyleAttrs.removeVal(StyleAttrsKeys.Color, 'red');
        fn(attrs);
        expect(attrs.get(StyleAttrsKeys.Color)).toEqual(undefined);
      });

      it('returns attribute modifier that removes attribute when multiple are present', () => {
        const attrs = new StyleAttrs();
        attrs.set(StyleAttrsKeys.Color, 'red green');

        const fn = StyleAttrs.removeVal(StyleAttrsKeys.Color, 'red');
        fn(attrs);
        expect(attrs.get(StyleAttrsKeys.Color)).toEqual('green');
      });
    });
  });
});
