const fs = require('fs');
const path = require('path');
const root = path.resolve(process.cwd());
function findIndexFiles(dir) {
  const results = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      results.push(...findIndexFiles(full));
    } else if (e.isFile() && e.name.toLowerCase() === 'index.html') {
      // exclude root index.html
      if (path.resolve(full) === path.join(root, 'index.html')) continue;
      results.push(full);
    }
  }
  return results;
}
const files = findIndexFiles(root);
files.sort();
let registry = {};
try {
  const registryPath = path.join(root, 'seo-conversion-registry.json');
  if (fs.existsSync(registryPath)) {
    registry = JSON.parse(fs.readFileSync(registryPath, 'utf8')) || {};
  }
} catch (err) {
  // ignore registry errors and fall back to filename-based titles
}

const links = files.map(f => {
  const rel = path.relative(root, f).replace(/\\/g, '/');
  // Use the actual file path (including index.html) as the href so file:// links resolve locally.
  const href = rel;
  const slug = rel.replace(/index.html$/,'').replace(/(^\/|\/$)/g, '');
  // Prefer registry title when available
  let title = '';
  if (slug && registry[slug] && registry[slug].title) {
    title = registry[slug].title.replace(/\s*\|\s*Universal Converter$/i, '').trim();
  }
  if (!title) {
    const base = slug.split('/').pop() || 'home';
    title = base.split('-').map(s=>s.charAt(0).toUpperCase()+s.slice(1)).join(' ');
  }
  return { href: href || 'index.html', title };
});
const head = `<!doctype html>
<html lang="en" data-theme="light">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Sitemap | Universal Converter</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <main class="page-shell">
    <section class="page-hero">
      <h1>Sitemap</h1>
      <p>Auto-generated sitemap of conversion routes</p>
    </section>
    <section class="page-grid sitemap-grid">
`;
const tail = `    </section>
  </main>
  <footer class="site-footer">
    <nav aria-label="Footer navigation">
      <a href="privacy.html">Privacy</a>
      <a href="terms.html">Terms</a>
      <a href="contact.html">Contact</a>
    </nav>
  </footer>
</body>
</html>`;
let body = '';
for (const l of links) {
  body += `      <section class="page-card"><h2>${l.title}</h2><ul class="sitemap-links"><li><a href="${l.href}">${l.title}</a></li></ul></section>\n`;
}
fs.writeFileSync(path.join(root,'sitemap.html'), head + body + tail, 'utf8');
console.log('wrote sitemap.html with', links.length, 'links');
