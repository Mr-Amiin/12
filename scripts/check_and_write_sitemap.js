const fs = require('fs');
const path = require('path');
const root = path.resolve(process.cwd());
const html = fs.readFileSync(path.join(root, 'sitemap.html'), 'utf8');
const hrefs = [...html.matchAll(/href="([^"]+)"/g)].map(m=>m[1]);
const missing = [];
for (const href of hrefs) {
  if (/^(https?:|mailto:|#|javascript:)/.test(href)) continue;
  const clean = href.split('#')[0].split('?')[0];
  let target = path.resolve(root, clean);
  if (fs.existsSync(target)) continue;
  if (clean.endsWith('/')) {
    target = path.resolve(root, clean, 'index.html');
    if (fs.existsSync(target)) continue;
  }
  target = path.resolve(root, clean + 'index.html');
  if (fs.existsSync(target)) continue;
  target = path.resolve(root, clean.replace(/\/$/, ''), 'index.html');
  if (fs.existsSync(target)) continue;
  missing.push(href);
}
const out = { missing };
fs.writeFileSync(path.join(root, 'scripts', 'sitemap_missing.json'), JSON.stringify(out, null, 2));
console.log('wrote scripts/sitemap_missing.json');
