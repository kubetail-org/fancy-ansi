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
    const { asFragment } = render(<AnsiHtml style={{ whiteSpace: 'no-wrap' }} text={x} />);
    expect(asFragment()).toMatchSnapshot();
  });
});
