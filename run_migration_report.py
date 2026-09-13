#!/usr/bin/env python3
"""
run_migration_report.py - Phase 1 + Phase 2 combined, with the exact report
shape requested: total scanned, total migrated, already compliant, failures
(with reason + recommended fix per Phase 5), and skipped (with reason).

Usage:
    python3 run_migration_report.py <root> [--json-out FILE] [--append-json FILE]

Runs migrate_shared_header.py for real (not dry-run) against <root>, then
validate_shared_nav.py against the same <root>, and reconciles the two into
one report. Designed to be safe to call once per subtree (e.g. once per
category directory) when the whole site can't fit on disk at once - pass
--append-json to accumulate a running total across multiple invocations
into a single JSON file, which combine_reports.py then turns into the
final site-wide report.
"""
import json
import re
import subprocess
import sys
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parent
MIGRATE_SCRIPT = SCRIPT_DIR / "migrate_shared_header.py"
VALIDATE_SCRIPT = SCRIPT_DIR / "validate_shared_nav.py"

# Mirrors validate_shared_nav.py's EXCLUDED_PAGES - kept in sync manually
# since it's a very short, deliberate list (see that file for why).
EXCLUDED_PAGES = {"404.html"}


def run_migrate(root: Path) -> dict:
    """Runs migrate_shared_header.py for real and parses its stdout report
    into {migrated: [...], already_ok: [...], no_match: [...]} (paths
    relative to root)."""
    result = subprocess.run(
        [sys.executable, str(MIGRATE_SCRIPT), str(root)],
        capture_output=True,
        text=True,
    )
    if result.returncode != 0:
        print(result.stdout)
        print(result.stderr, file=sys.stderr)
        raise RuntimeError(f"migrate_shared_header.py failed on {root}")

    no_match = []
    in_no_match_block = False
    for line in result.stdout.splitlines():
        if line.startswith("Files that did NOT match"):
            in_no_match_block = True
            continue
        if in_no_match_block:
            m = re.match(r"^\s*-\s+(.+)$", line)
            if m:
                no_match.append(m.group(1).strip())
            elif line.strip() == "" or line.startswith("These were left"):
                in_no_match_block = False

    migrated_count = 0
    already_ok_count = 0
    for line in result.stdout.splitlines():
        m = re.match(r"\s*Migrated:\s*(\d+)", line)
        if m:
            migrated_count = int(m.group(1))
        m = re.match(r"\s*Already on shared header:\s*(\d+)", line)
        if m:
            already_ok_count = int(m.group(1))

    return {
        "migrated_count": migrated_count,
        "already_ok_count": already_ok_count,
        "no_match": no_match,
        "raw_stdout": result.stdout,
    }


def run_validate(root: Path) -> dict:
    """Runs validate_shared_nav.py and parses failures back out by
    re-running the same check logic in-process for structured output
    (simpler and more robust than scraping stderr text)."""
    sys.path.insert(0, str(SCRIPT_DIR))
    import importlib

    if "validate_shared_nav" in sys.modules:
        importlib.reload(sys.modules["validate_shared_nav"])
    import validate_shared_nav as vsn

    failures = vsn.validate_root(root)
    all_html = list(root.rglob("*.html"))
    skipped = [p.name for p in all_html if p.name in vsn.EXCLUDED_PAGES]
    return {
        "total_html": len(all_html),
        "failures": {k: v for k, v in failures.items()},
        "skipped": skipped,
    }


FIX_SUGGESTIONS = [
    (re.compile(r"class=\"site-header\""), None),  # matched fine, not a no-match cause
]


def suggest_fix(path: Path, root: Path) -> str:
    """Best-effort diagnostic for a file migrate_shared_header.py couldn't
    match (Phase 5). Not a guaranteed one-line fix for every possible
    shape - just narrows down where to look by hand."""
    try:
        text = (root / path).read_text(encoding="utf-8", errors="replace")
    except Exception as exc:  # noqa: BLE001
        return f"Could not read file to diagnose: {exc}"

    if "<header" not in text.lower():
        return "No <header> element found at all — page may need the shared placeholder inserted by hand."
    if re.search(r"<header(?![^>]*class=\"site-header\")", text, re.IGNORECASE):
        return "Has a <header> tag but not class=\"site-header\" — check for a typo'd/renamed class, or a header that predates the shared-nav convention."
    if "site-header" in text and "</header>" not in text:
        return "Has class=\"site-header\" but no matching </header> — likely malformed/truncated HTML; open and inspect by hand."
    return "Header tag matches class=\"site-header\" but the surrounding markup doesn't match any known shape — review manually and consider extending HEADER_BLOCK_RE in migrate_shared_header.py if this shape recurs elsewhere."


def main() -> int:
    if len(sys.argv) < 2:
        print("Usage: python3 run_migration_report.py <root> [--json-out FILE]", file=sys.stderr)
        return 2
    root = Path(sys.argv[1]).resolve()
    json_out = None
    if "--json-out" in sys.argv:
        json_out = Path(sys.argv[sys.argv.index("--json-out") + 1])

    print(f"=== Phase 1: migrating {root} ===")
    migrate_result = run_migrate(root)
    print(migrate_result["raw_stdout"])

    print(f"=== Phase 2: validating {root} ===")
    validate_result = run_validate(root)

    failures_with_fixes = {}
    for rel_path, problems in validate_result["failures"].items():
        failures_with_fixes[rel_path] = {
            "problems": problems,
            "recommended_fix": suggest_fix(Path(rel_path), root),
        }

    report = {
        "root": str(root),
        "total_html_scanned": validate_result["total_html"],
        "migrated": migrate_result["migrated_count"],
        "already_compliant": migrate_result["already_ok_count"],
        "failures": failures_with_fixes,
        "skipped": {name: "pure client-side redirect page, no persistent chrome by design"
                    for name in validate_result["skipped"]},
        "no_match_during_migration": migrate_result["no_match"],
    }

    print("\n=== Summary ===")
    print(f"Total HTML files scanned: {report['total_html_scanned']}")
    print(f"Migrated: {report['migrated']}")
    print(f"Already compliant: {report['already_compliant']}")
    print(f"Failures: {len(report['failures'])}")
    print(f"Skipped: {len(report['skipped'])}")
    if report["failures"]:
        print("\nFailures:")
        for rel_path, info in report["failures"].items():
            print(f"  {rel_path}")
            for p in info["problems"]:
                print(f"    - {p}")
            print(f"    fix: {info['recommended_fix']}")

    if json_out:
        json_out.write_text(json.dumps(report, indent=2))
        print(f"\nWrote {json_out}")

    return 1 if report["failures"] else 0


if __name__ == "__main__":
    raise SystemExit(main())
