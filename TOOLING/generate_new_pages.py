#!/usr/bin/env python3
"""
Generates missing SEO converter pages for the Angle and Frequency categories,
using the exact structural template already used by the other reference
categories (Power, Pressure, Speed, Digital Storage, etc).

This script:
  1. Loads a known-good existing page (power/watts-to-horsepower/index.html)
     as the structural base (nav, footer, converter widget, ad slots, CSS/JS
     links all stay byte-identical).
  2. Swaps only the page-specific fields: title, meta, canonical, OG/Twitter,
     JSON-LD, breadcrumb, formula, conversion table, FAQ, definitions,
     related conversions, and window.__seoPageData.
  3. Writes each new page to <category>/<slug>/index.html.
  4. Updates the category hub pages (angle/index.html, frequency/index.html)
     Popular Conversions grid + All Conversions (window.__categoryConversions)
     using the same data-shape already used on other hub pages.
  5. Skips any page that already exists (no overwrite, no duplicates).
  6. Produces a validation report.
"""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent / "site"
BASE_TEMPLATE_PATH = ROOT / "power" / "watts-to-horsepower" / "index.html"

BASE_OLD = {
    "title": "Watts to Mechanical Horsepower",
    "description": "Convert Watts to Mechanical Horsepower instantly. Free online power unit converter with exact formula, conversion table and FAQ.",
    "keywords": "Watts to Mechanical Horsepower, power converter",
    "canonical": "https://theuniversalconverter.com/power/watts-to-horsepower/",
    "about_lower": "watts to mechanical horsepower",
    "breadcrumb": '../../power/index.html">Power</a><span>/</span><span>Watts to Mechanical Horsepower</span>',
    "conv_note": "Results update instantly for Watts to Mechanical Horsepower conversions.",
    "formula_line": "hp = W &times; 0.0013410221</p><p>W = hp &times; 745.6998715822702",
    "table": '<tbody><tr><td>1 W</td><td>0.001341 hp</td></tr><tr><td>5 W</td><td>0.006705 hp</td></tr><tr><td>10 W</td><td>0.013410 hp</td></tr><tr><td>20 W</td><td>0.026820 hp</td></tr><tr><td>50 W</td><td>0.067051 hp</td></tr><tr><td>100 W</td><td>0.134102 hp</td></tr><tr><td>500 W</td><td>0.670511 hp</td></tr><tr><td>1000 W</td><td>1.341022 hp</td></tr></tbody>',
    "related": '<ul class="seo-link-list"><li><a href="../watts-to-mechanical-horsepower/">Watt &rarr; Mechanical horsepower</a></li></ul>',
    "slug_seo_title": "Watts-to-horsepower | Universal Converter",
}

FAQ_RE = re.compile(r'<section class="seo-faq".*?</section>', re.DOTALL)
ABOUT_RE = re.compile(r'<article class="seo-article">.*?</article>', re.DOTALL)


def fmt_num(v: float) -> str:
    if abs(v) >= 1_000_000:
        return f"{v:.6e}"
    if abs(v - round(v)) < 1e-9:
        return str(int(round(v)))
    return f"{v:.6f}"


def build_table(rows, unit_from_sym, unit_to_sym, factor):
    cells = []
    for n in rows:
        val = n * factor
        cells.append(f"<tr><td>{fmt_num(n)} {unit_from_sym}</td><td>{fmt_num(val)} {unit_to_sym}</td></tr>")
    return "<tbody>" + "".join(cells) + "</tbody>"


PAGE_SPECS = [
    # ---------------- ANGLE ----------------
    dict(
        category="angle", category_title="Angle",
        slug="degrees-to-radians",
        title="Degrees to Radians",
        from_sym="deg", to_sym="rad",
        from_unit_id="degree", to_unit_id="radian",
        factor=0.0174532925, reverse_factor=57.2957795131,
        formula=("rad = deg &times; 0.0174532925", "deg = rad &times; 57.2957795131"),
        related_href="../radians-to-degrees/", related_label="Radian &rarr; Degree",
        faq=[
            ("What is the source unit in this conversion?",
             "The source unit is the degree (deg), a unit of angle equal to 1/360 of a full rotation, commonly used in everyday navigation, geography, and geometry."),
            ("What is the destination unit in this conversion?",
             "The destination unit is the radian (rad), the SI unit of angle, defined as the angle subtended at the center of a circle by an arc equal in length to the circle's radius."),
            ("How do I convert degrees to radians?",
             "Multiply the degree value by 0.0174532925 (which is &pi;/180). For example, 180 deg &times; 0.0174532925 = 3.141593 rad."),
            ("Is the degrees to radians conversion exact?",
             "Yes. One full turn is exactly 2&pi; radians, or 360 degrees, so the conversion factor &pi;/180 is a fixed mathematical constant rather than a measured approximation."),
            ("Where is this conversion commonly used?",
             "It's used in trigonometry, physics and engineering calculations involving rotation, programming languages and math libraries (which use radians internally), and robotics or CAD software."),
            ("Can I convert radians back to degrees?",
             "Yes. Multiply the radian value by 57.2957795131 (180/&pi;) to get degrees."),
        ],
        about=[
            "This page converts degrees (deg), the everyday angle unit based on dividing a circle into 360 parts, into radians (rad), the SI unit of angle used throughout mathematics and physics.",
            "This conversion is common when moving between human-friendly angle measurements, such as compass headings or geometry problems, and the radian-based math used in trigonometric functions, calculus, and programming.",
            "The formula is rad = deg &times; 0.0174532925, derived from the fixed relationship that 360 degrees equals exactly 2&pi; radians.",
            "The conversion is exact because both the degree and the radian are defined relative to a full circle, tied to the mathematical constant &pi; rather than a physical measurement.",
            "The degree remains the standard for navigation, surveying, and everyday geometry, while the radian is preferred in scientific and engineering contexts because it simplifies calculus involving trigonometric functions.",
        ],
    ),
    dict(
        category="angle", category_title="Angle",
        slug="radians-to-degrees",
        title="Radians to Degrees",
        from_sym="rad", to_sym="deg",
        from_unit_id="radian", to_unit_id="degree",
        factor=57.2957795131, reverse_factor=0.0174532925,
        formula=("deg = rad &times; 57.2957795131", "rad = deg &times; 0.0174532925"),
        related_href="../degrees-to-radians/", related_label="Degree &rarr; Radian",
        faq=[
            ("What is the source unit in this conversion?",
             "The source unit is the radian (rad), the SI unit of angle, defined as the angle subtended at the center of a circle by an arc equal in length to the circle's radius."),
            ("What is the destination unit in this conversion?",
             "The destination unit is the degree (deg), a unit of angle equal to 1/360 of a full rotation, commonly used in everyday navigation, geography, and geometry."),
            ("How do I convert radians to degrees?",
             "Multiply the radian value by 57.2957795131 (which is 180/&pi;). For example, 1 rad &times; 57.2957795131 = 57.295780 deg."),
            ("Is the radians to degrees conversion exact?",
             "Yes. One full turn is exactly 2&pi; radians, or 360 degrees, so the conversion factor 180/&pi; is a fixed mathematical constant rather than a measured approximation."),
            ("Where is this conversion commonly used?",
             "It's used to translate calculus and trigonometry results, sensor or robotics readings, and CAD/engineering software output (which often work in radians) back into human-readable degrees."),
            ("Can I convert degrees back to radians?",
             "Yes. Multiply the degree value by 0.0174532925 (&pi;/180) to get radians."),
        ],
        about=[
            "This page converts radians (rad), the SI unit of angle used throughout mathematics and physics, into degrees (deg), the everyday angle unit based on dividing a circle into 360 parts.",
            "This conversion is common when taking results from trigonometric functions, calculus, or engineering software, which typically work in radians, and presenting them in the more familiar degree format used in navigation and geometry.",
            "The formula is deg = rad &times; 57.2957795131, derived from the fixed relationship that 2&pi; radians equals exactly 360 degrees.",
            "The conversion is exact because both the radian and the degree are defined relative to a full circle, tied to the mathematical constant &pi; rather than a physical measurement.",
            "The radian is preferred in scientific and engineering contexts because it simplifies calculus involving trigonometric functions, while the degree remains the standard for navigation, surveying, and everyday geometry.",
        ],
    ),
    # ---------------- FREQUENCY ----------------
    dict(
        category="frequency", category_title="Frequency",
        slug="hertz-to-rpm",
        title="Hertz to RPM",
        from_sym="Hz", to_sym="rpm",
        from_unit_id="hertz", to_unit_id="rpm",
        factor=60, reverse_factor=1 / 60,
        formula=("rpm = Hz &times; 60", "Hz = rpm &divide; 60"),
        related_href="../rpm-to-hertz/", related_label="Revolutions per minute &rarr; Hertz",
        faq=[
            ("What is the source unit in this conversion?",
             "The source unit is the hertz (Hz), the SI unit of frequency, equal to one cycle per second."),
            ("What is the destination unit in this conversion?",
             "The destination unit is revolutions per minute (rpm), a common unit for describing the rotational speed of motors, engines, and fans."),
            ("How do I convert hertz to RPM?",
             "Multiply the hertz value by 60. For example, 50 Hz &times; 60 = 3000 rpm, which is why 50 Hz mains power drives many two-pole motors close to 3000 rpm."),
            ("Is the hertz to RPM conversion exact?",
             "Yes, assuming one cycle corresponds to one revolution. Since a minute is exactly 60 seconds, the factor of 60 is an exact mathematical relationship, not an approximation."),
            ("Where is this conversion commonly used?",
             "It's used for rating electric motor and generator speeds, engine tachometers, fan and turbine speeds, and converting AC line frequency into expected motor RPM."),
            ("Can I convert RPM back to hertz?",
             "Yes. Divide the RPM value by 60 (or multiply by 0.0166666667) to get hertz."),
        ],
        about=[
            "This page converts hertz (Hz), the SI unit of frequency equal to one cycle per second, into revolutions per minute (rpm), the standard unit for rotational speed.",
            "This conversion is common when relating electrical or vibrational frequencies, such as AC line frequency, to the rotational speed of motors, engines, fans, and turbines.",
            "The formula is rpm = Hz &times; 60, based on the fixed relationship that one minute contains exactly 60 seconds.",
            "The conversion is exact whenever one cycle equals one revolution, since it relies only on the fixed number of seconds in a minute rather than a measured approximation.",
            "The hertz is the SI-derived unit used for electrical and mechanical frequency, while RPM remains the everyday standard for describing how fast something spins, from car engines to hard drives.",
        ],
    ),
    dict(
        category="frequency", category_title="Frequency",
        slug="rpm-to-hertz",
        title="RPM to Hertz",
        from_sym="rpm", to_sym="Hz",
        from_unit_id="rpm", to_unit_id="hertz",
        factor=1 / 60, reverse_factor=60,
        formula=("Hz = rpm &divide; 60", "rpm = Hz &times; 60"),
        related_href="../hertz-to-rpm/", related_label="Hertz &rarr; Revolutions per minute",
        faq=[
            ("What is the source unit in this conversion?",
             "The source unit is revolutions per minute (rpm), a common unit for describing the rotational speed of motors, engines, and fans."),
            ("What is the destination unit in this conversion?",
             "The destination unit is the hertz (Hz), the SI unit of frequency, equal to one cycle per second."),
            ("How do I convert RPM to hertz?",
             "Divide the RPM value by 60 (or multiply by 0.0166666667). For example, 3000 rpm &divide; 60 = 50 Hz."),
            ("Is the RPM to hertz conversion exact?",
             "Yes, assuming one revolution corresponds to one cycle. Since a minute is exactly 60 seconds, the factor of 1/60 is an exact mathematical relationship, not an approximation."),
            ("Where is this conversion commonly used?",
             "It's used for converting motor and engine tachometer readings, fan or turbine speeds, and hard drive or disc rotation speeds into a frequency value for electrical or vibration analysis."),
            ("Can I convert hertz back to RPM?",
             "Yes. Multiply the hertz value by 60 to get RPM."),
        ],
        about=[
            "This page converts revolutions per minute (rpm), the standard unit for rotational speed, into hertz (Hz), the SI unit of frequency equal to one cycle per second.",
            "This conversion is common when relating the rotational speed of motors, engines, fans, or turbines to an electrical or vibrational frequency measured in hertz.",
            "The formula is Hz = rpm &divide; 60, based on the fixed relationship that one minute contains exactly 60 seconds.",
            "The conversion is exact whenever one revolution equals one cycle, since it relies only on the fixed number of seconds in a minute rather than a measured approximation.",
            "RPM remains the everyday standard for describing how fast something spins, from car engines to hard drives, while the hertz is the SI-derived unit used for electrical and mechanical frequency analysis.",
        ],
    ),
]

TABLE_ROWS = [1, 5, 10, 20, 50, 100, 500, 1000]


def make_faq_block(faq_pairs):
    items = []
    for q, a in faq_pairs:
        items.append(
            f'            <div class="faq-item">\n'
            f'              <h3>{q}</h3>\n'
            f'              <p>{a}</p>\n'
            f'            </div>'
        )
    return (
        '<section class="seo-faq" aria-label="FAQ">\n'
        '            <h2>Frequently asked questions</h2>\n'
        + "\n".join(items)
        + "\n          </section>"
    )


def make_about_block(paragraphs):
    body = "\n".join(f"            <p>{p}</p>" for p in paragraphs)
    return (
        '<article class="seo-article">\n'
        "            <h2>About this conversion</h2>\n"
        + body
        + "\n          </article>"
    )


def render_page(base_html: str, spec: dict) -> str:
    html = base_html

    new_title = spec["title"]
    new_description = f"Convert {spec['title']} instantly. Free online {spec['category']} unit converter with exact formula, conversion table and FAQ."
    new_keywords = f"{spec['title']}, {spec['category']} converter"
    new_canonical = f"https://theuniversalconverter.com/{spec['category']}/{spec['slug']}/"
    new_about_lower = spec["title"].lower()
    new_breadcrumb = f'../../{spec["category"]}/index.html">{spec["category_title"]}</a><span>/</span><span>{spec["title"]}</span>'
    new_conv_note = f"Results update instantly for {spec['title']} conversions."
    new_formula_line = f"{spec['formula'][0]}</p><p>{spec['formula'][1]}"
    new_table = build_table(TABLE_ROWS, spec["from_sym"], spec["to_sym"], spec["factor"])
    new_related = f'<ul class="seo-link-list"><li><a href="{spec["related_href"]}">{spec["related_label"]}</a></li></ul>'
    new_slug_seo_title = f"{spec['slug'][0].upper()}{spec['slug'][1:]} | Universal Converter"

    # Simple 1:1 global substitutions. ORDER MATTERS: several of the "old"
    # anchor strings (keywords, description, conv_note, breadcrumb) embed the
    # bare title as a substring, so they must be replaced BEFORE the bare
    # title itself -- otherwise the bare-title replace mutates them first and
    # the longer anchor strings no longer match exactly.
    html = html.replace(BASE_OLD["keywords"], new_keywords)
    html = html.replace(BASE_OLD["description"], new_description)
    html = html.replace(BASE_OLD["conv_note"], new_conv_note)
    html = html.replace(BASE_OLD["breadcrumb"], new_breadcrumb)
    html = html.replace(BASE_OLD["canonical"], new_canonical)
    html = html.replace(BASE_OLD["about_lower"], new_about_lower)
    html = html.replace(BASE_OLD["formula_line"], new_formula_line)
    html = html.replace(BASE_OLD["table"], new_table)
    html = html.replace(BASE_OLD["related"], new_related)
    # Bare title replaced last (covers <title>, h1, og:title, twitter:title,
    # and the JSON-LD WebPage/BreadcrumbList "name" fields).
    html = html.replace(BASE_OLD["title"], new_title)

    # Block replacements (FAQ + About) with unit-specific prose.
    html = FAQ_RE.sub(lambda m: make_faq_block(spec["faq"]), html, count=1)
    html = ABOUT_RE.sub(lambda m: make_about_block(spec["about"]), html, count=1)

    # window.__seoPageData payload
    seo_data = {
        "slug": spec["slug"],
        "category": spec["category"],
        "fromUnitId": spec["from_unit_id"],
        "toUnitId": spec["to_unit_id"],
        "value": "1",
        "title": new_slug_seo_title,
        "description": new_description,
        "path": f"/{spec['category']}/{spec['slug']}/",
        "fromUnit": "",
        "toUnit": "",
        "fromSymbol": "",
        "toSymbol": "",
        "conversionFactor": "",
        "reverseFactor": "",
        "unitDefinitions": [],
        "relatedConversions": [],
    }
    # NOTE: by this point, the description field inside the still-unmodified
    # seoPageData JSON has ALREADY been swapped to new_description by the
    # earlier global html.replace() call (the same literal string also
    # appears inside the JSON blob), so the anchor below must use
    # new_description, not the original BASE_OLD value.
    old_seo_json = json.dumps(
        {
            "slug": "watts-to-horsepower",
            "category": "power",
            "fromUnitId": "watt",
            "toUnitId": "horsepower_mechanical",
            "value": "1",
            "title": BASE_OLD["slug_seo_title"],
            "description": new_description,
            "path": "/power/watts-to-horsepower/",
            "fromUnit": "",
            "toUnit": "",
            "fromSymbol": "",
            "toSymbol": "",
            "conversionFactor": "",
            "reverseFactor": "",
            "unitDefinitions": [],
            "relatedConversions": [],
        }
    )
    new_seo_json = json.dumps(seo_data)
    if old_seo_json not in html:
        raise RuntimeError("seoPageData anchor not found; base template may have changed.")
    html = html.replace(old_seo_json, new_seo_json)

    # Also fix the WebPage JSON-LD "about" name (uses "watts to mechanical horsepower")
    # and the BreadcrumbList category name ("Power") + url segments already handled by
    # canonical/breadcrumb substitutions above (they share the same literal strings).

    return html


def main():
    base_html = BASE_TEMPLATE_PATH.read_text(encoding="utf-8")

    report_lines = []
    generated = 0
    skipped_existing = 0
    duplicates_found = 0

    seen_targets = set()

    for spec in PAGE_SPECS:
        out_dir = ROOT / spec["category"] / spec["slug"]
        out_path = out_dir / "index.html"
        target_key = (spec["category"], spec["slug"])

        if target_key in seen_targets:
            duplicates_found += 1
            report_lines.append(f"DUPLICATE SKIPPED: {spec['category']}/{spec['slug']}")
            continue
        seen_targets.add(target_key)

        if out_path.exists():
            skipped_existing += 1
            report_lines.append(f"SKIPPED (already exists): {out_path.relative_to(ROOT)}")
            continue

        html = render_page(base_html, spec)
        out_dir.mkdir(parents=True, exist_ok=True)
        out_path.write_text(html, encoding="utf-8")
        generated += 1
        report_lines.append(f"GENERATED: {out_path.relative_to(ROOT)}")

    summary = {
        "generated": generated,
        "skipped_existing": skipped_existing,
        "duplicates_found": duplicates_found,
    }
    print(json.dumps(summary, indent=2))
    print("\n".join(report_lines))


if __name__ == "__main__":
    main()
