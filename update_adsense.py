from pathlib import Path
import re

root = Path(r'c:\Users\Think Station\Documents\Codex\2026-06-25\create-a-modern-responsive-utility-conversion\outputs')
old_id = 'ca-pub-4632693492035799'
old_pub = 'pub-4632693492035799'
new_id = 'ca-pub-4632693492035799'
new_pub = 'pub-4632693492035799'
meta_tag = f'<meta name="google-adsense-account" content="{new_id}">'
script_tag = f'<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client={new_id}"\n     crossorigin="anonymous"></script>'

extensions = {'.html', '.js', '.ps1', '.txt', '.md', '.json', '.py'}
updated_files = []

for path in root.rglob('*'):
    if not path.is_file():
        continue
    if path.suffix.lower() not in extensions:
        continue
    try:
        text = path.read_text(encoding='utf-8')
    except Exception:
        continue

    original = text
    text = text.replace(old_id, new_id).replace(old_pub, new_pub)

    if path.suffix.lower() == '.html':
        text = re.sub(r'(?is)<meta\s+name=["\']google-adsense-account["\'][^>]*>', '', text)
        text = re.sub(r'(?is)<script\b[^>]*src=["\']https://pagead2\.googlesyndication\.com/pagead/js/adsbygoogle\.js[^"\']*["\'][^>]*></script>', '', text)
        if '</head>' in text:
            if '<meta name="google-adsense-account"' not in text:
                text = text.replace('</head>', f'  {meta_tag}\n</head>', 1)
            if 'pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=' not in text:
                text = text.replace('</head>', f'  {script_tag}\n</head>', 1)
        else:
            text += f'\n{meta_tag}\n{script_tag}'

    if path.name == 'ads.txt':
        text = 'google.com, pub-4632693492035799, DIRECT, f08c47fec0942fa0\n'

    if text != original:
        path.write_text(text, encoding='utf-8')
        updated_files.append(path.relative_to(root).as_posix())

print(f'Updated {len(updated_files)} files')
for item in updated_files[:40]:
    print(item)
if len(updated_files) > 40:
    print('...')
