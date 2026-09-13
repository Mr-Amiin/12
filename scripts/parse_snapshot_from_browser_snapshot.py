import json
import pathlib
import re
import sys

if len(sys.argv) != 2:
    print('Usage: python scripts/parse_snapshot_from_browser_snapshot.py <snapshot-path>')
    sys.exit(1)

snapshot_path = pathlib.Path(sys.argv[1])
if not snapshot_path.exists():
    print(f'Snapshot file not found: {snapshot_path}')
    sys.exit(2)

workspace_root = pathlib.Path('.').resolve()
raw = snapshot_path.read_text(encoding='utf8')

hrefs = set()
for m in re.finditer(r'/url:\s*([^\s\n\r]+)', raw):
    token = m.group(1).strip()
    token = token.strip('"')
    token = token.rstrip('.,;')
    hrefs.add(token)

href_array = sorted(hrefs)
files = [str(f.relative_to(workspace_root)).replace('\\', '/') for f in workspace_root.rglob('*.html')]
file_set = set(files)

missing = []
for href in href_array:
    normalized = href.lstrip('/')
    if normalized.endswith('.html'):
        candidate = normalized
    elif normalized.endswith('/'):
        candidate = normalized + 'index.html'
    else:
        candidate = normalized + '.html'
    if candidate not in file_set and normalized + '/index.html' not in file_set and normalized not in file_set:
        missing.append(href)

out = {
    'snapshot': str(snapshot_path),
    'workspaceRoot': str(workspace_root),
    'totalSnapshotHrefs': len(href_array),
    'totalWorkspaceHtmlFiles': len(files),
    'missingCount': len(missing),
    'missing': missing,
}

out_path = workspace_root / 'scripts' / 'snapshot_missing_from_snapshot.json'
out_path.write_text(json.dumps(out, indent=2), encoding='utf8')
print('Wrote', out_path)
print('Snapshot hrefs:', len(href_array), 'Workspace html files:', len(files), 'Missing:', len(missing))
if len(missing) <= 200:
    print('Missing list:')
    print('\n'.join(missing))
else:
    print('Missing list is large; see', out_path)
