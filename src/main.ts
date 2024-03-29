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

import AnsiRegex from 'ansi-regex';
import escape from 'escape-html';

import { StandardColorKeys, xtermjs } from '@/colors';
import { Packet, PacketKind, Parser } from '@/parse';
import { StyleAttrs, StyleAttrsKeys } from '@/style-attrs';
import type { StyleAttrsDict, StyleAttrsModifierFn } from '@/style-attrs';

const ansiRegex = AnsiRegex();
const hasAnsiRegex = AnsiRegex({ onlyFirst: true });

const styleAttrsMap = new Array<StyleAttrsDict | StyleAttrsModifierFn | undefined>(108);
styleAttrsMap[0] = { [StyleAttrsKeys.FontWeight]: 'var(--ansi-bold-font-weight, 600)' };
styleAttrsMap[1] = { [StyleAttrsKeys.FontWeight]: 'var(--ansi-bold-font-weight, 600)' };
styleAttrsMap[2] = { [StyleAttrsKeys.Opacity]: 'var(--ansi-dim-opacity, 0.7)' };
styleAttrsMap[3] = { [StyleAttrsKeys.FontStyle]: 'italic' };
styleAttrsMap[4] = StyleAttrs.appendVal(StyleAttrsKeys.TextDecoration, 'underline');
styleAttrsMap[8] = { [StyleAttrsKeys.Visibility]: 'hidden' };
styleAttrsMap[9] = StyleAttrs.appendVal(StyleAttrsKeys.TextDecoration, 'line-through');
styleAttrsMap[10] = StyleAttrs.delete(StyleAttrsKeys.FontFamily);
styleAttrsMap[11] = { [StyleAttrsKeys.FontFamily]: 'var(--ansi-font-1)' };
styleAttrsMap[12] = { [StyleAttrsKeys.FontFamily]: 'var(--ansi-font-2)' };
styleAttrsMap[13] = { [StyleAttrsKeys.FontFamily]: 'var(--ansi-font-3)' };
styleAttrsMap[14] = { [StyleAttrsKeys.FontFamily]: 'var(--ansi-font-4)' };
styleAttrsMap[15] = { [StyleAttrsKeys.FontFamily]: 'var(--ansi-font-5)' };
styleAttrsMap[16] = { [StyleAttrsKeys.FontFamily]: 'var(--ansi-font-6)' };
styleAttrsMap[17] = { [StyleAttrsKeys.FontFamily]: 'var(--ansi-font-7)' };
styleAttrsMap[18] = { [StyleAttrsKeys.FontFamily]: 'var(--ansi-font-8)' };
styleAttrsMap[19] = { [StyleAttrsKeys.FontFamily]: 'var(--ansi-font-9)' };
styleAttrsMap[21] = { [StyleAttrsKeys.TextDecorationLine]: 'underline', [StyleAttrsKeys.TextDecorationStyle]: 'double' };
styleAttrsMap[22] = StyleAttrs.delete(StyleAttrsKeys.FontWeight);
styleAttrsMap[23] = StyleAttrs.delete(StyleAttrsKeys.FontStyle);
styleAttrsMap[24] = StyleAttrs.removeVal(StyleAttrsKeys.TextDecoration, 'underline');
styleAttrsMap[28] = StyleAttrs.delete(StyleAttrsKeys.Visibility);
styleAttrsMap[29] = StyleAttrs.removeVal(StyleAttrsKeys.TextDecoration, 'line-through');
styleAttrsMap[30] = { [StyleAttrsKeys.Color]: `var(--ansi-black, ${xtermjs[StandardColorKeys.Black]})` };
styleAttrsMap[31] = { [StyleAttrsKeys.Color]: `var(--ansi-red, ${xtermjs[StandardColorKeys.Red]})` };
styleAttrsMap[32] = { [StyleAttrsKeys.Color]: `var(--ansi-green, ${xtermjs[StandardColorKeys.Green]})` };
styleAttrsMap[33] = { [StyleAttrsKeys.Color]: `var(--ansi-yellow, ${xtermjs[StandardColorKeys.Yellow]})` };
styleAttrsMap[34] = { [StyleAttrsKeys.Color]: `var(--ansi-blue, ${xtermjs[StandardColorKeys.Blue]})` };
styleAttrsMap[35] = { [StyleAttrsKeys.Color]: `var(--ansi-magenta, ${xtermjs[StandardColorKeys.Magenta]})` };
styleAttrsMap[36] = { [StyleAttrsKeys.Color]: `var(--ansi-cyan, ${xtermjs[StandardColorKeys.Cyan]})` };
styleAttrsMap[37] = { [StyleAttrsKeys.Color]: `var(--ansi-white, ${xtermjs[StandardColorKeys.White]})` };
styleAttrsMap[39] = StyleAttrs.delete(StyleAttrsKeys.Color);
styleAttrsMap[40] = { [StyleAttrsKeys.BackgroundColor]: `var(--ansi-black, ${xtermjs[StandardColorKeys.Black]})` };
styleAttrsMap[41] = { [StyleAttrsKeys.BackgroundColor]: `var(--ansi-red, ${xtermjs[StandardColorKeys.Red]})` };
styleAttrsMap[42] = { [StyleAttrsKeys.BackgroundColor]: `var(--ansi-green, ${xtermjs[StandardColorKeys.Green]})` };
styleAttrsMap[43] = { [StyleAttrsKeys.BackgroundColor]: `var(--ansi-yellow, ${xtermjs[StandardColorKeys.Yellow]})` };
styleAttrsMap[44] = { [StyleAttrsKeys.BackgroundColor]: `var(--ansi-blue, ${xtermjs[StandardColorKeys.Blue]})` };
styleAttrsMap[45] = { [StyleAttrsKeys.BackgroundColor]: `var(--ansi-magenta, ${xtermjs[StandardColorKeys.Magenta]})` };
styleAttrsMap[46] = { [StyleAttrsKeys.BackgroundColor]: `var(--ansi-cyan, ${xtermjs[StandardColorKeys.Cyan]})` };
styleAttrsMap[47] = { [StyleAttrsKeys.BackgroundColor]: `var(--ansi-white, ${xtermjs[StandardColorKeys.White]})` };
styleAttrsMap[49] = StyleAttrs.delete(StyleAttrsKeys.BackgroundColor);
styleAttrsMap[51] = { [StyleAttrsKeys.Outline]: 'var(--ansi-frame-outline, 1px solid)' };
styleAttrsMap[53] = StyleAttrs.appendVal(StyleAttrsKeys.TextDecoration, 'overline');
styleAttrsMap[54] = StyleAttrs.delete(StyleAttrsKeys.Outline);
styleAttrsMap[55] = StyleAttrs.removeVal(StyleAttrsKeys.TextDecoration, 'overline');
styleAttrsMap[59] = StyleAttrs.delete(StyleAttrsKeys.TextDecorationColor);
styleAttrsMap[73] = { [StyleAttrsKeys.VerticalAlign]: 'super', [StyleAttrsKeys.FontSize]: 'var(--ansi-superscript-font-size, 80%)' };
styleAttrsMap[74] = { [StyleAttrsKeys.VerticalAlign]: 'sub', [StyleAttrsKeys.FontSize]: 'var(--ansi-subscript-font-size, 80%)' };
styleAttrsMap[75] = StyleAttrs.delete(StyleAttrsKeys.VerticalAlign, StyleAttrsKeys.FontSize);
styleAttrsMap[90] = { [StyleAttrsKeys.Color]: `var(--ansi-bright-black, ${xtermjs[StandardColorKeys.BrightBlack]})` };
styleAttrsMap[91] = { [StyleAttrsKeys.Color]: `var(--ansi-bright-red, ${xtermjs[StandardColorKeys.BrightRed]})` };
styleAttrsMap[92] = { [StyleAttrsKeys.Color]: `var(--ansi-bright-green, ${xtermjs[StandardColorKeys.BrightGreen]})` };
styleAttrsMap[93] = { [StyleAttrsKeys.Color]: `var(--ansi-bright-yellow, ${xtermjs[StandardColorKeys.BrightYellow]})` };
styleAttrsMap[94] = { [StyleAttrsKeys.Color]: `var(--ansi-bright-blue, ${xtermjs[StandardColorKeys.BrightBlue]})` };
styleAttrsMap[95] = { [StyleAttrsKeys.Color]: `var(--ansi-bright-magenta, ${xtermjs[StandardColorKeys.BrightMagenta]})` };
styleAttrsMap[96] = { [StyleAttrsKeys.Color]: `var(--ansi-bright-cyan, ${xtermjs[StandardColorKeys.BrightCyan]})` };
styleAttrsMap[97] = { [StyleAttrsKeys.Color]: `var(--ansi-bright-white, ${xtermjs[StandardColorKeys.BrightWhite]})` };
styleAttrsMap[100] = { [StyleAttrsKeys.BackgroundColor]: `var(--ansi-bright-black, ${xtermjs[StandardColorKeys.BrightBlack]})` };
styleAttrsMap[101] = { [StyleAttrsKeys.BackgroundColor]: `var(--ansi-bright-red, ${xtermjs[StandardColorKeys.BrightRed]})` };
styleAttrsMap[102] = { [StyleAttrsKeys.BackgroundColor]: `var(--ansi-bright-green, ${xtermjs[StandardColorKeys.BrightGreen]})` };
styleAttrsMap[103] = { [StyleAttrsKeys.BackgroundColor]: `var(--ansi-bright-yellow, ${xtermjs[StandardColorKeys.BrightYellow]})` };
styleAttrsMap[104] = { [StyleAttrsKeys.BackgroundColor]: `var(--ansi-bright-blue, ${xtermjs[StandardColorKeys.BrightBlue]})` };
styleAttrsMap[105] = { [StyleAttrsKeys.BackgroundColor]: `var(--ansi-bright-magenta, ${xtermjs[StandardColorKeys.BrightMagenta]})` };
styleAttrsMap[106] = { [StyleAttrsKeys.BackgroundColor]: `var(--ansi-bright-cyan, ${xtermjs[StandardColorKeys.BrightCyan]})` };
styleAttrsMap[107] = { [StyleAttrsKeys.BackgroundColor]: `var(--ansi-bright-white, ${xtermjs[StandardColorKeys.BrightWhite]})` };

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

/**
 * Get key from code
 * @param {string} code
 * @returns {StyleAttrsKey} The key
 */
function getStyleAttrsKey(code: string): StyleAttrsKeys {
  switch (code) {
    case '38':
      return StyleAttrsKeys.Color;
    case '48':
      return StyleAttrsKeys.BackgroundColor;
    case '58':
      return StyleAttrsKeys.TextDecorationColor;
    default:
      throw new Error('not implemented');
  }
}

/**
 * Read SGR packet and apply 256-color palette to style attributes
 * @param {Packet} packet - The parsed packet
 * @param {StyleAttrs} attrs - The current style attributes
 */
function processSGRPacket256(packet: Packet, attrs: StyleAttrs) {
  const parts = packet.text.split(';');
  if (parts.length !== 3) return;

  const key = getStyleAttrsKey(parts[0]);
  const colorCode = parseInt(parts[2], 10);

  if (0 <= colorCode && colorCode <= 15) {
    const colorKey = codeMap[colorCode];
    attrs.set(key, `var(--ansi-${colorKey}, ${xtermjs[colorKey]})`);
  } else if (16 <= colorCode && colorCode <= 231) {
    // 6x6 rgb cube
    const x = colorCode - 16;
    const v = [0x00, 0x5f, 0x87, 0xaf, 0xd7, 0xff];
    const r = v[(x / 36) % 6 | 0];
    const g = v[(x / 6) % 6 | 0];
    const b = v[x % 6];
    attrs.set(key, `rgb(${r},${g},${b})`);
  } else if (232 <= colorCode && colorCode <= 255) {
    // 24-step grayscale
    const c = 8 + (colorCode - 232) * 10;
    attrs.set(key, `var(--ansi-gray-${256 - colorCode}, rgb(${c},${c},${c}))`);
  }
}

/**
 * Read SGR packet and apply truecolor properties to style attributes
 * @param {Packet} packet - The parsed packet
 * @param {StyleAttrs} attrs - The current style attributes
 */
function processSGRPacketTruecolor(packet: Packet, attrs: StyleAttrs) {
  const parts = packet.text.split(';');
  if (parts.length !== 5) return;

  const key = getStyleAttrsKey(parts[0]);
  const [, , r, g, b] = parts;
  attrs.set(key, `rgb(${r},${g},${b})`);
}

/**
 * Read SGR packet and modify style attributes accordingly
 * @param {Packet} packet - The parsed packet
 * @param {StyleAttrs} attrs - The current style attributes
 */
function processSGRPacket(packet: Packet, attrs: StyleAttrs) {
  if (/^(38|48|58);(2|5);/.test(packet.text)) {
    if (packet.text[3] === '2') processSGRPacketTruecolor(packet, attrs);
    else processSGRPacket256(packet, attrs);
    return;
  }

  packet.text.split(';').forEach((codeStr) => {
    const code = parseInt(codeStr, 10);

    // handle reset
    if (code === 0) {
      attrs.clear();
      return;
    }

    // get attribute modifier
    const newAttrsOrModifierFn = styleAttrsMap[code];
    if (!newAttrsOrModifierFn) return;

    // update attrs
    if (typeof newAttrsOrModifierFn === 'function') newAttrsOrModifierFn(attrs);
    else attrs.update(newAttrsOrModifierFn);
  });
}

/**
 * Check if a given string has ANSI markup
 * @param {string} input - The input string
 * @returns {boolean} Whether or not the input string has ANSI markup
 */
export function hasAnsi(input: string): boolean {
  return hasAnsiRegex.test(input);
}

/**
 * Strip out all ANSI markup
 * @param {string} input - The input string
 * @returns {string} The input string with ANSI escape codes replaced with ''
 */
export function stripAnsi(input: string): string {
  return input.replaceAll(ansiRegex, '');
}

/**
 * Represents a configurable ANSI to HTML converter object
 */
export class FancyAnsi {
  /**
   * Convert input string with ansi markup to browser-safe HTML
   * @param {string} input
   * @returns {string} A browser-safe HTML string with converted ANSI
   */
  public toHtml(input: string): string {
    const attrs: StyleAttrs = new StyleAttrs();
    let buffer = '';
    let inTag = false;

    // iterate through packets
    Array.from(new Parser(input)).forEach((packet) => {
      switch (packet.kind) {
        case PacketKind.Text:
          buffer += escape(packet.text);
          break;
        case PacketKind.SGR:
          if (inTag) {
            buffer += '</span>';
            inTag = false;
          }

          processSGRPacket(packet, attrs);

          if (attrs.size) {
            buffer += `<span style="${attrs.toString()}">`;
            inTag = true;
          }
          break;
        default:
          break;
      }
    });

    // add closing tag if necessary
    if (inTag) buffer += '</span>';

    return buffer;
  }
}
