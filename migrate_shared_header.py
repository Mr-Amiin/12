#!/usr/bin/env python3
"""
Migrates every HTML page on the site to the shared, single-source-of-truth
navigation header.

Why this exists
----------------
The homepage's header was hand-updated to support the new mobile drawer
accordion, but the Category Landing Page and SEO Conversion Page templates
were never touched, so they kept whatever nav markup they were generated
with (in some cases a much older layout with no hamburger drawer at all -
see generate-conversion-pages.ps1's old `$conversion` template). Because
this is a fully static site (no server-side includes), every page carries
its OWN copy of the header HTML, and those copies drift out of sync over
time as different generator scripts (and manual edits) touch them
independently.

The fix is to stop duplicating header markup in HTML at all. app.js now
has a single `renderSiteHeader()` function that is the only place the
header's real markup (hamburger button, brand/logo, desktop nav,
Categories dropdown, theme toggle) is defined - the same way
`renderMobileDrawer()` already is the single source of truth for the
drawer contents. Every page just needs to ship an empty placeholder:

    <header class="site-header" id="siteHeader"></header>
    <div class="mobile-drawer-overlay" id="mobileDrawerOverlay" hidden></div>
    <nav class="mobile-drawer" id="mobileDrawer" aria-hidden="true" aria-label="Mobile navigation"></nav>

This script finds the old, fully-spelled-out header block (whatever shape
it happens to be in on a given page - the current homepage version, the
length-converter.html version, or the bare-bones PowerShell-generated
version) on every *.html file under the site root and replaces it with
that placeholder. It is idempotent: pages that are already migrated are
left untouched, and pages the pattern doesn't match are reported instead
of silently skipped, so nothing is corrupted by a partial match.

Usage
-----
    python3 migrate_shared_header.py /path/to/site/root
    python3 migrate_shared_header.py /path/to/site/root --dry-run

Run with --dry-run first on a real site checkout and read the report
before committing to the in-place rewrite.
"""
import argparse
import re
import sys
from pathlib import Path

PLACEHOLDER = (
    '<header class="site-header" id="siteHeader"></header>\n'
    '<div class="mobile-drawer-overlay" id="mobileDrawerOverlay" hidden></div>'
    '<nav class="mobile-drawer" id="mobileDrawer" aria-hidden="true" '
    'aria-label="Mobile navigation"></nav>'
)

# Matches the old <header class="site-header">...</header> block (any
# internal shape - homepage version, category-page version, or the bare
# PowerShell-generated version all match this), plus, if present
# immediately after it, the old mobile-drawer-overlay/mobile-drawer pair
# and/or the legacy .category-dropdown-container leftover. Whitespace
# between pieces is tolerated since different generators format
# differently (CRLF vs LF, indentation, etc.).
HEADER_BLOCK_RE = re.compile(
    r'<header\s+class="site-header"[^>]*>.*?</header>'
    r'(?:\s*<div\s+class="mobile-drawer-overlay"[^>]*>.*?</div>)?'
    r'(?:\s*<nav\s+class="mobile-drawer"[^>]*>.*?</nav>)?'
    r'(?:\s*<div\s+class="category-dropdown-container"[^>]*>.*?</div>)?',
    re.IGNORECASE | re.DOTALL,
)

# A page is considered "already migrated" if its header is exactly (modulo
# whitespace) the empty placeholder already - re-running the script is then
# a no-op for it.
ALREADY_MIGRATED_RE = re.compile(
    r'<header\s+class="site-header"\s+id="siteHeader"\s*>\s*</header>',
    re.IGNORECASE | re.DOTALL,
)


def ensure_asset_links(html: str, filename: str) -> str:
    """Make sure styles.css and app.js are linked with a root-relative
    path, so migrated pages keep working regardless of folder depth. Only
    adds them if genuinely missing; never touches an existing correct
    link."""
    if 'app.js' not in html:
        html = html.replace(
            '</head>',
            '  <script src="/app.js" defer></script>\n</head>',
            1,
        )
    if 'styles.css' not in html:
        html = html.replace(
            '</head>',
            '  <link rel="stylesheet" href="/styles.css">\n</head>',
            1,
        )
    return html


def migrate_file(path: Path, dry_run: bool) -> str:
    """Returns one of: 'migrated', 'already-ok', 'no-match'."""
    original = path.read_text(encoding="utf-8", errors="strict")

    if ALREADY_MIGRATED_RE.search(original):
        return "already-ok"

    new_html, count = HEADER_BLOCK_RE.subn(PLACEHOLDER, original, count=1)
    if count == 0:
        return "no-match"

    new_html = ensure_asset_links(new_html, path.name)

    if not dry_run:
        path.write_text(new_html, encoding="utf-8")
    return "migrated"


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("root", help="Path to the site root directory")
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Report what would change without writing any files",
    )
    args = parser.parse_args()

    root = Path(args.root)
    if not root.is_dir():
        print(f"Not a directory: {root}", file=sys.stderr)
        return 1

    html_files = sorted(root.rglob("*.html"))
    if not html_files:
        print(f"No .html files found under {root}", file=sys.stderr)
        return 1

    results = {"migrated": [], "already-ok": [], "no-match": []}
    for path in html_files:
        try:
            status = migrate_file(path, args.dry_run)
        except Exception as exc:  # noqa: BLE001 - report and keep going
            print(f"ERROR reading/writing {path}: {exc}", file=sys.stderr)
            status = "no-match"
        results[status].append(path)

    print(f"Scanned {len(html_files)} HTML files under {root}")
    print(f"  {'Would migrate' if args.dry_run else 'Migrated'}: {len(results['migrated'])}")
    print(f"  Already on shared header: {len(results['already-ok'])}")
    print(f"  No header match (needs manual review): {len(results['no-match'])}")

    if results["no-match"]:
        print("\nFiles that did NOT match the expected header pattern:")
        for p in results["no-match"]:
            print(f"  - {p.relative_to(root)}")
        print(
            "\nThese were left untouched. Inspect them by hand - they may "
            "use a header shape this script doesn't recognize yet, or may "
            "not have a header at all."
        )

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
