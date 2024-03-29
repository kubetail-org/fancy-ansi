import { useState } from 'react'
import { AnsiHtml } from 'fancy-ansi/react';

import fancyAnsiLogo from '/fancy-ansi.svg'

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

const SGRCodeTable = () => {
  return (
    <>
      <div className="mb-2 font-semibold">Supported SGR parameters:</div>
      <table className="[&_th]:px-2 [&_td]:px-2 [&_td:first-child]:text-right text-sm">
        <thead>
          <tr>
            <th className="text-right">n</th>
            <th className="text-left">Name</th>
            <th className="text-left">Example</th>
            <th>&nbsp;</th>
          </tr>
        </thead>
        <tbody>
          {sgrParameters.map(([n, name, example]) => {
            const exampleStr = example || `\x1b[${n}m${name}\x1b[0m`;
            return (
              <tr key={n} className="hover:bg-gray-50 dark:hover:bg-gray-900">
                <td>{n}</td>
                <td>{name}</td>
                <td><AnsiHtml text={exampleStr} /></td>
                <td>
                  <a
                    className="ml-1 text-sm text-blue-500 underline cursor-pointer"
                    onClick={() => navigator.clipboard.writeText(exampleStr)}
                  >
                    copy
                  </a>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </>
  );
};

const ExtendedColorsTable = () => (
  <>
    <div className="mt-10 mb-2 font-semibold">Extended Color Palette - (38|48|58);&#123;0-255&#125;</div>
    <table className="[&_th]:px-2 [&_td]:px-2 [&_td:first-child]:text-right text-sm">
      <thead>
        <tr>
          <th className="text-right">Code</th>
          <th className="text-left">Foreground</th>
          <th className="text-left">Background</th>
          <th className="text-left">Underline</th>
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
              <td><AnsiHtml text={exampleStrFg} /></td>
              <td><AnsiHtml text={exampleStrBg} /></td>
              <td><AnsiHtml text={exampleStrUl} /></td>
            </tr>
          )
        })}
      </tbody>
    </table>
  </>
);

const Header = () => {
  const handleAppearanceChange = (ev: React.ChangeEvent<HTMLSelectElement>) => {
    if (ev.target.value === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  };

  const handleAnsiChange = (ev: React.ChangeEvent<HTMLSelectElement>) => {
    document.documentElement.dataset.ansiTheme = ev.target.value;
  };

  return (
    <div className="flex justify-between">
      <div className="flex space-x-3 whitespace-nowrap">
        <a href="https://github.com/kubetail-org/fancy-ansi">
          <img className="h-[60px] min-h-[60px]" src={fancyAnsiLogo} alt="Fancy-ANSI" />
        </a>
        <span className="text-4xl">Fancy-ANSI</span>
      </div>
      <div>
        <div className="flex space-x-5">
          <div>
            <label className="mr-1">Appearance:</label>
            <select
              className="bg-background"
              defaultValue="light"
              onChange={handleAppearanceChange}
            >
              <option value="light">Light mode</option>
              <option value="dark">Dark mode</option>
            </select>
          </div>
          <div>
            <label className="mr-1">ANSI Palette:</label>
            <select
              className="bg-background"
              defaultValue="light"
              onChange={handleAnsiChange}
            >
              <option value="xtermjs">Xterm.js (default)</option>
              <option value="eclipse">Eclipse</option>
              <option value="putty">Putty</option>
              <option value="terminalapp">Terminal.app</option>
              <option value="ubuntu">Ubuntu</option>
              <option value="vga">VGA</option>
              <option value="vscode">Visual Studio Code</option>
              <option value="windows10">Windows 10</option>
              <option value="xterm">Xterm</option>
            </select>
          </div>
        </div>
      </div>
    </div>

  );
}

function App() {
  const [testStr, setTestStr] = useState<string>();

  const handleTestChange = (ev: React.ChangeEvent<HTMLInputElement>) => {
    setTestStr(ev.target.value);
  };

  return (
    <div className="p-2">
      <Header />
      <hr className="my-5" />
      <div>
        <div><label>Test:</label></div>
        <input
          className="h-[30px] w-[800px] border border-input bg-background"
          onChange={handleTestChange}
        />
        <div className="h-[30px] leading-[30px] mb-5">
          <AnsiHtml text={testStr} />
        </div>
      </div>
      <hr className="my-5" />
      <SGRCodeTable />
      <hr className="my-5" />
      <ExtendedColorsTable />
    </div>
  )
}

export default App
