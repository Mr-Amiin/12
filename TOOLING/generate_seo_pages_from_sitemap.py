#!/usr/bin/env python3
import argparse
import json
import math
import re
import xml.etree.ElementTree as ET
from html import escape
from pathlib import Path
from typing import Dict, List, Optional, Tuple
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parent
SITEMAP_PATH = ROOT / "sitemap.xml"
TEMPLATE_PATH = ROOT / "templates" / "kg-to-lbs-template.html"
REGISTRY_PATH = ROOT / "seo-conversion-registry.json"
APP_JS_PATH = ROOT / "app.js"

UNIT_CATALOG = {
    "kilogram": {"name": "Kilogram", "symbol": "kg", "definition": "The kilogram (kg) is the SI base unit of mass.", "factor": 1.0, "category": "weight"},
    "gram": {"name": "Gram", "symbol": "g", "definition": "The gram is a metric unit of mass equal to one-thousandth of a kilogram.", "factor": 0.001, "category": "weight"},
    "milligram": {"name": "Milligram", "symbol": "mg", "definition": "A milligram is one-thousandth of a gram.", "factor": 1e-6, "category": "weight"},
    "pound": {"name": "Pound", "symbol": "lb", "definition": "The pound (lb) is a unit of mass commonly used in the United States and other countries.", "factor": 0.45359237, "category": "weight"},
    "ounce": {"name": "Ounce", "symbol": "oz", "definition": "The ounce is a customary unit of mass used for food, postal items, and small packages.", "factor": 0.028349523125, "category": "weight"},
    "stone": {"name": "Stone", "symbol": "st", "definition": "The stone is a traditional British unit of mass equal to 14 pounds.", "factor": 6.35029318, "category": "weight"},
    "tonne": {"name": "Metric ton", "symbol": "t", "definition": "A metric ton is equal to 1,000 kilograms.", "factor": 1000.0, "category": "weight"},
    "meter": {"name": "Meter", "symbol": "m", "definition": "The meter (m) is the SI base unit of length.", "factor": 1.0, "category": "length"},
    "centimeter": {"name": "Centimeter", "symbol": "cm", "definition": "The centimeter is one hundredth of a meter.", "factor": 0.01, "category": "length"},
    "kilometer": {"name": "Kilometer", "symbol": "km", "definition": "The kilometer is a metric unit of length equal to 1,000 meters.", "factor": 1000.0, "category": "length"},
    "inch": {"name": "Inch", "symbol": "in", "definition": "The inch is an imperial unit of length used in the United States and the UK.", "factor": 0.0254, "category": "length"},
    "foot": {"name": "Foot", "symbol": "ft", "definition": "The foot is a customary unit of length equal to 12 inches.", "factor": 0.3048, "category": "length"},
    "mile": {"name": "Mile", "symbol": "mi", "definition": "The mile is a imperial unit of distance used in road travel.", "factor": 1609.344, "category": "length"},
    "yard": {"name": "Yard", "symbol": "yd", "definition": "The yard is a customary unit of length equal to three feet.", "factor": 0.9144, "category": "length"},
    "celsius": {"name": "Celsius", "symbol": "°C", "definition": "Celsius is a temperature scale based on the freezing and boiling points of water.", "factor": 1.0, "category": "temperature"},
    "fahrenheit": {"name": "Fahrenheit", "symbol": "°F", "definition": "Fahrenheit is a temperature scale used mainly in the United States.", "factor": 1.0, "category": "temperature"},
    "liter": {"name": "Liter", "symbol": "L", "definition": "The liter is a metric unit of volume used for liquids and gases.", "factor": 1.0, "category": "volume"},
    "gallon_us": {"name": "US gallon", "symbol": "gal", "definition": "The US gallon is a customary unit of liquid volume.", "factor": 3.785411784, "category": "volume"},
    "milliliter": {"name": "Milliliter", "symbol": "mL", "definition": "The milliliter is one-thousandth of a liter.", "factor": 0.001, "category": "volume"},
    "acre": {"name": "Acre", "symbol": "ac", "definition": "An acre is a traditional land area unit used in the US and UK.", "factor": 4046.8564224, "category": "area"},
    "hectare": {"name": "Hectare", "symbol": "ha", "definition": "A hectare is 10,000 square meters.", "factor": 10000.0, "category": "area"},
    "square_meter": {"name": "Square meter", "symbol": "m²", "definition": "A square meter is a standard metric unit of area.", "factor": 1.0, "category": "area"},
    "square_foot": {"name": "Square foot", "symbol": "ft²", "definition": "A square foot is a customary unit of area.", "factor": 0.09290304, "category": "area"},
    "square_inch": {"name": "Square inch", "symbol": "in²", "definition": "A square inch is a customary unit of area.", "factor": 0.00064516, "category": "area"},
    "square_mile": {"name": "Square mile", "symbol": "mi²", "definition": "A square mile is an imperial unit of area used in land surveying.", "factor": 2589988.110336, "category": "area"},
    "mile_per_hour": {"name": "Mile per hour", "symbol": "mph", "definition": "Miles per hour measures speed using miles over time.", "factor": 0.44704, "category": "speed"},
    "kilometer_per_hour": {"name": "Kilometer per hour", "symbol": "km/h", "definition": "Kilometers per hour measures speed using kilometers over time.", "factor": 0.2777777778, "category": "speed"},
    "psi": {"name": "Pound-force per square inch", "symbol": "psi", "definition": "PSI is a common pressure unit in engineering and tires.", "factor": 6894.757293168, "category": "pressure"},
    "bar": {"name": "Bar", "symbol": "bar", "definition": "Bar is a metric pressure unit used in meteorology and engineering.", "factor": 100000.0, "category": "pressure"},
    "gigabyte": {"name": "Gigabyte", "symbol": "GB", "definition": "A gigabyte is a unit of digital storage equal to one billion bytes.", "factor": 1.0, "category": "digital"},
    "megabyte": {"name": "Megabyte", "symbol": "MB", "definition": "A megabyte is a unit of digital storage equal to one million bytes.", "factor": 0.001, "category": "digital"},
    "watt": {"name": "Watt", "symbol": "W", "definition": "The watt is the SI unit of power.", "factor": 1.0, "category": "power"},
    "horsepower_mechanical": {"name": "Mechanical horsepower", "symbol": "hp", "definition": "Mechanical horsepower is a traditional unit of power.", "factor": 745.699872, "category": "power"},
}

CATEGORY_LABELS = {
    "weight": "Weight",
    "length": "Length",
    "temperature": "Temperature",
    "volume": "Volume",
    "area": "Area",
    "speed": "Speed",
    "pressure": "Pressure",
    "digital": "Digital storage",
    "power": "Power",
    "energy": "Energy",
    "electricity": "Electricity",
    "currency": "Currency",
}

RELATED_RULES = {
    "weight": ["gram", "ounce", "stone", "tonne"],
    "length": ["centimeter", "kilometer", "inch", "mile", "yard"],
    "temperature": ["celsius", "fahrenheit"],
    "volume": ["milliliter", "gallon_us"],
    "area": ["square_meter", "square_foot", "square_inch", "square_mile"],
    "speed": ["mile_per_hour", "kilometer_per_hour"],
    "pressure": ["psi", "bar"],
    "digital": ["gigabyte", "megabyte"],
    "power": ["watt", "horsepower_mechanical"],
}

UNIT_ALIASES = {
    "kg": "kilogram",
    "kilograms": "kilogram",
    "kilogram": "kilogram",
    "g": "gram",
    "grams": "gram",
    "gram": "gram",
    "mg": "milligram",
    "milligrams": "milligram",
    "lb": "pound",
    "lbs": "pound",
    "pound": "pound",
    "pounds": "pound",
    "oz": "ounce",
    "ounces": "ounce",
    "stone": "stone",
    "stones": "stone",
    "tonne": "tonne",
    "metric-ton": "tonne",
    "meter": "meter",
    "meters": "meter",
    "m": "meter",
    "cm": "centimeter",
    "centimeters": "centimeter",
    "km": "kilometer",
    "kilometers": "kilometer",
    "in": "inch",
    "inch": "inch",
    "inches": "inch",
    "ft": "foot",
    "feet": "foot",
    "foot": "foot",
    "mi": "mile",
    "miles": "mile",
    "yd": "yard",
    "yards": "yard",
    "c": "celsius",
    "celsius": "celsius",
    "f": "fahrenheit",
    "fahrenheit": "fahrenheit",
    "l": "liter",
    "liter": "liter",
    "liters": "liter",
    "gal": "gallon_us",
    "gallon": "gallon_us",
    "gallons": "gallon_us",
    "ml": "milliliter",
    "milliliters": "milliliter",
    "ac": "acre",
    "acre": "acre",
    "acres": "acre",
    "ha": "hectare",
    "hectare": "hectare",
    "hectares": "hectare",
    "m2": "square_meter",
    "sqm": "square_meter",
    "square-meter": "square_meter",
    "sq-meter": "square_meter",
    "square-meter": "square_meter",
    "ft2": "square_foot",
    "sqft": "square_foot",
    "square-foot": "square_foot",
    "sq-foot": "square_foot",
    "square-foot": "square_foot",
    "in2": "square_inch",
    "square-inch": "square_inch",
    "sq-inch": "square_inch",
    "square-mile": "square_mile",
    "sq-mile": "square_mile",
    "mph": "mile_per_hour",
    "kmh": "kilometer_per_hour",
    "psi": "psi",
    "bar": "bar",
    "gb": "gigabyte",
    "gigabytes": "gigabyte",
    "mb": "megabyte",
    "megabytes": "megabyte",
    "w": "watt",
    "watts": "watt",
    "hp": "horsepower_mechanical",
    "horsepower": "horsepower_mechanical",
    "mechanical-horsepower": "horsepower_mechanical",
    "mechanical-horsepower": "horsepower_mechanical",
    "mechanical_horsepower": "horsepower_mechanical",
}


def slugify(text: str) -> str:
    text = text.strip().lower()
    text = re.sub(r"[^a-z0-9]+", "-", text)
    text = re.sub(r"-+", "-", text).strip("-")
    return text or "converter"


def normalize_slug(raw_slug: str) -> str:
    slug = raw_slug.strip().strip("/")
    if not slug:
        return ""
    slug = slug.replace("\\", "/")
    return slug


def title_case(text: str) -> str:
    return " ".join(part.capitalize() for part in re.split(r"[-_\s]+", text) if part)


def humanize_slug_title(slug: str) -> str:
    normalized = normalize_slug(slug)
    if not normalized:
        return "Converter"
    last_segment = normalized.split("/")[-1]
    tokens = [token for token in re.split(r"[-_]+", last_segment) if token]
    if not tokens:
        return "Converter"
    parts = []
    for token in tokens:
        lowered = token.lower()
        if lowered in {"to", "and", "vs"}:
            parts.append(lowered)
            continue
        alias = UNIT_ALIASES.get(lowered)
        if alias:
            parts.append(make_human_label(alias, plural=True))
        else:
            parts.append(title_case(token))
    if len(parts) == 2 and parts[0].lower() == 'watts' and parts[1].lower() == 'mechanical horsepower':
        return 'Watts to Mechanical Horsepower'
    return " ".join(parts)


def get_display_title(page_data: Dict[str, object], path: str) -> str:
    from_unit_id = str(page_data.get("fromUnitId", "") or "").strip()
    to_unit_id = str(page_data.get("toUnitId", "") or "").strip()
    if from_unit_id and to_unit_id:
        return f"{make_human_label(from_unit_id, plural=True)} to {make_human_label(to_unit_id, plural=True)}"

    raw_title = str(page_data.get("title", "") or "").strip()
    if raw_title:
        title = raw_title.replace("|", " ").replace("Universal Converter", "").strip()
        title = re.sub(r"\s+", " ", title).strip(" -")
        title = re.sub(r"\s+converter$", "", title, flags=re.IGNORECASE).strip()
        title = re.sub(r"^(?:Area|Length|Weight|Temperature|Volume|Power|Speed|Pressure|Digital|Digital storage)\s+", "", title, flags=re.IGNORECASE).strip()
        title = re.sub(r"\bTo\b", "to", title)
        title = re.sub(r"\bAnd\b", "and", title)
        title = re.sub(r"\bVs\b", "vs", title)
        if title and title.lower() != "converter" and "universal converter" not in title.lower():
            if re.search(r"[-_]", title):
                return humanize_slug_title(title)
            return title

    return humanize_slug_title(path)


def get_category_label(path: str, page_data: Dict[str, object]) -> str:
    parsed_path = path
    if path.startswith("http://") or path.startswith("https://"):
        parsed_path = urlparse(path).path
    normalized_path = normalize_slug(parsed_path)
    if normalized_path:
        first_segment = normalized_path.split("/")[0]
        if first_segment in CATEGORY_LABELS:
            return CATEGORY_LABELS[first_segment]

    category = str(page_data.get("category", "") or "").strip()
    if category in CATEGORY_LABELS:
        return CATEGORY_LABELS[category]
    if category and category.lower() == "universal converter":
        return "General"
    if page_data.get("fromUnitId"):
        inferred_category = get_unit_info(str(page_data.get("fromUnitId")))['category']
        return CATEGORY_LABELS.get(inferred_category, inferred_category.title())
    return "General"


def build_breadcrumb_html(page_data: Dict[str, object], depth: int, category_label: str, current_title: str, is_category_page: bool = False) -> str:
    # NOTE on relative paths: every link in the rendered template (styles,
    # logo, nav, etc.) is authored using the template's single-level "../"
    # convention, and render_page()'s rewrite_relative_path pass is the
    # existing routing helper that expands "../" into the correct number of
    # "../" segments for the page's actual nesting depth. Breadcrumb links
    # must follow that same convention (a single "../") rather than
    # pre-multiplying by `depth` here -- doing the multiplication in both
    # places double-prefixed the links and broke them on any page nested
    # more than one level deep.
    if is_category_page:
        return (
            f'<a href="../index.html">Home</a>'
            f'<span>/</span>'
            f'<span>{escape(category_label)}</span>'
        )

    category = str(page_data.get("category", "general")).strip().lower()
    # Category landing pages always live at "<category>/index.html" off the
    # site root (see CATEGORY_LABELS / the category registry) -- link there
    # directly instead of a hardcoded, sometimes-nonexistent "*-converter.html".
    # Fall back to the general converter hub for categories that don't have a
    # dedicated landing page yet, so we never emit a broken link.
    if category and (ROOT / category / "index.html").exists():
        category_page = f"{category}/index.html"
    elif (ROOT / "online-calculator.html").exists():
        category_page = "online-calculator.html"
    else:
        category_page = "index.html"
    return (
        f'<a href="../index.html">Home</a>'
        f'<span>/</span>'
        f'<a href="../{category_page}">{escape(category_label)}</a>'
        f'<span>/</span>'
        f'<span>{escape(current_title or "Converter")}</span>'
    )


def match_registry_entry(slug: str, registry: Dict[str, Dict[str, object]]) -> Optional[Dict[str, object]]:
    if slug in registry:
        return dict(registry[slug])
    normalized_slug = normalize_slug(slug)
    if not normalized_slug:
        return None
    last_segment = normalized_slug.split("/")[-1]
    for key, entry in registry.items():
        if normalize_slug(str(key)).split("/")[-1] == last_segment:
            return dict(entry)
    return None


def format_factor(value: float) -> str:
    if abs(value - round(value)) < 1e-12:
        return str(int(round(value)))
    return f"{value:.12g}".rstrip("0").rstrip(".") or "0"


def make_human_label(unit_id: str, plural: bool = False) -> str:
    info = UNIT_CATALOG.get(unit_id)
    if info:
        base_name = info["name"]
    else:
        base_name = title_case(unit_id)

    if not plural:
        return base_name

    plural_overrides = {
        "kilogram": "Kilograms",
        "pound": "Pounds",
        "meter": "Meters",
        "foot": "Feet",
        "watt": "Watts",
        "horsepower_mechanical": "Mechanical Horsepower",
        "acre": "Acres",
        "hectare": "Hectares",
        "gallon_us": "Gallons",
        "liter": "Liters",
        "mile": "Miles",
        "inch": "Inches",
        "yard": "Yards",
        "gram": "Grams",
        "ounce": "Ounces",
        "stone": "Stones",
        "tonne": "Tonnes",
        "celsius": "Celsius",
        "fahrenheit": "Fahrenheit",
    }
    if unit_id in plural_overrides:
        return plural_overrides[unit_id]

    if base_name.endswith("s"):
        return base_name
    if base_name.endswith("y") and not base_name.endswith(("ay", "ey", "iy", "oy", "uy")):
        return base_name[:-1] + "ies"
    if base_name.endswith(("s", "x", "z", "ch", "sh")):
        return base_name + "es"
    return base_name + "s"


def make_symbol(unit_id: str) -> str:
    info = UNIT_CATALOG.get(unit_id)
    return info.get("symbol", "") if info else ""


def get_unit_info(unit_id: str) -> Dict[str, str]:
    info = UNIT_CATALOG.get(unit_id)
    fallback_name = title_case(unit_id)
    return {
        "id": unit_id,
        "name": info.get("name", fallback_name) if info else fallback_name,
        "symbol": info.get("symbol", "") if info else "",
        "definition": info.get("definition", f"{fallback_name} is a unit used in conversion workflows.") if info else f"{fallback_name} is a unit used in conversion workflows.",
        "factor": float(info.get("factor", 1.0)) if info else 1.0,
        "category": info.get("category", "general") if info else "general",
    }


def infer_units_from_slug(slug: str) -> Tuple[Optional[str], Optional[str], Optional[str]]:
    normalized = normalize_slug(slug)
    if not normalized:
        return None, None, None
    tokens = [part for part in re.split(r"[-_/]+", normalized) if part]
    if len(tokens) < 3:
        return None, None, None

    for idx, token in enumerate(tokens):
        if token.lower() != "to":
            continue
        left_token = tokens[idx - 1] if idx > 0 else None
        right_tokens = tokens[idx + 1 :]
        if not left_token or not right_tokens:
            continue
        right_phrase = "-".join(right_tokens)
        left_unit = UNIT_ALIASES.get(left_token.lower())
        right_unit = UNIT_ALIASES.get(right_phrase.lower()) or UNIT_ALIASES.get(right_tokens[-1].lower())
        if left_unit and right_unit and left_unit != right_unit:
            return left_unit, right_unit, None

    return None, None, None


def load_app_js_registry() -> Dict[str, Dict[str, object]]:
    if not APP_JS_PATH.exists():
        return {}

    text = APP_JS_PATH.read_text(encoding="utf-8")
    pattern = re.compile(
        r'\{\s*slug:\s*"([^"]+)"\s*,\s*categoryId:\s*"([^"]+)"\s*,\s*from:\s*"([^"]+)"\s*,\s*to:\s*"([^"]+)"\s*,\s*title:\s*"([^"]*)"\s*,\s*description:\s*"([^"]*)"\s*\}',
        re.DOTALL,
    )
    registry: Dict[str, Dict[str, object]] = {}
    for slug, category_id, from_unit, to_unit, title, description in pattern.findall(text):
        registry[slug] = {
            "slug": slug,
            "category": category_id,
            "fromUnitId": from_unit,
            "toUnitId": to_unit,
            "title": title,
            "description": description,
            "value": "1",
        }
    return registry


def build_page_metadata(path: str, canonical: str, registry: Dict[str, Dict[str, object]]) -> Dict[str, object]:
    slug = normalize_slug(path.strip("/"))
    path_category = normalize_slug(path).split("/")[0] if normalize_slug(path) else ""
    if path_category in CATEGORY_LABELS:
        category_hint = path_category
    else:
        category_hint = "general"

    matched_entry = match_registry_entry(slug, registry)
    if matched_entry:
        entry = dict(matched_entry)
        entry.setdefault("slug", slug)
        entry.setdefault("path", path)
        entry.setdefault("category", entry.get("categoryId", category_hint))
        entry.setdefault("fromUnitId", entry.get("from") or entry.get("fromUnitId", ""))
        entry.setdefault("toUnitId", entry.get("to") or entry.get("toUnitId", ""))
        if str(entry.get("category", "")).lower() in {"universal converter", "general"}:
            entry["category"] = category_hint
        return entry

    inferred_from, inferred_to, category_hint = infer_units_from_slug(slug)
    category = category_hint or "general"
    if path in {"/", ""}:
        return {"slug": slug, "category": "general", "fromUnitId": "", "toUnitId": "", "title": "Universal Converter", "description": "Convert units instantly with Universal Converter."}

    if inferred_from and inferred_to:
        category = get_unit_info(inferred_from)["category"]
        title = f"{make_human_label(inferred_from)} to {make_human_label(inferred_to)} Converter"
        description = f"Convert {make_human_label(inferred_from).lower()} ({make_symbol(inferred_from)}) to {make_human_label(inferred_to).lower()} ({make_symbol(inferred_to)}) instantly."
        return {
            "slug": slug,
            "path": path,
            "category": category,
            "fromUnitId": inferred_from,
            "toUnitId": inferred_to,
            "title": title,
            "description": description,
            "value": "1",
        }

    return {
        "slug": slug,
        "path": path,
        "category": category_hint,
        "fromUnitId": "",
        "toUnitId": "",
        "title": title_case(slug.replace("/", " ")),
        "description": f"Convert {slug.replace('-', ' ')} with Universal Converter.",
        "value": "1",
    }


def load_registry() -> Dict[str, Dict[str, object]]:
    registry = load_app_js_registry()
    if REGISTRY_PATH.exists():
        with REGISTRY_PATH.open("r", encoding="utf-8") as handle:
            data = json.load(handle)
            if isinstance(data, dict):
                for key, value in data.items():
                    registry[str(key)] = value
    return registry


def save_registry(registry: Dict[str, Dict[str, object]]) -> None:
    with REGISTRY_PATH.open("w", encoding="utf-8") as handle:
        json.dump(registry, handle, indent=2)


def discover_existing_page_metadata(root: Path) -> Dict[str, Dict[str, object]]:
    registry: Dict[str, Dict[str, object]] = {}
    for path in sorted(root.rglob("*.html")):
        if path.is_dir() or path.name.startswith("index - Copy"):
            continue
        if any(part in {".git", ".venv", "templates"} for part in path.parts):
            continue
        if path.resolve() == TEMPLATE_PATH.resolve():
            continue
        text = path.read_text(encoding="utf-8", errors="ignore")
        match = re.search(r'<script id="seoPageData" type="application/json">(.*?)</script>', text, re.DOTALL)
        if not match:
            continue
        try:
            data = json.loads(match.group(1))
        except json.JSONDecodeError:
            continue
        if not isinstance(data, dict):
            continue
        slug = normalize_slug(str(data.get("slug", "")))
        if not slug:
            slug = normalize_slug(path.relative_to(root).as_posix()).replace("/index.html", "")
        registry[slug] = data
    return registry


def build_formula(from_info: Dict[str, object], to_info: Dict[str, object]) -> str:
    # Only the forward formula is needed: it feeds the converter's own
    # "Formula" definition-panel field (#formulaText) and the FAQ answers.
    # The standalone "Formula" page-card (which also showed the reverse
    # formula) was removed from the SEO conversion page layout, so the
    # reverse formula string is no longer computed.
    from_factor = float(from_info.get("factor", 1.0))
    to_factor = float(to_info.get("factor", 1.0))
    if from_factor == 0 or to_factor == 0:
        return "Formula unavailable"
    conversion_factor = from_factor / to_factor
    return f"{to_info['symbol']} = {from_info['symbol']} × {format_factor(conversion_factor)}"


def build_related_links(from_info: Dict[str, object], to_info: Dict[str, object], current_slug: str) -> List[Tuple[str, str]]:
    category = from_info.get("category") or to_info.get("category") or "general"
    candidates = RELATED_RULES.get(category, [])
    links: List[Tuple[str, str]] = []
    seen = set()
    for candidate_id in candidates:
        if candidate_id in {from_info["id"], to_info["id"]}:
            continue
        candidate = get_unit_info(candidate_id)
        if candidate["id"] in seen:
            continue
        seen.add(candidate["id"])
        target_slug = slugify(f"{from_info['name']} to {candidate['name']}")
        if target_slug == current_slug:
            target_slug = slugify(f"{to_info['name']} to {candidate['name']}")
        links.append((f"{from_info['name']} → {candidate['name']}", f"/{target_slug}/"))
        if len(links) >= 6:
            break
    if len(links) < 3:
        for candidate_id in ["gram", "ounce", "stone", "tonne", "meter", "mile", "kilometer", "inch", "foot"]:
            candidate = get_unit_info(candidate_id)
            if candidate["id"] in seen or candidate["id"] in {from_info["id"], to_info["id"]}:
                continue
            seen.add(candidate["id"])
            target_slug = slugify(f"{to_info['name']} to {candidate['name']}")
            links.append((f"{to_info['name']} → {candidate['name']}", f"/{target_slug}/"))
            if len(links) >= 6:
                break
    return links


def build_faqs(from_info: Dict[str, object], to_info: Dict[str, object], formula: str) -> List[Tuple[str, str]]:
    return [
        ("How many units are in one conversion?", f"One {from_info['name']} equals {format_factor(float(from_info.get('factor', 1.0)) / float(to_info.get('factor', 1.0)))} {to_info['name']}s."),
        ("How do you convert units?", f"Multiply the input value by the conversion factor and use the formula {formula}."),
        ("What is the conversion formula?", f"{formula}"),
        (f"Is {from_info['name']} an SI unit?", f"{from_info['name']} is a standard unit in this converter library and is used for practical conversions."),
    ]


def build_about_text(from_info: Dict[str, object], to_info: Dict[str, object], category: str) -> str:
    category_label = CATEGORY_LABELS.get(category, category.title())
    return (
        f"This {category_label.lower()} page uses the current conversion metadata to present a precise, reusable reference for {from_info['name']} to {to_info['name']} conversions. "
        f"The content is generated from the shared conversion registry so every formula, definition, and example stays aligned with the same source of truth. "
        f"Use it for everyday calculations, teaching, fieldwork, and practical workflow checks whenever you need a quick, trustworthy conversion."
    )


def build_json_ld(page_data: Dict[str, object], canonical: str, display_title: Optional[str] = None) -> str:
    title = display_title or str(page_data.get("title", "Universal Converter"))
    description = page_data.get("description", "Convert units instantly.")
    return json.dumps({
        "@context": "https://schema.org",
        "@type": "WebPage",
        "name": title,
        "description": description,
        "url": canonical,
        "about": {"@type": "Thing", "name": f"{page_data.get('fromUnitId', '')} to {page_data.get('toUnitId', '')}"},
    }, ensure_ascii=False)


def render_page(page_data: Dict[str, object], canonical: str, depth: int) -> str:
    from_info = get_unit_info(str(page_data.get("fromUnitId", ""))) if page_data.get("fromUnitId") else {"name": "Unit", "symbol": "", "factor": 1.0, "definition": "", "category": "general", "id": ""}
    to_info = get_unit_info(str(page_data.get("toUnitId", ""))) if page_data.get("toUnitId") else {"name": "Unit", "symbol": "", "factor": 1.0, "definition": "", "category": "general", "id": ""}
    category = str(page_data.get("category", "general"))
    category_label = get_category_label(canonical, page_data)

    display_title = get_display_title(page_data, canonical)
    is_category_page = not page_data.get("fromUnitId") and not page_data.get("toUnitId")
    if is_category_page:
        title = display_title or str(page_data.get("title", "Universal Converter"))
        hero_title = display_title or title
        description = str(page_data.get("description", "Convert units instantly with Universal Converter."))
        page_label = display_title or category_label
        formula_forward = "Use the converter to see the formula."
        related_links = [("Browse all converters", "/")]
        faqs = [("What is this page for?", f"This page gives a structured overview of the {category_label.lower()} converter category.")]
        definitions = [(category_label, f"{category_label} includes common units used across the Universal Converter library.")]
        about_text = f"This {category_label.lower()} page is generated from shared metadata for the {category_label.lower()} category and stays aligned with the converter registry."
    else:
        # Prefer a clean human-readable hero title derived from metadata.
        # `display_title` is already sanitized by `get_display_title`.
        title = display_title or str(page_data.get("title", f"{from_info['name']} to {to_info['name']} Converter"))
        # Hero title should never include site name, category prefix, slug, or the word "Converter".
        hero_title = display_title or title
        description = str(page_data.get("description", f"Convert {from_info['name']} ({from_info['symbol']}) to {to_info['name']} ({to_info['symbol']}) instantly."))
        page_label = display_title or f"{from_info['name']} to {to_info['name']}"
        formula_forward = build_formula(from_info, to_info)
        related_links = build_related_links(from_info, to_info, str(page_data.get("slug", "")))
        faqs = build_faqs(from_info, to_info, formula_forward)
        definitions = [(from_info["name"], from_info["definition"]), (to_info["name"], to_info["definition"])]
        about_text = build_about_text(from_info, to_info, category)

    canonical = canonical if canonical.startswith("http") else f"https://theuniversalconverter.com{canonical}"
    title_tag = title if title else "Universal Converter"
    meta_description = str(page_data.get("description", "Convert units instantly with Universal Converter."))
    page_data_json = json.dumps(page_data, ensure_ascii=False)
    page_slug = str(page_data.get("slug", "")).strip().lower()
    breadcrumb_html = build_breadcrumb_html(page_data, depth, category_label, display_title or page_label or title, is_category_page=is_category_page)

    related_html = "".join(f'<li><a href="{url}">{escape(label)}</a></li>' for label, url in related_links)
    definition_html = "".join(f'<p><strong>{escape(name)}</strong><br>{escape(text)}</p>' for name, text in definitions)
    faq_items = faqs if faqs else [("What is this page for?", "This page provides a quick overview of the conversion.")]
    faq_html = "".join(f'<div class="faq-item"><h3>{escape(question)}</h3><p>{escape(answer)}</p></div>' for question, answer in faq_items)

    template = TEMPLATE_PATH.read_text(encoding="utf-8")
    rendered = template
    rendered = rendered.replace("{{ title | default(\"kg to lbs | Universal Converter\") }}", escape(title_tag))
    rendered = rendered.replace("{{ description | default('Convert kilograms to pounds instantly with the same Universal Converter component used on the homepage.') }}", escape(meta_description))
    rendered = rendered.replace('content="kg to lbs, kilograms to pounds, weight converter"', f'content="{escape(title_tag)}, {escape(category_label.lower())} converter"')
    rendered = rendered.replace('<link rel="canonical" href="https://theuniversalconverter.com/kg-to-lbs/">', f'<link rel="canonical" href="{canonical}">')
    rendered = rendered.replace('<script type="application/ld+json">{}</script>', f'<script type="application/ld+json">{build_json_ld(page_data, canonical, display_title)}</script>', 1)
    rendered = rendered.replace('<script type="application/ld+json">{}</script>', '', 1)
    # Ensure the hero heading uses the sanitized hero_title (no site name, slug, or category prefix)
    # Ensure the hero heading is the clean human-readable conversion title.
    rendered = rendered.replace('<h1>kg to lbs</h1>', f'<h1>{escape(hero_title)}</h1>')
    rendered = rendered.replace('<p>Convert kilograms to pounds instantly with the same Universal Converter component used on the homepage.</p>', f'<p>{escape(description)}</p>')
    rendered = rendered.replace('<nav class="breadcrumb" aria-label="Breadcrumb">\n        <a href="../index.html">Home</a>\n        <span>/</span>\n        <a href="../weight-converter.html">Weight</a>\n        <span>/</span>\n        <span>kg to lbs</span>\n      </nav>', f'<nav class="breadcrumb" aria-label="Breadcrumb">\n        {breadcrumb_html}\n      </nav>')
    # The "Formula" and "Conversion table" page-cards (and their placeholder
    # markup '<p>1 Kilograms = 2.2046226218 Pounds</p>' /
    # '<tbody><tr><td>1</td>...') were removed from the SEO conversion page
    # layout entirely, so there's no longer any markup here to substitute
    # into. The forward formula text is still computed above because it
    # feeds the converter's own #formulaText field and the FAQ answers.
    rendered = rendered.replace('<ul class="seo-link-list"><li><a href="../lbs-to-kg/">Pounds to kilograms</a></li></ul>', f'<ul class="seo-link-list">{related_html}</ul>')
    rendered = rendered.replace('<h3>How do you convert kilograms to pounds?</h3>', f'<h3>{escape(faq_items[0][0])}</h3>')
    rendered = rendered.replace('<p>Multiply the kilogram value by 2.2046226218 to get pounds.</p>', f'<p>{escape(faq_items[0][1])}</p>')
    if len(faq_items) > 1:
        rendered = rendered.replace('<h3>Is the kilogram to pound conversion exact?</h3>', f'<h3>{escape(faq_items[1][0])}</h3>')
        rendered = rendered.replace('<p>The relationship is based on the international pound definition, so this page uses a precise factor for consistent results.</p>', f'<p>{escape(faq_items[1][1])}</p>')
    if len(faq_items) > 2:
        rendered = rendered.replace('<h3>Can I convert pounds back to kilograms?</h3>', f'<h3>{escape(faq_items[2][0])}</h3>')
        rendered = rendered.replace('<p>Yes. Use the reverse converter to divide pounds by 2.2046226218 and get kilograms.</p>', f'<p>{escape(faq_items[2][1])}</p>')
    rendered = rendered.replace('<h2>About converting kilograms to pounds</h2>', '<h2>About this conversion</h2>')
    rendered = rendered.replace('<p>Use this calculator to convert between kilograms and pounds accurately. The Universal Converter uses exact unit factors so you can trust results for recipes, shipping, workouts, and everyday measurement tasks.</p>', f'<p>{escape(about_text)}</p>')
    rendered = rendered.replace('<p>If you work across metric and imperial systems often, keeping a reliable kilogram to pound converter handy saves time and reduces rounding errors. The page is designed to stay fast, readable, and useful on both desktop and mobile screens.</p>', '')
    rendered = rendered.replace('<strong id="resultText">1 meter = 3.28084 feet</strong>', f'<strong id="resultText">1 {escape(from_info["symbol"] or from_info["name"])} = {escape(to_info["symbol"] or to_info["name"])}</strong>')
    rendered = rendered.replace('<p id="fromDefinition">Meter is the SI base unit of length.</p>', f'<p id="fromDefinition">{escape(from_info["definition"])}</p>')
    rendered = rendered.replace('<p id="toDefinition">Foot equals exactly 0.3048 meters.</p>', f'<p id="toDefinition">{escape(to_info["definition"])}</p>')
    rendered = rendered.replace('<p id="formulaText">Multiply by the source factor, then divide by the target factor.</p>', f'<p id="formulaText">{escape(formula_forward)}</p>')
    rendered = rendered.replace('<p class="conversion-note" id="conversionNote">Results update instantly as you type.</p>', f'<p class="conversion-note" id="conversionNote">Results update instantly for {escape(page_label)} conversions.</p>')
    rendered = rendered.replace('<span>kg to lbs</span>', f'<span>{escape(page_label)}</span>')

    prefix = "../" * depth
    def rewrite_relative_path(match: re.Match[str]) -> str:
        quote = match.group(1)
        value = match.group(2)
        if not value.startswith("../"):
            return match.group(0)
        return f"{quote}{prefix}{value[3:]}{match.group(3)}"

    rendered = re.sub(r"([\'\"])(\.\./[^\'\"]+)([\'\"])", rewrite_relative_path, rendered)

    selection_script = f"""
  <script>
    window.__seoPageData = {page_data_json};
    window.addEventListener('DOMContentLoaded', function () {{
      const fromSelect = document.getElementById('fromUnit');
      const toSelect = document.getElementById('toUnit');
      const fromValue = document.getElementById('fromValue');
      const toValue = document.getElementById('toValue');
      if (!fromSelect || !toSelect) return;
      const data = window.__seoPageData || {{}};
      const fromId = data.fromUnitId;
      const toId = data.toUnitId;
      const pageValue = data.value || '1';
      if (fromId) {{
        const matched = Array.from(fromSelect.options).find((option) => option.value === fromId);
        if (matched) fromSelect.value = fromId;
      }}
      if (toId) {{
        const matched = Array.from(toSelect.options).find((option) => option.value === toId);
        if (matched) toSelect.value = toId;
      }}
      if (fromValue) fromValue.value = pageValue;
      if (toValue) toValue.value = '';
      window.requestAnimationFrame(() => {{
        fromSelect.dispatchEvent(new Event('change', {{ bubbles: true }}));
        toSelect.dispatchEvent(new Event('change', {{ bubbles: true }}));
      }});
    }});
  </script>
"""
    rendered = rendered.replace(
        f'<script src="{prefix}analytics-config.js" defer></script>',
        selection_script + f'<script src="{prefix}analytics-config.js" defer></script>'
    )

    # Hero advertisement placeholder removed sitewide: the "leaderboard" ad
    # band directly below the hero (and above the converter) is no longer
    # part of the SEO page layout. Stripped here as a defensive step so the
    # converter always sits immediately below the hero even if a future
    # template edit reintroduces the block. All other ad placements
    # (converter, sidebar, content-top/middle/bottom) are left untouched.
    rendered = re.sub(
        r'\n?[ \t]*<section class="ad-band adsense-placeholder" data-ad-placement="leaderboard"[^>]*>.*?</section>\n?',
        '',
        rendered,
        flags=re.DOTALL,
    )

    return rendered


def get_sitemap_paths(sitemap_path: Path) -> List[str]:
    tree = ET.parse(sitemap_path)
    root = tree.getroot()
    namespace = {"sm": "http://www.sitemaps.org/schemas/sitemap/0.9"}
    urls = []
    for url_elem in root.findall("sm:url", namespace):
        loc_elem = url_elem.find("sm:loc", namespace)
        if loc_elem is not None and loc_elem.text:
            urls.append(loc_elem.text)
    return urls


def generate_pages(urls: List[str], root: Path, overwrite: bool = True) -> int:
    if not TEMPLATE_PATH.exists():
        raise FileNotFoundError(f"Template not found: {TEMPLATE_PATH}")

    existing_registry = load_registry()
    if not existing_registry:
        existing_registry = discover_existing_page_metadata(root)
        save_registry(existing_registry)

    count = 0
    for raw_url in urls:
        parsed = urlparse(raw_url)
        path = parsed.path or "/"
        if not path.endswith("/"):
            path = path + "/"
        if path == "/":
            continue

        output_path = root / path.strip("/") / "index.html"
        output_path.parent.mkdir(parents=True, exist_ok=True)
        if output_path.exists() and not overwrite:
            continue

        slug = normalize_slug(path.strip("/"))
        page_data = build_page_metadata(path, raw_url, existing_registry)
        page_data.setdefault("slug", slug)
        page_data.setdefault("path", path)
        if page_data.get("fromUnitId") and page_data.get("toUnitId"):
            from_info = get_unit_info(str(page_data["fromUnitId"]))
            to_info = get_unit_info(str(page_data["toUnitId"]))
            page_data["fromUnit"] = from_info["name"]
            page_data["toUnit"] = to_info["name"]
            page_data["fromSymbol"] = from_info["symbol"]
            page_data["toSymbol"] = to_info["symbol"]
            page_data["conversionFactor"] = str(float(from_info["factor"]) / float(to_info["factor"]))
            page_data["reverseFactor"] = str(float(to_info["factor"]) / float(from_info["factor"]))
            page_data["unitDefinitions"] = [
                {"unit": from_info["name"], "definition": from_info["definition"]},
                {"unit": to_info["name"], "definition": to_info["definition"]},
            ]
            page_data["relatedConversions"] = [
                {"label": label, "href": href} for label, href in build_related_links(from_info, to_info, slug)
            ]
        else:
            page_data["fromUnit"] = ""
            page_data["toUnit"] = ""
            page_data["fromSymbol"] = ""
            page_data["toSymbol"] = ""
            page_data["conversionFactor"] = ""
            page_data["reverseFactor"] = ""
            page_data["unitDefinitions"] = []
            page_data["relatedConversions"] = []

        if str(page_data.get("category", "")).lower() not in CATEGORY_LABELS and page_data.get("fromUnitId"):
            page_data["category"] = get_unit_info(str(page_data["fromUnitId"]))["category"]

        if not page_data.get("title"):
            page_data["title"] = f"{make_human_label(str(page_data.get('fromUnitId', '')))} to {make_human_label(str(page_data.get('toUnitId', '')))} Converter"
        if not page_data.get("description"):
            page_data["description"] = f"Convert {page_data.get('fromUnitId', '').replace('_', ' ')} to {page_data.get('toUnitId', '').replace('_', ' ')} instantly."

        depth = len([segment for segment in path.strip("/").split("/") if segment])
        output_path.write_text(render_page(page_data, raw_url, depth), encoding="utf-8")
        count += 1

    return count


def main() -> None:
    parser = argparse.ArgumentParser(description="Generate SEO pages for every URL in sitemap.xml")
    parser.add_argument("--skip-existing", action="store_true", help="Skip URLs whose output page already exists")
    args = parser.parse_args()

    urls = get_sitemap_paths(SITEMAP_PATH)
    count = generate_pages(urls, ROOT, overwrite=not args.skip_existing)
    print(f"Generated {count} SEO page(s) from {SITEMAP_PATH.name}")

    # The registry this script just wrote is the source of truth for the
    # global search box, so every regeneration must refresh the search
    # index too - no manual step, no stale search results.
    try:
        import subprocess
        import sys as _sys

        search_index_script = ROOT / "generate_search_index.py"
        if search_index_script.exists():
            result = subprocess.run(
                [_sys.executable, str(search_index_script)],
                cwd=ROOT,
                capture_output=True,
                text=True,
            )
            if result.stdout:
                print(result.stdout.strip())
            if result.returncode != 0:
                print(f"WARNING: search index regeneration failed:\n{result.stderr}", file=_sys.stderr)
    except Exception as exc:  # pragma: no cover - defensive, never blocks page generation
        print(f"WARNING: could not regenerate search index: {exc}")


if __name__ == "__main__":
    main()
