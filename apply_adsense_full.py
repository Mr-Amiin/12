#!/usr/bin/env python3
"""Apply full AdSense markup to all conversion page placeholders."""
from pathlib import Path
import re

root = Path(__file__).resolve().parent
meta_tag = '<meta name="google-adsense-account" content="ca-pub-4632693492035799">'
script_tag = '<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4632693492035799"\n     crossorigin="anonymous"></script>'

# AdSense markup for each placement type
ad_placements = {
    'converter': '''<ins class="adsbygoogle"
                     style="display:block"
                     data-ad-client="ca-pub-4632693492035799"
                     data-ad-slot="REPLACE_WITH_SLOT_ID"
                     data-ad-format="auto"
                     data-full-width-responsive="true"></ins>
                <script>(adsbygoogle = window.adsbygoogle || []).push({});</script>''',
    
    'sidebar': '''<ins class="adsbygoogle"
                     style="display:block"
                     data-ad-client="ca-pub-4632693492035799"
                     data-ad-slot="REPLACE_WITH_SLOT_ID"
                     data-ad-format="auto"
                     data-full-width-responsive="true"></ins>
                <script>(adsbygoogle = window.adsbygoogle || []).push({});</script>''',
    
    'below-converter': '''<ins class="adsbygoogle"
             style="display:block"
             data-ad-client="ca-pub-4632693492035799"
             data-ad-slot="REPLACE_WITH_SLOT_ID"
             data-ad-format="auto"
             data-full-width-responsive="true"></ins>
        <script>(adsbygoogle = window.adsbygoogle || []).push({});</script>''',
    
    'between-faq-about': '''<ins class="adsbygoogle"
                 style="display:block"
                 data-ad-client="ca-pub-4632693492035799"
                 data-ad-slot="REPLACE_WITH_SLOT_ID"
                 data-ad-format="auto"
                 data-full-width-responsive="true"></ins>
            <script>(adsbygoogle = window.adsbygoogle || []).push({});</script>''',
    
}

updated_count = 0
processed_count = 0

for path in sorted(root.rglob('**/index.html')):
    # Skip template files
    if 'templates' in path.parts:
        continue
    
    try:
        text = path.read_text(encoding='utf-8')
        processed_count += 1
    except Exception:
        continue
    
    original = text
    modified = False
    
    # Ensure meta tag and script in head
    if '</head>' in text.lower():
        if meta_tag not in text:
            text = text.replace('</head>', f'  {meta_tag}\n  {script_tag}\n</head>', 1)
            modified = True
        elif 'pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4632693492035799' not in text:
            text = text.replace('</head>', f'  {script_tag}\n</head>', 1)
            modified = True
    
    # Replace empty ad placeholders with full markup
    for placement, markup in ad_placements.items():
        # Pattern for empty section or placeholder content
        patterns = [
            # Empty section: <section ... data-ad-placement="X" ...></section>
            (rf'(<(?:section|aside)[^>]*data-ad-placement=["\']({re.escape(placement)})["\'][^>]*>)\s*(</(?:section|aside)>)',
             rf'\1\n                {markup}\n              \3'),
            
            # Section with just "Advertisement" text
            (rf'(<(?:section|aside)[^>]*data-ad-placement=["\']({re.escape(placement)})["\'][^>]*>)\s*Advertisement\s*(</(?:section|aside)>)',
             rf'\1\n                {markup}\n              \3'),
            
            # Section with ad-slot class but empty
            (rf'(<(?:section|aside)[^>]*class="[^"]*ad-slot[^"]*"[^>]*data-ad-placement=["\']({re.escape(placement)})["\'][^>]*>)\s*(</(?:section|aside)>)',
             rf'\1\n                {markup}\n              \3'),
        ]
        
        for pattern, replacement in patterns:
            if re.search(pattern, text, re.IGNORECASE | re.DOTALL):
                text = re.sub(pattern, replacement, text, count=1, flags=re.IGNORECASE | re.DOTALL)
                modified = True
                break
    
    if modified and text != original:
        path.write_text(text, encoding='utf-8')
        updated_count += 1
        print(f"✓ {path.relative_to(root)}")

print(f"\nProcessed {processed_count} HTML files, updated {updated_count} files")
