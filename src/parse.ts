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
  ^                           # beginning of line
                              #
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
    ([\x00-\x1f:])              # anything illegal
  )
`;

const oscRegex = rgx`
  ^                           # beginning of line
                              #
  \x1b\]8;                    # OSC Hyperlink
  [\x20-\x3a\x3c-\x7e]*       # params (excluding ;)
  ;                           # end of params
  ([\x21-\x7e]{0,512})        # URL capture
  (?:                         # ST
    (?:\x1b\\)                  # ESC \
    |                           # alternate
    (?:\x07)                    # BEL (what xterm did)
  )
  ([\x20-\x7e]+)              # TEXT capture
  \x1b\]8;;                   # OSC Hyperlink End
  (?:                         # ST
    (?:\x1b\\)                  # ESC \
    |                           # alternate
    (?:\x07)                    # BEL (what xterm did)
  )
`;

const oscTerminatorRegex = rgxG`
  (?:                         # legal sequence
    (\x1b\\)                    # ESC \
    |                           # alternate
    (\x07)                      # BEL (what xterm did)
  )
  |                           # alternate (second attempt)
  (                           # illegal sequence
    [\x00-\x06]                 # anything illegal
    |                           # alternate
    [\x08-\x1a]                 # anything illegal
    |                           # alternate
    [\x1c-\x1f]                 # anything illegal
  )
`;
*/

const csiRegex = /^(?:\x1b\[([\x3c-\x3f]?)([\d;]*)([\x20-\x2f]?[\x40-\x7e]))|(?:\x1b\[[\x20-\x7e]*([\x00-\x1f:]))/;
const oscRegex = /^\x1b\]8;[\x20-\x3a\x3c-\x7e]*;([\x21-\x7e]{0,512})(?:(?:\x1b\\)|(?:\x07))([\x20-\x7e]+)\x1b\]8;;(?:(?:\x1b\\)|(?:\x07))/;
const oscTerminatorRegex = /(?:(\x1b\\)|(\x07))|([\x00-\x06]|[\x08-\x1a]|[\x1c-\x1f])/g;

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
    const remaining = this.input.substring(this.lastIndex);
    const len = remaining.length;

    // close iterator
    if (len === 0) return { value: null, done: true };

    const pkt = { kind: PacketKind.UNSET, text: '', url: '' };
    const pos = remaining.indexOf('\x1b');

    // most common case, no ESC codes
    if (pos === -1) {
      pkt.kind = PacketKind.Text;
      pkt.text = remaining;
      this.lastIndex += len;
      return { value: pkt, done: false };
    }

    // escape code is further ahead
    if (pos > 0) {
      pkt.kind = PacketKind.Text;
      pkt.text = remaining.slice(0, pos);
      this.lastIndex += pos;
      return { value: pkt, done: false };
    }

    if (len < 3) {
      // sequences need at least 3 so this means last escape is incomplete
      return { value: null, done: true };
    }

    // handle escapes
    const nextChar = remaining.charAt(1);

    // single ESC
    if ((nextChar !== '[') && (nextChar !== ']') && (nextChar !== '(')) {
      pkt.kind = PacketKind.ESC;
      pkt.text = remaining[0];
      this.lastIndex += 1;
      return { value: pkt, done: false };
    }

    // handle SGR
    if (nextChar === '[') {
      const match = remaining.match(csiRegex);

      // This match is guaranteed to terminate (even on
      // invalid input). The key is to match on legal and
      // illegal sequences.
      // The first alternate matches everything legal and
      // the second matches everything illegal.
      //
      // If it doesn't match, then we have not received
      // either the full sequence or an illegal sequence.
      // If it does match, the presence of field 4 tells
      // us whether it was legal or illegal.

      if (match === null) return { value: null, done: true };

      // match is an array
      // 0 - total match
      // 1 - private mode chars group
      // 2 - digits and semicolons group
      // 3 - command
      // 4 - illegal char

      if (match[4]) {
        // Illegal sequence, just remove the ESC
        pkt.kind = PacketKind.ESC;
        pkt.text = remaining[0];
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
      if (len < 4) return { value: null, done: true };

      if (remaining.charAt(2) !== '8' || remaining.charAt(3) !== ';') {
        // This is not a match, so we'll just treat it as ESC
        pkt.kind = PacketKind.ESC;
        pkt.text = remaining[0];
        this.lastIndex += 1;
        return { value: pkt, done: false };
      }

      // We do a stateful regex match with exec.
      // If it matches, the regex can be used again to
      // find the next match.
      const regex = new RegExp(oscTerminatorRegex);

      {
        const match = regex.exec(remaining);

        if (match === null) return { value: null, done: true };

        // If an illegal character was found, bail on the match
        if (match[3]) {
          // Illegal sequence, just remove the ESC
          pkt.kind = PacketKind.ESC;
          pkt.text = remaining[0];
          this.lastIndex += 1;
          return { value: pkt, done: false };
        }
      }

      // OK - we might have the prefix and URI
      // Lets start our search for the next ST
      // past this index

      {
        const match = regex.exec(remaining);

        if (match === null) return { value: null, done: true };

        // If an illegal character was found, bail on the match
        if (match[3]) {
          // Illegal sequence, just remove the ESC
          pkt.kind = PacketKind.ESC;
          pkt.text = remaining[0];
          this.lastIndex += 1;
          return { value: pkt, done: false };
        }
      }

      // now we have a full match
      const match = remaining.match(oscRegex);

      if (match === null) {
        // Illegal sequence, just remove the ESC
        pkt.kind = PacketKind.ESC;
        pkt.text = remaining[0];
        this.lastIndex += 1;
        return { value: pkt, done: false };
      }

      // match is an array
      // 0 - total match
      // 1 - URL
      // 2 - Text

      // If a valid SGR
      pkt.kind = PacketKind.OSCURL;
      pkt.url = match[1];
      pkt.text = match[2];
      this.lastIndex += match[0].length;
      return { value: pkt, done: false };
    }

    // Other ESC CHECK
    if (nextChar === '(') {
      // This specifies the character set, which
      // should just be ignored

      // We have at least 3, so drop the sequence
      pkt.kind = PacketKind.Unknown;
      this.lastIndex += 3;
      return { value: pkt, done: false };
    }

    return { value: null, done: true };
  }

  [Symbol.iterator](): IterableIterator<Packet> {
    return this;
  }
}
