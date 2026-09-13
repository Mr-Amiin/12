const fs = require('fs');
const path = require('path');
const root = path.resolve(process.cwd());
const file = path.join(root, 'sitemap.html');
const bak = path.join(root, 'sitemap.html.bak');
if (!fs.existsSync(file)) { console.error('sitemap.html not found'); process.exit(1); }
if (!fs.existsSync(bak)) fs.copyFileSync(file, bak);
let html = fs.readFileSync(file, 'utf8');
const hrefs = [...html.matchAll(/href=\"([^\"]+)\"/g)].map(m=>m[1]);
const filesList = (()=>{ const walk=(d)=>{ let out=[]; for(const e of fs.readdirSync(d,{withFileTypes:true})){ const p=path.join(d,e.name); if(e.isDirectory()){ out.push(...walk(p)); } else { out.push(p); } } return out; }; return walk(root).map(p=>p.replace(/\\\\/g,'/')); })();
let changed = 0;
for (const href of hrefs) {
  if (/^(https?:|mailto:|#|javascript:)/.test(href)) continue;
  const clean = href.split('#')[0].split('?')[0];
  const abs = path.resolve(root, clean);
  const exists = fs.existsSync(abs) || fs.existsSync(abs + '.html') || fs.existsSync(path.join(abs,'index.html'));
  if (exists) continue;
  // Try remove leading slash
  let candidate = clean.replace(/^\//,'');
  if (candidate !== clean) {
    if (fs.existsSync(path.resolve(root, candidate)) || fs.existsSync(path.resolve(root, candidate + 'index.html')) || fs.existsSync(path.resolve(root, candidate + 'index.htm')) ) {
      html = html.split(`href=\"${href}\"`).join(`href=\"${candidate}\"`);
      changed++; continue;
    }
  }
  // Try add index.html if directory exists
  if (!candidate.endsWith('index.html')) {
    if (fs.existsSync(path.resolve(root, candidate, 'index.html'))) {
      const newHref = candidate.endsWith('/') ? candidate : candidate + '/';
      html = html.split(`href=\"${href}\"`).join(`href=\"${newHref}\"`);
      changed++; continue;
    }
  }
  // Try slug-based match: pick filename or dir that contains token
  const token = candidate.split(/[^a-z0-9]+/i).filter(Boolean)[0] || candidate;
  if (token) {
    const match = filesList.find(p=>p.toLowerCase().includes('/' + token.toLowerCase() + '/')) || filesList.find(p=>p.toLowerCase().includes('/' + token.toLowerCase() + 'index.html')) || filesList.find(p=>p.toLowerCase().includes(token.toLowerCase()));
    if (match) {
      const rel = path.relative(root, match).replace(/\\\\/g,'/');
      const newHref = rel.endsWith('index.html') ? rel.replace(/index.html$/,'') : rel;
      html = html.split(`href=\"${href}\"`).join(`href=\"${newHref}\"`);
      changed++; continue;
    }
  }
  // As last resort, remove spaces and weird tokens
  const cleanedSlug = candidate.replace(/\s+/g,'-').replace(/\[.*?\]/g,'').replace(/[^a-z0-9\-_/]/ig,'');
  if (cleanedSlug && cleanedSlug !== href) {
    if (fs.existsSync(path.resolve(root, cleanedSlug)) || fs.existsSync(path.resolve(root, cleanedSlug,'index.html')) ) {
      html = html.split(`href=\"${href}\"`).join(`href=\"${cleanedSlug}\"`);
      changed++; continue;
    }
  }
}
if (changed>0) {
  fs.writeFileSync(file, html, 'utf8');
}
console.log('changed', changed);
