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

// The regexes and much of the parsing code is from ansi_up: https://github.com/drudru/ansi_up/blob/main/ansi_up.ts

/* ansi_up.js
 * author : Dru Nelson
 * license : MIT
 * http://github.com/drudru/ansi_up
 */

/*
const csiRegex = rgx`
                              # First attempt
  (?:                         # legal sequence
    \x1b\[                      # CSI
    ([\x3c-\x3f]?)              # private-mode char
    ([\d;]*)                    # any digits or semicolons
    ([\x20-\x2f]?               # an intermediate modifier
    [\x40-\x7e])                # the command
  )
  |                           # alternate (second attempt)
  (?:                         # illegal sequence
    \x1b\[                      # CSI
    [\x20-\x7e]*                # anything legal
    ([^\x20-\x39\x3b-\x7e])     # anything illegal (incl. : and non-ASCII)
  )
`;

const oscRegex = rgx`
                              # First attempt
  (?:                         # legal sequence
    \x1b\]8;                    # OSC Hyperlink
    [\x20-\x3a\x3c-\x7e]*       # params (excluding ;)
    ;                           # end of params
    ([\x21-\x7e]{0,512})        # URL capture (empty closes the link)
    (?:                         # ST
      \x1b\\                      # ESC \
      |                           # alternate
      \x07                        # BEL (what xterm did)
    )
  )
  |                           # alternate (second attempt)
  (?:                         # illegal sequence
    \x1b\]8;                    # OSC Hyperlink
    [^\x00-\x1f]*               # anything but a control char
    (                           # whichever comes first
      \x1b\\?                     # ESC \, or a bare ESC so the run ends there
      |                           # alternate
      [\x00-\x1a\x1c-\x1f]        # BEL or an illegal control char
    )
  )
`;
*/

// Both are sticky: they match at `lastIndex` in the full input, so `next()` must
// set `lastIndex` right before each `exec()`. ansi_up anchors only the legal
// alternative, but anchoring both doesn't change matches: if the illegal one
// fails at the start, it can't match further ahead either.
const csiRegex = /(?:\x1b\[([\x3c-\x3f]?)([\d;]*)([\x20-\x2f]?[\x40-\x7e]))|(?:\x1b\[[\x20-\x7e]*([^\x20-\x39\x3b-\x7e]))/y;
const oscRegex = /(?:\x1b\]8;[\x20-\x3a\x3c-\x7e]*;([\x21-\x7e]{0,512})(?:\x1b\\|\x07))|(?:\x1b\]8;[^\x00-\x1f]*(\x1b\\?|[\x00-\x1a\x1c-\x1f]))/y;

/**
 * Represents the different kinds of packets that can be parsed
 */
export const enum PacketKind {
  UNSET,
  Text,
  ESC, // A single ESC char - random
  Unknown, // A valid CSI but not an SGR code
  SGR, // Select Graphic Rendition
  OSCURL, // Operating System Command
}

/**
 * Represents a parsed packet
 */
export type Packet = {
  kind: PacketKind;
  text: string;
  url: string;
};

/**
 * Represents an instance of a parser that implements the JavaScript iterator interface
 * @param {string} input - The string to parse
 */
export class Parser implements IterableIterator<Packet> {
  private lastIndex = 0;

  private readonly input: string;

  constructor(input: string) {
    this.input = input;
  }

  /**
   * Get the next parsed packet
   * @returns {IteratorResult<Packet>} The next parsed packet
   */
  public next(): IteratorResult<Packet> {
    const { input } = this;
    const start = this.lastIndex;
    const len = input.length - start;

    // close iterator
    if (len === 0) return { value: null, done: true };

    const pkt = { kind: PacketKind.UNSET, text: '', url: '' };
    const pos = input.indexOf('\x1b', start);

    // most common case, no ESC codes
    if (pos === -1) {
      pkt.kind = PacketKind.Text;
      pkt.text = input.slice(start);
      this.lastIndex = input.length;
      return { value: pkt, done: false };
    }

    // escape code is further ahead
    if (pos > start) {
      pkt.kind = PacketKind.Text;
      pkt.text = input.slice(start, pos);
      this.lastIndex = pos;
      return { value: pkt, done: false };
    }

    // handle escapes
    const nextChar = input.charAt(start + 1);

    // single ESC, or a character set sequence cut short by the end of input
    if ((nextChar !== '[') && (nextChar !== ']') && (nextChar !== '(' || len < 3)) {
      pkt.kind = PacketKind.ESC;
      pkt.text = '\x1b';
      this.lastIndex += 1;
      return { value: pkt, done: false };
    }

    // handle SGR
    if (nextChar === '[') {
      csiRegex.lastIndex = start;
      const match = csiRegex.exec(input);

      // This match is guaranteed to terminate (even on
      // invalid input). The key is to match on legal and
      // illegal sequences.
      // The first alternate matches everything legal and
      // the second matches everything illegal.
      //
      // If it doesn't match, the sequence is unterminated.
      // If it does match, the presence of field 4 tells
      // us whether it was legal or illegal.

      // match is an array
      // 0 - total match
      // 1 - private mode chars group
      // 2 - digits and semicolons group
      // 3 - command
      // 4 - illegal char

      if (match === null || match[4]) {
        // Unterminated or illegal sequence, just remove the ESC
        pkt.kind = PacketKind.ESC;
        pkt.text = '\x1b';
        this.lastIndex += 1;
        return { value: pkt, done: false };
      }

      // If not a valid SGR, we don't handle
      if ((match[1] !== '') || (match[3] !== 'm')) {
        pkt.kind = PacketKind.Unknown;
      } else {
        pkt.kind = PacketKind.SGR;
      }

      pkt.text = match[2]; // Just the parameters
      this.lastIndex += match[0].length;
      return { value: pkt, done: false };
    }

    // handle OSC
    if (nextChar === ']') {
      // only OSC 8 (hyperlinks) is supported
      if (input.charAt(start + 2) !== '8' || input.charAt(start + 3) !== ';') {
        // This is not a match, so we'll just treat it as ESC
        pkt.kind = PacketKind.ESC;
        pkt.text = '\x1b';
        this.lastIndex += 1;
        return { value: pkt, done: false };
      }

      // Same approach as CSI: the first alternate matches a legal sequence,
      // the second an illegal one, and no match means the sequence is unterminated.
      oscRegex.lastIndex = start;
      const match = oscRegex.exec(input);

      // match is an array
      // 0 - total match
      // 1 - url
      // 2 - terminator of an illegal sequence

      if (match === null || match[2]) {
        // Unterminated or illegal sequence, just remove the ESC
        pkt.kind = PacketKind.ESC;
        pkt.text = '\x1b';
        this.lastIndex += 1;
        return { value: pkt, done: false };
      }

      // OSC 8 opens a hyperlink (with a URL) or closes one (empty URL). The
      // link text between them is parsed like any other text.
      pkt.kind = PacketKind.OSCURL;
      pkt.url = match[1];
      this.lastIndex += match[0].length;
      return { value: pkt, done: false };
    }

    // nextChar is '(', which specifies the character set and
    // should just be ignored, so drop the sequence
    pkt.kind = PacketKind.Unknown;
    this.lastIndex += 3;
    return { value: pkt, done: false };
  }

  [Symbol.iterator](): IterableIterator<Packet> {
    return this;
  }
}
