#!/usr/bin/env python3
"""
Remove the hero advertisement placeholder ("leaderboard" ad band) from every
generated SEO conversion page, site-wide.

What this targets:
    <section class="ad-band adsense-placeholder" data-ad-placement="leaderboard" ...>
        ...
    </section>
This block appears immediately after the hero section
(<section class="hero seo-top" ...>) and before the converter section on
every SEO conversion page. It is removed completely -- including its
surrounding blank line -- so the converter section moves up directly below
the hero with no leftover gap, spacer, or empty container.

What this does NOT touch:
    - The homepage (index.html), which uses a different hero
      (class="hero", no "seo-top") and different ad bands
      (data-ad-placement="header" / "content"), so it never matches the
      pattern above.
    - Any other ad placement: converter, sidebar, content-top,
      content-middle, content-bottom.
    - Layout, CSS, JS, breadcrumbs, hero copy, converter, formulas, tables,
      FAQs, related conversions, footer, schema, or SEO metadata.

Usage:
    python3 remove_hero_ad_band.py [root_dir]

If root_dir is omitted, the site directory containing this script is used.
Safe to re-run: files that no longer contain the pattern are left untouched.
"""
import re
import sys
from pathlib import Path

HERO_AD_PATTERN = re.compile(
    r'\n?[ \t]*<section class="ad-band adsense-placeholder" '
    r'data-ad-placement="leaderboard"[^>]*>.*?</section>\n?',
    re.DOTALL,
)


def main() -> None:
    root = Path(sys.argv[1]) if len(sys.argv) > 1 else Path(__file__).resolve().parent

    changed = []
    unexpected = []

    for path in root.rglob("*.html"):
        text = path.read_text(encoding="utf-8")
        if 'data-ad-placement="leaderboard"' not in text:
            continue

        new_text, n = HERO_AD_PATTERN.subn("", text)
        if n == 0:
            unexpected.append(path)
            continue
        if n > 1:
            print(f"WARNING: multiple hero ad blocks matched in {path} ({n})")

        path.write_text(new_text, encoding="utf-8")
        changed.append(path)

    print(f"Removed hero ad band from {len(changed)} SEO page(s).")
    if unexpected:
        print(f"{len(unexpected)} file(s) referenced the placement but did not "
              f"match the expected block shape -- review manually:")
        for p in unexpected[:20]:
            print(f"  {p}")


if __name__ == "__main__":
    main()
