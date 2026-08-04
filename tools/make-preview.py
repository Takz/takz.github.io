#!/usr/bin/env python3
"""
Bundles a page from this site into ONE self-contained HTML fragment, with CSS,
JS and images inlined as data URIs, so it can be reviewed away from localhost.

It reads the real files - it is not a hand-maintained copy, so it can't drift.
Video is replaced by its poster frame (too large to inline).

Output is a fragment, not a document: no doctype/html/head/body, because the
artifact host supplies those.

Usage:  tools/make-preview.py products/index.html /path/to/out.html
"""
import base64
import mimetypes
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
# Prefer the smaller variant when inlining, to keep the bundle reasonable.
DOWNSCALE = {"-1600.jpg": "-800.jpg", "-1920.jpg": "-960.jpg"}


def resolve(ref, base_dir):
    ref = ref.split("#")[0].split("?")[0]
    if not ref or ref.startswith(("http", "mailto:", "//", "data:")):
        return None
    return os.path.normpath(os.path.join(base_dir, ref))


def data_uri(path):
    for big, small in DOWNSCALE.items():
        if path.endswith(big) and os.path.exists(path.replace(big, small)):
            path = path.replace(big, small)
            break
    if not os.path.exists(path):
        return None
    mime = mimetypes.guess_type(path)[0] or "application/octet-stream"
    blob = base64.b64encode(open(path, "rb").read()).decode()
    return f"data:{mime};base64,{blob}", os.path.getsize(path)


def main():
    page = sys.argv[1]
    out = sys.argv[2]
    src = os.path.join(ROOT, page)
    base = os.path.dirname(src)
    html = open(src).read()

    # keep only what's inside <body>
    body = re.search(r"<body[^>]*>(.*)</body>", html, re.S)
    if body:
        html = body.group(1)

    css = open(os.path.join(ROOT, "assets/site.css")).read()
    js = open(os.path.join(ROOT, "assets/site.js")).read()
    html = re.sub(r'<link rel="stylesheet"[^>]*>', "", html)
    html = re.sub(r'<script src="[^"]*site\.js"[^>]*></script>', "", html)

    inlined = total = 0

    # Video first, so its sources are never inlined - replace it with its
    # poster still, which then gets inlined like any other image below.
    def do_video(m):
        poster = re.search(r'poster="([^"]+)"', m.group(0))
        if not poster:
            return ""
        return f'<img class="hero-video" src="{poster.group(1)}" alt="" />'
    html = re.sub(r"<video\b.*?</video>", do_video, html, flags=re.S)

    # Drop srcset/sizes entirely and inline the plain src, downscaled. Keeping
    # both would embed every image twice.
    html = re.sub(r'\s*srcset="[^"]*"', "", html)
    html = re.sub(r'\s*sizes="[^"]*"', "", html)

    def do_src(m):
        nonlocal inlined, total
        attr, ref = m.group(1), m.group(2)
        p = resolve(ref, base)
        if not p:
            return m.group(0)
        got = data_uri(p)
        if not got:
            return m.group(0)
        inlined += 1
        total += got[1]
        return f'{attr}="{got[0]}"'
    html = re.sub(r'\b(src)="([^"]+)"', do_src, html)

    # background-image: url('...') in inline styles
    def do_url(m):
        nonlocal inlined, total
        p = resolve(m.group(1), base)
        got = data_uri(p) if p else None
        if not got:
            return m.group(0)
        inlined += 1
        total += got[1]
        return f"url('{got[0]}')"
    html = re.sub(r"url\('([^']+)'\)", do_url, html)

    banner = (
        '<div style="position:fixed;bottom:0;left:0;right:0;z-index:999;'
        'background:#e8b14c;color:#0b1220;font:600 12px/1.4 -apple-system,sans-serif;'
        'letter-spacing:.08em;text-transform:uppercase;text-align:center;padding:7px 12px">'
        'Preview bundle &middot; video shown as still &middot; links inert</div>'
    )

    open(out, "w").write(f"<style>\n{css}\n</style>\n{html}\n{banner}\n<script>\n{js}\n</script>\n")
    print(f"inlined {inlined} assets ({total/1024:.0f} KB source)")
    print(f"bundle: {os.path.getsize(out)/1024:.0f} KB -> {out}")


if __name__ == "__main__":
    main()
