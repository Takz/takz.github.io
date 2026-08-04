#!/usr/bin/env bash
#
# Serves the working tree for local review. Whatever branch is checked out is
# what you see — so `git checkout redesign` then run this to review the redesign,
# or `git checkout main` to compare against what's live.
#
# Binds to all interfaces so you can also open it on a phone or headset on the
# same wifi. Nothing here is public: it's your local network only.
#
# Usage:  tools/serve.sh [port]     (default 8765)

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PORT="${1:-8765}"
LAN="$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null || true)"

if lsof -ti "tcp:$PORT" >/dev/null 2>&1; then
  echo "port $PORT is already in use — either it's already serving, or run:"
  echo "  lsof -ti tcp:$PORT | xargs kill"
  exit 1
fi

echo "branch:  $(git -C "$ROOT" branch --show-current 2>/dev/null || echo 'n/a')"
echo "serving: $ROOT"
echo
echo "  this Mac    http://localhost:$PORT/"
[[ -n "$LAN" ]] && echo "  phone/VP    http://$LAN:$PORT/"
echo
echo "ctrl-C to stop."
echo

cd "$ROOT"
exec python3 -m http.server "$PORT" --bind 0.0.0.0
