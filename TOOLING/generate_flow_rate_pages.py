#!/usr/bin/env python3
"""
Flow-rate-only SEO page generator.

This script does NOT duplicate or hand-edit any HTML. It reuses the shared
generator (generate_seo_pages_from_sitemap.py) and the shared template
(templates/kg-to-lbs-template.html) for all rendering. It only:

  1. Reads the real sitemap.xml to find every /flow-rate/ URL.
  2. Loads the true flow-rate unit catalog (extracted directly from the
     live app.js converter via Node, see extract_flow_units.js /
     flow_units_catalog.json) so units, symbols, and factors used on the
     generated pages are identical to the live converter.
  3. Matches each sitemap slug to its real from/to unit ids.
  4. Registers flow-specific "related conversions" and "about" text
     generators (context-aware, using only real existing sitemap pairs
     for links) without touching the behavior of any other category.
  5. Calls the shared generate_pages()/render_page() pipeline, restricted
     to flow-rate URLs only, so no other category or site file is
     touched.

No other file in the repository is modified by this script.
"""
import json
import re
import sys
import xml.etree.ElementTree as ET
from collections import defaultdict
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parent
sys.path.insert(0, str(ROOT))

import generate_seo_pages_from_sitemap as gm  # the shared, untouched generator


class _CachedTemplatePath:
    """Wraps the real template Path so its (unchanged) content is read from
    disk once instead of once per generated page. Pure performance shim —
    does not alter template content, only how many times it's read."""

    def __init__(self, real_path: Path):
        self._real_path = real_path
        self._cache = None

    def exists(self):
        return self._real_path.exists()

    def read_text(self, encoding="utf-8"):
        if self._cache is None:
            self._cache = self._real_path.read_text(encoding=encoding)
        return self._cache

    def __getattr__(self, name):
        return getattr(self._real_path, name)


gm.TEMPLATE_PATH = _CachedTemplatePath(gm.TEMPLATE_PATH)

FLOW_CATALOG_PATH = ROOT / "flow-rate-unit-catalog.json"
REPORT_PATH = ROOT / "flow-rate-generation-report.json"


def load_flow_catalog():
    with FLOW_CATALOG_PATH.open("r", encoding="utf-8") as fh:
        return json.load(fh)


def get_sitemap_flow_urls():
    urls = gm.get_sitemap_paths(gm.SITEMAP_PATH)
    flow_urls = []
    for u in urls:
        # Fast path check without a full urlparse() per URL (394k+ URLs total).
        idx = u.find("://")
        rest = u[idx + 3:] if idx != -1 else u
        slash = rest.find("/")
        path = rest[slash:] if slash != -1 else "/"
        if path == "/flow-rate/" or path.startswith("/flow-rate/"):
            flow_urls.append(u)
    return flow_urls


def match_pairs(slugs, slug_to_id):
    """Match each 'a-to-b' slug to a real (from_id, to_id) pair."""
    matched = {}
    skipped = []
    for s in slugs:
        positions = [m.start() for m in re.finditer("-to-", s)]
        candidates = []
        for pos in positions:
            left, right = s[:pos], s[pos + 4:]
            if left in slug_to_id and right in slug_to_id:
                candidates.append((slug_to_id[left], slug_to_id[right]))
        if len(candidates) == 1:
            matched[s] = candidates[0]
        elif len(candidates) > 1:
            skipped.append({"slug": s, "reason": "ambiguous slug (multiple valid unit-pair splits)"})
        else:
            skipped.append({"slug": s, "reason": "no matching unit pair found in live converter catalog"})
    return matched, skipped


def split_top_bottom(name: str):
    """Split a compound flow-unit display name like 'Liter per Second' into (top, bottom)."""
    parts = re.split(r"\s+per\s+", name, maxsplit=1, flags=re.IGNORECASE)
    if len(parts) == 2:
        return parts[0].strip(), parts[1].strip()
    return name, ""


def singularize(word: str) -> str:
    if word.endswith("ies") and len(word) > 3:
        return word[:-3] + "y"
    if word.endswith("s") and not word.endswith("ss"):
        return word[:-1]
    return word


def build_flow_related_links(forward_index, backward_index, from_info, to_info, current_slug):
    from_id, to_id = from_info["id"], to_info["id"]
    links = []
    seen_slugs = {current_slug}

    # Reverse conversion first (explicit reverse-conversion link).
    if to_id in forward_index and from_id in forward_index[to_id]:
        rev_slug = f"{to_id.replace('_', '-')}-to-{from_id.replace('_', '-')}"
        if rev_slug not in seen_slugs:
            links.append((f"{to_info['name']} to {from_info['name']} (reverse)", f"/flow-rate/{rev_slug}/"))
            seen_slugs.add(rev_slug)

    # A few alternate targets from the same source unit.
    for other_to in sorted(forward_index.get(from_id, ())):
        if other_to == to_id:
            continue
        alt_slug = f"{from_id.replace('_', '-')}-to-{other_to.replace('_', '-')}"
        if alt_slug in seen_slugs:
            continue
        other_info = gm.get_unit_info(other_to)
        links.append((f"{from_info['name']} to {other_info['name']}", f"/flow-rate/{alt_slug}/"))
        seen_slugs.add(alt_slug)
        if len(links) >= 4:
            break

    # A couple of alternate sources into the same target unit.
    if len(links) < 6:
        for other_from in sorted(backward_index.get(to_id, ())):
            if other_from == from_id:
                continue
            alt_slug = f"{other_from.replace('_', '-')}-to-{to_id.replace('_', '-')}"
            if alt_slug in seen_slugs:
                continue
            other_info = gm.get_unit_info(other_from)
            links.append((f"{other_info['name']} to {to_info['name']}", f"/flow-rate/{alt_slug}/"))
            seen_slugs.add(alt_slug)
            if len(links) >= 6:
                break

    return links


def build_flow_about_text(from_info, to_info):
    from_top, from_bottom = split_top_bottom(from_info["name"])
    to_top, to_bottom = split_top_bottom(to_info["name"])
    factor = float(from_info["factor"]) / float(to_info["factor"])
    from_bottom_s = singularize(from_bottom).lower() or "time interval"
    to_bottom_s = singularize(to_bottom).lower() or "time interval"
    return (
        f"This flow rate page converts {from_info['name']} ({from_info['symbol']}) to "
        f"{to_info['name']} ({to_info['symbol']}) using the exact volumetric flow rate factor "
        f"from the Universal Converter engine. A flow of one {from_top.lower()} every {from_bottom_s} "
        f"is the same physical flow as {gm.format_factor(factor)} {to_top.lower()}(s) every {to_bottom_s}, "
        f"so this page is useful for pipeline sizing, pump and pipe selection, HVAC airflow and liquid "
        f"handling, irrigation and water-supply planning, and lab or industrial process calculations that mix "
        f"metric, US customary, or imperial flow units."
    )


def build_flow_faqs(from_info, to_info, formula):
    factor = float(from_info["factor"]) / float(to_info["factor"])
    reverse_factor = float(to_info["factor"]) / float(from_info["factor"])
    from_top, from_bottom = split_top_bottom(from_info["name"])
    to_top, to_bottom = split_top_bottom(to_info["name"])
    return [
        (
            f"How do you convert {from_info['name']} to {to_info['name']}?",
            f"Multiply the {from_info['name']} value by {gm.format_factor(factor)} to get {to_info['name']}. "
            f"The formula is {formula}.",
        ),
        (
            f"How many {to_info['name']} are in one {from_info['name']}?",
            f"One {from_info['name']} equals {gm.format_factor(factor)} {to_info['name']}.",
        ),
        (
            f"Can I convert {to_info['name']} back to {from_info['name']}?",
            f"Yes. Divide the {to_info['name']} value by {gm.format_factor(factor)}, or multiply by "
            f"{gm.format_factor(reverse_factor)}, to get {from_info['name']}.",
        ),
        (
            f"When would I use a {singularize(from_bottom).lower() or from_info['name'].lower()}-based flow unit like {from_info['name']}?",
            f"{from_info['name']} expresses volume moved per {singularize(from_bottom).lower() or 'time interval'}, which is "
            f"common in engineering, industrial, and utility contexts where flow is measured or billed over that "
            f"time period.",
        ),
    ]


def main():
    overwrite = "--skip-existing" not in sys.argv

    flow_catalog = load_flow_catalog()
    gm.UNIT_CATALOG.update(flow_catalog)
    gm.CATEGORY_LABELS.setdefault("flow-rate", "Flow Rate")

    slug_to_id = {uid.replace("_", "-"): uid for uid in flow_catalog}

    sitemap_flow_urls = get_sitemap_flow_urls()
    total_sitemap_flow_urls = len(sitemap_flow_urls)

    import os
    limit = os.environ.get("FLOW_LIMIT")
    if limit:
        sitemap_flow_urls = sitemap_flow_urls[: int(limit)]

    conversion_slugs = []
    has_category_root = False
    for u in sitemap_flow_urls:
        path = urlparse(u).path.strip("/")
        if path == "flow-rate":
            has_category_root = True
            continue
        slug = path.split("/", 1)[1] if "/" in path else ""
        conversion_slugs.append(slug)

    matched, skipped = match_pairs(conversion_slugs, slug_to_id)

    forward_index = defaultdict(set)
    backward_index = defaultdict(set)
    for (from_id, to_id) in matched.values():
        forward_index[from_id].add(to_id)
        backward_index[to_id].add(from_id)

    # ---- Build the registry entries the shared generator will render. ----
    flow_registry = {}
    for slug, (from_id, to_id) in matched.items():
        from_info = gm.get_unit_info(from_id)
        to_info = gm.get_unit_info(to_id)
        registry_key = f"flow-rate/{slug}"
        flow_registry[registry_key] = {
            "slug": slug,
            "path": f"/flow-rate/{slug}/",
            "category": "flow-rate",
            "fromUnitId": from_id,
            "toUnitId": to_id,
            "title": f"{from_info['name']} to {to_info['name']} Flow Rate Converter",
            "description": (
                f"Convert {from_info['name']} ({from_info['symbol']}) to {to_info['name']} "
                f"({to_info['symbol']}) instantly with exact volumetric flow rate factors."
            ),
            "value": "1",
        }

    if has_category_root:
        flow_registry["flow-rate"] = {
            "slug": "flow-rate",
            "path": "/flow-rate/",
            "category": "flow-rate",
            "fromUnitId": "",
            "toUnitId": "",
            "title": "Flow Rate Converter",
            "description": "Convert volumetric flow rates across metric, US, imperial, industrial, and scientific units.",
            "value": "1",
        }

    # ---- Monkeypatch: inject our registry entries (isolated, in-memory). ----
    original_load_registry = gm.load_registry

    def patched_load_registry():
        reg = original_load_registry()
        reg.update(flow_registry)
        return reg

    gm.load_registry = patched_load_registry

    # ---- Monkeypatch: flow-aware related links / about text / FAQs. ----
    original_build_related_links = gm.build_related_links
    original_build_about_text = gm.build_about_text
    original_build_faqs = gm.build_faqs

    def patched_build_related_links(from_info, to_info, current_slug):
        if from_info.get("category") == "flow" and to_info.get("category") == "flow":
            return build_flow_related_links(forward_index, backward_index, from_info, to_info, current_slug)
        return original_build_related_links(from_info, to_info, current_slug)

    def patched_build_about_text(from_info, to_info, category):
        if category == "flow-rate":
            return build_flow_about_text(from_info, to_info)
        return original_build_about_text(from_info, to_info, category)

    def patched_build_faqs(from_info, to_info, formula):
        if from_info.get("category") == "flow" and to_info.get("category") == "flow":
            return build_flow_faqs(from_info, to_info, formula)
        return original_build_faqs(from_info, to_info, formula)

    gm.build_related_links = patched_build_related_links
    gm.build_about_text = patched_build_about_text
    gm.build_faqs = patched_build_faqs

    generated = gm.generate_pages(sitemap_flow_urls, gm.ROOT, overwrite=overwrite)

    report = {
        "total_flow_rate_urls_in_sitemap": total_sitemap_flow_urls,
        "total_flow_rate_pages_generated": generated,
        "category_root_generated": has_category_root,
        "matched_conversion_pairs": len(matched),
        "skipped_pages": skipped,
        "skipped_count": len(skipped),
        "errors": [],
    }
    with REPORT_PATH.open("w", encoding="utf-8") as fh:
        json.dump(report, fh, indent=2)

    print(json.dumps(report, indent=2)[:2000])


if __name__ == "__main__":
    main()
