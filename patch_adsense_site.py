from pathlib import Path
import re

root = Path(__file__).resolve().parent
meta_tag = '<meta name="google-adsense-account" content="ca-pub-4632693492035799">'
script_tag = '<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4632693492035799"\n     crossorigin="anonymous"></script>'
updated_paths = []

for path in sorted(root.rglob('*.html')):
    try:
        text = path.read_text(encoding='utf-8')
    except Exception:
        continue

    original = text

    text = re.sub(r'(?is)<meta\s+name=["\']google-adsense-account["\'][^>]*>', '', text)
    text = re.sub(r'(?is)<script\b[^>]*src=["\']https://pagead2\.googlesyndication\.com/pagead/js/adsbygoogle\.js[^"\']*["\'][^>]*></script>', '', text)

    if '</head>' in text.lower():
        if meta_tag not in text:
            text = text.replace('</head>', f'  {meta_tag}\n  {script_tag}\n</head>', 1)
        else:
            if 'pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4632693492035799' not in text:
                text = text.replace('</head>', f'  {script_tag}\n</head>', 1)

    pattern = re.compile(r'(<(?P<tag>section|aside|div)[^>]*data-ad-placement="(?P<placement>[^"]+)"[^>]*>)(?P<content>.*?)(</(?P=tag)>)', re.S | re.I)

    def repl(match):
        start_tag = match.group(1)
        content = match.group('content')
        end_tag = match.group(3)
        if 'class="adsbygoogle"' in content or 'data-ad-client=' in content or 'data-adsbygoogle-processed="true"' in start_tag:
            return match.group(0)
        if 'data-adsbygoogle-processed="true"' not in start_tag:
            start_tag = start_tag.replace('>', ' data-adsbygoogle-processed="true">', 1)
        new_content = (
            '<ins class="adsbygoogle" style="display:block" '
            'data-ad-client="ca-pub-4632693492035799" '
            'data-ad-slot="REPLACE_WITH_SLOT_ID" '
            'data-ad-format="auto" '
            'data-full-width-responsive="true"></ins>'
            '<script>(adsbygoogle = window.adsbygoogle || []).push({});</script>'
        )
        return start_tag + new_content + end_tag

    text = pattern.sub(repl, text)

    if text != original:
        path.write_text(text, encoding='utf-8')
        updated_paths.append(path)

if updated_paths:
    print(f"Updated {len(updated_paths)} HTML files")
else:
    print("No HTML files needed updates")
