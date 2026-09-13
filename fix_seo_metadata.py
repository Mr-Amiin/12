#!/usr/bin/env python3
"""
Fix for SEO Page Initialization Audit findings #1 and #2:
  1. Generic/duplicate meta description, JSON-LD description, and visible
     hero paragraph ("Browse the Universal Converter for accurate,
     data-driven conversions and practical examples.") on bulk-generated
     conversion pages.
  2. Broken JSON-LD structured data: "about": {"@type": "Thing", "name": " to "}
     (empty from/to interpolation).

This script performs a content-only fix. It does NOT touch templates, CSS,
or app.js. It derives the replacement text from data that is ALREADY
correct on each page (the <title> tag and the breadcrumb category name),
so no external registry or hardcoded unit list is needed and the fix is
guaranteed to stay consistent with what the page (and the JS converter,
which independently derives the same conversion from the URL) actually
shows.
"""
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
GENERIC_DESC = "Browse the Universal Converter for accurate, data-driven conversions and practical examples."
BROKEN_ABOUT = '"about": {"@type": "Thing", "name": " to "}'

HUB_FILES = {
    "length/index.html", "area/index.html", "volume/index.html",
    "weight/index.html", "temperature/index.html", "speed/index.html",
    "pressure/index.html", "digital/index.html", "power/index.html",
}

TITLE_RE = re.compile(r"<title>(.*?)</title>", re.DOTALL)
BREADCRUMB_RE = re.compile(r'<nav class="breadcrumb".*?</nav>', re.DOTALL)
CRUMB_LINK_RE = re.compile(r'<a href="[^"]*">([^<]+)</a>')


def extract_title(html):
    m = TITLE_RE.search(html)
    return m.group(1).strip() if m else None


def extract_category(html):
    m = BREADCRUMB_RE.search(html)
    if not m:
        return None
    links = CRUMB_LINK_RE.findall(m.group(0))
    # links[0] == "Home", links[1] == category (if present)
    if len(links) >= 2:
        return links[1].strip()
    return None


def fix_file(path: Path, rel: str, stats):
    html = path.read_text(encoding="utf-8")
    original = html
    is_hub = rel in HUB_FILES

    if GENERIC_DESC in html:
        if is_hub:
            category = extract_title(html) or "unit"
            new_desc = (
                f"Browse {category} unit conversions: formulas, conversion "
                f"tables and calculators for every {category.lower()} unit."
            )
        else:
            title = extract_title(html)
            category = extract_category(html)
            if not title or not category:
                stats["skipped_missing_data"].append(rel)
                return False
            new_desc = (
                f"Convert {title} instantly. Free online {category.lower()} "
                f"unit converter with exact formula, conversion table and FAQ."
            )
        html = html.replace(GENERIC_DESC, new_desc)
        stats["desc_fixed"] += 1

    if BROKEN_ABOUT in html:
        if is_hub:
            # No single from/to concept applies to a category hub page;
            # drop the empty "about" field rather than fabricate one.
            html = html.replace(', ' + BROKEN_ABOUT, '')
            html = html.replace(BROKEN_ABOUT, '')  # in case it's first/only key
        else:
            title = extract_title(html)
            if title:
                about_name = title.lower()
                new_about = f'"about": {{"@type": "Thing", "name": "{about_name}"}}'
                html = html.replace(BROKEN_ABOUT, new_about)
        stats["about_fixed"] += 1

    if html != original:
        path.write_text(html, encoding="utf-8")
        return True
    return False


def main():
    dry_run = "--apply" not in sys.argv
    stats = {"desc_fixed": 0, "about_fixed": 0, "skipped_missing_data": [], "files_changed": 0}

    candidates = set()
    for p in ROOT.rglob("index.html"):
        if "/.git/" in str(p):
            continue
        rel = str(p.relative_to(ROOT))
        text_head = p.read_text(encoding="utf-8", errors="ignore")
        if GENERIC_DESC in text_head or BROKEN_ABOUT in text_head:
            candidates.add(p)

    print(f"Found {len(candidates)} candidate files.")

    if dry_run:
        print("DRY RUN (pass --apply to write changes). Sampling 5 candidates:")
        for p in list(candidates)[:5]:
            print(" -", p.relative_to(ROOT))
        return

    changed = 0
    for p in sorted(candidates):
        rel = str(p.relative_to(ROOT))
        if fix_file(p, rel, stats):
            changed += 1
    stats["files_changed"] = changed
    print("Done.")
    print("desc_fixed occurrences:", stats["desc_fixed"])
    print("about_fixed occurrences:", stats["about_fixed"])
    print("files_changed:", stats["files_changed"])
    print("skipped_missing_data:", len(stats["skipped_missing_data"]), stats["skipped_missing_data"][:10])


if __name__ == "__main__":
    main()
