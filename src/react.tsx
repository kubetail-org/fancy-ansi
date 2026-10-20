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

import type { CSSProperties } from 'react';

import { FancyAnsi } from '@/main';
import type { FancyAnsiOptions } from '@/main';

export type AnsiHtmlProps = {
  className?: string;
  hyperlinks?: FancyAnsiOptions['hyperlinks'];
  text?: string;
  style?: CSSProperties;
};

export const AnsiHtml = ({
  className,
  hyperlinks,
  style,
  text = '',
}: AnsiHtmlProps) => (
  // constructing FancyAnsi is cheap, so a fresh one per render tracks `hyperlinks`
  <span
    className={className}
    style={style}
    dangerouslySetInnerHTML={{ __html: new FancyAnsi({ hyperlinks }).toHtml(text) }}
  />
);
