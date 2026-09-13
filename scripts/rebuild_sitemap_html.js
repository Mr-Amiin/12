#!/usr/bin/env node
/**
 * rebuild_sitemap_html.js
 * ===================================================================
 * Rewrites sitemap.html's grid section to be lightweight (category
 * cards with a count + expand button, zero individual links in the
 * initial DOM) and swaps the old eager index-building inline script for
 * a lazy-loading one that fetches sitemap-data/<slug>.json only when a
 * category is expanded.
 *
 * Everything outside the grid section and the final inline <script>
 * (doctype, <head>/meta/SEO tags, hero, #sitemapRouteCount static text,
 * search-bar markup, footer) is copied through BYTE-FOR-BYTE from the
 * input file - this script only touches the grid and the one script
 * block that operated on it.
 *
 * Usage: node scripts/rebuild_sitemap_html.js [in] [out] [dataDir]
 */
'use strict';
const fs = require('fs');
const path = require('path');

const inPath = path.resolve(process.argv[2] || 'sitemap.html');
const outPath = path.resolve(process.argv[3] || 'sitemap.html');
const dataDir = process.argv[4] || 'sitemap-data';

const html = fs.readFileSync(inPath, 'utf8');
const index = JSON.parse(fs.readFileSync(path.join(path.dirname(inPath), dataDir, 'index.json'), 'utf8'));

const gridStart = html.indexOf('<section class="page-grid sitemap-grid"');
if (gridStart === -1) throw new Error('Could not find the grid opening tag');
const mainCloseIdx = html.indexOf('</main>', gridStart);
if (mainCloseIdx === -1) throw new Error('Could not find </main> after the grid');

const scriptStart = html.indexOf('<script>', mainCloseIdx);
const scriptEnd = html.indexOf('</script>', scriptStart) + '</script>'.length;
if (scriptStart === -1 || scriptEnd === -1) throw new Error('Could not find the trailing inline <script> block');

const before = html.slice(0, gridStart);           // doctype..head..hero..count..search bar (untouched)
const betweenGridAndScript = html.slice(mainCloseIdx, scriptStart); // </main>..footer (untouched)
const after = html.slice(scriptEnd);                // </body></html> (untouched)

// ---- Build the lightweight grid ----
function escapeHtml(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

let grid = '<section class="page-grid sitemap-grid" aria-label="Sitemap categories">\n';
for (const entry of index) {
  if (entry.type === 'category') {
    const count = entry.count;
    grid += `      <section class="page-card" data-sitemap-category="${escapeHtml(entry.slug)}">` +
      `<div class="sitemap-card-head"><h2>${escapeHtml(entry.name)}</h2></div>` +
      `<div class="sitemap-card-scroll" hidden></div>` +
      `<button type="button" class="sitemap-card-expand" data-category="${escapeHtml(entry.slug)}" aria-expanded="false">Show ${count.toLocaleString('en-US')} page${count === 1 ? '' : 's'}</button>` +
      `<p class="sitemap-card-count">${count.toLocaleString('en-US')} pages</p>` +
      `</section>\n`;
  } else {
    grid += `      <section class="in-content-ad adsense-placeholder" data-ad-placement="${escapeHtml(entry.placement)}" aria-label="Advertisement" style="grid-column: 1 / -1;">\n` +
      `      <span>Advertisement</span>\n      <strong>Ad slot: sitemap (728x90)</strong>\n      <p>${escapeHtml(entry.label)}</p>\n    </section>\n`;
  }
}
grid += '    </section>';

// ---- New lazy-loading + pagination script ----
const newScript = `<script>
  (function () {
    // Loads a category's links only when the user expands that category
    // (fetches sitemap-data/<slug>.json), instead of every one of the
    // site's routes being present in the DOM on page load. Large
    // categories (PAGE_SIZE+ links) render in pages with a "Show more"
    // control so even opening the very largest category doesn't block
    // the main thread in one go.
    var PAGE_SIZE = 1000;
    var cache = {};   // slug -> array of [href, label]
    var shown = {};   // slug -> number of rows currently rendered

    var grid = document.querySelector('.sitemap-grid');
    if (!grid) return;

    function renderPage(slug, container, list, upTo) {
      var start = shown[slug] || 0;
      if (start >= upTo) return;
      var frag = document.createDocumentFragment();
      var ul = container.querySelector('ul.sitemap-links');
      if (!ul) {
        ul = document.createElement('ul');
        ul.className = 'sitemap-links';
        container.appendChild(ul);
      }
      for (var i = start; i < upTo; i++) {
        var li = document.createElement('li');
        var a = document.createElement('a');
        a.href = list[i][0];
        a.textContent = list[i][1];
        li.appendChild(a);
        frag.appendChild(li);
      }
      ul.appendChild(frag);
      shown[slug] = upTo;

      var existingMore = container.querySelector('.sitemap-card-more');
      if (existingMore) existingMore.remove();
      if (upTo < list.length) {
        var more = document.createElement('button');
        more.type = 'button';
        more.className = 'sitemap-card-more';
        more.textContent = 'Show more (' + upTo + ' of ' + list.length + ')';
        more.addEventListener('click', function () {
          renderPage(slug, container, list, Math.min(list.length, upTo + PAGE_SIZE));
        });
        container.appendChild(more);
      }
    }

    function loadCategory(card, slug) {
      var container = card.querySelector('.sitemap-card-scroll');
      var expandBtn = card.querySelector('.sitemap-card-expand');
      if (cache[slug]) {
        container.hidden = false;
        if (expandBtn) expandBtn.hidden = true;
        return;
      }
      if (expandBtn) { expandBtn.disabled = true; expandBtn.textContent = 'Loading…'; }
      fetch('sitemap-data/' + slug + '.json')
        .then(function (res) {
          if (!res.ok) throw new Error('failed to load ' + slug);
          return res.json();
        })
        .then(function (list) {
          cache[slug] = list;
          container.hidden = false;
          if (expandBtn) expandBtn.hidden = true;
          renderPage(slug, container, list, Math.min(list.length, PAGE_SIZE));
        })
        .catch(function () {
          if (expandBtn) { expandBtn.disabled = false; expandBtn.textContent = 'Could not load — try again'; }
        });
    }

    grid.addEventListener('click', function (event) {
      var btn = event.target.closest('.sitemap-card-expand');
      if (!btn) return;
      var card = btn.closest('.page-card');
      var slug = btn.getAttribute('data-category');
      if (card && slug) loadCategory(card, slug);
    });

    // ---- Search ----
    // Instant filter over the 27 category names (cheap, always available).
    // Typing also expands+loads any category whose name OR already-cached
    // link list matches, without ever pulling every category's data into
    // memory at once just to power a search box.
    var input = document.getElementById('sitemapSearchInput');
    var status = document.getElementById('sitemapSearchStatus');
    if (!input || !status) return;

    var cards = Array.prototype.slice.call(grid.querySelectorAll('.page-card'));
    var timer = null;

    function runFilter() {
      var query = input.value.trim().toLowerCase();
      if (!query) {
        cards.forEach(function (card) { card.hidden = false; });
        status.textContent = '';
        return;
      }
      var matchingCategories = 0;
      cards.forEach(function (card) {
        var slug = card.getAttribute('data-sitemap-category');
        var name = (card.querySelector('h2') || {}).textContent || '';
        var nameMatch = name.toLowerCase().indexOf(query) !== -1;
        var cachedMatch = cache[slug] && cache[slug].some(function (pair) {
          return pair[1].toLowerCase().indexOf(query) !== -1;
        });
        var visible = nameMatch || cachedMatch;
        card.hidden = !visible;
        if (visible) matchingCategories++;
      });
      status.textContent = matchingCategories === 0
        ? 'No matching categories. Try a shorter term, or open a category below to search its pages directly.'
        : 'Showing ' + matchingCategories + ' matching categor' + (matchingCategories === 1 ? 'y' : 'ies') +
          '. Open a category to search its individual pages.';
    }

    input.addEventListener('input', function () {
      clearTimeout(timer);
      timer = setTimeout(runFilter, 200);
    });
  })();
</script>`;

fs.writeFileSync(outPath, before + grid + betweenGridAndScript + newScript + after, 'utf8');
console.log('Wrote', outPath, '(' + (fs.statSync(outPath).size / 1024).toFixed(0) + ' KB, was ' + (fs.statSync(inPath).size / 1024 / 1024).toFixed(1) + ' MB)');
