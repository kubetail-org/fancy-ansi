# Security model

What the library protects, where the boundaries are, and which protections a test enforces rather
than a reviewer remembering. This file describes the current state of the code.

Dated reviews live in [`docs/security/`](security/) and are never rewritten. Latest review:
[20 October 2026](security/2026-10-20-threat-model.md). Tests pin specific properties; they do not
prove the absence of vulnerabilities.

## Assets

Fancy-ANSI holds no credentials and no data of its own. It protects the page it renders into:

- **The consumer's origin.** `toHtml()` output goes into `innerHTML`, and `AnsiHtml` uses
  `dangerouslySetInnerHTML`. A script in that output runs with the page's cookies, tokens and DOM.
- **The consumer's main thread.** Conversion is synchronous. Slow or oversized output freezes the
  tab.
- **Every downstream install.** A malicious release reaches each of these sinks at once.

## Boundaries

Three boundaries, in the order an attacker meets them:

1. **Input → HTML.** All input is untrusted. It is usually process or container output, so whoever
   writes a log line controls every byte. The output contains only three things: escaped text,
   `<span style>` with values from a fixed table, and `<a>` tags for http(s) URLs when hyperlinks
   are on. Truecolor components are the one value copied from the input. The parser captures only
   `[\d;]*` for them.
2. **Consumer → HTML.** `hyperlinks.target` and `hyperlinks.className` are escaped. The consumer
   is trusted to choose them, but the escaping holds even if they don't. The `rel` attribute is
   fixed. The consumer's own CSS variables (`--ansi-*`) are trusted.
3. **Repository → npm.** A `v*` tag publishes through `publish.yml` with npm trusted publishing
   (OIDC, `id-token: write`), and the registry records a provenance attestation. The job runs in
   the `npm` environment with SHA-pinned actions. It runs lint, coverage and build on the tagged
   commit before publishing. `main` requires one approving review, signed commits and the DCO
   check. Required CI checks, a `v*` tag ruleset and the `npm` environment's reviewers are repository
   settings, not code. The only runtime dependency is `escape-html`. `ansi-regex` and the
   parser regexes are vendored. Development dependencies run during the release build, pinned by
   the lockfile.

## Protections

**Enforced** means a named test fails when the property regresses, and CI runs it on every pull
request. **Held by review** means it is true today and nothing stops the next change undoing it.
**Not built** means the gap is open; the review that found it says what the work is.

| Protection | Where | Status |
| --- | --- | --- |
| Text is HTML-escaped, inside and outside spans | `src/main.ts` | **Enforced** — `escapes html in input strings`, `escapes all html special characters in text`, `escapes text inside styled spans` |
| Output is limited to escaped text, fixed-alphabet spans and http(s) links | `src/main.ts` | **Enforced** — `only emits escaped text, styled spans and http(s) links for random input` (5,000 generated inputs against `safeHtmlRegex`, three converter configurations) |
| SGR parameters cannot reach the `style` attribute | `src/parse.ts`, `src/main.ts` | **Enforced** — `keeps payloads in SGR parameters out of attributes`. The style string is not escaped. Its safety rests on `csiRegex` capturing only `[\d;]*` |
| Malformed sequences drop only the ESC, and the text after them is escaped | `src/parse.ts` | **Enforced** — `escapes text after malformed sequences` |
| Hyperlinks are off by default | `src/main.ts` | **Enforced** — `renders link text only when hyperlinks is %j` (false and undefined), `does not render OSC 8 urls` |
| Only `http:` and `https:` URLs become links; anything else closes the open link | `src/main.ts` (`isHttpUrl`) | **Enforced** — `renders non-http(s) urls as plain text`, `closes a link when an unsafe link opens` |
| Link URLs and consumer link options are attribute-escaped; `rel="noopener noreferrer nofollow"` is fixed | `src/main.ts` (`linkAttrs`) | **Enforced** — `escapes quotes and special characters in link urls`, and the random-input test with hostile `target`/`className` |
| `AnsiHtml` renders only `<span style>` and safe `<a>` elements | `src/react.tsx` | **Enforced** — `renders untrusted input as text and styled spans`, `renders untrusted hyperlinks as safe links` |
| Emitted tags are balanced: spans never nest, and a span is closed before a link opens or closes | `src/main.ts` (`toHtml`) | **Held by review** — fuzzed with 100,000 inputs in the latest review; the alphabet test does not check nesting |
| Parsing time is linear in input length | `src/parse.ts` | **Not built** — CSI, `stripAnsi` and `hasAnsi` measured linear; `oscRegex`'s illegal branch is quadratic within a run without control characters ([P-1](security/2026-10-20-threat-model.md#medium)) |
| Output size is bounded relative to input | `src/main.ts` | **Not built** — up to 95× (377 bytes per 4-byte SGR) ([R-1](security/2026-10-20-threat-model.md#low)) |
| A release passes lint, coverage and build for its own commit and uses SHA-pinned actions | `.github/workflows/publish.yml` | **Held by review** — nothing fails if a step or pin is removed ([X-1](security/2026-10-20-threat-model.md#medium)) |
| Only maintainers can tag, CI is required on `main`, and publishing waits for environment approval | GitHub rulesets, `npm` environment | **Not built** — repository settings, outside the code ([X-1](security/2026-10-20-threat-model.md#medium)) |
| A `SECURITY.md` that points to the private reporting channel | — | **Not built** — GitHub private vulnerability reporting is enabled but unadvertised ([X-2](security/2026-10-20-threat-model.md#low)) |

## What the library does not do

**It makes HTML safe, not text truthful.** Bidi overrides (U+202E), `\r`, `\b` and other C0
characters pass through as text. With hyperlinks on, the link text is attacker-controlled and can
show a different URL from the `href`; the README's Hyperlinks section says so. Neither runs script.
Both can mislead a reader.

**`stripAnsi` is not a terminal sanitizer.** It uses `ansi-regex`, not the `toHtml` parser. It can
leave a lone ESC, unterminated OSC payloads and C0 characters behind, and it strips the 8-bit CSI
`\x9b` that `toHtml` renders as text. Do not write its output to a terminal as if it were clean. The
README's `stripAnsi()` section says so.

**It does not bound work.** It has no input size limit and no time budget. A consumer that renders
untrusted input should cap length per call. A consumer that renders logs should convert one line at
a time. The README's [Output size](../README.md#output-size) section tells consumers the same.

## How this is recorded

- **This file** shows what is true now. A row moves to *Enforced* when a test that pins it lands,
  not because the code looks right.
- **[`docs/security/`](security/)** holds dated review records, append-only, each naming the commit
  it reviewed. A later review is a new file, not an edit.
