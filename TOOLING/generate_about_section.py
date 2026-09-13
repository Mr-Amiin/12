#!/usr/bin/env python3
"""
generate_about_section.py

Assembles the "About This Conversion" section for a conversion page from two
per-unit research records (e.g. unit_facts/kilogram.json, unit_facts/pound.json).

This is the reusable, dynamic architecture referenced in the About-section
upgrade task: unit history/uses are researched and stored ONCE per unit in
unit_facts/<slug>.json, and any conversion page pairing two units (kg-to-lbs,
lbs-to-kg, kg-to-oz, etc.) assembles its About section from those two records
plus a small amount of page-specific conversion-relationship data.

It does NOT invent content. If a unit_facts/<slug>.json file does not exist,
the script refuses to fabricate one — that unit needs to be researched by a
human (or a research-backed pass) before a page for it can use this system.

Usage:
    python3 generate_about_section.py kilogram pound \
        --factor 0.45359237 --factor-note "An avoirdupois pound is exactly 0.45359237 kilograms." \
        --out about_section_kg_to_lbs.html
"""
import argparse
import json
import os
import re
import sys

FACTS_DIR = os.path.join(os.path.dirname(__file__), "unit_facts")


def load_unit(slug):
    path = os.path.join(FACTS_DIR, f"{slug}.json")
    if not os.path.exists(path):
        sys.exit(
            f"ERROR: no researched record for '{slug}' at {path}.\n"
            f"Refusing to fabricate unit history. Research this unit first "
            f"(BIPM, NIST, national measurement institutes, encyclopaedic "
            f"sources with strong editorial standards) and add "
            f"unit_facts/{slug}.json before generating this page."
        )
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def esc(text):
    return (
        text.replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
    )


def render_unit_block(unit, heading_prefix):
    name = unit["name"]
    parts = []
    parts.append(f'<h3>Understanding the {esc(name)}</h3>')
    for p in unit["understanding"]:
        parts.append(f"<p>{esc(p)}</p>")

    parts.append(f'<h3>History of the {esc(name)}</h3>')
    parts.append(f'<p>{esc(unit["history"]["intro"])}</p>')
    for p in unit["history"]["paragraphs"]:
        parts.append(f"<p>{esc(p)}</p>")

    # Founder / origin transparency block — mandatory, never fabricated.
    status = unit.get("founder_status")
    note = unit.get("founder_note", "")
    if status == "no_single_founder":
        label = "Historical origin and contributors"
    elif status == "no_founder_established":
        label = "No single founder is historically established"
    else:
        label = "Origin"
    parts.append(
        f'<p class="unit-origin-note"><strong>{esc(label)}.</strong> {esc(note)}</p>'
    )

    parts.append(f'<h3>Uses of the {esc(name)} Today</h3>')
    parts.append("<ul>")
    for u in unit["uses"]:
        parts.append(f"<li>{esc(u)}</li>")
    parts.append("</ul>")

    return "\n".join(parts)


def render_sources(unit):
    items = "".join(
        f'<li>{esc(s["label"])} — {esc(s["note"])}</li>' for s in unit["sources"]
    )
    return f'<h4>{esc(unit["name"])} — sources</h4><ul class="source-list">{items}</ul>'


def word_count(html):
    text = re.sub(r"<[^>]+>", " ", html)
    return len(text.split())


def build(unit_a_slug, unit_b_slug, factor, factor_note, page_title_unit_a, page_title_unit_b):
    a = load_unit(unit_a_slug)
    b = load_unit(unit_b_slug)

    inv_factor = 1 / factor if factor else None

    intro = (
        f'<p>This page converts between the {a["name"].lower()} and the {b["name"].lower()}. '
        f'{esc(factor_note)} That means 1 {a["symbol"]} equals '
        f'{inv_factor:.10f} {b["symbol"]}, and 1 {b["symbol"]} equals '
        f'{factor:.10f} {a["symbol"]}. Because the relationship between these two units is '
        f'fixed by definition rather than measured, the converter above and the figures on this '
        f'page will always agree, and results are rounded only for display, never for the '
        f'underlying calculation.</p>'
    )

    html = []
    html.append(f'<h2>About Converting {esc(page_title_unit_a)} to {esc(page_title_unit_b)}</h2>')
    html.append(intro)
    html.append(render_unit_block(a, "a"))
    html.append(render_unit_block(b, "b"))
    html.append('<div class="about-sources">')
    html.append(render_sources(a))
    html.append(render_sources(b))
    html.append("</div>")

    full_html = "\n".join(html)
    wc = word_count(full_html)
    sys.stderr.write(f"[info] generated About section word count: {wc}\n")
    if wc < 1000:
        sys.stderr.write(
            "[warning] section is under the 1,000-word minimum required by the "
            "content spec — add more researched detail before publishing.\n"
        )
    return full_html


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("unit_a")
    ap.add_argument("unit_b")
    ap.add_argument("--factor", type=float, required=True, help="1 unit_b = <factor> unit_a")
    ap.add_argument("--factor-note", required=True)
    ap.add_argument("--title-a", required=True)
    ap.add_argument("--title-b", required=True)
    ap.add_argument("--out", required=True)
    args = ap.parse_args()

    html = build(
        args.unit_a, args.unit_b, args.factor, args.factor_note, args.title_a, args.title_b
    )
    with open(args.out, "w", encoding="utf-8") as f:
        f.write(html)
    print(f"Wrote {args.out}")


if __name__ == "__main__":
    main()
