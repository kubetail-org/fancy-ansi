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

import { render } from '@testing-library/react';
import React from 'react';

import { AnsiHtml } from './react';

describe('AnsiHtml', () => {
  it('renders properly', () => {
    const x = '\x1b[1mbold\x1b[0m';
    const { asFragment } = render(<AnsiHtml text={x} />);
    expect(asFragment()).toMatchSnapshot();
  });

  it('passes through className', () => {
    const x = '\x1b[1mbold\x1b[0m';
    const { asFragment } = render(<AnsiHtml className="my-custom-class" text={x} />);
    expect(asFragment()).toMatchSnapshot();
  });

  it('passes through style', () => {
    const x = '\x1b[1mbold\x1b[0m';
    const { asFragment } = render(<AnsiHtml style={{ whiteSpace: 'nowrap' }} text={x} />);
    expect(asFragment()).toMatchSnapshot();
  });

  it('renders hyperlinks when enabled', () => {
    const x = '\x1b]8;;https://example.com\x07link\x1b]8;;\x07';
    const { container } = render(<AnsiHtml hyperlinks text={x} />);
    const link = container.querySelector('a');
    expect(link?.getAttribute('href')).toEqual('https://example.com');
    expect(link?.textContent).toEqual('link');
  });

  it('passes through hyperlink options', () => {
    const x = '\x1b]8;;https://example.com\x07link\x1b]8;;\x07';
    const { asFragment } = render(<AnsiHtml hyperlinks={{ target: '_blank', className: 'link' }} text={x} />);
    expect(asFragment()).toMatchSnapshot();
  });

  it.each([
    '<img src="x" onerror=\'alert(1)\'>',
    '\x1b[1m<script>alert(1)</script>',
    '\x1b[38;2;"><img src=x onerror=alert(1)>m',
    'a\x1b[1\x01<img src=x onerror=alert(1)>',
    '\x1b]8;;javascript:alert(1)\x07<b>link</b>\x1b]8;;\x07',
  ])('renders untrusted input as text and styled spans: %j', (text) => {
    const { container } = render(<AnsiHtml text={text} />);
    container.querySelectorAll('span *').forEach((el) => {
      expect(el.tagName).toEqual('SPAN');
      expect(el.getAttributeNames()).toEqual(['style']);
    });
  });

  it.each([
    '\x1b]8;;javascript:alert(1)\x07<b>link</b>\x1b]8;;\x07',
    '\x1b]8;;https://x/"onmouseover="alert(1)\x07link\x1b]8;;\x07',
    '\x1b]8;;https://x/\x07\x1b[1m<img src=x onerror=alert(1)>\x1b]8;;\x07',
  ])('renders untrusted hyperlinks as safe links: %j', (text) => {
    const { container } = render(<AnsiHtml hyperlinks={{ target: '_blank" onclick="alert(1)' }} text={text} />);
    container.querySelectorAll('span *').forEach((el) => {
      if (el.tagName === 'A') {
        expect(el.getAttributeNames()).toEqual(['href', 'rel', 'target']);
        expect(el.getAttribute('href')).toMatch(/^https?:/);
      } else {
        expect(el.tagName).toEqual('SPAN');
        expect(el.getAttributeNames()).toEqual(['style']);
      }
    });
  });
});
