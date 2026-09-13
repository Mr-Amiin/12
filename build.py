#!/usr/bin/env python3
"""
build.py - automatic cache-busting build step for a static site.

WHAT THIS DOES
--------------
Run this once before every deploy (or let Netlify run it automatically -
see netlify.toml). It never modifies any file in this source directory.
Instead it produces a ready-to-publish copy of the whole site in ./dist
where the cache-sensitive JS/CSS assets have been renamed to include a
hash of their own content, e.g.:

    styles.css          ->  styles.91ab3fcd12.css
    app.js               ->  app.4f82c1a9de.js

Every reference to those files is rewritten automatically, everywhere they
appear:
    - every *.html page (href=, src=)
    - service-worker.js (the offline precache list + its own CACHE_NAME,
      which is re-derived from the new asset hashes so the browser's
      service-worker cache is also invalidated on every deploy)
    - _headers (the six exact-path Cache-Control rules are regenerated to
      point at the new hashed filenames)

Because the filename itself changes whenever the file's contents change,
it is safe to cache these files "forever":

    Cache-Control: public, max-age=31536000, immutable

A browser holding an old cached copy of "app.4f82c1a9de.js" will simply
never be asked for that URL again once you ship new content under
"app.<new-hash>.js" - there is nothing to go stale, so there is no need
to ever shorten the cache lifetime or add revalidation.

USAGE
-----
    python3 build.py

Then deploy the generated ./dist directory (Netlify does this
automatically for you - see netlify.toml in this same folder).

No arguments, no manual version numbers, nothing to remember between
deploys. Re-running this script always regenerates dist/ from scratch
from the source files, so it is fully idempotent.
"""

import hashlib
import json
import re
import shutil
import subprocess
import sys
import time
from pathlib import Path

SOURCE_DIR = Path(__file__).resolve().parent
DIST_DIR = SOURCE_DIR / "dist"
SEARCH_INDEX_GENERATOR = SOURCE_DIR / "generate_search_index.py"

# The six files that get a content hash baked into their filename.
VERSIONED_ASSETS = [
    "app.js",
    "styles.css",
    "adsense.js",
    "adsense-config.js",
    "analytics-config.js",
    "google-analytics.js",
]

# Not part of the deployed site - just this build script and VCS/build
# housekeeping. Everything else in the source directory is mirrored into
# dist untouched (including the dev/report scripts already in this repo),
# so this build step changes nothing about the deployed site other than
# the six versioned assets and the references to them.
EXCLUDE_NAMES = {"dist", ".git", "build.py"}

HASH_LEN = 10  # 10 hex chars of sha256 is ample to avoid collisions here


def content_hash(path: Path) -> str:
    h = hashlib.sha256()
    h.update(path.read_bytes())
    return h.hexdigest()[:HASH_LEN]


def hashed_name(original_name: str, digest: str) -> str:
    stem, ext = original_name.rsplit(".", 1)
    return f"{stem}.{digest}.{ext}"


def copy_source_to_dist():
    if DIST_DIR.exists():
        shutil.rmtree(DIST_DIR)
    DIST_DIR.mkdir(parents=True)
    for item in SOURCE_DIR.iterdir():
        if item.name in EXCLUDE_NAMES:
            continue
        dest = DIST_DIR / item.name
        if item.is_dir():
            shutil.copytree(item, dest)
        else:
            shutil.copy2(item, dest)


def rename_versioned_assets() -> dict:
    """Hash + rename each target asset inside dist. Returns a mapping of
    old filename -> new (hashed) filename."""
    mapping = {}
    for name in VERSIONED_ASSETS:
        src = DIST_DIR / name
        if not src.exists():
            print(f"  ! WARNING: {name} not found, skipping", file=sys.stderr)
            continue
        digest = content_hash(src)
        new_name = hashed_name(name, digest)
        src.rename(DIST_DIR / new_name)
        mapping[name] = new_name
        print(f"  {name}  ->  {new_name}")
    return mapping


def rewrite_references(mapping: dict):
    """Rewrite every reference to the old asset filenames in every
    HTML page and in service-worker.js. Only whole-filename matches
    immediately after a '/' or quote, and immediately before a quote or
    '?', are touched - so this can never clip an unrelated substring.

    Returns (changed_files, total_substitutions):
        changed_files       - list of relative paths that were modified
        total_substitutions - total number of individual references
                              rewritten across all files (not just the
                              count of files touched)
    """
    if not mapping:
        return [], 0
    text_suffixes = {".html", ".js"}
    changed_files = []
    total_substitutions = 0
    for path in DIST_DIR.rglob("*"):
        if not path.is_file() or path.suffix not in text_suffixes:
            continue
        try:
            text = path.read_text(encoding="utf-8")
        except (UnicodeDecodeError, ValueError):
            continue
        original = text
        file_substitutions = 0
        for old_name, new_name in mapping.items():
            pattern = re.compile(r'(?<=[/"\'])' + re.escape(old_name) + r'(?=["\'\?])')
            text, count = pattern.subn(new_name, text)
            file_substitutions += count
        if text != original:
            path.write_text(text, encoding="utf-8")
            changed_files.append(str(path.relative_to(DIST_DIR)))
            total_substitutions += file_substitutions
    return changed_files, total_substitutions


def rewrite_headers_file(mapping: dict) -> bool:
    """Regenerate the exact-path Cache-Control rules in _headers for the
    new hashed filenames (the old plain-name rules are removed since
    those paths no longer exist once the files are renamed).

    Returns True if _headers exists and every rule was found and updated.
    """
    headers_path = DIST_DIR / "_headers"
    if not headers_path.exists() or not mapping:
        return False
    text = headers_path.read_text(encoding="utf-8")

    # Replace just the "/oldname" path line of each rule in place, leaving
    # its Cache-Control line(s) and the surrounding blank-line spacing/
    # comments exactly where they already were.
    all_found = True
    for old_name, new_name in mapping.items():
        pattern = re.compile(r"^/" + re.escape(old_name) + r"$", re.MULTILINE)
        text, count = pattern.subn(f"/{new_name}", text, count=1)
        if not count:
            print(f"  ! WARNING: no _headers rule found for {old_name}", file=sys.stderr)
            all_found = False

    headers_path.write_text(text, encoding="utf-8")
    return all_found


def update_service_worker_cache_name(mapping: dict) -> bool:
    """Re-derive the service worker's own CACHE_NAME from the new asset
    hashes, so its precache storage is automatically invalidated on every
    deploy too - no manual version bump needed there either.

    Returns True if service-worker.js exists and was updated.
    """
    sw_path = DIST_DIR / "service-worker.js"
    if not sw_path.exists() or not mapping:
        return False
    text = sw_path.read_text(encoding="utf-8")
    build_fingerprint = hashlib.sha256("".join(sorted(mapping.values())).encode("utf-8")).hexdigest()[:HASH_LEN]
    text, count = re.subn(
        r'const CACHE_NAME = "[^"]*";',
        f'const CACHE_NAME = "universal-converter-{build_fingerprint}";',
        text,
        count=1,
    )
    if count:
        sw_path.write_text(text, encoding="utf-8")
        return True
    return False


def write_manifest(mapping: dict):
    (DIST_DIR / "asset-manifest.json").write_text(json.dumps(mapping, indent=2) + "\n", encoding="utf-8")


# Extensions that make up the actually-published site. Anything else that
# happens to sit in the repo (.py, .ps1, .md, .log, ...) is dev tooling or
# documentation, never served/parsed as part of the live site, so it's
# excluded from validation by construction - not by guessing at comments.
VALIDATE_SUFFIXES = {".html", ".js", ".css", ".json", ".xml", ".webmanifest"}

# The manifest is expected (and supposed) to contain the plain old names -
# that's its entire job, mapping old -> new.
VALIDATE_IGNORE_NAMES = {"asset-manifest.json"}


def validate_dist(mapping: dict) -> list:
    """Recursively scan the built dist/ output for any remaining reference
    to an unversioned (plain) asset filename. Only files that are actually
    part of the published site are scanned (see VALIDATE_SUFFIXES); dev
    scripts, docs, and the manifest itself are skipped.

    Returns a list of (relative_path, line_number, old_name, line_text)
    tuples - empty if everything is clean.
    """
    if not mapping:
        return []
    problems = []
    for path in DIST_DIR.rglob("*"):
        if not path.is_file():
            continue
        if path.suffix not in VALIDATE_SUFFIXES:
            continue
        if path.name in VALIDATE_IGNORE_NAMES:
            continue
        try:
            lines = path.read_text(encoding="utf-8").splitlines()
        except (UnicodeDecodeError, ValueError):
            continue
        rel_path = path.relative_to(DIST_DIR)
        for lineno, line in enumerate(lines, start=1):
            for old_name in mapping:
                # Plain substring check is safe here: a hashed filename
                # like "app.9022f63c3c.js" never contains "app.js" as a
                # contiguous substring, so this can't false-positive on
                # the very names we just generated.
                if old_name in line:
                    problems.append((rel_path, lineno, old_name, line.strip()))
    return problems


def print_build_summary(duration, html_page_count, mapping, total_substitutions, sw_updated, headers_updated, validation_passed):
    print()
    print("Build Summary")
    print("-------------")
    print(f"Build duration: {duration:.2f} s")
    print(f"HTML pages processed: {html_page_count}")
    print(f"Assets fingerprinted: {len(mapping)}")
    print(f"References rewritten: {total_substitutions}")
    print(f"Service worker updated: {'Yes' if sw_updated else 'No'}")
    print(f"Headers updated: {'Yes' if headers_updated else 'No'}")
    print(f"Validation: {'PASSED' if validation_passed else 'FAILED'}")
    if mapping:
        print()
        print("Generated assets:")
        for new_name in mapping.values():
            print(new_name)


def regenerate_search_index():
    """Rebuild search-index.json from the current SEO conversion registry
    + static page list *before* anything is copied into dist/, so every
    build always ships a search index that matches every other generated
    page. Never hand-edited - always derived at build time."""
    if not SEARCH_INDEX_GENERATOR.exists():
        print("  ! WARNING: generate_search_index.py not found, skipping", file=sys.stderr)
        return False
    result = subprocess.run(
        [sys.executable, str(SEARCH_INDEX_GENERATOR)],
        cwd=SOURCE_DIR,
        capture_output=True,
        text=True,
    )
    if result.stdout:
        print("  " + result.stdout.strip().replace("\n", "\n  "))
    if result.returncode != 0:
        print("  ! search index generation FAILED:", file=sys.stderr)
        print(result.stderr, file=sys.stderr)
        return False
    return True


def main():
    start_time = time.perf_counter()

    print("1. Regenerating search-index.json from the SEO conversion registry ...")
    search_index_ok = regenerate_search_index()
    if not search_index_ok:
        print("\n✗ Aborting build - search index must be up to date before every deploy.", file=sys.stderr)
        sys.exit(1)

    print("2. Copying source -> dist/ ...")
    copy_source_to_dist()

    print("3. Hashing + renaming versioned assets:")
    mapping = rename_versioned_assets()

    print("4. Rewriting references in HTML pages + service-worker.js ...")
    changed, total_substitutions = rewrite_references(mapping)
    for f in changed:
        print(f"     updated {f}")

    print("5. Regenerating _headers rules for hashed filenames ...")
    headers_updated = rewrite_headers_file(mapping)

    print("6. Updating service-worker.js CACHE_NAME ...")
    sw_updated = update_service_worker_cache_name(mapping)

    print("7. Writing dist/asset-manifest.json ...")
    write_manifest(mapping)

    print(f"\nDone. {len(mapping)} asset(s) versioned, {len(changed)} file(s) updated.")

    print("\n8. Validating dist/ for leftover unversioned asset references ...")
    problems = validate_dist(mapping)

    html_page_count = sum(1 for p in DIST_DIR.rglob("*.html") if p.is_file())
    duration = time.perf_counter() - start_time

    if problems:
        print("\n✗ Asset version validation FAILED - unversioned reference(s) found:", file=sys.stderr)
        for rel_path, lineno, old_name, line in problems:
            print(f"  {rel_path}:{lineno}: still references '{old_name}'", file=sys.stderr)
            print(f"      {line}", file=sys.stderr)
        print(
            f"\n{len(problems)} problem(s) found in the published output - failing the build "
            "so this can't ship with a stale/broken asset reference.",
            file=sys.stderr,
        )
        print_build_summary(duration, html_page_count, mapping, total_substitutions, sw_updated, headers_updated, validation_passed=False)
        sys.exit(1)

    print("✓ Asset version validation passed")
    print("Deploy the dist/ directory.")

    print_build_summary(duration, html_page_count, mapping, total_substitutions, sw_updated, headers_updated, validation_passed=True)


if __name__ == "__main__":
    main()
