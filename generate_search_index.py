#!/usr/bin/env python3
"""
generate_search_index.py - build search-index.json for the site-wide search box.

WHAT THIS DOES
--------------
Reads every source of truth for pages on the site:

  - seo-conversion-registry.json   (every SEO conversion page + category
                                     landing page the other generators have
                                     produced - this is already the registry
                                     that drives sitemap.xml, so it is a
                                     complete list of generated URLs)
  - NAV_CATEGORIES in app.js       (the 27 top-level category landing pages)
  - a small fixed list of guide / calculator / static pages that live as
    real .html files in this folder

...and writes a single flat search-index.json containing one record per
searchable page:

    {
      "title":    "Square Feet to Square Meters",
      "slug":     "square-feet-to-square-meters",
      "url":      "/square-feet-to-square-meters/",
      "category": "Area",
      "from":     "square foot",
      "to":       "square meter",
      "aliases":  ["sq ft", "ft2", "square feet", "square metre", "m2", ...],
      "keywords": ["area", "square foot", "square meter", "conversion", ...]
    }

This file is loaded once by app.js and searched entirely client-side, so it
needs to be complete and it needs to be regenerated any time the registry
(or the static page list) changes.

USAGE
-----
    python3 generate_search_index.py

This is also invoked automatically by build.py on every build, and it is
safe/cheap to run repeatedly (fully idempotent, no external state).
"""

from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent
REGISTRY_PATH = ROOT / "seo-conversion-registry.json"
OUTPUT_PATH = ROOT / "search-index.json"

# ---------------------------------------------------------------------------
# Category id -> display name (mirrors NAV_CATEGORIES in app.js). Keeping
# this list here means every category landing page is always searchable
# even for categories that don't yet have SEO conversion sub-pages in the
# registry.
# ---------------------------------------------------------------------------
NAV_CATEGORIES = [
    ("length", "Length"),
    ("area", "Area"),
    ("volume", "Volume"),
    ("weight", "Weight"),
    ("temperature", "Temperature"),
    ("time", "Time"),
    ("speed", "Speed"),
    ("pressure", "Pressure"),
    ("power", "Power"),
    ("energy", "Energy"),
    ("electricity", "Electricity"),
    ("frequency", "Frequency"),
    ("angle", "Angle"),
    ("digital", "Digital storage"),
    ("currency", "Currency"),
    ("density", "Density"),
    ("flow-rate", "Flow Rate"),
    ("agriculture", "Agriculture"),
    ("astronomy", "Astronomy"),
    ("chemistry", "Chemistry"),
    ("cooking", "Cooking"),
    ("engineering", "Engineering"),
    ("force", "Force"),
    ("fuel-economy", "Fuel Economy"),
    ("radiation", "Radiation"),
    ("scientific", "Scientific"),
    ("torque", "Torque"),
]

# Fixed list of real, hand-authored pages that aren't part of the generated
# conversion registry but must still be in the global search index. Add to
# this list whenever a new guide/calculator/static page is created.
STATIC_PAGES = [
    {"title": "Universal Converter - Home", "slug": "home", "url": "/", "category": "Home",
     "keywords": ["home", "unit converter", "universal converter"]},
    {"title": "Unit Converter", "slug": "unit-converter", "url": "/unit-converter.html", "category": "Tools",
     "keywords": ["unit converter", "convert units"]},
    {"title": "Online Calculator", "slug": "online-calculator", "url": "/online-calculator.html", "category": "Tools",
     "keywords": ["calculator", "online calculator"]},
    {"title": "Length Converter", "slug": "length-converter", "url": "/length-converter.html", "category": "Length",
     "keywords": ["length", "distance", "converter"]},
    {"title": "Weight Converter", "slug": "weight-converter", "url": "/weight-converter.html", "category": "Weight",
     "keywords": ["weight", "mass", "converter"]},
    {"title": "Temperature Converter", "slug": "temperature-converter", "url": "/temperature-converter.html", "category": "Temperature",
     "keywords": ["temperature", "celsius", "fahrenheit", "kelvin", "converter"]},
    {"title": "Currency & Measurement Converter", "slug": "currency-measurement-converter", "url": "/currency-measurement-converter.html", "category": "Currency",
     "keywords": ["currency", "exchange rate", "measurement"]},
    {"title": "Guides", "slug": "guides", "url": "/guides.html", "category": "Guides",
     "keywords": ["guides", "articles", "how to"]},
    {"title": "Celsius vs Fahrenheit", "slug": "celsius-vs-fahrenheit", "url": "/celsius-vs-fahrenheit.html", "category": "Guides",
     "keywords": ["temperature", "celsius", "fahrenheit", "guide"]},
    {"title": "Metric vs Imperial", "slug": "metric-vs-imperial", "url": "/metric-vs-imperial.html", "category": "Guides",
     "keywords": ["metric", "imperial", "units", "guide"]},
    {"title": "Digital Storage Units Guide", "slug": "digital-storage-units-guide", "url": "/digital-storage-units-guide.html", "category": "Guides",
     "keywords": ["digital storage", "bytes", "bits", "guide"]},
    {"title": "Pressure Units Guide", "slug": "pressure-units-guide", "url": "/pressure-units-guide.html", "category": "Guides",
     "keywords": ["pressure", "psi", "bar", "pascal", "guide"]},
    {"title": "Acre vs Hectare", "slug": "acre-vs-hectare", "url": "/acre-vs-hectare.html", "category": "Guides",
     "keywords": ["acre", "hectare", "area", "land", "guide"]},
    {"title": "What Is a Kilometer", "slug": "what-is-a-kilometer", "url": "/what-is-a-kilometer.html", "category": "Guides",
     "keywords": ["kilometer", "km", "length", "guide"]},
    {"title": "References", "slug": "references", "url": "/references.html", "category": "About",
     "keywords": ["references", "sources"]},
    {"title": "About", "slug": "about", "url": "/about.html", "category": "About",
     "keywords": ["about"]},
    {"title": "Contact", "slug": "contact", "url": "/contact.html", "category": "About",
     "keywords": ["contact", "support"]},
    {"title": "Sitemap", "slug": "sitemap", "url": "/sitemap.html", "category": "About",
     "keywords": ["sitemap"]},
]

# Small hand-maintained symbol/alias table for the units people actually
# search by symbol or abbreviation. Anything not listed here still gets a
# generated set of aliases (see `humanize` / `aliases_for_unit` below), this
# table just adds the well-known short forms on top.
UNIT_SYMBOL_ALIASES: dict[str, list[str]] = {
    "meter": ["m", "metre", "meters", "metres"],
    "kilometer": ["km", "kilometre", "kilometres"],
    "centimeter": ["cm", "centimetre", "centimetres"],
    "millimeter": ["mm", "millimetre", "millimetres"],
    "foot": ["ft", "feet"],
    "inch": ["in", "inches", '"'],
    "yard": ["yd", "yards"],
    "mile": ["mi", "miles"],
    "nautical_mile": ["nmi", "nautical miles"],
    "gram": ["g", "grams", "gramme"],
    "kilogram": ["kg", "kilograms", "kilo"],
    "milligram": ["mg", "milligrams"],
    "pound": ["lb", "lbs", "pounds"],
    "ounce": ["oz", "ounces"],
    "tonne": ["t", "metric ton", "metric tonne", "tonnes"],
    "liter": ["l", "litre", "liters", "litres"],
    "milliliter": ["ml", "millilitre"],
    "gallon_us": ["gal", "us gallon", "gallons"],
    "gallon_imperial": ["imp gal", "imperial gallon"],
    "celsius": ["c", "\u00b0c", "centigrade"],
    "fahrenheit": ["f", "\u00b0f"],
    "kelvin": ["k", "\u00b0k"],
    "pascal": ["pa"],
    "bar": ["bar"],
    "psi": ["psi", "lb/in2", "pounds per square inch"],
    "square_foot": ["sq ft", "ft2", "ft\u00b2", "square feet"],
    "square_meter": ["sq m", "m2", "m\u00b2", "square metre", "square metres"],
    "square_inch": ["sq in", "in2", "in\u00b2", "square inches"],
    "square_yard": ["sq yd", "yd2", "yd\u00b2", "square yards"],
    "square_mile": ["sq mi", "mi2", "mi\u00b2", "square miles"],
    "square_kilometer": ["sq km", "km2", "km\u00b2", "square kilometre", "square kilometres"],
    "acre": ["ac", "acres"],
    "hectare": ["ha", "hectares"],
    "byte": ["b"],
    "kilobyte": ["kb"],
    "megabyte": ["mb"],
    "gigabyte": ["gb"],
    "terabyte": ["tb"],
    "watt": ["w", "watts"],
    "kilowatt": ["kw", "kilowatts"],
    "horsepower_mechanical": ["hp", "horsepower"],
    "hertz": ["hz"],
    "volt": ["v", "volts"],
    "ampere": ["a", "amp", "amps"],
    "ohm": ["ohm", "\u03a9"],
    "newton": ["n"],
    "joule": ["j"],
    "calorie": ["cal", "calories"],
    "second": ["s", "sec", "seconds"],
    "minute": ["min", "minutes"],
    "hour": ["h", "hr", "hours"],
}

WORD_SPLIT_RE = re.compile(r"[_\-]+")
NON_ALNUM_RE = re.compile(r"[^a-z0-9]+")


def humanize(unit_id: str) -> str:
    """'square_foot' -> 'square foot', 'gallon_us' -> 'gallon us'."""
    if not unit_id:
        return ""
    words = WORD_SPLIT_RE.split(unit_id.strip().lower())
    return " ".join(w for w in words if w)


def title_case(text: str) -> str:
    return " ".join(w[:1].upper() + w[1:] for w in text.split(" ") if w)


def aliases_for_unit(unit_id: str) -> list[str]:
    if not unit_id:
        return []
    human = humanize(unit_id)
    out = {human}
    out.update(UNIT_SYMBOL_ALIASES.get(unit_id, []))
    # square_x / cubic_x get a generated "sq x" / "cu x" + superscript form
    if unit_id.startswith("square_"):
        rest = humanize(unit_id[len("square_"):])
        out.add(f"sq {rest}")
    elif unit_id.startswith("cubic_"):
        rest = humanize(unit_id[len("cubic_"):])
        out.add(f"cu {rest}")
        out.add(f"cubic {rest}")
    # British spelling variants
    if "meter" in human:
        out.add(human.replace("meter", "metre"))
    if "liter" in human:
        out.add(human.replace("liter", "litre"))
    return sorted(a for a in out if a)


def slugify_key(key: str) -> str:
    return key.strip("/") or "home"


def url_for_key(key: str) -> str:
    key = key.strip("/")
    if not key or key == "index.html":
        return "/"
    return f"/{key}/"


def clean_title(raw_title: str, from_id: str, to_id: str, category: str) -> str:
    """Prefer a clean 'X to Y' title built from the unit ids (matches the
    ranking/display format requested for the dropdown); fall back to the
    registry's own title with boilerplate suffixes stripped."""
    if from_id and to_id:
        return f"{title_case(humanize(from_id))} to {title_case(humanize(to_id))}"
    title = (raw_title or "").strip()
    title = re.sub(r"\s*\|\s*Universal Converter\s*$", "", title)
    title = re.sub(r"\s*Converter\s*$", "", title)
    if not title and category:
        title = title_case(category)
    return title or title_case(category or "Universal Converter")


def build_records_from_registry(registry: dict) -> dict[str, dict]:
    records: dict[str, dict] = {}
    for key, entry in registry.items():
        if not isinstance(entry, dict):
            continue
        slug = slugify_key(key)
        url = url_for_key(key)
        if url in records:
            continue  # registry can map multiple legacy keys to one URL

        category_raw = str(entry.get("category") or "").strip()
        from_id = str(entry.get("fromUnitId") or "").strip()
        to_id = str(entry.get("toUnitId") or "").strip()

        if category_raw.lower() == "universal converter":
            # This is a category landing page (key == the category id) or
            # the homepage itself.
            cat_slug = key.strip("/")
            display_category = title_case(cat_slug.replace("-", " ")) if cat_slug else "Home"
            title = clean_title(entry.get("title", ""), "", "", display_category)
            aliases = [display_category.lower()]
            keywords = [display_category.lower(), "category", "conversions"]
        else:
            display_category = title_case(category_raw.replace("_", " ")) if category_raw else ""
            title = clean_title(entry.get("title", ""), from_id, to_id, display_category)
            from_human = humanize(from_id)
            to_human = humanize(to_id)
            aliases = sorted(set(aliases_for_unit(from_id) + aliases_for_unit(to_id)))
            keywords = sorted(set(filter(None, [
                display_category.lower(),
                from_human,
                to_human,
                "conversion",
                "converter",
            ])))

        records[url] = {
            "title": title,
            "slug": slug,
            "url": url,
            "category": display_category or "General",
            "from": humanize(from_id),
            "to": humanize(to_id),
            "aliases": aliases,
            "keywords": keywords,
        }
    return records


def build_category_records() -> dict[str, dict]:
    records = {}
    for cat_id, display_name in NAV_CATEGORIES:
        url = f"/{cat_id}/"
        records[url] = {
            "title": display_name,
            "slug": cat_id,
            "url": url,
            "category": display_name,
            "from": "",
            "to": "",
            "aliases": [display_name.lower()],
            "keywords": [display_name.lower(), "category", "conversions", "unit converter"],
        }
    return records


def build_static_records() -> dict[str, dict]:
    records = {}
    for page in STATIC_PAGES:
        record = {
            "title": page["title"],
            "slug": page["slug"],
            "url": page["url"],
            "category": page["category"],
            "from": "",
            "to": "",
            "aliases": [page["title"].lower()],
            "keywords": page.get("keywords", []),
        }
        records[page["url"]] = record
    return records


def main() -> None:
    registry = {}
    if REGISTRY_PATH.exists():
        registry = json.loads(REGISTRY_PATH.read_text(encoding="utf-8"))

    merged: dict[str, dict] = {}
    # Order matters only for which record "wins" a URL collision; static
    # pages and category pages are hand-curated so they take priority over
    # anything auto-derived from the registry.
    merged.update(build_records_from_registry(registry))
    merged.update(build_category_records())
    merged.update(build_static_records())

    index = sorted(merged.values(), key=lambda r: r["url"])

    OUTPUT_PATH.write_text(
        json.dumps(index, ensure_ascii=False, separators=(",", ":")),
        encoding="utf-8",
    )
    print(f"Wrote {len(index)} record(s) to {OUTPUT_PATH.name}")


if __name__ == "__main__":
    main()
