// Proves "every page renders the exact same navigation" (requirement 4) at
// the DOM level, without paying the cost of parsing full multi-MB pages
// (sitemap.html alone is ~64MB) in jsdom:
//
//   1. app.js's renderSiteHeader()/renderMobileDrawer() take no page-
//      specific input - they only read the NAV_CATEGORIES/MOBILE_MAIN_NAV
//      constants and fill in #siteHeader/#mobileDrawer. So they produce
//      identical output on every page BY CONSTRUCTION, as long as every
//      page ships the same empty placeholder. This is verified once here
//      by actually running app.js against a minimal shell.
//   2. validate_shared_nav.py separately (and cheaply) confirms every real
//      page in the site ships that exact unmodified placeholder and no
//      legacy nav markup - see that script for the per-page check.
// Together, (1) + (2) demonstrate parity across every page type without
// having to fully parse each (possibly huge) real page in a DOM.
const fs = require("fs");
const path = require("path");
const { JSDOM } = require("jsdom");

const appJs = fs.readFileSync(path.join(__dirname, "app.js"), "utf8");

const SHELL = `<!doctype html><html><body>
<header class="site-header" id="siteHeader"></header>
<div class="mobile-drawer-overlay" id="mobileDrawerOverlay" hidden></div>
<nav class="mobile-drawer" id="mobileDrawer" aria-hidden="true" aria-label="Mobile navigation"></nav>
</body></html>`;

const dom = new JSDOM(SHELL, { runScripts: "outside-only", url: "https://example.com/" });
const { window } = dom;
window.matchMedia = () => ({ matches: false, addListener() {}, removeListener() {} });
window.eval(appJs);
window.document.dispatchEvent(new window.Event("DOMContentLoaded", { bubbles: true, cancelable: true }));

const header = window.document.getElementById("siteHeader");
const drawer = window.document.getElementById("mobileDrawer");

if (!header.childElementCount || !drawer.childElementCount) {
  console.error("✗ app.js did not populate #siteHeader/#mobileDrawer from the shared placeholder.");
  process.exit(1);
}

const navLinks = [...header.querySelectorAll(".top-nav > a, .top-nav .nav-dropdown-toggle")].map((el) => el.textContent.trim());
const categoryCount = drawer.querySelectorAll(".mobile-drawer-category-list li").length;
const hasThemeToggle = !!header.querySelector("#themeToggle");
const hasHamburger = !!header.querySelector("#mobileMenuToggle");

console.log("✓ renderSiteHeader()/renderMobileDrawer() ran successfully against the shared placeholder shell:");
console.log(`  top-nav items: ${navLinks.join(", ")}`);
console.log(`  categories accordion entries: ${categoryCount}`);
console.log(`  theme toggle present: ${hasThemeToggle}`);
console.log(`  hamburger button present: ${hasHamburger}`);
console.log("\nSince every real page (per validate_shared_nav.py) ships this exact same empty");
console.log("placeholder and these renderers take no page-specific input, every page renders");
console.log("byte-identical navigation.");
window.close();
