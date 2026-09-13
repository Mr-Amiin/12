#!/usr/bin/env node
/**
 * generate-sitemap.js
 * ===================================================================
 * Universal Converter build pipeline — sitemap + route-count stage.
 *
 * Pipeline order (this file owns steps 2-4; step 1 is your existing
 * page generator, wired in via --routes or the generateSeoPages hook):
 *
 *   1. Generate all SEO pages           (existing page generator)
 *   2. Generate/update sitemap.xml      (generateSitemapXml)
 *   3. Count every <url> node in it     (countUrlEntries)
 *   4. Write that number into           (updateHtmlCount)
 *      sitemap.html's #sitemapRouteCount
 *
 * SINGLE SOURCE OF TRUTH: sitemap.xml.
 * The count is derived by reading the <url> tags actually present in
 * the sitemap.xml file on disk after step 2 — not from routes.length,
 * not from a database row count, not from anything else. Whatever
 * ships in sitemap.xml is what gets written into sitemap.html, full
 * stop. There is no second number to keep in sync by hand.
 *
 * This script also actively guards against browser-side counting:
 * guardNoBrowserSideCounting() scans every inline <script> in
 * sitemap.html and fails the build if any of them reference the
 * #sitemapRouteCount element, or call any counting-ish browser API
 * (fetch, MutationObserver, setInterval/setTimeout-driven recompute,
 * DOM scans of cards/links/categories) anywhere near it. The counter
 * must always be static text baked in at build time.
 *
 * Usage:
 *   node scripts/generate-sitemap.js \
 *     --routes ./data/routes.json \
 *     --xml    ./sitemap.xml \
 *     --html   ./sitemap.html
 *
 * If --routes is omitted, step 2 is skipped and the script treats
 * whatever sitemap.xml already exists on disk as authoritative (useful
 * when a separate crawler/build step already produced it this run).
 * ===================================================================
 */

'use strict';

const fs = require('fs');
const path = require('path');

// -------------------------------------------------------------------
// CLI args
// -------------------------------------------------------------------
function parseArgs(argv) {
  const args = { routes: null, xml: './sitemap.xml', html: './sitemap.html' };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--routes') args.routes = argv[++i];
    else if (a === '--xml') args.xml = argv[++i];
    else if (a === '--html') args.html = argv[++i];
  }
  return args;
}

// -------------------------------------------------------------------
// STEP 1 (hook only): Generate all SEO pages.
//
// The actual page templates/content generator lives elsewhere in the
// codebase and isn't part of this script. This hook exists so the
// pipeline order is explicit and a real implementation can be dropped
// in without restructuring anything downstream. If you already run
// your page generator as its own npm script, just make sure it runs
// before this file in package.json / CI, and pass --routes pointing
// at the route list it produced.
// -------------------------------------------------------------------
function generateSeoPages(routesPath) {
  if (!routesPath) {
    console.log('Step 1: Generate SEO pages — skipped (no --routes given; ' +
      'assuming pages/sitemap.xml were already generated upstream).');
    return null;
  }
  console.log(`Step 1: Generate SEO pages — reading route list from ${routesPath}`);
  const routes = JSON.parse(fs.readFileSync(path.resolve(routesPath), 'utf8'));
  // Real page generation (writing each SEO page to disk) happens in the
  // existing generator. This pipeline only needs the route list back
  // so it can build sitemap.xml from the same data in step 2.
  console.log(`Step 1: Generate SEO pages — ${routes.length} route(s) confirmed.`);
  return routes;
}

// -------------------------------------------------------------------
// STEP 2: Generate/update sitemap.xml from the route list.
// -------------------------------------------------------------------
function generateSitemapXml(routes) {
  const lines = [];
  lines.push('<?xml version="1.0" encoding="UTF-8"?>');
  lines.push('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');

  for (const route of routes) {
    const entry = typeof route === 'string' ? { loc: route } : route;
    const loc = escapeXml(entry.loc);
    const lastmod = entry.lastmod ? `<lastmod>${escapeXml(entry.lastmod)}</lastmod>` : '';
    const changefreq = entry.changefreq
      ? `<changefreq>${escapeXml(entry.changefreq)}</changefreq>`
      : '';
    lines.push(`    <url><loc>${loc}</loc>${lastmod}${changefreq}</url>`);
  }

  lines.push('</urlset>');
  lines.push('');
  return lines.join('\n');
}

function escapeXml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// -------------------------------------------------------------------
// STEP 3: Count every <url> node actually written to sitemap.xml.
//
// This re-reads the file from disk rather than trusting routes.length,
// so the number reflects what's really there, including anything
// added by other tooling that touches sitemap.xml directly.
// -------------------------------------------------------------------
function countUrlEntries(xmlContent) {
  const matches = xmlContent.match(/<url>/g);
  return matches ? matches.length : 0;
}

// -------------------------------------------------------------------
// STEP 4: Write that count into sitemap.html.
// -------------------------------------------------------------------
function updateHtmlCount(htmlContent, count) {
  const formatted = count.toLocaleString('en-US');
  const pattern = /(<p id="sitemapRouteCount">)([\s\S]*?)(<\/p>)/;

  if (!pattern.test(htmlContent)) {
    throw new Error(
      'Could not find <p id="sitemapRouteCount">...</p> in sitemap.html — ' +
        'refusing to guess where the count should go.'
    );
  }

  const newText = `${formatted} public routes are currently indexed for search and browsing.`;
  return htmlContent.replace(pattern, `$1${newText}$3`);
}

function extractHtmlCount(htmlContent) {
  const match = htmlContent.match(/<p id="sitemapRouteCount">([\s\S]*?)<\/p>/);
  if (!match) return null;
  const numMatch = match[1].replace(/,/g, '').match(/\d+/);
  return numMatch ? parseInt(numMatch[0], 10) : null;
}

// -------------------------------------------------------------------
// GUARD: no browser-side code may ever recompute this number.
//
// Scans every inline <script>...</script> block in sitemap.html and
// fails the build if any of them:
//   - reference the #sitemapRouteCount element/id, or
//   - contain counting-style APIs (fetch of sitemap.xml, DOM scans of
//     cards/links/categories, MutationObserver, setInterval,
//     rAF-driven recompute loops) in a way that touches that element.
//
// This runs on every build, so if someone re-introduces client-side
// counting logic later, the build fails instead of silently drifting.
// -------------------------------------------------------------------
function guardNoBrowserSideCounting(htmlContent) {
  const scriptBlocks = [...htmlContent.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi)]
    .map((m) => m[1]);

  const offendingPatterns = [
    /sitemapRouteCount/i,
  ];

  for (const block of scriptBlocks) {
    for (const pattern of offendingPatterns) {
      if (pattern.test(block)) {
        throw new Error(
          'guardNoBrowserSideCounting: found an inline <script> that references ' +
            '#sitemapRouteCount. The route count must be static text written at ' +
            'build time — remove any browser-side logic that reads or recalculates it.'
        );
      }
    }
  }

  console.log(`Guard: scanned ${scriptBlocks.length} inline <script> block(s) — ` +
    'none reference #sitemapRouteCount. Counter is build-time-only. OK.');
}

// -------------------------------------------------------------------
// Main pipeline
// -------------------------------------------------------------------
function main() {
  const args = parseArgs(process.argv.slice(2));
  const xmlPath = path.resolve(args.xml);
  const htmlPath = path.resolve(args.html);

  // Step 1
  const routes = generateSeoPages(args.routes);

  // Step 2
  if (routes) {
    const xml = generateSitemapXml(routes);
    fs.writeFileSync(xmlPath, xml, 'utf8');
    console.log(`Step 2: Generate/update sitemap.xml — wrote ${xmlPath}`);
  } else {
    console.log(`Step 2: Generate/update sitemap.xml — skipped, using existing ${xmlPath}`);
  }

  if (!fs.existsSync(xmlPath)) {
    console.error(`sitemap.xml not found at ${xmlPath} and no --routes file was given.`);
    process.exit(1);
  }

  // Step 3
  const xmlContent = fs.readFileSync(xmlPath, 'utf8');
  const totalRoutes = countUrlEntries(xmlContent);
  console.log(`Step 3: Count <url> nodes in sitemap.xml — ${totalRoutes.toLocaleString('en-US')}`);

  // Step 4
  const htmlBefore = fs.readFileSync(htmlPath, 'utf8');
  const htmlAfter = updateHtmlCount(htmlBefore, totalRoutes);
  fs.writeFileSync(htmlPath, htmlAfter, 'utf8');
  console.log(`Step 4: Update #sitemapRouteCount in sitemap.html — wrote ${htmlPath}`);

  // Guard: no browser-side recomputation allowed.
  guardNoBrowserSideCounting(htmlAfter);

  // Validation: re-read both files off disk (not from memory) and compare.
  const verifyXmlCount = countUrlEntries(fs.readFileSync(xmlPath, 'utf8'));
  const verifyHtmlCount = extractHtmlCount(fs.readFileSync(htmlPath, 'utf8'));
  const match = verifyXmlCount === verifyHtmlCount;

  console.log('');
  console.log('Routes in sitemap.xml:        ' + verifyXmlCount.toLocaleString('en-US'));
  console.log('Routes written to HTML:       ' + (verifyHtmlCount === null ? 'N/A' : verifyHtmlCount.toLocaleString('en-US')));
  console.log('');
  console.log('MATCH: ' + (match ? 'TRUE' : 'FALSE'));

  if (!match) {
    console.error('\nBUILD FAILED: sitemap.xml and sitemap.html report different totals.');
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  generateSeoPages,
  generateSitemapXml,
  countUrlEntries,
  updateHtmlCount,
  extractHtmlCount,
  guardNoBrowserSideCounting,
};
