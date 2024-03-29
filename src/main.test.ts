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

  it('ignores extra reset at start', () => {
    const fancyAnsi = new FancyAnsi();
    const output = fancyAnsi.toHtml('\x1b[0m\x1b[1mbold\x1b[0m');
    expect(output).toEqual('<span style="font-weight:var(--ansi-bold-font-weight, 600);">bold</span>');
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

  it('handles spaces properly', () => {
    const result = stripAnsi('one  \x1b[1m  two  \x1b[0m  three');
    expect(result).toEqual('one    two    three');
  });
});
