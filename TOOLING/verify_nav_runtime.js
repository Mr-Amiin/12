const fs = require("fs");
const { JSDOM } = require("jsdom");

const appJs = fs.readFileSync("/home/claude/prod-site/app.js", "utf8");

const SHELL = `<!doctype html><html><body class="is-loading">
<header class="site-header" id="siteHeader"></header>
<div class="mobile-drawer-overlay" id="mobileDrawerOverlay" hidden></div>
<nav class="mobile-drawer" id="mobileDrawer" aria-hidden="true" aria-label="Mobile navigation"></nav>
<main></main>
</body></html>`;

const errors = [];
const dom = new JSDOM(SHELL, {
  runScripts: "outside-only",
  url: "https://example.com/",
  pretendToBeVisual: true,
});
const { window } = dom;
window.matchMedia = window.matchMedia || (() => ({ matches: false, addListener() {}, removeListener() {} }));
// Force mobile-width matchMedia so setupResponsiveMobileNav() also
// exercises the drawer render+init path (it's gated to <1024px).
window.matchMedia = (query) => ({
  matches: query.includes("min-width: 1024px") ? false : false,
  media: query,
  addListener() {},
  removeListener() {},
  addEventListener() {},
  removeEventListener() {},
});
window.onerror = (msg, src, line, col, err) => { errors.push(`${msg} (line ${line})`); };

try {
  window.eval(appJs);
} catch (err) {
  errors.push(`Top-level eval error: ${err.message}`);
}

window.document.dispatchEvent(new window.Event("DOMContentLoaded", { bubbles: true, cancelable: true }));

const header = window.document.getElementById("siteHeader");
const drawer = window.document.getElementById("mobileDrawer");
const hamburger = window.document.getElementById("mobileMenuToggle");
const brand = header.querySelector(".brand");
const topNav = header.querySelector(".top-nav");
const themeToggle = window.document.getElementById("themeToggle");
const categoriesDropdown = header.querySelector(".nav-dropdown-menu#categoriesNavMenu");

console.log("Runtime errors:", errors.length ? errors : "none");
console.log("#siteHeader populated:", header.childElementCount > 0);
console.log("hamburger (#mobileMenuToggle) present:", !!hamburger);
console.log("brand/logo (.brand) present:", !!brand, brand ? brand.textContent.trim() : "");
console.log("desktop top-nav (.top-nav) present:", !!topNav);
console.log("theme toggle (#themeToggle) present:", !!themeToggle);
console.log("categories dropdown menu populated:", categoriesDropdown ? categoriesDropdown.children.length : "N/A", "items");
console.log("#mobileDrawer populated:", drawer.childElementCount > 0);

if (errors.length || !header.childElementCount || !hamburger || !brand || !topNav || !themeToggle) {
  console.log("\nFAIL");
  process.exit(1);
}
console.log("\nPASS");
window.close();

// This script exists because of a real production outage: the shared-nav
// migration replaced every page's hardcoded header with the empty
// #siteHeader placeholder, on the assumption that app.js already had a
// renderSiteHeader() to populate it (it did, in the prototype repo used to
// build the migration tooling - it did NOT in this repo's actual app.js).
// validate_shared_nav.py only checks static HTML, so it never would have
// caught this - the placeholder markup was always correct, app.js just
// never filled it in. Run this after any app.js change that touches
// header/drawer/theme-toggle rendering, not just after HTML migrations.
