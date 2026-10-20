# Threat model — 20 October 2026

**Reviewed at** `e4d2f01` (`upstream_v0_2_0`) · **Method** source review of `src/` and
`.github/workflows/`, the repository's GitHub rulesets and npm registry metadata, plus timing and
size measurements of adversarial inputs against the built `dist/` on Node 24. Every number below
was measured in this review. No browser testing.

This is a review record. It says what was believed on the day, and it is not edited afterwards. The
current picture is [`docs/security-model.md`](../security-model.md). The next review is a new file
here.

Severities weigh impact on a consumer's page against how much the attacker must control. Writing
the input is assumed, since that is the library's purpose.

## Adversaries considered

Anyone who writes the input, such as a container, a CI job, or a process whose output a log viewer
renders. A consumer who misconfigures the library. The supply chain: the `escape-html` dependency,
the development dependencies that run during a release build, the GitHub Actions used to publish,
and anyone who can push a tag.

## Findings

### Medium

**P-1 · Quadratic parse on repeated `ESC ]8;`.** When the legal branch of `oscRegex` fails, the
illegal branch scans `[^\x00-\x1a\x1c-\x1f]*`. That class includes ESC, so each attempt runs to the
next control character or `ESC \`. The parser then drops one ESC, emits `]8;` as text, finds the
next `ESC ]8;` and scans again. Time quadruples each time the input doubles:

| Input | `'\x1b]8;'.repeat(k) + '\n'` | `('\x1b]8;' + 'a'.repeat(100)).repeat(k) + '\n'` |
| --- | --- | --- |
| 20 KB | 59 ms | — |
| 39 KB | 230 ms | — |
| 78 KB | 891 ms | — |
| 102 KB | — | 40 ms |
| 156 KB | 3,484 ms | — |
| 203 KB | — | 161 ms |
| 406 KB | — | 643 ms |

This happens with hyperlinks off, because the parser always runs. A control character ends the
run, so per-line rendering limits the cost to the line length. A single long line, such as a JSON
blob logged without newlines, still freezes the tab. Without any terminator the regex fails once and
parsing stops, so that input is cheap (0 ms at 156 KB) but truncated (P-2).

*Fix:* end the illegal run at the next ESC, as `csiRegex` already does:
`(?:\x1b\]8;[^\x00-\x1f]*(\x1b\\?|[\x00-\x1a\x1c-\x1f]))`. Measured with this regex in
`src/parse.ts`: 7 ms at 78 KB, 11 ms at 156 KB, 22 ms at 312 KB, 41 ms at 625 KB. The test suite
passes except `drops incomplete OSC with ESC but no terminator at end of input`, which pins the
current truncation of `'\x1b]8;;url\x1b[1m'`; with the fix that input renders `]8;;url` followed
by the SGR, which is the better behaviour and the test should change with it. Add a regression test
with a time bound.

**X-1 · A release is not gated on review or checks.** `publish.yml` runs on every tag (`'**'`,
not only `v*`). It builds and publishes without lint, tests or coverage, and does not require CI to
have passed for that commit. Nothing in GitHub closes the gap: the `main` ruleset requires one
approving review, signed commits, linear history and the DCO status check, but not the `ci.yml`
jobs, and no ruleset targets tags. So anyone with write access can tag any commit, reviewed or not,
on any branch, and it publishes. Actions float on major tags (`actions/checkout@v4`,
`actions/setup-node@v7`, `pnpm/action-setup@v6`) inside the job that holds `id-token: write`. A
compromised action tag, or a tag on an unreviewed commit, reaches every consumer's `innerHTML`.
Trusted publishing, `contents: read`, the `github.repository` guard and the published provenance
attestation are the right base. *Fix:* run `pnpm lint` and `pnpm coverage` before publishing. Pin
actions to SHAs. Add a tag ruleset for `v*` limited to maintainers, and make the CI jobs required
status checks on `main`. Put the job behind a protected environment.

### Low

**R-1 · Output is up to 95× the input.** Each SGR sequence closes the current span and re-emits the
full style, even when the attributes did not change. The largest style string is 355 characters, so
a 4-byte `\x1b[1m` emits 377 bytes. Measured after an SGR that sets every attribute:

| Repeated unit | Input | Output | Ratio |
| --- | --- | --- | --- |
| `\x1b[1m` | 391 KB | 36.0 MB | 94× |
| `\x1b[5m` (unmapped code) | 391 KB | 36.0 MB | 94× |
| `\x1b[1m\x1b[22m` | 879 KB | 67.5 MB | 79× |

Conversion itself is fast (361 ms for the first row); the cost lands when the consumer inserts
the string into the DOM. Skipping the close-and-reopen when attributes are unchanged only removes
the first two rows; the toggling row stays at 79×. It is a small win, not a mitigation. *Fix:*
document the bound and tell consumers to cap input size per call. Optionally skip the reopen when
nothing changed.

**P-2 · An unterminated sequence drops the rest of the input.** When neither regex branch matches,
`Parser.next()` returns `done`, and so does an ESC within the last two characters. Measured:

| Input | Output |
| --- | --- |
| `'visible \x1b]8;hidden tail'` | `visible ` |
| `'visible \x1b[1 2 3 hidden'` | `visible ` |
| `'visible \x1b['`, `'visible \x1b]8'` | `visible ` |
| `'line1\x1b]8;x\nline2'` | `line1]8;x\nline2` |

For CSI the tail must contain no control character and no final byte at the right place, so it is
harder to reach than for OSC, where any printable or non-ASCII tail works. A newline anywhere after
the ESC prevents it. The impact is hiding content within a single render call, which SGR 8
(`visibility:hidden`) can already do, so it adds nothing an attacker lacks. No script runs. The
P-1 fix narrows the OSC case to tails with no ESC. *Fix:* emit the remainder as text.

**R-4 · `stripAnsi` and `toHtml` disagree on what a sequence is.** `stripAnsi` uses vendored
`ansi-regex`. It leaves a lone ESC (`'x\x1bP1$r\x1b'` → `'x1$r\x1b'`), strips the head of an
unterminated OSC (`'a\x1b]8;;http://x'` → `'attp://x'`) and keeps C0 characters. It also strips
the 8-bit CSI `\x9b`, which `toHtml` passes through as text (`'\x9b31mred'` → `'red'` versus
`'\x9b31mred'`). A consumer who uses it to clean text for a terminal is not protected. *Fix:*
document the limit.

**X-2 · No `SECURITY.md`.** GitHub private vulnerability reporting is enabled on
`kubetail-org/fancy-ansi`, so a private channel exists. Nothing in the repository or on npm points
to it, and a reporter who does not look at the Security tab sees only public issues. *Fix:* add a
`SECURITY.md` that names the channel and the supported versions.

### Informational

**R-2 · Hyperlink text can impersonate another URL.** With `hyperlinks` on,
`\x1b]8;;https://evil.example/\x07https://bank.example/login\x1b]8;;\x07` renders a link whose
visible text is the bank's URL and whose `href` is the attacker's. Terminals behave the same way.
The option is opt-in and the README's Hyperlinks section already says to enable it only for trusted
input and describes this exact case (since `75655f7`). No action.

**R-3 · Display-altering characters pass through.** Bidi overrides, `\r` and `\b` are not HTML
special characters, so they reach the DOM. This can reorder or hide what a log line appears to say.
Out of scope for an HTML converter. Recorded in the security model so consumers know.

**X-3 · Development dependencies run in the release build.** `pnpm build` executes TypeScript,
Vite, Rollup and their plugins from about forty development dependencies inside the publishing job.
The lockfile pins them and CI installs with a frozen lockfile. Lifecycle scripts are blocked except
for the three packages in `pnpm-workspace.yaml`. There is no Dependabot or Renovate configuration,
so nothing bumps a version without a human, and nothing flags an advisory either. Recorded for
context, not as a defect.

## What held up

**The output alphabet.** Text goes through `escape-html`. Every style value comes from a
precomputed table, except truecolor components, which `csiRegex` limits to digits; a malformed
component gives an invalid declaration, never a different property. A 5,000-input random test pins
this across three converter configurations, including hostile `target` and `className`. Payloads in
SGR parameters, malformed CSI and OSC, and quoted or `javascript:` URLs each have a named test.

**Tag structure.** 100,000 random inputs drawn from an alphabet of ESC, CSI, OSC 8, SGR codes,
terminators and HTML metacharacters, with hyperlinks on and off, produced no unbalanced tag, no
nested span and no span open across a link boundary. No test pins this yet.

**Hyperlinks.** Off by default. `isHttpUrl` uses the WHATWG `URL` parser rather than a prefix
check, so `HTTPS:` and `http:host` forms are judged the way a browser resolves them, and any
environment where `URL` throws fails closed with no link. An unsafe URL closes the open link, so
earlier link text cannot leak into it. `rel="noopener noreferrer nofollow"` is fixed. The URL is
capped at 512 characters and limited to printable ASCII by the regex.

**Parsing cost outside P-1.** CSI parsing, `stripAnsi` and `hasAnsi` stayed linear on every
adversarial input tried (repeated `ESC [`, long parameter runs, long printable runs, nested `;`
patterns), each under 30 ms at 156 KB. The vendored `ansi-regex` pattern is the one that followed
CVE-2021-3807; every repetition in it consumes at least one character, so it cannot loop on empty
matches.

**Supply chain.** A single runtime dependency, `escape-html` 1.0.3, unchanged since 2015. The
`v0.2.0-rc2` release on npm carries a provenance attestation, so a consumer can check that the
package was built by `publish.yml` from this repository. The workflow reads the tag through
`$GITHUB_REF_NAME` in the shell, not through `${{ }}` expression interpolation, so a tag name
cannot inject into the script. `files` limits the package to `dist/`.
