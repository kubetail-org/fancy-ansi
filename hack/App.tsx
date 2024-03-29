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

import { useState } from 'react';

import { AnsiHtml } from '@/react';

const sgrParameters: [number, string, string?][] = [
  [0, 'Reset'],
  [1, 'Bold'],
  [2, 'Dim'],
  [3, 'Italic'],
  [4, 'Underline'],
  [8, 'Hide', '|\x1b[8mConceal or hide\x1b[0m|'],
  [9, 'Strikethrough'],
  [10, 'Default font', '\x1b[11mOn\x1b[10m Off\x1b[0m'],
  [11, 'Alternative font 1'],
  [12, 'Alternative font 2'],
  [13, 'Alternative font 3'],
  [14, 'Alternative font 4'],
  [15, 'Alternative font 5'],
  [16, 'Alternative font 6'],
  [17, 'Alternative font 7'],
  [18, 'Alternative font 8'],
  [19, 'Alternative font 9'],
  [21, 'Double underline'],
  [22, 'Bold off', '\x1b[1mOn \x1b[22moff\x1b[0m'],
  [23, 'Italic off', '\x1b[3mOn \x1b[23moff\x1b[0m'],
  [24, 'Underline off', '\x1b[4mOn\x1b[24m Off\x1b[0m'],
  [28, 'Hidden off', '|\x1b[8mOn\x1b[28m| |Off|\x1b[0m'],
  [29, 'Strikethrough off', '\x1b[9mOn\x1b[29m Off\x1b[0m'],
  [30, 'Foreground color - black'],
  [31, 'Foreground color - red'],
  [32, 'Foreground color - green'],
  [33, 'Foreground color - yellow'],
  [34, 'Foreground color - blue'],
  [35, 'Foreground color - magenta'],
  [36, 'Foreground color - cyan'],
  [37, 'Foreground color - white'],
  [38, 'Foreground color - extended (see below)'],
  [39, 'Default foreground color', '\x1b[31mOn\x1b[39m Off\x1b[0m'],
  [40, 'Background color - black'],
  [41, 'Background color - red'],
  [42, 'Background color - green'],
  [43, 'Background color - yellow'],
  [44, 'Background color - blue'],
  [45, 'Background color - magenta'],
  [46, 'Background color - cyan'],
  [47, 'Background color - white'],
  [48, 'Background color - extended (see below)'],
  [49, 'Default background color', '\x1b[41mOn\x1b[49m Off\x1b[0m'],
  [51, 'Frame'],
  [53, 'Overline'],
  [54, 'Frame or encircle off', '\x1b[51mOn\x1b[54m Off\x1b[0m'],
  [55, 'Overline off', '\x1b[53mOn\x1b[55m   Off\x1b[0m'],
  [58, 'Set underline color (see below)'],
  [59, 'Default underline color', '\x1b[4m\x1b[58;5;1mOn\x1b[59mOff\x1b[0m'],
  [73, 'Superscript', 'Super\x1b[73mscript\x1b[0m'],
  [74, 'Subscript', 'Sub\x1b[74mscript\x1b[0m'],
  [75, 'Superscript/subscript off', 'Super\x1b[73mon\x1b[75moff\x1b[0m, Sub\x1b[74mon\x1b[75moff\x1b[0m'],
  [90, 'Foreground color - bright black'],
  [91, 'Foreground color - bright red'],
  [92, 'Foreground color - bright green'],
  [93, 'Foreground color - bright yellow'],
  [94, 'Foreground color - bright blue'],
  [95, 'Foreground color - bright magenta'],
  [96, 'Foreground color - bright cyan'],
  [97, 'Foreground color - bright white'],
  [100, 'Background color - bright black'],
  [101, 'Background color - bright red'],
  [102, 'Background color - bright green'],
  [103, 'Background color - bright yellow'],
  [104, 'Background color - bright blue'],
  [105, 'Background color - bright magenta'],
  [106, 'Background color - bright cyan'],
  [107, 'Background color - bright white'],
];

const DisplayRawInput = ({ data }: { data: string }) => (
  <>
    {data.replaceAll('\x1b', '\\x1b')}
    <a
      className="ml-1 text-sm text-blue-500 underline cursor-pointer"
      onClick={() => navigator.clipboard.writeText(data)}
    >
      copy
    </a>
  </>
);

function App() {
  const [testStr, setTestStr] = useState<string>();

  const handleThemeChange = (ev: React.ChangeEvent<HTMLSelectElement>) => {
    if (ev.target.value === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  };

  const handleTestChange = (ev: React.ChangeEvent<HTMLInputElement>) => {
    setTestStr(ev.target.value);
  };

  return (
    <div className="p-2">
      <div className="mb-2">
        <label className="mr-1">Theme:</label>
        <select defaultValue="light" onChange={handleThemeChange}>
          <option>light</option>
          <option>dark</option>
        </select>
      </div>
      <div>
        <div><label>Test:</label></div>
        <input className="h-[30px] w-[800px] border border-input dark:text-gray-900" onChange={handleTestChange}></input>
        <div className="h-[30px] leading-[30px] mb-5">
          <AnsiHtml text={testStr} />
        </div>
      </div>
      <div className="mb-2 font-semibold">Supported SGR parameters:</div>
      <table className="[&_th]:px-2 [&_td]:px-2 [&_td:first-child]:text-right text-sm">
        <thead>
          <tr>
            <th className="text-right">n</th>
            <th className="text-left">Name</th>
            <th className="text-left">Raw Input</th>
            <th className="text-left">Example Output</th>
          </tr>
        </thead>
        <tbody>
          {sgrParameters.map(([n, name, example]) => {
            const exampleStr = example || `\x1b[${n}m${name}\x1b[0m`;
            return (
              <tr key={n}>
                <td>{n}</td>
                <td>{name}</td>
                <td><DisplayRawInput data={exampleStr} /></td>
                <td><AnsiHtml text={exampleStr} /></td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <div className="mt-10 mb-2 font-semibold">Extended Color Palette (0-255):</div>
      <table className="[&_th]:px-2 [&_td]:px-2 [&_td:first-child]:text-right text-sm">
        <thead>
          <tr>
            <th>&nbsp;</th>
            <th colSpan={2}>Foreground</th>
            <th colSpan={2}>Background</th>
            <th colSpan={2}>Underline</th>
          </tr>
          <tr>
            <th className="text-right">Color Code</th>
            <th className="text-left">Raw Input</th>
            <th className="text-left">Example Output</th>
            <th className="text-left">Raw Input</th>
            <th className="text-left">Example Output</th>
            <th className="text-left">Raw Input</th>
            <th className="text-left">Example Output</th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 256 }, (_, i) => i).map(i => {
            const exampleStrFg = `\x1b[38;5;${i}mColor Code - ${i}\x1b[0m`;
            const exampleStrBg = `\x1b[48;5;${i}mColor Code - ${i}\x1b[0m`;
            const exampleStrUl = `\x1b[4m\x1b[58;5;${i}mColor Code - ${i}\x1b[0m`;

            return (
              <tr key={i}>
                <td>{i}</td>
                <td><DisplayRawInput data={exampleStrFg} /></td>
                <td><AnsiHtml text={exampleStrFg} /></td>
                <td><DisplayRawInput data={exampleStrBg} /></td>
                <td><AnsiHtml text={exampleStrBg} /></td>
                <td><DisplayRawInput data={exampleStrUl} /></td>
                <td><AnsiHtml text={exampleStrUl} /></td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export default App;
