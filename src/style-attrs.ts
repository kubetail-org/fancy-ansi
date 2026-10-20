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

export const enum StyleAttrsKeys {
  BackgroundColor,
  Color,
  FontFamily,
  FontSize,
  FontStyle,
  FontWeight,
  Opacity,
  Outline,
  TextDecoration,
  TextDecorationColor,
  TextDecorationLine,
  TextDecorationStyle,
  VerticalAlign,
  Visibility,
}

const numKeys = 14;

const nameMap = new Array<string>(numKeys);
nameMap[StyleAttrsKeys.BackgroundColor] = 'background-color';
nameMap[StyleAttrsKeys.Color] = 'color';
nameMap[StyleAttrsKeys.FontFamily] = 'font-family';
nameMap[StyleAttrsKeys.FontSize] = 'font-size';
nameMap[StyleAttrsKeys.FontStyle] = 'font-style';
nameMap[StyleAttrsKeys.FontWeight] = 'font-weight';
nameMap[StyleAttrsKeys.Opacity] = 'opacity';
nameMap[StyleAttrsKeys.Outline] = 'outline';
nameMap[StyleAttrsKeys.TextDecoration] = 'text-decoration';
nameMap[StyleAttrsKeys.TextDecorationColor] = 'text-decoration-color';
nameMap[StyleAttrsKeys.TextDecorationLine] = 'text-decoration-line';
nameMap[StyleAttrsKeys.TextDecorationStyle] = 'text-decoration-style';
nameMap[StyleAttrsKeys.VerticalAlign] = 'vertical-align';
nameMap[StyleAttrsKeys.Visibility] = 'visibility';

/**
 * Represents a function that modifies style attributes
 */
export type StyleAttrsModifierFn = (attrs: StyleAttrs) => void;

// Caches a list edit per current value. The cache grows with the number of
// distinct values the key takes, which is small for text-decoration.
function memoize(edit: (currVal: string | undefined) => string) {
  const cache = new Map<string | undefined, string>();
  return (currVal: string | undefined) => {
    let newVal = cache.get(currVal);
    if (newVal === undefined) {
      newVal = edit(currVal);
      cache.set(currVal, newVal);
    }
    return newVal;
  };
}

/**
 * Represents style attributes holder
 */
export class StyleAttrs {
  private attrArray = new Array<string | undefined>(numKeys);

  private _size = 0;

  /**
   * Get attr
   * @param {StyleAttrKeys} key
   */
  public get(key: StyleAttrsKeys) {
    return this.attrArray[key];
  }

  /**
   *
   * @param {StyleAttrsKeys} key
   * @param {string} value
   */
  public set(key: StyleAttrsKeys, value: string) {
    const oldValue = this.attrArray[key];
    this.attrArray[key] = value;
    if (oldValue === undefined && value !== undefined) this._size += 1;
  }

  /**
   * Delete attrs
   * @param {StyleAttrKeys} key
   */
  public delete(key: StyleAttrsKeys) {
    const value = this.attrArray[key];
    this.attrArray[key] = undefined;
    if (value !== undefined) this._size -= 1;
  }

  /**
   * Delete all style attributes
   */
  public clear() {
    this.attrArray.fill(undefined);
    this._size = 0;
  }

  /**
   * Get number of non-empty attributes
   * @returns {number} Number of non-empty attributes
   */
  get size(): number {
    return this._size;
  }

  /**
   * Convert object to string for insertion to `style` elelment attribute
   * @returns {string} Semi-colon separated list of key:val pairs
   */
  public toString(): string {
    let buffer = '';
    this.attrArray.forEach((value, i) => {
      if (value === undefined) return;
      buffer += `${nameMap[i]}:${value};`;
    });
    return buffer;
  }

  /**
   * Set attribute at `key` to `value`
   * @param {StyleAttrsKeys} key
   * @param {string} value
   * @returns {StyleAttrsModifierFn} Modifier function
   */
  static setVal(key: StyleAttrsKeys, value: string): StyleAttrsModifierFn {
    return (attrs) => {
      attrs.set(key, value);
    };
  }

  /**
   * Remove attributes at `keys` if present
   * @param {StyleAttrsKeys} key
   * @returns {StyleAttrsModifierFn} Modifier function
   */
  static delete(...keys: StyleAttrsKeys[]): StyleAttrsModifierFn {
    return (attrs) => {
      keys.forEach((key) => {
        attrs.delete(key);
      });
    };
  }

  /**
   * Append `value` to space separated list if not present
   * @param {StyleAttrsKeys} key
   * @param {string} value
   * @returns {StyleAttrsModifierFn} Modifier function
   */
  static appendVal(key: StyleAttrsKeys, value: string): StyleAttrsModifierFn {
    const next = memoize((currVal) => {
      const vals = (currVal) ? currVal.split(' ') : [];
      if (!vals.includes(value)) vals.push(value);
      return vals.join(' ');
    });
    return (attrs) => {
      attrs.set(key, next(attrs.get(key)));
    };
  }

  /**
   * Remove `value` from space separated list if present
   * @param {StyleAttrsKeys} key
   * @param {string} val
   * @returns {StyleAttrsModifierFn} Modifier function
   */
  static removeVal(key: StyleAttrsKeys, value: string): StyleAttrsModifierFn {
    const next = memoize((currVal) => (
      (currVal) ? currVal.split(' ').filter((x) => x !== value).join(' ') : ''
    ));
    return (attrs) => {
      const newVal = next(attrs.get(key));
      if (newVal) attrs.set(key, newVal);
      else attrs.delete(key);
    };
  }
}
