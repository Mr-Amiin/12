const fs = require('fs');
const path = require('path');
const root = path.resolve(process.cwd());
const html = fs.readFileSync(path.join(root, 'sitemap.html'), 'utf8');
const hrefs = [...html.matchAll(/href="([^"]+)"/g)].map(m=>m[1]);
const missing = [];
for (const href of hrefs) {
  if (/^(https?:|mailto:|#|javascript:)/.test(href)) continue;
  const clean = href.split('#')[0].split('?')[0];
  // Try exact file
  let target = path.resolve(root, clean);
  if (fs.existsSync(target)) continue;
  // If href ends with slash, try index.html
  if (clean.endsWith('/')) {
    target = path.resolve(root, clean, 'index.html');
    if (fs.existsSync(target)) continue;
  }
  // Try adding index.html
  target = path.resolve(root, clean + 'index.html');
  if (fs.existsSync(target)) continue;
  // Try folder with trailing slash
  target = path.resolve(root, clean.replace(/\/$/, ''), 'index.html');
  if (fs.existsSync(target)) continue;
  missing.push(href);
}
console.log(JSON.stringify({missing}, null, 2));
