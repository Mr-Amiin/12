#!/usr/bin/env python3
"""
validate_shared_nav.py - regression guard for the shared-navigation migration.

WHY THIS EXISTS
----------------
migrate_shared_header.py did the one-time cleanup of collapsing every page's
own copy of the header/drawer markup down to the shared placeholder that
app.js's renderSiteHeader() / renderMobileDrawer() fill in at runtime. That
migration is only worth anything if it *stays* true - i.e. if no future hand
edit or generator script (generate_conversion_pages.py,
generate_seo_pages_from_sitemap.py, generate_flow_rate_pages.py,
generate-conversion-pages.ps1, generate_new_pages.py, or anything written
after this file) can silently reintroduce a hardcoded header/nav/drawer.

This script is that guard. It is meant to be called from build.py (see the
"0. Validating shared navigation ..." step there) so a broken page fails the
build instead of shipping. It can also be run standalone in CI or by hand:

    python3 validate_shared_nav.py .
    python3 validate_shared_nav.py dist

WHAT COUNTS AS A FAILURE
-------------------------
For every *.html file under the given root (except EXCLUDED_PAGES below):
  1. It must contain the three shared placeholder elements, unmodified:
       <header ... id="siteHeader"></header>            (EMPTY)
       <div ... id="mobileDrawerOverlay" ...></div>
       <nav ... id="mobileDrawer" ...></nav>
  2. It must NOT contain any legacy/duplicated markup that
     migrate_shared_header.py's HEADER_BLOCK_RE was written to catch:
     a fully spelled-out <header class="site-header">...content...</header>,
     a hand-authored .mobile-drawer with its own <li> markup, or a leftover
     .category-dropdown-container from the pre-accordion nav.
  3. #siteHeader and #mobileDrawer must be genuinely EMPTY in the source
     HTML. app.js populates them at runtime - if a page ships them
     pre-filled, that page has its own copy of the nav again (drifted, or
     never migrated), defeating the entire point of the shared renderer.

EXCLUDED_PAGES is intentionally a short, named, commented list - not a
pattern - so nothing can be silently exempted by accident.
"""
import re
import sys
from pathlib import Path

# Pages that legitimately ship with no site header/drawer at all, and why.
# Keep this list short; anything added to it should be able to justify
# itself in one line, the same way 404.html can below.
EXCLUDED_PAGES = {
    # Pure client-side redirect page (see the inline <script> in 404.html):
    # it shows a one-line fallback message and location.replace()s within
    # 800ms. It intentionally has no persistent chrome to migrate.
    "404.html",
}

PLACEHOLDER_HEADER_RE = re.compile(
    r'<header\s+class="site-header"\s+id="siteHeader"\s*>\s*</header>',
    re.IGNORECASE | re.DOTALL,
)
PLACEHOLDER_OVERLAY_RE = re.compile(
    r'<div\s+class="mobile-drawer-overlay"\s+id="mobileDrawerOverlay"[^>]*>\s*</div>',
    re.IGNORECASE | re.DOTALL,
)
PLACEHOLDER_DRAWER_RE = re.compile(
    r'<nav\s+class="mobile-drawer"\s+id="mobileDrawer"[^>]*>\s*</nav>',
    re.IGNORECASE | re.DOTALL,
)

# Same shape migrate_shared_header.py's HEADER_BLOCK_RE looks for, minus
# the "already migrated" empty case - i.e. this only matches a header that
# still has real content inside it, or a hand-authored drawer/category
# leftover sitting where the placeholder should be.
LEGACY_HEADER_RE = re.compile(
    r'<header\s+class="site-header"[^>]*>(?!\s*</header>).*?</header>',
    re.IGNORECASE | re.DOTALL,
)
LEGACY_DRAWER_RE = re.compile(
    r'<nav\s+class="mobile-drawer"[^>]*>(?!\s*</nav>).*?</nav>',
    re.IGNORECASE | re.DOTALL,
)
LEGACY_CATEGORY_DROPDOWN_RE = re.compile(
    r'<div\s+class="category-dropdown-container"[^>]*>.*?</div>',
    re.IGNORECASE | re.DOTALL,
)


def validate_file(path: Path) -> list:
    """Returns a list of human-readable problem strings for this file
    (empty list = clean)."""
    html = path.read_text(encoding="utf-8", errors="strict")
    problems = []

    if LEGACY_HEADER_RE.search(html):
        problems.append(
            "still has a fully spelled-out <header class=\"site-header\"> "
            "with content inside it (legacy per-page header, should be the "
            "empty #siteHeader placeholder filled by app.js at runtime)"
        )
    if LEGACY_DRAWER_RE.search(html):
        problems.append(
            "still has a hand-authored <nav class=\"mobile-drawer\"> with "
            "content inside it (should be the empty #mobileDrawer "
            "placeholder filled by app.js at runtime)"
        )
    if LEGACY_CATEGORY_DROPDOWN_RE.search(html):
        problems.append(
            "still has a leftover .category-dropdown-container from the "
            "pre-accordion nav"
        )

    if not PLACEHOLDER_HEADER_RE.search(html):
        problems.append(
            'missing (or non-empty) <header class="site-header" '
            'id="siteHeader"></header> placeholder'
        )
    if not PLACEHOLDER_OVERLAY_RE.search(html):
        problems.append(
            'missing (or non-empty) <div class="mobile-drawer-overlay" '
            'id="mobileDrawerOverlay" ...></div> placeholder'
        )
    if not PLACEHOLDER_DRAWER_RE.search(html):
        problems.append(
            'missing (or non-empty) <nav class="mobile-drawer" '
            'id="mobileDrawer" ...></nav> placeholder'
        )

    return problems


def validate_root(root: Path) -> dict:
    """Returns {relative_path: [problem, ...]} for every page that failed.
    Empty dict = whole site clean."""
    failures = {}
    for path in sorted(root.rglob("*.html")):
        if path.name in EXCLUDED_PAGES:
            continue
        try:
            problems = validate_file(path)
        except Exception as exc:  # noqa: BLE001 - report and keep going
            problems = [f"ERROR reading file: {exc}"]
        if problems:
            failures[str(path.relative_to(root))] = problems
    return failures


def main() -> int:
    if len(sys.argv) != 2:
        print("Usage: python3 validate_shared_nav.py <site-root>", file=sys.stderr)
        return 2
    root = Path(sys.argv[1])
    if not root.is_dir():
        print(f"Not a directory: {root}", file=sys.stderr)
        return 2

    html_files = list(root.rglob("*.html"))
    if not html_files:
        print(f"No .html files found under {root}", file=sys.stderr)
        return 2

    failures = validate_root(root)
    scanned = len(html_files) - len(EXCLUDED_PAGES & {p.name for p in html_files})

    if failures:
        print(
            f"✗ Shared-navigation validation FAILED: {len(failures)} of "
            f"{len(html_files)} page(s) still carry legacy navigation "
            f"markup instead of the shared placeholder:\n",
            file=sys.stderr,
        )
        for rel_path, problems in failures.items():
            print(f"  {rel_path}", file=sys.stderr)
            for problem in problems:
                print(f"    - {problem}", file=sys.stderr)
        print(
            f"\nRun migrate_shared_header.py against these pages, or check "
            f"the generator that produced them for hardcoded nav markup.",
            file=sys.stderr,
        )
        return 1

    print(
        f"✓ Shared-navigation validation passed: {scanned} page(s) all use "
        f"the shared #siteHeader / #mobileDrawer placeholder "
        f"({len(EXCLUDED_PAGES)} intentionally excluded: "
        f"{', '.join(sorted(EXCLUDED_PAGES))})"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
