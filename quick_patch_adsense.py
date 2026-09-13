#!/usr/bin/env python3
"""Apply AdSense markup to all HTML files with ad placements."""
from pathlib import Path
import re

root = Path(__file__).resolve().parent
meta_tag = '<meta name="google-adsense-account" content="ca-pub-4632693492035799">'
script_tag = '<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4632693492035799"\n     crossorigin="anonymous"></script>'

# Reusable AdSense markup template
ad_markup_template = '''<ins class="adsbygoogle"
             style="display:block"
             data-ad-client="ca-pub-4632693492035799"
             data-ad-slot="REPLACE_WITH_SLOT_ID"
             data-ad-format="auto"
             data-full-width-responsive="true"></ins>
        <script>(adsbygoogle = window.adsbygoogle || []).push({});</script>'''

updated = 0
skipped = 0

# Process all HTML files
for html_file in sorted(root.rglob('**/*.html')):
    # Skip template files and non-index pages in conversion directories
    if 'templates' in html_file.parts or (html_file.parent != root and html_file.name != 'index.html'):
        continue
    
    try:
        content = html_file.read_text(encoding='utf-8')
    except:
        continue
    
    original = content
    
    # Add meta tag and script to head if missing
    if '</head>' in content and 'google-adsense-account' not in content:
        content = content.replace('</head>', f'  {meta_tag}\n  {script_tag}\n</head>', 1)
    elif '</head>' in content and 'pagead2.googlesyndication.com' not in content:
        content = content.replace('</head>', f'  {script_tag}\n</head>', 1)
    
    # Replace empty ad placeholders
    # Pattern 1: empty <section> or <aside> tags with data-ad-placement
    content = re.sub(
        r'(<(?:section|aside)[^>]*data-ad-placement="[^"]*"[^>]*>)\s*(</(?:section|aside)>)',
        lambda m: m.group(1) + '\n                ' + ad_markup_template + '\n              ' + m.group(2) 
        if 'adsbygoogle' not in m.group(0) else m.group(0),
        content,
        flags=re.IGNORECASE
    )
    
    # Only update if something changed
    if content != original:
        html_file.write_text(content, encoding='utf-8')
        updated += 1
    else:
        skipped += 1

with open(root / 'adsense_patch.log', 'w') as f:
    f.write(f'Updated {updated} files\nSkipped {skipped} files\nProcessed {updated + skipped} total\n')
