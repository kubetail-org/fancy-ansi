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

import { Parser, PacketKind } from './parse';

// helper method for tests
const parse = (input: string) => {
  return Array.from(new Parser(input));
}

describe('parse', () => {
  it('returns empty list if input string is empty', () => {
    const packets = parse('');
    expect(packets.length).toEqual(0);
  });

  it('returns one packet of kind `Text` for a string without escape codes', () => {
    const packets = parse('xxx');
    expect(packets.length).toEqual(1);
    expect(packets[0].kind).toEqual(PacketKind.Text);
    expect(packets[0].text).toEqual('xxx');
  });

  it('returns one packet of kind `SGR` for a string with one escape code', () => {
    const packets = parse('\x1b[0m');
    expect(packets.length).toEqual(1);
    expect(packets[0].kind).toEqual(PacketKind.SGR);
    expect(packets[0].text).toEqual('0');
  });

  it('returns one packet of kind `SGR` for a string with no escape codes', () => {
    const packets = parse('\x1b[m');
    expect(packets.length).toEqual(1);
    expect(packets[0].kind).toEqual(PacketKind.SGR);
    expect(packets[0].text).toEqual('');
  });

  it('returns one packet of kind `SGR` for a string with semicolon but no codes', () => {
    const packets = parse('\x1b[;m');
    expect(packets.length).toEqual(1);
    expect(packets[0].kind).toEqual(PacketKind.SGR);
    expect(packets[0].text).toEqual(';');
  });

  it('returns packets of kind `OSCURL` around hyperlink text', () => {
    const packets = parse('\x1b]8;;http://example.com\x07click me\x1b]8;;\x1b\\');
    expect(packets.length).toEqual(3);

    expect(packets[0].kind).toEqual(PacketKind.OSCURL);
    expect(packets[0].url).toEqual('http://example.com');

    expect(packets[1].kind).toEqual(PacketKind.Text);
    expect(packets[1].text).toEqual('click me');

    expect(packets[2].kind).toEqual(PacketKind.OSCURL);
    expect(packets[2].url).toEqual('');
  });

  it('returns packets of kind `Unknown` for strings with non-SGR, non-OSCURL escape codes', () => {
    const packets = parse('\x1b[10;5H');
    expect(packets.length).toEqual(1);
    expect(packets[0].kind).toEqual(PacketKind.Unknown);
  });

  it('returns three packets for escape code betwen text', () => {
    const packets = parse('before\x1b[0mafter');
    expect(packets.length).toEqual(3);

    expect(packets[0].kind).toEqual(PacketKind.Text);
    expect(packets[0].text).toEqual('before');

    expect(packets[1].kind).toEqual(PacketKind.SGR);
    expect(packets[1].text).toEqual('0');

    expect(packets[2].kind).toEqual(PacketKind.Text);
    expect(packets[2].text).toEqual('after');
  });

  it('returns three packets for text between escape codes', () => {
    const packets = parse('\x1b[1mbetween\x1b[0m');
    expect(packets.length).toEqual(3);

    expect(packets[0].kind).toEqual(PacketKind.SGR);
    expect(packets[0].text).toEqual('1');

    expect(packets[1].kind).toEqual(PacketKind.Text);
    expect(packets[1].text).toEqual('between');

    expect(packets[2].kind).toEqual(PacketKind.SGR);
    expect(packets[2].text).toEqual('0');
  });

  it('includes multiple codes if present', () => {
    const packets = parse('\x1b[1;3;4m');
    expect(packets.length).toEqual(1);
    expect(packets[0].kind).toEqual(PacketKind.SGR);
    expect(packets[0].text).toEqual('1;3;4');
  });

  it.each([
    ['escape', '\x1b['],
    ['CSI', '\x1b[1'],
    ['OSC', '\x1b]8'],
    ['OSC without terminator', '\x1b]8;;url'],
  ])('drops incomplete %s at end of input', (_, input) => {
    expect(parse(input)).toEqual([]);
  });

  it.each([
    ['single ESC', '\x1bcx'],
    ['illegal CSI', '\x1b[1\x01'],
    ['CSI with non-ASCII char', '\x1b[\u00e9 rest'],
    ['CSI with DEL', '\x1b[1\x7f rest'],
    ['non-hyperlink OSC', '\x1b]0;title'],
    ['illegal char in OSC url', '\x1b]8;;url\x01'],
    ['OSC without url separator', '\x1b]8;url\x07'],
  ])('drops only the ESC from %s', (_, input) => {
    const packets = parse(input);
    expect(packets[0].kind).toEqual(PacketKind.ESC);
    expect(packets[0].text).toEqual('\x1b');
    expect(packets.slice(1).map((p) => p.text).join('')).toEqual(input.slice(1));
  });

  it('returns packet of kind `Unknown` for character set sequences', () => {
    const packets = parse('\x1b(Bx');
    expect(packets.length).toEqual(2);
    expect(packets[0].kind).toEqual(PacketKind.Unknown);
    expect(packets[1].text).toEqual('x');
  });
});
