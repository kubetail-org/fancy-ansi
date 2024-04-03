import { useState } from 'react'

import { AnsiHtml } from 'fancy-ansi/react';
import Form from '@kubetail/ui/elements/Form';

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
  [30, 'Foreground - black'],
  [31, 'Foreground - red'],
  [32, 'Foreground - green'],
  [33, 'Foreground - yellow'],
  [34, 'Foreground - blue'],
  [35, 'Foreground - magenta'],
  [36, 'Foreground - cyan'],
  [37, 'Foreground - white'],
  [38, 'Foreground - extended (see below)'],
  [39, 'Default foreground color', '\x1b[31mOn\x1b[39m Off\x1b[0m'],
  [40, 'Background - black'],
  [41, 'Background - red'],
  [42, 'Background - green'],
  [43, 'Background - yellow'],
  [44, 'Background - blue'],
  [45, 'Background - magenta'],
  [46, 'Background - cyan'],
  [47, 'Background - white'],
  [48, 'Background - extended (see below)'],
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
  [90, 'Foreground - bright black'],
  [91, 'Foreground - bright red'],
  [92, 'Foreground - bright green'],
  [93, 'Foreground - bright yellow'],
  [94, 'Foreground - bright blue'],
  [95, 'Foreground - bright magenta'],
  [96, 'Foreground - bright cyan'],
  [97, 'Foreground - bright white'],
  [100, 'Background - bright black'],
  [101, 'Background - bright red'],
  [102, 'Background - bright green'],
  [103, 'Background - bright yellow'],
  [104, 'Background - bright blue'],
  [105, 'Background - bright magenta'],
  [106, 'Background - bright cyan'],
  [107, 'Background - bright white'],
];

const SGRCodeTable = () => {
  return (
    <>
      <div className="mb-2 font-semibold">Supported SGR parameters:</div>
      <table className="[&_th]:px-2 [&_td]:px-2 [&_td:first-child]:text-right text-xs md:text-sm">
        <thead>
          <tr className="bg-chrome-100">
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
              <tr key={n}>
                <td>{n}</td>
                <td>{name}</td>
                <td><AnsiHtml text={exampleStr} /></td>
                <td>
                  <a
                    className="ml-1 text-sm text-blue-500 underline cursor-pointer hidden md:inline"
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
    <table className="[&_th]:px-2 [&_td]:px-2 [&_td:first-child]:text-right text-xs md:text-sm">
      <thead>
        <tr className="bg-chrome-100">
          <th className="text-right">Code</th>
          <th className="text-left">Foreground</th>
          <th className="text-left">Background</th>
          <th className="text-left">Underline</th>
        </tr>
      </thead>
      <tbody>
        {Array.from({ length: 256 }, (_, i) => i).map(i => {
          const exampleStrFg = `\x1b[38;5;${i}mColor - ${i}\x1b[0m`;
          const exampleStrBg = `\x1b[48;5;${i}mColor - ${i}\x1b[0m`;
          const exampleStrUl = `\x1b[4m\x1b[58;5;${i}mColor - ${i}\x1b[0m`;

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

const FancyAnsiAscii = () => {
  const l1 = `\x1b[31m _____                              _    _   _ ____ ___ \x1b[0m`;
  const l2 = `\x1b[33m|  ___|_ _ _ __   ___ _   _        / \\  | \\ | / ___|_ _|\x1b[0m`;
  const l3 = `\x1b[32m| |_ / _\` | '_ \\ / __| | | |_____ / _ \\ |  \\| \\___ \\| | \x1b[0m`;
  const l4 = `\x1b[34m|  _| (_| | | | | (__| |_| |_____/ ___ \\| |\\  |___) | | \x1b[0m`;
  const l5 = `\x1b[35m|_|  \\__,_|_| |_|\\___|\\__, |    /_/   \\_\\_| \\_|____/___|\x1b[0m`;
  const l6 = `\x1b[36m                      |___/                             \x1b[0m`;

  // text-xs leading-[14px] md:text-base md:leading-[18px] 
  return (
    <div className="whitespace-pre font-mono text-[10px]/[12px] md:text-[16px]/[18px]">
      <AnsiHtml className="block" text={l1} />
      <AnsiHtml className="block" text={l2} />
      <AnsiHtml className="block" text={l3} />
      <AnsiHtml className="block" text={l4} />
      <AnsiHtml className="block" text={l5} />
      <AnsiHtml className="block" text={l6} />
    </div>
  );
};

const Header = () => {
  return (
    <>
      <a className="text-blue-500 underline" href="https://github.com/kubetail-org/fancy-ansi.git">GitHub</a>
      <FancyAnsiAscii />
    </>
  );
}

const Footer = () => {
  const handleAppearanceChange = (ev: React.ChangeEvent<HTMLSelectElement>) => {
    if (ev.target.value === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  };

  const handleAnsiChange = (ev: React.ChangeEvent<HTMLSelectElement>) => {
    document.documentElement.dataset.ansiTheme = ev.target.value;
  };

  return (
    <div className="flex space-x-3">
      <div className="flex items-center space-x-1">
        <label>Appearance:</label>
        <Form.Select
          className="bg-background text-sm py-1"
          defaultValue="light"
          onChange={handleAppearanceChange}
        >
          <Form.Option value="light">Light mode</Form.Option>
          <Form.Option value="dark">Dark mode</Form.Option>
        </Form.Select>
      </div>
      <div className="flex items-center space-x-1">
        <label className="whitespace-nowrap">ANSI Palette:</label>
        <Form.Select
          className="bg-background text-sm py-1"
          defaultValue="light"
          onChange={handleAnsiChange}
        >
          <Form.Option value="xtermjs">Xterm.js (default)</Form.Option>
          <Form.Option value="eclipse">Eclipse</Form.Option>
          <Form.Option value="putty">Putty</Form.Option>
          <Form.Option value="terminalapp">Terminal.app</Form.Option>
          <Form.Option value="ubuntu">Ubuntu</Form.Option>
          <Form.Option value="vga">VGA</Form.Option>
          <Form.Option value="vscode">Visual Studio Code</Form.Option>
          <Form.Option value="windows10">Windows 10</Form.Option>
          <Form.Option value="xterm">Xterm</Form.Option>
        </Form.Select>
      </div>
    </div>
  );
};

function App() {
  const [testStr, setTestStr] = useState<string>();

  const handleTestChange = (ev: React.ChangeEvent<HTMLInputElement>) => {
    setTestStr(ev.target.value);
  };

  return (
    <div>
      <div className="p-2">
        <Header />
        <hr className="my-3" />
        <div>
          <div><label>Test:</label></div>
          <Form.Control
            onChange={handleTestChange}
          />
          <div className="h-[30px] leading-[30px] mb-5">
            <AnsiHtml text={testStr} />
          </div>
        </div>
        <hr className="my-3" />
        <SGRCodeTable />
        <hr className="my-3" />
        <ExtendedColorsTable />
      </div>
      <div className="sticky bottom-0 bg-background p-2 border-t">
        <Footer />
      </div>
    </div>
  )
}

export default App
