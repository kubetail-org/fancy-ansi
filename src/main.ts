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

/**
 * Get the style attribute an extended color packet sets
 * @param {string} text - The SGR parameters
 * @returns {StyleAttrsKeys | undefined} The key for "38;5;n" and "38;2;r;g;b" (also 48 and 58)
 */
function getExtendedColorKey(text: string): StyleAttrsKeys | undefined {
  if (text[1] !== '8' || text[2] !== ';' || text[4] !== ';') return undefined;
  if (text[3] !== '2' && text[3] !== '5') return undefined;
  switch (text[0]) {
    case '3': return StyleAttrsKeys.Color;
    case '4': return StyleAttrsKeys.BackgroundColor;
    case '5': return StyleAttrsKeys.TextDecorationColor;
    default: return undefined;
  }
}

/**
 * Apply an extended color to style attributes; malformed packets set nothing
 * @param {string} text - The SGR parameters
 * @param {StyleAttrsKeys} key - The style attribute to set
 * @param {StyleAttrs} attrs - The current style attributes
 */
function processExtendedColor(text: string, key: StyleAttrsKeys, attrs: StyleAttrs) {
  if (text[3] === '5') {
    // exactly one parameter: the palette index
    let index = 0;
    for (let i = 5; i < text.length; i += 1) {
      const c = text.charCodeAt(i);
      if (c === SEMICOLON) return;
      index = index * 10 + (c - ZERO);
    }
    if (text.length > 5 && index < 256) attrs.set(key, palette256[index]);
    return;
  }

  // exactly three parameters: r, g and b, kept as written
  const g = text.indexOf(';', 5);
  const b = text.indexOf(';', g + 1);
  if (g === -1 || b === -1 || text.indexOf(';', b + 1) !== -1) return;
  attrs.set(key, `rgb(${text.slice(5, g)},${text.slice(g + 1, b)},${text.slice(b + 1)})`);
}

/**
 * Read SGR packet and modify style attributes accordingly
 * @param {Packet} packet - The parsed packet
 * @param {StyleAttrs} attrs - The current style attributes
 */
function processSGRPacket(packet: Packet, attrs: StyleAttrs) {
  const { text } = packet;

  const key = getExtendedColorKey(text);
  if (key !== undefined) {
    processExtendedColor(text, key, attrs);
    return;
  }

  // Parameters are digits and ';' only, so read each code in place.
  // An empty parameter counts as 0.
  let code = 0;
  for (let i = 0; i < text.length; i += 1) {
    const c = text.charCodeAt(i);
    if (c === SEMICOLON) {
      applySGRCode(code, attrs);
      code = 0;
    } else {
      code = code * 10 + (c - ZERO);
    }
  }
  applySGRCode(code, attrs);
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

    const openSpan = () => {
      if (!attrs.size) return;
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
          buffer += escape(packet.text);
          break;
        case PacketKind.SGR:
          closeSpan();
          processSGRPacket(packet, attrs);
          openSpan();
          break;
        case PacketKind.OSCURL: {
          if (!this.linkAttrs) break;

          // an unsafe url closes the current link, like an empty one does
          const url = isHttpUrl(packet.url) ? packet.url : '';
          if (!url && !inLink) break;

          // spans nest inside links, so reopen the current style inside the new link
          closeSpan();
          if (inLink) buffer += '</a>';
          if (url) buffer += `<a href="${escape(url)}"${this.linkAttrs}>`;
          inLink = url !== '';
          openSpan();
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
