from pathlib import Path
import re

root = Path(r'c:\Users\Think Station\Documents\Codex\2026-06-25\create-a-modern-responsive-utility-conversion\outputs')
old_ids = ['ca-pub-4632693492035799', 'pub-4632693492035799']
new_id = 'ca-pub-4632693492035799'
new_pub = 'pub-4632693492035799'
meta_tag = f'<meta name="google-adsense-account" content="{new_id}">'
script_tag = f'<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client={new_id}"\n     crossorigin="anonymous"></script>'

report_lines = []
updated_files = []
updated_html = 0
updated_shared = []
old_matches = []

for path in root.rglob('*'):
    if not path.is_file():
        continue
    if path.suffix.lower() not in {'.html', '.js', '.ps1', '.txt'}:
        continue
    try:
        text = path.read_text(encoding='utf-8')
    except UnicodeDecodeError:
        try:
            text = path.read_text(encoding='utf-8', errors='ignore')
        except Exception:
            continue
    original = text
    # Replace any old publisher IDs in text files.
    for old in old_ids:
        if old in text:
            text = text.replace(old, new_id if old.startswith('ca-pub') else new_pub)
    if path.suffix.lower() == '.html':
        # remove any existing adsense account meta and pagead2 script tags
        text = re.sub(r'(?is)<meta\s+name=["\']google-adsense-account["\'][^>]*>', '', text)
        text = re.sub(r'(?is)<script\b[^>]*src=["\']https://pagead2\.googlesyndication\.com/pagead/js/adsbygoogle\.js[^"\']*["\'][^>]*></script>', '', text)
        if '</head>' in text.lower():
            # insert if not already present with new values
            if new_id not in text:
                text = re.sub(r'(?i)</head>', f'  {meta_tag}\n  {script_tag}\n</head>', text, count=1)
            else:
                # ensure script exists when meta already has new ID
                if 'pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=' not in text:
                    text = re.sub(r'(?i)</head>', f'  {script_tag}\n</head>', text, count=1)
        else:
            text += f'\n{meta_tag}\n{script_tag}\n'
        updated_html += 1
    if path.name == 'ads.txt':
        text = 'google.com, pub-4632693492035799, DIRECT, f08c47fec0942fa0\n'
    if text != original:
        path.write_text(text, encoding='utf-8')
        updated_files.append(str(path.relative_to(root)))
        if path.suffix.lower() == '.html':
            updated_html += 0
        if path.name in {'adsense-config.js', 'generate-conversion-pages.ps1'}:
            updated_shared.append(str(path.relative_to(root)))

# verify remaining old IDs
for path in root.rglob('*'):
    if not path.is_file():
        continue
    if path.suffix.lower() not in {'.html', '.js', '.ps1', '.txt'}:
        continue
    try:
        text = path.read_text(encoding='utf-8')
    except UnicodeDecodeError:
        continue
    for old in old_ids:
        if old in text:
            old_matches.append(f'{path.relative_to(root)}: {old}')

report_lines.append(f'Updated files: {len(updated_files)}')
report_lines.append(f'Shared files updated: {len(updated_shared)}')
report_lines.append('Updated files list:')
report_lines.extend(updated_files[:50])
if len(updated_files) > 50:
    report_lines.append('...')
report_lines.append('')
report_lines.append(f'Remaining old publisher ID matches: {len(old_matches)}')
report_lines.extend(old_matches[:50])
if len(old_matches) > 50:
    report_lines.append('...')

Path(root / 'adsense_update_report.txt').write_text('\n'.join(report_lines), encoding='utf-8')
print('done')
