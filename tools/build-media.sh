#!/usr/bin/env bash
#
# Derives every web asset in media/ from the masters in "AlternateXR Media/".
# Masters are gitignored; media/ is committed. Re-run after replacing any master.
#
# Stills go through sips (ships with macOS). Video needs ffmpeg for bitrate
# control — avconvert has no quality knob and produced ~4x the file size at the
# same visual quality. If ffmpeg isn't on PATH the script fetches a standalone
# binary into tools/node_modules (gitignored, no system install).
#
# Idempotent — safe to run repeatedly.
#
# Usage:  tools/build-media.sh [--force]
#         --force  rebuild even if the output is newer than the source

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SRC="$ROOT/AlternateXR Media"
OUT="$ROOT/media"
FORCE="${1:-}"

# --- resolve ffmpeg -----------------------------------------------------------
resolve_ffmpeg() {
  if [[ -n "${FFMPEG:-}" && -x "${FFMPEG}" ]]; then echo "$FFMPEG"; return; fi
  if command -v ffmpeg >/dev/null 2>&1; then command -v ffmpeg; return; fi
  local local_ff="$ROOT/tools/node_modules/ffmpeg-static/ffmpeg"
  if [[ -x "$local_ff" ]]; then echo "$local_ff"; return; fi
  if command -v npm >/dev/null 2>&1; then
    echo "fetching a standalone ffmpeg into tools/node_modules ..." >&2
    (cd "$ROOT/tools" && npm install --silent --no-package-lock ffmpeg-static >&2)
    [[ -x "$local_ff" ]] && { echo "$local_ff"; return; }
  fi
  echo ""
}
FF="$(resolve_ffmpeg)"

if [[ ! -d "$SRC" ]]; then
  echo "error: source media not found at $SRC" >&2
  echo "       masters are gitignored — copy them in before running this." >&2
  exit 1
fi

mkdir -p "$OUT"

# newer <src> <dst> -> true when src is newer than dst (or dst missing, or --force)
newer() {
  [[ "$FORCE" == "--force" ]] && return 0
  [[ ! -f "$2" ]] && return 0
  [[ "$1" -nt "$2" ]]
}

# still <src.png> <basename> <width>...
# Writes <basename>-<width>.jpg for each width given.
still() {
  local src="$1" base="$2"; shift 2
  for w in "$@"; do
    local dst="$OUT/$base-$w.jpg"
    if newer "$src" "$dst"; then
      sips -Z "$w" -s format jpeg -s formatOptions 78 "$src" --out "$dst" >/dev/null
      printf '  %-38s %s\n' "$base-$w.jpg" "$(du -h "$dst" | cut -f1)"
    fi
  done
}

echo "==> Asset Manager (retouched)"
AM="$SRC/Browser App/clean"
still "$AM/Screenshot 2026-08-03 at 13.09.43.png" "app-library"        1600 800
still "$AM/Screenshot 2026-08-03 at 13.10.48.png" "app-materials"      1600 800
still "$AM/Screenshot 2026-08-03 at 13.11.01.png" "app-textures"       1600 800

echo "==> Texture library tiles"
# Cropped out of the Texture Library screenshot at fixed pixel offsets, so this
# breaks if that screenshot is retaken at a different window size. The durable
# fix is to export the six basemaps straight out of Asset Manager - then these
# become plain copies. Regenerate with: tools/build-media.sh --force
TEXSRC="$SRC/Browser App/clean/Screenshot 2026-08-03 at 13.11.01.png"
if [[ -f "$TEXSRC" ]] && newer "$TEXSRC" "$OUT/tex-aluminium.jpg"; then
  python3 - "$TEXSRC" "$OUT" <<'PY' || echo "  skipped - needs Pillow (pip3 install Pillow)"
import sys
try:
    from PIL import Image
except ImportError:
    sys.exit(1)
src, out = sys.argv[1], sys.argv[2]
im = Image.open(src).convert("RGB")
Y0, Y1 = 1216, 1442
for name, x0, x1 in [("aluminium",416,790), ("brass",860,1236),
                     ("brushed-brass",1304,1680), ("copper",1748,2124),
                     ("light-gold",2180,2556), ("satin-nickel",2620,2996)]:
    im.crop((x0, Y0, x1, Y1)).resize((480, 290), Image.LANCZOS) \
      .save(f"{out}/tex-{name}.jpg", quality=86, optimize=True)
    print(f"  tex-{name}.jpg")
PY
fi

echo "==> Airport before/after"
still "$SRC/Airport/Before.png" "airport-before" 1600 800
still "$SRC/Airport/After.png"  "airport-after"  1600 800

echo "==> Digital Showroom"
AS="$SRC/AppStore"
for n in hero horse piano sculpture; do
  still "$AS/axr_metal_day_$n.png"   "showroom-day-$n"   1920 960
  still "$AS/axr_metal_night_$n.png" "showroom-night-$n" 1920 960
done
still "$AS/axr_metal_day_ui.png" "showroom-ui" 1920 960

echo "==> Volumetric / product mode"
still "$AS/axr_volume_leaves.png" "product-leaves" 1920 960
still "$AS/axr_volume_london.png" "product-london" 1920 960
still "$AS/axr_volume_menu.png"   "product-menu"   1920 960

echo "==> Hero film"
FILM="$SRC/Website Hero.mp4"
POSTER_AT=0.5        # seconds — frame used for the poster / OG image


# encode <width> <crf> <outfile>
# Audio is dropped: the hero is a muted background loop, so it's pure weight.
# faststart puts the moov atom first so playback can begin before full download.
encode() {
  local w="$1" crf="$2" dst="$3"
  "$FF" -hide_banner -loglevel error -y -i "$FILM" \
    -map 0:v:0 -an -vf "scale=$w:-2" \
    -c:v libx264 -profile:v high -preset slow -crf "$crf" \
    -pix_fmt yuv420p -movflags +faststart "$dst"
  printf '  %-38s %s\n' "$(basename "$dst")" "$(du -h "$dst" | cut -f1)"
}

if [[ ! -f "$FILM" ]]; then
  echo "  skipped — $FILM not found"
elif [[ -z "$FF" ]]; then
  echo "  SKIPPED — no ffmpeg available and npm not found." >&2
  echo "            install ffmpeg, or set FFMPEG=/path/to/ffmpeg" >&2
else
  newer "$FILM" "$OUT/hero-1080.mp4" && encode 1920 26 "$OUT/hero-1080.mp4"
  newer "$FILM" "$OUT/hero-720.mp4"  && encode 1280 26 "$OUT/hero-720.mp4"
  if newer "$FILM" "$OUT/hero-poster.jpg"; then
    "$FF" -hide_banner -loglevel error -y -ss "$POSTER_AT" -i "$FILM" \
      -frames:v 1 -vf "scale=2560:-2" -q:v 3 "$OUT/hero-poster.jpg"
    printf '  %-38s %s\n' "hero-poster.jpg" "$(du -h "$OUT/hero-poster.jpg" | cut -f1)"
  fi
fi

echo "==> Re-compress oversized legacy assets"
[[ -f "$ROOT/tarik.jpg" ]]         && still "$ROOT/tarik.jpg"         "tarik"    800 400
[[ -f "$ROOT/yachtxr-thumb.jpg" ]] && still "$ROOT/yachtxr-thumb.jpg" "yachtxr"  1200 600

echo
echo "media/ total: $(du -sh "$OUT" | cut -f1)"
