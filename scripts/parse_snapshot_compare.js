const fs = require('fs');
const path = require('path');

function walkDir(dir, fileList = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) walkDir(full, fileList);
    else if (e.isFile() && full.toLowerCase().endsWith('.html')) fileList.push(full);
  }
  return fileList;
}

function usage() {
  console.error('Usage: node scripts/parse_snapshot_compare.js <snapshot-path> [workspace-root]');
  process.exit(1);
}

const snapshotPath = process.argv[2];
const workspaceRoot = process.argv[3] || process.cwd();
if (!snapshotPath) usage();
if (!fs.existsSync(snapshotPath)) {
  console.error('Snapshot file not found:', snapshotPath);
  process.exit(2);
}

const raw = fs.readFileSync(snapshotPath, 'utf8');

// Extract href-like tokens after '/url:' occurrences
const hrefs = new Set();
const urlRegex = /\/url:\s*([^\s\n\r]+)/g;
let m;
while ((m = urlRegex.exec(raw))) {
  let token = m[1].trim();
  // strip surrounding quotes or trailing punctuation
  token = token.replace(/^\"|\"$/g, '');
  token = token.replace(/[.,;]+$/g, '');
  hrefs.add(token);
}

const hrefArray = Array.from(hrefs).sort();

// Build set of workspace html files (relative to workspaceRoot)
const files = walkDir(workspaceRoot).map(f => path.relative(workspaceRoot, f).replace(/\\/g, '/'));
const fileSet = new Set(files);

function existsForHref(href) {
  if (!href) return false;
  // Normalize leading slash
  if (href.startsWith('/')) href = href.slice(1);
  // If href points to a file
  if (href.endsWith('.html')) return fileSet.has(href);
  // If href ends with slash -> index.html inside directory
  if (href.endsWith('/')) {
    const candidate = path.posix.join(href, 'index.html');
    return fileSet.has(candidate);
  }
  // Try href + .html and href + /index.html
  const c1 = href + '.html';
  const c2 = path.posix.join(href, 'index.html');
  return fileSet.has(c1) || fileSet.has(c2);
}

const missing = [];
for (const h of hrefArray) {
  if (!existsForHref(h)) missing.push(h);
}

const out = {
  snapshot: snapshotPath,
  workspaceRoot,
  totalSnapshotHrefs: hrefArray.length,
  totalWorkspaceHtmlFiles: files.length,
  missingCount: missing.length,
  missing
};

const outPath = path.join(workspaceRoot, 'scripts', 'sitemap_missing_from_snapshot.json');
fs.writeFileSync(outPath, JSON.stringify(out, null, 2));
console.log('Wrote', outPath);
console.log('Snapshot hrefs:', hrefArray.length, 'Workspace html files:', files.length, 'Missing:', missing.length);
if (missing.length <= 200) console.log('Missing list:', missing.join('\n'));
else console.log('Missing list is large; see', outPath);

process.exit(0);
