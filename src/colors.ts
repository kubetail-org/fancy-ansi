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

export const enum StandardColorKeys {
  Black = 'black',
  Red = 'red',
  Green = 'green',
  Yellow = 'yellow',
  Blue = 'blue',
  Magenta = 'magenta',
  Cyan = 'cyan',
  White = 'white',
  BrightBlack = 'bright-black',
  BrightRed = 'bright-red',
  BrightGreen = 'bright-green',
  BrightYellow = 'bright-yellow',
  BrightBlue = 'bright-blue',
  BrightMagenta = 'bright-magenta',
  BrightCyan = 'bright-cyan',
  BrightWhite = 'bright-white',
}

// https://github.com/xtermjs/xterm.js/blob/53bc9f8442994d75ad522a117a0c2ffd78e50781/src/browser/services/ThemeService.ts#L88
export const xtermjs = {
  [StandardColorKeys.Black]: '#2e3436',
  [StandardColorKeys.Red]: '#cc0000',
  [StandardColorKeys.Green]: '#4e9a06',
  [StandardColorKeys.Yellow]: '#c4a000',
  [StandardColorKeys.Blue]: '#3465a4',
  [StandardColorKeys.Magenta]: '#75507b',
  [StandardColorKeys.Cyan]: '#06989a',
  [StandardColorKeys.White]: '#d3d7cf',
  [StandardColorKeys.BrightBlack]: '#555753',
  [StandardColorKeys.BrightRed]: '#ef2929',
  [StandardColorKeys.BrightGreen]: '#8ae234',
  [StandardColorKeys.BrightYellow]: '#fce94f',
  [StandardColorKeys.BrightBlue]: '#729fcf',
  [StandardColorKeys.BrightMagenta]: '#ad7fa8',
  [StandardColorKeys.BrightCyan]: '#34e2e2',
  [StandardColorKeys.BrightWhite]: '#eeeeec',
};

// https://en.wikipedia.org/wiki/ANSI_escape_code
export const vga = {
  [StandardColorKeys.Black]: '#000000',
  [StandardColorKeys.Red]: '#aa0000',
  [StandardColorKeys.Green]: '#00aa00',
  [StandardColorKeys.Yellow]: '#aa5500',
  [StandardColorKeys.Blue]: '#0000aa',
  [StandardColorKeys.Magenta]: '#aa00aa',
  [StandardColorKeys.Cyan]: '#00aaaa',
  [StandardColorKeys.White]: '#aaaaaa',
  [StandardColorKeys.BrightBlack]: '#555555',
  [StandardColorKeys.BrightRed]: '#ff5555',
  [StandardColorKeys.BrightGreen]: '#55ff55',
  [StandardColorKeys.BrightYellow]: '#ffff55',
  [StandardColorKeys.BrightBlue]: '#5555ff',
  [StandardColorKeys.BrightMagenta]: '#ff55ff',
  [StandardColorKeys.BrightCyan]: '#55ffff',
  [StandardColorKeys.BrightWhite]: '#ffffff',
};

// https://en.wikipedia.org/wiki/ANSI_escape_code
export const vscode = {
  [StandardColorKeys.Black]: '#000000',
  [StandardColorKeys.Red]: '#cd3131',
  [StandardColorKeys.Green]: '#0dbc79',
  [StandardColorKeys.Yellow]: '#e5e510',
  [StandardColorKeys.Blue]: '#2473c8',
  [StandardColorKeys.Magenta]: '#bc3fbc',
  [StandardColorKeys.Cyan]: '#11a7cd',
  [StandardColorKeys.White]: '#e5e5e5',
  [StandardColorKeys.BrightBlack]: '#666666',
  [StandardColorKeys.BrightRed]: '#f14c4c',
  [StandardColorKeys.BrightGreen]: '#23d18b',
  [StandardColorKeys.BrightYellow]: '#f5f5430',
  [StandardColorKeys.BrightBlue]: '#3b8dea',
  [StandardColorKeys.BrightMagenta]: '#d670d6',
  [StandardColorKeys.BrightCyan]: '#29b7db',
  [StandardColorKeys.BrightWhite]: '#e5e5e5',
};

// https://en.wikipedia.org/wiki/ANSI_escape_code
export const windows10 = {
  [StandardColorKeys.Black]: '#0c0c0c',
  [StandardColorKeys.Red]: '#c50f1e',
  [StandardColorKeys.Green]: '#13a10e',
  [StandardColorKeys.Yellow]: '#c19a00',
  [StandardColorKeys.Blue]: '#0037da',
  [StandardColorKeys.Magenta]: '#891798',
  [StandardColorKeys.Cyan]: '#3a96dd',
  [StandardColorKeys.White]: '#cccccc',
  [StandardColorKeys.BrightBlack]: '#767676',
  [StandardColorKeys.BrightRed]: '#e74855',
  [StandardColorKeys.BrightGreen]: '#15c60c',
  [StandardColorKeys.BrightYellow]: '#f9f1a5',
  [StandardColorKeys.BrightBlue]: '#3b79ff',
  [StandardColorKeys.BrightMagenta]: '#b4009f',
  [StandardColorKeys.BrightCyan]: '#61d6d6',
  [StandardColorKeys.BrightWhite]: '#f2f2f2',
};

// https://en.wikipedia.org/wiki/ANSI_escape_code
export const terminalapp = {
  [StandardColorKeys.Black]: '#000000',
  [StandardColorKeys.Red]: '#990000',
  [StandardColorKeys.Green]: '#00a600',
  [StandardColorKeys.Yellow]: '#999900',
  [StandardColorKeys.Blue]: '#0000b2',
  [StandardColorKeys.Magenta]: '#b200b2',
  [StandardColorKeys.Cyan]: '#00a6b2',
  [StandardColorKeys.White]: '#bfbfbf',
  [StandardColorKeys.BrightBlack]: '#666666',
  [StandardColorKeys.BrightRed]: '#e60000',
  [StandardColorKeys.BrightGreen]: '#00d900',
  [StandardColorKeys.BrightYellow]: '#e6e600',
  [StandardColorKeys.BrightBlue]: '#0000ff',
  [StandardColorKeys.BrightMagenta]: '#e600e6',
  [StandardColorKeys.BrightCyan]: '#00e6e6',
  [StandardColorKeys.BrightWhite]: '#e6e6e6',
};

// https://en.wikipedia.org/wiki/ANSI_escape_code
export const putty = {
  [StandardColorKeys.Black]: '#000000',
  [StandardColorKeys.Red]: '#bb0000',
  [StandardColorKeys.Green]: '#00bb00',
  [StandardColorKeys.Yellow]: '#bbbb00',
  [StandardColorKeys.Blue]: '#0000bb',
  [StandardColorKeys.Magenta]: '#bb00bb',
  [StandardColorKeys.Cyan]: '#00bbbb',
  [StandardColorKeys.White]: '#bbbbbb',
  [StandardColorKeys.BrightBlack]: '#555555',
  [StandardColorKeys.BrightRed]: '#ff5555',
  [StandardColorKeys.BrightGreen]: '#55ff55',
  [StandardColorKeys.BrightYellow]: '#ffff55',
  [StandardColorKeys.BrightBlue]: '#5555ff',
  [StandardColorKeys.BrightMagenta]: '#ff55ff',
  [StandardColorKeys.BrightCyan]: '#55ffff',
  [StandardColorKeys.BrightWhite]: '#ffffff',
};

// https://en.wikipedia.org/wiki/ANSI_escape_code
export const xterm = {
  [StandardColorKeys.Black]: '#000000',
  [StandardColorKeys.Red]: '#cd0000',
  [StandardColorKeys.Green]: '#00cd00',
  [StandardColorKeys.Yellow]: '#cdcd00',
  [StandardColorKeys.Blue]: '#0000ee',
  [StandardColorKeys.Magenta]: '#cd00cd',
  [StandardColorKeys.Cyan]: '#00cdcd',
  [StandardColorKeys.White]: '#e5e5e5',
  [StandardColorKeys.BrightBlack]: '#7f7f7f',
  [StandardColorKeys.BrightRed]: '#ff0000',
  [StandardColorKeys.BrightGreen]: '#00ff00',
  [StandardColorKeys.BrightYellow]: '#ffff00',
  [StandardColorKeys.BrightBlue]: '#5c5cff',
  [StandardColorKeys.BrightMagenta]: '#ff00ff',
  [StandardColorKeys.BrightCyan]: '#00ffff',
  [StandardColorKeys.BrightWhite]: '#ffffff',
};

// https://en.wikipedia.org/wiki/ANSI_escape_code
export const ubuntu = {
  [StandardColorKeys.Black]: '#010101',
  [StandardColorKeys.Red]: '#de382b',
  [StandardColorKeys.Green]: '#39b54a',
  [StandardColorKeys.Yellow]: '#ffc906',
  [StandardColorKeys.Blue]: '#006eb8',
  [StandardColorKeys.Magenta]: '#762671',
  [StandardColorKeys.Cyan]: '#2cb3e9',
  [StandardColorKeys.White]: '#cccccc',
  [StandardColorKeys.BrightBlack]: '#808080',
  [StandardColorKeys.BrightRed]: '#ff0000',
  [StandardColorKeys.BrightGreen]: '#00ff00',
  [StandardColorKeys.BrightYellow]: '#ffff00',
  [StandardColorKeys.BrightBlue]: '#0000ff',
  [StandardColorKeys.BrightMagenta]: '#ff00ff',
  [StandardColorKeys.BrightCyan]: '#00ffff',
  [StandardColorKeys.BrightWhite]: '#ffffff',
};

// https://en.wikipedia.org/wiki/ANSI_escape_code
export const eclipse = {
  [StandardColorKeys.Black]: '#000000',
  [StandardColorKeys.Red]: '#cd0000',
  [StandardColorKeys.Green]: '#00cd00',
  [StandardColorKeys.Yellow]: '#cdcd00',
  [StandardColorKeys.Blue]: '#0000ee',
  [StandardColorKeys.Magenta]: '#cd00cd',
  [StandardColorKeys.Cyan]: '#00cdcd',
  [StandardColorKeys.White]: '#e5e5e5',
  [StandardColorKeys.BrightBlack]: '#000000',
  [StandardColorKeys.BrightRed]: '#ff0000',
  [StandardColorKeys.BrightGreen]: '#00ff00',
  [StandardColorKeys.BrightYellow]: '#ffff00',
  [StandardColorKeys.BrightBlue]: '#5c5cff',
  [StandardColorKeys.BrightMagenta]: '#ff00ff',
  [StandardColorKeys.BrightCyan]: '#00ffff',
  [StandardColorKeys.BrightWhite]: '#ffffff',
};
