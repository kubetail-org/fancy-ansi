# Fancy-ANSI

Small TypeScript library that converts ANSI escape sequences to HTML. Ships four entry points: `fancy-ansi` (`src/main.ts`), `/colors`, `/plugin` (Tailwind v4 stylesheet via the `style` export condition, v3 JS plugin via `import`/`require`) and `/react`.

`src/plugin.css` is generated from `src/colors.ts` by `src/plugin.test.ts`. After changing a palette, run `pnpm test run -u`.

## Commands

- `pnpm lint` — ESLint over `src/`
- `pnpm test run` — Vitest, single run (`pnpm test` watches)
- `pnpm build` — type-check and build `dist/`
- `pnpm dev` — Vite playground in `hack/`

CI runs lint, test and build on every pull request.

To release, push a `v<version>` tag to `kubetail-org/fancy-ansi` (e.g. `v1.2.3`, `v1.2.3-rc1`). The publish workflow sets the package version from the tag and publishes prereleases under the `next` dist-tag. The `0.0.0-development` version in `package.json` is a placeholder.

## Sandbox

The repo is shared with a macOS host. `scripts/sandbox-dev-setup.sh` runs at session start (`.claude/settings.json`) and keeps Linux builds separate. It bind-mounts `node_modules` and `dist` from `.sandbox-linux/` and puts the pnpm store there too. It also installs the Node major in `.node-version`, which CI reads as well. It does nothing outside the sandbox.

The mounts don't survive a sandbox restart. If `node_modules` looks like the host's, re-run the script.

## Writing standards

Applies to every hand-written file. Not to generated output (`dist/`, `src/__snapshots__/`, `src/plugin.css`, lockfiles) or vendored code (`src/ansi-regex.ts`).

1. **Code — simple, idiomatic, easy to follow.** Prefer the boring construction. Match the idiom of the file you are in.
2. **Comments — terse and necessary.** Say what the code cannot: the *why*, the invariant, the trap. Never restate the line. Describe the current design, not the alternatives you rejected.
3. **Documentation — simple and concise.** Lead with what is true now. One idea per sentence.

## Commits and pull requests

- **Commits are terse [conventional commits](https://www.conventionalcommits.org)**: `type(scope): subject` — `feat`/`fix`/`perf`/`refactor`/`test`/`docs`/`chore`, scope only when it adds information (`react`, `plugin`), `!` for breaking. Subject imperative, lower-case, no period, ≤72 chars. No body unless the why isn't obvious — then 1–3 plain sentences.
- **Pull requests follow [`.github/pull_request_template.md`](.github/pull_request_template.md)**: keep `Summary` (why), `Key Changes` (what), `Checklist`. The title is a natural, capitalized title led by the change type's emoji — 🎣 bug fix, 🐋 new feature, 📜 documentation, ✨ general improvement.
