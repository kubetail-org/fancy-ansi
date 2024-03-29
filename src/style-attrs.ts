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
 * Represents a map between style attribute keys and string values
 */
export type StyleAttrsDict = { [key in StyleAttrsKeys]?: string };

/**
 * Represents a function that modifies style attributes
 */
export type StyleAttrsModifierFn = (attrs: StyleAttrs) => void;

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
   * Merge values from another object into this one
   * @param {StyleAttrs} attrs - The attributes to merge into instance
   */
  public update(attrs: StyleAttrsDict) {
    for (const key in attrs) {
      if (attrs.hasOwnProperty(key)) {
        // @ts-expect-error key type is string
        const value = attrs[key];
        // @ts-expect-error key type is string
        this.attrArray[key] = value;
        if (value !== undefined) this._size += 1;
      }
    }
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
    return (attrs) => {
      const currVal = attrs.get(key);
      const vals = (currVal) ? currVal.split(' ') : [];
      if (!vals.includes(value)) vals.push(value);
      attrs.set(key, vals.join(' '));
    };
  }

  /**
   * Remove `value` from space separated list if present
   * @param {StyleAttrsKeys} key
   * @param {string} val
   * @returns {StyleAttrsModifierFn} Modifier function
   */
  static removeVal(key: StyleAttrsKeys, value: string): StyleAttrsModifierFn {
    return (attrs) => {
      const currVal = attrs.get(key);
      let vals = (currVal) ? currVal.split(' ') : [];
      vals = vals.filter((x) => x !== value);
      if (!vals.length) attrs.delete(key);
      else attrs.set(key, vals.join(' '));
    };
  }
}
