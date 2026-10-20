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

import { FancyAnsi, hasAnsi, stripAnsi } from './main';

// Everything `toHtml()` may emit: escaped text and spans with a fixed style alphabet
const safeHtmlRegex = /^(?:[^<>"'&]|&(?:lt|gt|quot|#39|amp);|<\/span>|<span style="[\w #%(),.:;-]*">)*$/;

// Park-Miller PRNG, so fuzz failures are reproducible
function prng(seed: number) {
  let state = seed;
  return () => {
    state = (state * 48271) % 2147483647;
    return state / 2147483647;
  };
}

describe('FancyAnsi', () => {
  it('escapes html in input strings', () => {
    const fancyAnsi = new FancyAnsi();
    const output = fancyAnsi.toHtml('<script>alert("hi");</script>');
    expect(output).toEqual('&lt;script&gt;alert(&quot;hi&quot;);&lt;/script&gt;');
  });

  it('ignores dangling resets', () => {
    const fancyAnsi = new FancyAnsi();
    const output = fancyAnsi.toHtml('\x1b[0m');
    expect(output).toEqual('');
  });

  it('adds closing tag even if reset isnt present', () => {
    const fancyAnsi = new FancyAnsi();
    const output = fancyAnsi.toHtml('\x1b[1mbold');
    expect(output).toEqual('<span style="font-weight:var(--ansi-bold-font-weight, 600);">bold</span>');
  });

  it('ignores extra dangling resets', () => {
    const fancyAnsi = new FancyAnsi();
    const output = fancyAnsi.toHtml('\x1b[1mbold\x1b[0m\x1b[0m');
    expect(output).toEqual('<span style="font-weight:var(--ansi-bold-font-weight, 600);">bold</span>');
  });

  it('treats missing code as reset', () => {
    const fancyAnsi = new FancyAnsi();
    const output = fancyAnsi.toHtml('\x1b[1mon\x1b[moff');
    expect(output).toEqual('<span style="font-weight:var(--ansi-bold-font-weight, 600);">on</span>off');
  });

  it('treats missing codes as reset', () => {
    const fancyAnsi = new FancyAnsi();
    const output = fancyAnsi.toHtml('\x1b[1mon\x1b[;moff');
    expect(output).toEqual('<span style="font-weight:var(--ansi-bold-font-weight, 600);">on</span>off');
  });

  it('ignores extra reset at start', () => {
    const fancyAnsi = new FancyAnsi();
    const output = fancyAnsi.toHtml('\x1b[0m\x1b[1mbold\x1b[0m');
    expect(output).toEqual('<span style="font-weight:var(--ansi-bold-font-weight, 600);">bold</span>');
  });

  it('combines and removes attributes', () => {
    const fancyAnsi = new FancyAnsi();
    const output = fancyAnsi.toHtml('\x1b[4;4;9mx\x1b[24my\x1b[29;99mz');
    expect(output).toEqual('<span style="text-decoration:underline line-through;">x</span><span style="text-decoration:line-through;">y</span>z');
  });

  it('supports 256-color standard colors', () => {
    const fancyAnsi = new FancyAnsi();
    const output = fancyAnsi.toHtml('\x1b[38;5;1mx');
    expect(output).toEqual('<span style="color:var(--ansi-red, #cc0000);">x</span>');
  });

  it('supports 256-color rgb cube', () => {
    const fancyAnsi = new FancyAnsi();
    const output = fancyAnsi.toHtml('\x1b[48;5;100mx');
    expect(output).toEqual('<span style="background-color:rgb(135,135,0);">x</span>');
  });

  it('supports 256-color grayscale', () => {
    const fancyAnsi = new FancyAnsi();
    const output = fancyAnsi.toHtml('\x1b[58;5;240mx');
    expect(output).toEqual('<span style="text-decoration-color:var(--ansi-gray-16, rgb(88,88,88));">x</span>');
  });

  it('supports truecolor', () => {
    const fancyAnsi = new FancyAnsi();
    const output = fancyAnsi.toHtml('\x1b[38;2;1;2;3mx');
    expect(output).toEqual('<span style="color:rgb(1,2,3);">x</span>');
  });

  it.each([
    '\x1b[38;5;256mx',
    '\x1b[38;5;1;2mx',
    '\x1b[38;2;1;2mx',
  ])('ignores malformed extended colors: %j', (input) => {
    const fancyAnsi = new FancyAnsi();
    expect(fancyAnsi.toHtml(input)).toEqual('x');
  });

  it('keeps text after a CSI with a non-ASCII character', () => {
    const fancyAnsi = new FancyAnsi();
    expect(fancyAnsi.toHtml('a\x1b[\u00e9 rest\nnext')).toEqual('a[\u00e9 rest\nnext');
  });

  it('ignores non-SGR escape sequences', () => {
    const fancyAnsi = new FancyAnsi();
    const output = fancyAnsi.toHtml('a\x1b[2Kb\x1b(Bc');
    expect(output).toEqual('abc');
  });

  it.each([
    ['see \x1b]8;;https://example.com\x1b\\link text\x1b]8;;\x1b\\ after', 'see link text after'],
    ['\x1b]8;id=1;https://example.com\x07l\u00efnk\x1b]8;;\x07', 'l\u00efnk'],
    ['\x1b]8;;https://example.com\x07\x1b[1mbold\x1b[0m\x1b]8;;\x07', '<span style="font-weight:var(--ansi-bold-font-weight, 600);">bold</span>'],
  ])('renders OSC 8 hyperlink text: %j', (input, expected) => {
    const fancyAnsi = new FancyAnsi();
    expect(fancyAnsi.toHtml(input)).toEqual(expected);
  });
});

describe('FancyAnsi with untrusted input', () => {
  const fancyAnsi = new FancyAnsi();

  it('escapes all html special characters in text', () => {
    const output = fancyAnsi.toHtml('<img src="x" onerror=\'alert(1)\'>&');
    expect(output).toEqual('&lt;img src=&quot;x&quot; onerror=&#39;alert(1)&#39;&gt;&amp;');
  });

  it('escapes text inside styled spans', () => {
    const output = fancyAnsi.toHtml('\x1b[1m<script>alert(1)</script>');
    expect(output).toEqual('<span style="font-weight:var(--ansi-bold-font-weight, 600);">&lt;script&gt;alert(1)&lt;/script&gt;</span>');
  });

  it.each([
    '\x1b[38;2;"><script>alert(1)</script>m',
    '\x1b[38;2;1;2;3"><script>alert(1)</script>m',
    '\x1b[38;5;1 onclick=alert(1)m',
    '\x1b[1;"style="background:url(x)m',
  ])('keeps payloads in SGR parameters out of attributes: %j', (input) => {
    const output = fancyAnsi.toHtml(input);
    expect(output).toMatch(safeHtmlRegex);
    expect(output).not.toMatch(/<span style="[^"]*(?:script|onclick|url)/);
  });

  it.each([
    'a\x1b[1\x01<b>',
    'a\x1b[\u00e9<b>',
    'a\x1b]8;;x\x01<b>',
    'a\x1b]x;<b>',
    'a\x1b<b>',
  ])('escapes text after malformed sequences: %j', (input) => {
    expect(fancyAnsi.toHtml(input)).toMatch(safeHtmlRegex);
  });

  it.each([
    '\x1b]8;;javascript:alert(1)\x1b\\link\x1b]8;;\x1b\\',
    '\x1b]8;;javascript:alert(1)\x07<b>link</b>\x1b]8;;\x07',
  ])('does not render OSC 8 urls: %j', (input) => {
    const output = fancyAnsi.toHtml(input);
    expect(output).toMatch(safeHtmlRegex);
    expect(output).not.toContain('javascript');
  });

  it('only emits escaped text and styled spans for random input', () => {
    const random = prng(34);
    const pick = (items: string[]) => items[Math.floor(random() * items.length)];
    const repeat = (fn: () => string, max: number) => Array.from({ length: Math.floor(random() * max) }, fn);

    const payloads = ['x', ' ', '<script>', '<', '>', '"', '\'', '&', '=', 'onclick=', 'javascript:', '</span>', '<span style="', '\x01', '\u00e9'];
    const params = ['', '0', '1', '2', '3', '4', '5', '9', '24', '31', '38', '48', '58', '99', '255', '999', '"><script>', ' onclick='];
    const terminators = ['\x07', '\x1b\\', ''];
    const pieces = [
      () => pick(payloads),
      () => `\x1b[${repeat(() => pick(params), 6).join(';')}${pick(['m', 'm', 'K', ''])}`,
      () => `\x1b[${pick(['38', '48', '58'])};${pick(['2', '5'])};${repeat(() => pick(params), 4).join(';')}m`,
      () => `\x1b]8;;${pick(payloads)}${pick(terminators)}${pick(payloads)}\x1b]8;;${pick(terminators)}`,
      () => pick(['\x1b', '\x1b(B', '\x1b]', '\x1b\\', '\x07']),
    ];

    const failures: string[] = [];
    for (let i = 0; i < 5000; i += 1) {
      const input = repeat(() => pick(pieces)(), 20).join('');
      if (!safeHtmlRegex.test(fancyAnsi.toHtml(input))) failures.push(input);
    }

    expect(failures).toEqual([]);
  });
});

describe('hasAnsi', () => {
  it('returns false when there is no ansi markup', () => {
    const result = hasAnsi('xxx');
    expect(result).toEqual(false);
  });

  it('returns true when there is an SGR code', () => {
    const result = hasAnsi('\x1b[0m');
    expect(result).toEqual(true);
  });

  it('returns true when there are other escape codes', () => {
    const result = hasAnsi('\x1b[10;5H');
    expect(result).toEqual(true);
  });

  it('returns true when there is an 8-bit CSI code', () => {
    const result = hasAnsi('\x9b0m');
    expect(result).toEqual(true);
  });
});

describe('stripAnsi', () => {
  it('returns same string when there is no markup', () => {
    const result = stripAnsi('xxx');
    expect(result).toEqual('xxx');
  });

  it('returns empty string when there is only one escape code', () => {
    const result = stripAnsi('\x1b[0m');
    expect(result).toEqual('');
  });

  it('returns empty string when there are only escape codes', () => {
    const result = stripAnsi('\x1b[1m\x1b[0m');
    expect(result).toEqual('');
  });

  it('returns string without escape codes', () => {
    const result = stripAnsi('one\x1b[1mtwo\x1b[0mthree');
    expect(result).toEqual('onetwothree');
  });

  it('strips 8-bit CSI codes', () => {
    const result = stripAnsi('one\x9b1mtwo\x9b0mthree');
    expect(result).toEqual('onetwothree');
  });

  it('handles spaces properly', () => {
    const result = stripAnsi('one  \x1b[1m  two  \x1b[0m  three');
    expect(result).toEqual('one    two    three');
  });
});
