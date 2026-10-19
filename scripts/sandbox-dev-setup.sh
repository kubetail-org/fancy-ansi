#!/usr/bin/env bash
# Set up a Linux-native dev environment for fancy-ansi inside the sandbox,
# without letting its build artifacts collide with the macOS host's.
#
# The repo is bind-mounted from the macOS host, so every build output path is
# shared. Two mechanisms keep the two platforms apart:
#
#   1. The pnpm store is pointed at $BUILD_ROOT via an environment variable.
#   2. Fixed paths that tooling can't relocate (node_modules, dist) get a
#      sandbox-only bind mount from $BUILD_ROOT on top of them. A bind mount is
#      invisible to the host: macOS keeps its own node_modules underneath,
#      untouched, while the sandbox sees the Linux one. This matters because
#      node_modules holds native builds (microtime).
#
# BUILD_ROOT lives *inside* the repo (on the host's disk) so artifacts survive
# sandbox restarts and aren't capped by the 20G overlay. Set
# FANCY_ANSI_SANDBOX_BUILD_ROOT=/home/agent/fancy-ansi-build to use the overlay
# instead (faster I/O, smaller, wiped on sandbox recreate).
#
# Idempotent — safe to re-run. Run it once per sandbox boot: bind mounts do not
# survive a restart, the env vars (in /etc/sandbox-persistent.sh) do.

set -euo pipefail

# No-op outside the sandbox. This runs from a SessionStart hook, and the repo is
# shared with the macOS host, so the host's own agents fire this same hook —
# where every redirection here would be wrong. $SANDBOX_VM_ID is set only inside
# the sandbox; the Linux check guards against a stray export.
if [ -z "${SANDBOX_VM_ID:-}" ] || [ "$(uname -s)" != "Linux" ]; then
  exit 0
fi

REPO="$(cd "$(dirname "$0")/.." && pwd)"
BUILD_ROOT="${FANCY_ANSI_SANDBOX_BUILD_ROOT:-$REPO/.sandbox-linux}"
PERSIST="/etc/sandbox-persistent.sh"
NODE_MAJOR="$(cat "$REPO/.node-version")"
NODE_DIR="$HOME/.local/node-v$NODE_MAJOR"

echo "→ build root: $BUILD_ROOT"
mkdir -p "$BUILD_ROOT"/{node_modules,dist,pnpm-store}

# --- 1. bind mounts for paths the tooling can't relocate -------------------
for dir in node_modules dist; do
  target="$REPO/$dir"
  mkdir -p "$target"
  if mountpoint -q "$target"; then
    echo "✓ $dir already bind-mounted"
  else
    sudo mount --bind "$BUILD_ROOT/$dir" "$target"
    echo "✓ $dir bind-mounted from $BUILD_ROOT/$dir"
  fi
done

# --- 2. env vars for the paths that are configurable -----------------------
# Written to the persistent env file, which is sourced before every command.
# Every line this script owns is dropped first, so a re-run rewrites the values
# rather than leaving an older copy above them.
#
# Unset, the pnpm store defaults to the root of node_modules' mount, so its
# location depends on whether the bind mount is up — without it, that is
# $REPO/.pnpm-store, which the host also sees.
sudo touch "$PERSIST"
sudo sed -i \
  -e '/FANCY_ANSI_SANDBOX_ENV/d' \
  -e '/^export PNPM_CONFIG_STORE_DIR=/d' \
  -e '/^export PATH=.*\/\.local\/node-v/d' \
  "$PERSIST"
sudo tee -a "$PERSIST" >/dev/null <<EOF
# FANCY_ANSI_SANDBOX_ENV — Linux toolchain and build outputs, kept apart from the macOS host.
export PNPM_CONFIG_STORE_DIR="$BUILD_ROOT/pnpm-store"
export PATH="$NODE_DIR/bin:\$PATH"
EOF
echo "✓ env vars written to $PERSIST"

# --- 3. node --------------------------------------------------------------
# The major in .node-version, which CI also reads. Official nodejs.org builds,
# since that host is reachable through the sandbox firewall.
if [ -x "$NODE_DIR/bin/node" ]; then
  echo "✓ node $("$NODE_DIR/bin/node" --version) already installed"
else
  case "$(uname -m)" in
    aarch64) arch=arm64 ;;
    x86_64) arch=x64 ;;
  esac
  base="https://nodejs.org/dist/latest-v$NODE_MAJOR.x"
  tarball="$(curl -fsSL "$base/SHASUMS256.txt" | grep -o "node-v[0-9.]*-linux-$arch\.tar\.gz")"
  mkdir -p "$NODE_DIR"
  curl -fsSL "$base/$tarball" | tar -xz -C "$NODE_DIR" --strip-components=1
  echo "✓ node $("$NODE_DIR/bin/node" --version) installed"
fi

# --- 4. pnpm ---------------------------------------------------------------
# Any pnpm will do: it switches itself to the version in package.json's
# packageManager field.
if command -v pnpm >/dev/null; then
  echo "✓ pnpm $(pnpm --version) already installed"
else
  npm install --global --silent pnpm
  echo "✓ pnpm $(pnpm --version) installed"
fi

echo
echo "Done. Open a new shell (or 'source $PERSIST') to pick up the env vars,"
echo "then run 'pnpm install' if node_modules is empty."
