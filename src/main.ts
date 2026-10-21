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

import escape from 'escape-html';

import AnsiRegex from '@/ansi-regex';
import { StandardColorKeys, xtermjs } from '@/colors';
import { Packet, PacketKind, Parser } from '@/parse';
import { StyleAttrs, StyleAttrsKeys } from '@/style-attrs';
import type { StyleAttrsModifierFn } from '@/style-attrs';

const ansiRegex = AnsiRegex();
const hasAnsiRegex = AnsiRegex({ onlyFirst: true });

const codeMap = new Array<StandardColorKeys>(16);
codeMap[0] = StandardColorKeys.Black;
codeMap[1] = StandardColorKeys.Red;
codeMap[2] = StandardColorKeys.Green;
codeMap[3] = StandardColorKeys.Yellow;
codeMap[4] = StandardColorKeys.Blue;
codeMap[5] = StandardColorKeys.Magenta;
codeMap[6] = StandardColorKeys.Cyan;
codeMap[7] = StandardColorKeys.White;
codeMap[8] = StandardColorKeys.BrightBlack;
codeMap[9] = StandardColorKeys.BrightRed;
codeMap[10] = StandardColorKeys.BrightGreen;
codeMap[11] = StandardColorKeys.BrightYellow;
codeMap[12] = StandardColorKeys.BrightBlue;
codeMap[13] = StandardColorKeys.BrightMagenta;
codeMap[14] = StandardColorKeys.BrightCyan;
codeMap[15] = StandardColorKeys.BrightWhite;

const palette256 = new Array<string>(256);
for (let i = 0; i < 16; i += 1) {
  const colorKey = codeMap[i];
  palette256[i] = `var(--ansi-${colorKey}, ${xtermjs[colorKey]})`;
}
// 6x6x6 rgb cube
const cubeLevels = [0x00, 0x5f, 0x87, 0xaf, 0xd7, 0xff];
for (let i = 0; i < 216; i += 1) {
  const r = cubeLevels[(i / 36) | 0];
  const g = cubeLevels[((i / 6) | 0) % 6];
  const b = cubeLevels[i % 6];
  palette256[16 + i] = `rgb(${r},${g},${b})`;
}
// 24-step grayscale
for (let i = 0; i < 24; i += 1) {
  const c = 8 + i * 10;
  palette256[232 + i] = `var(--ansi-gray-${24 - i}, rgb(${c},${c},${c}))`;
}

// SGR code -> style attributes modifier (code 0 is handled in applySGRCode)
const styleAttrsMap = new Array<StyleAttrsModifierFn | undefined>(108);
styleAttrsMap[1] = StyleAttrs.setVal(StyleAttrsKeys.FontWeight, 'var(--ansi-bold-font-weight, 600)');
styleAttrsMap[2] = StyleAttrs.setVal(StyleAttrsKeys.Opacity, 'var(--ansi-dim-opacity, 0.7)');
styleAttrsMap[3] = StyleAttrs.setVal(StyleAttrsKeys.FontStyle, 'italic');
styleAttrsMap[4] = StyleAttrs.appendVal(StyleAttrsKeys.TextDecoration, 'underline');
styleAttrsMap[8] = StyleAttrs.setVal(StyleAttrsKeys.Visibility, 'hidden');
styleAttrsMap[9] = StyleAttrs.appendVal(StyleAttrsKeys.TextDecoration, 'line-through');
styleAttrsMap[10] = StyleAttrs.delete(StyleAttrsKeys.FontFamily);
for (let i = 1; i <= 9; i += 1) {
  styleAttrsMap[10 + i] = StyleAttrs.setVal(StyleAttrsKeys.FontFamily, `var(--ansi-font-${i})`);
}
styleAttrsMap[21] = (attrs) => {
  attrs.set(StyleAttrsKeys.TextDecorationLine, 'underline');
  attrs.set(StyleAttrsKeys.TextDecorationStyle, 'double');
};
styleAttrsMap[22] = StyleAttrs.delete(StyleAttrsKeys.FontWeight);
styleAttrsMap[23] = StyleAttrs.delete(StyleAttrsKeys.FontStyle);
styleAttrsMap[24] = StyleAttrs.removeVal(StyleAttrsKeys.TextDecoration, 'underline');
styleAttrsMap[28] = StyleAttrs.delete(StyleAttrsKeys.Visibility);
styleAttrsMap[29] = StyleAttrs.removeVal(StyleAttrsKeys.TextDecoration, 'line-through');
for (let i = 0; i < 8; i += 1) {
  styleAttrsMap[30 + i] = StyleAttrs.setVal(StyleAttrsKeys.Color, palette256[i]);
  styleAttrsMap[40 + i] = StyleAttrs.setVal(StyleAttrsKeys.BackgroundColor, palette256[i]);
  styleAttrsMap[90 + i] = StyleAttrs.setVal(StyleAttrsKeys.Color, palette256[8 + i]);
  styleAttrsMap[100 + i] = StyleAttrs.setVal(StyleAttrsKeys.BackgroundColor, palette256[8 + i]);
}
styleAttrsMap[39] = StyleAttrs.delete(StyleAttrsKeys.Color);
styleAttrsMap[49] = StyleAttrs.delete(StyleAttrsKeys.BackgroundColor);
styleAttrsMap[51] = StyleAttrs.setVal(StyleAttrsKeys.Outline, 'var(--ansi-frame-outline, 1px solid)');
styleAttrsMap[53] = StyleAttrs.appendVal(StyleAttrsKeys.TextDecoration, 'overline');
styleAttrsMap[54] = StyleAttrs.delete(StyleAttrsKeys.Outline);
styleAttrsMap[55] = StyleAttrs.removeVal(StyleAttrsKeys.TextDecoration, 'overline');
styleAttrsMap[59] = StyleAttrs.delete(StyleAttrsKeys.TextDecorationColor);
styleAttrsMap[73] = (attrs) => {
  attrs.set(StyleAttrsKeys.VerticalAlign, 'super');
  attrs.set(StyleAttrsKeys.FontSize, 'var(--ansi-superscript-font-size, 80%)');
};
styleAttrsMap[74] = (attrs) => {
  attrs.set(StyleAttrsKeys.VerticalAlign, 'sub');
  attrs.set(StyleAttrsKeys.FontSize, 'var(--ansi-subscript-font-size, 80%)');
};
styleAttrsMap[75] = StyleAttrs.delete(StyleAttrsKeys.VerticalAlign, StyleAttrsKeys.FontSize);

const SEMICOLON = 59; // ';'
const ZERO = 48; // '0'

/**
 * Apply one SGR code to style attributes
 * @param {number} code - The SGR code
 * @param {StyleAttrs} attrs - The current style attributes
 */
function applySGRCode(code: number, attrs: StyleAttrs) {
  // handle reset
  if (code === 0) {
    attrs.clear();
    return;
  }

  styleAttrsMap[code]?.(attrs);
}

// Scratch space for the parameters of one extended color
const colorParams = [0, 0, 0];

/**
 * Apply the extended color at `start`, "5;n" or "2;r;g;b"; malformed colors set nothing
 * @param {string} text - The SGR parameters
 * @param {number} start - Where the color type starts
 * @param {StyleAttrsKeys} key - The style attribute to set
 * @param {StyleAttrs} attrs - The current style attributes
 * @returns {number} The position after the color
 */
function processExtendedColor(
  text: string,
  start: number,
  key: StyleAttrsKeys,
  attrs: StyleAttrs,
): number {
  const n = text.length;

  // "5;" is followed by a palette index, "2;" by r, g and b
  let count = 0;
  if (text.charCodeAt(start + 1) === SEMICOLON) {
    const type = text.charCodeAt(start);
    if (type === ZERO + 5) count = 1;
    else if (type === ZERO + 2) count = 3;
  }
  // Without a known color type there's no telling where the color ends, so
  // drop the rest of the packet rather than misread it as codes
  if (count === 0) return n + 1;

  // Every parameter is read even when one is invalid, so the codes after the
  // color are still applied
  let i = start + 2;
  let valid = true;
  for (let k = 0; k < count; k += 1) {
    let value = -1;
    for (; i < n; i += 1) {
      const c = text.charCodeAt(i);
      if (c === SEMICOLON) break;
      value = (value < 0 ? 0 : value * 10) + (c - ZERO);
    }
    i += 1;
    // empty, missing and out-of-range parameters are all invalid
    if (value < 0 || value > 255) valid = false;
    colorParams[k] = value;
  }

  if (valid) {
    if (count === 1) attrs.set(key, palette256[colorParams[0]]);
    else attrs.set(key, `rgb(${colorParams[0]},${colorParams[1]},${colorParams[2]})`);
  }
  return i;
}

/**
 * Get the style attribute an extended color code sets
 * @param {number} code - The SGR code
 * @returns {StyleAttrsKeys | undefined} The key for 38, 48 and 58
 */
function getExtendedColorKey(code: number): StyleAttrsKeys | undefined {
  switch (code) {
    case 38: return StyleAttrsKeys.Color;
    case 48: return StyleAttrsKeys.BackgroundColor;
    case 58: return StyleAttrsKeys.TextDecorationColor;
    default: return undefined;
  }
}

/**
 * Read SGR packet and modify style attributes accordingly
 * @param {Packet} packet - The parsed packet
 * @param {StyleAttrs} attrs - The current style attributes
 */
function processSGRPacket(packet: Packet, attrs: StyleAttrs) {
  const { text } = packet;
  const n = text.length;

  // Parameters are digits and ';' only, so read each code in place.
  // An empty parameter counts as 0.
  let i = 0;
  while (i <= n) {
    let code = 0;
    for (; i < n; i += 1) {
      const c = text.charCodeAt(i);
      if (c === SEMICOLON) break;
      code = code * 10 + (c - ZERO);
    }
    i += 1; // past the ';', or past the end once the last code is read

    const key = getExtendedColorKey(code);
    if (key === undefined) applySGRCode(code, attrs);
    else i = processExtendedColor(text, i, key, attrs);
  }
}

// Every ANSI sequence starts with ESC or the 8-bit CSI. Checking for them with
// includes() is much faster than running the regex over plain text.
function hasEscapeChar(input: string): boolean {
  return input.includes('\x1b') || input.includes('\x9b');
}

/**
 * Check if a given string has ANSI markup
 * @param {string} input - The input string
 * @returns {boolean} Whether or not the input string has ANSI markup
 */
export function hasAnsi(input: string): boolean {
  return hasEscapeChar(input) && hasAnsiRegex.test(input);
}

/**
 * Strip out all ANSI markup
 * @param {string} input - The input string
 * @returns {string} The input string with ANSI escape codes replaced with ''
 */
export function stripAnsi(input: string): string {
  if (!hasEscapeChar(input)) return input;
  return input.replaceAll(ansiRegex, '');
}

// Only http(s) URLs become links; `javascript:`, `data:` and relative URLs don't
function isHttpUrl(url: string): boolean {
  // Every link close has an empty url, and new URL('') throws, which is slow. The
  // URL parser only reports http(s) when the scheme leads the input, so this is safe.
  if (!/^https?:/i.test(url)) return false;
  try {
    const { protocol } = new URL(url);
    return protocol === 'http:' || protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Options for rendering OSC 8 hyperlinks
 */
export type HyperlinkOptions = {
  /** Value of the `target` attribute */
  target?: string;
  /** Value of the `class` attribute */
  className?: string;
};

/**
 * Options for the FancyAnsi converter
 */
export type FancyAnsiOptions = {
  /**
   * Render OSC 8 hyperlinks as `<a>` tags. Off by default because the URL
   * comes from the input.
   */
  hyperlinks?: boolean | HyperlinkOptions;
};

// Attributes shared by every `<a>` tag. `rel` is fixed; the consumer picks the rest.
function linkAttrs({ target, className }: HyperlinkOptions): string {
  let attrs = ' rel="noopener noreferrer nofollow"';
  if (target) attrs += ` target="${escape(target)}"`;
  if (className) attrs += ` class="${escape(className)}"`;
  return attrs;
}

/**
 * Represents a configurable ANSI to HTML converter object
 */
export class FancyAnsi {
  private readonly linkAttrs?: string;

  /**
   * @param {FancyAnsiOptions} options - Converter options
   */
  constructor({ hyperlinks }: FancyAnsiOptions = {}) {
    if (hyperlinks) this.linkAttrs = linkAttrs(hyperlinks === true ? {} : hyperlinks);
  }

  /**
   * Convert input string with ansi markup to browser-safe HTML
   * @param {string} input
   * @returns {string} A browser-safe HTML string with converted ANSI
   */
  public toHtml(input: string): string {
    // Parser only splits on ESC, so without one the input is a single text packet
    if (!input.includes('\x1b')) return escape(input);

    const attrs: StyleAttrs = new StyleAttrs();
    let buffer = '';
    let inSpan = false;
    let inLink = false;

    // Spans open on the next text packet, so adjacent SGR packets and trailing
    // styles don't leave empty spans behind.
    const openSpan = () => {
      if (inSpan || !attrs.size) return;
      buffer += `<span style="${attrs.toString()}">`;
      inSpan = true;
    };

    const closeSpan = () => {
      if (!inSpan) return;
      buffer += '</span>';
      inSpan = false;
    };

    // iterate through packets
    for (const packet of new Parser(input)) {
      switch (packet.kind) {
        case PacketKind.Text:
          openSpan();
          buffer += escape(packet.text);
          break;
        case PacketKind.SGR:
          closeSpan();
          processSGRPacket(packet, attrs);
          break;
        case PacketKind.OSCURL: {
          if (!this.linkAttrs) break;

          // an unsafe url closes the current link, like an empty one does
          const url = isHttpUrl(packet.url) ? packet.url : '';
          if (!url && !inLink) break;

          // spans nest inside links, so the next text reopens the style inside the new link
          closeSpan();
          if (inLink) buffer += '</a>';
          if (url) buffer += `<a href="${escape(url)}"${this.linkAttrs}>`;
          inLink = url !== '';
          break;
        }
        default:
          break;
      }
    }

    // close open tags
    closeSpan();
    if (inLink) buffer += '</a>';

    return buffer;
  }
}
