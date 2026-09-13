#!/usr/bin/env python3
import argparse
import json
import re
from pathlib import Path
from typing import Dict, Iterable, List

ROOT = Path(__file__).resolve().parent
TEMPLATE_DIR = ROOT / "templates"


def slug_from_template_name(name: str) -> str:
    slug = name
    if slug.endswith("-template"):
        slug = slug[: -len("-template")]
    return slug


def discover_templates() -> List[Path]:
    if not TEMPLATE_DIR.exists():
        return []
    templates = []
    for path in sorted(TEMPLATE_DIR.glob("*-template.html")):
        if "copy" in path.name.lower():
            continue
        templates.append(path)
    return templates


def load_template(path: Path) -> str:
    return path.read_text(encoding="utf-8")


def load_template_metadata(path: Path) -> Dict[str, str]:
    metadata_path = path.with_suffix(".json")
    if not metadata_path.exists():
        return {}
    raw = metadata_path.read_text(encoding="utf-8")
    data = json.loads(raw)
    return {key: str(value) for key, value in data.items() if value is not None}


def render_template(template: str, context: Dict[str, str]) -> str:
    rendered = template

    # Support the placeholder syntax already used in the template files.
    patterns = {
        "title": re.compile(r"\{\{\s*title\s*\|\s*default\((['\"])(.*?)\1\)\s*\}\}", re.IGNORECASE | re.DOTALL),
        "description": re.compile(r"\{\{\s*description\s*\|\s*default\((['\"])(.*?)\1\)\s*\}\}", re.IGNORECASE | re.DOTALL),
    }

    def replace_with_default(match: re.Match[str], key: str) -> str:
        fallback = match.group(2)
        return context.get(key, fallback)

    rendered = patterns["title"].sub(lambda match: replace_with_default(match, "title"), rendered)
    rendered = patterns["description"].sub(lambda match: replace_with_default(match, "description"), rendered)

    # Also support simple double-brace tokens for future template additions.
    for key, value in context.items():
        rendered = rendered.replace("{{ " + key + " }}", value)
        rendered = rendered.replace("{{" + key + "}}", value)

    return rendered


def template_to_page(template_path: Path) -> Dict[str, str]:
    stem = template_path.stem
    slug = slug_from_template_name(stem)
    page = {
        "slug": slug,
    }
    page.update(load_template_metadata(template_path))
    return page


def write_page(template_path: Path) -> Path:
    page = template_to_page(template_path)
    template = load_template(template_path)
    html = render_template(template, page)
    output_path = ROOT / page["slug"] / "index.html"
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(html, encoding="utf-8")
    return output_path


def select_templates(args: argparse.Namespace) -> Iterable[Path]:
    templates = discover_templates()
    if args.template:
        match = [path for path in templates if path.name == args.template or path.stem == args.template]
        if not match:
            raise SystemExit(f"Unknown template: {args.template}")
        return match
    return templates


def main() -> None:
    parser = argparse.ArgumentParser(description="Generate SEO pages from template files in outputs/templates")
    parser.add_argument("--template", help="Generate one template by file name or stem")
    args = parser.parse_args()

    templates = list(select_templates(args))
    if not templates:
        raise SystemExit("No template files found in outputs/templates")

    for template_path in templates:
        output_path = write_page(template_path)
        print(f"Generated {output_path.relative_to(ROOT)} from {template_path.name}")


if __name__ == "__main__":
    main()
