(function () {
"use strict";
// Single source of truth for the site-wide "Categories" nav dropdown.
// Every page's dropdown (desktop #categoriesNavMenu and mobile
// #categoriesNavMenuMobile) is rendered from this list by
// renderCategoryDropdownMenus() below, so adding, removing, or
// reordering a category here updates every page automatically.
const NAV_CATEGORIES = [
{ href: "/length/", label: "Length" },
{ href: "/area/", label: "Area" },
{ href: "/volume/", label: "Volume" },
{ href: "/weight/", label: "Weight" },
{ href: "/temperature/", label: "Temperature" },
{ href: "/time/", label: "Time" },
{ href: "/speed/", label: "Speed" },
{ href: "/pressure/", label: "Pressure" },
{ href: "/power/", label: "Power" },
{ href: "/energy/", label: "Energy" },
{ href: "/electricity/", label: "Electricity" },
{ href: "/frequency/", label: "Frequency" },
{ href: "/angle/", label: "Angle" },
{ href: "/digital/", label: "Digital storage" },
{ href: "/currency/", label: "Currency" },
{ href: "/density/", label: "Density" },
{ href: "/flow-rate/", label: "Flow Rate" },
{ href: "/agriculture/", label: "Agriculture" },
{ href: "/astronomy/", label: "Astronomy" },
{ href: "/chemistry/", label: "Chemistry" },
{ href: "/cooking/", label: "Cooking" },
{ href: "/engineering/", label: "Engineering" },
{ href: "/force/", label: "Force" },
{ href: "/fuel-economy/", label: "Fuel Economy" },
{ href: "/radiation/", label: "Radiation" },
{ href: "/scientific/", label: "Scientific" },
{ href: "/torque/", label: "Torque" }
];
function renderCategoryDropdownMenus() {
const menus = document.querySelectorAll("#categoriesNavMenu, #categoriesNavMenuMobile");
if (!menus.length) return;
const itemsHtml = NAV_CATEGORIES.map(
(category) => `<li><a href="${category.href}">${category.label}</a></li>`
).join("");
menus.forEach((menu) => {
menu.innerHTML = itemsHtml;
});
}
// ---------------------------------------------------------------------
// Mobile drawer navigation (hamburger menu, <=820px).
// One consistent line-icon set (hand-drawn in the same stroke style as
// the site's existing nav-caret/theme-dot glyphs) used for both the main
// nav rows and every category row. Categories are NOT duplicated here —
// the drawer's "All Categories" list renders straight from
// NAV_CATEGORIES, the same registry renderCategoryDropdownMenus() uses
// for the desktop dropdown, so adding/removing a category there updates
// the drawer automatically too.
// ---------------------------------------------------------------------
function drawerIcon(pathMarkup) {
return `<svg class="drawer-icon" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${pathMarkup}</svg>`;
}
const CHEVRON_ICON = `<svg class="drawer-chevron" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7.5 5l5 5-5 5"/></svg>`;
const MAIN_NAV_ICONS = {
converter: drawerIcon('<path d="M4 7h9"/><path d="M11 4.5 13.5 7 11 9.5"/><path d="M16 13H7"/><path d="M9 10.5 6.5 13 9 15.5"/>'),
categories: drawerIcon('<rect x="3" y="3" width="6" height="6" rx="1"/><rect x="11" y="3" width="6" height="6" rx="1"/><rect x="3" y="11" width="6" height="6" rx="1"/><rect x="11" y="11" width="6" height="6" rx="1"/>'),
calculators: drawerIcon('<rect x="4" y="2.5" width="12" height="15" rx="2"/><line x1="6.5" y1="6" x2="13.5" y2="6"/><line x1="6.5" y1="9.7" x2="6.5" y2="9.7"/><line x1="10" y1="9.7" x2="10" y2="9.7"/><line x1="13.5" y1="9.7" x2="13.5" y2="9.7"/><line x1="6.5" y1="12.6" x2="6.5" y2="12.6"/><line x1="10" y1="12.6" x2="10" y2="12.6"/><line x1="13.5" y1="12.6" x2="13.5" y2="12.6"/><line x1="6.5" y1="15.5" x2="6.5" y2="15.5"/>'),
popular: drawerIcon('<path d="M10 17c-3 0-5-2-5-4.7 0-2 1.3-3.2 2-4.8.3 1 .2 2 1 2.3-.3-2.7 1-4.7 3-6 .1 2 .1 3 1.5 4.3C13.8 9.3 15 10.7 15 12.3 15 15 13 17 10 17z"/>'),
guides: drawerIcon('<path d="M10 5c-1.5-1-3.5-1.3-5.5-1v11c2 0 4 .3 5.5 1.3"/><path d="M10 5c1.5-1 3.5-1.3 5.5-1v11c-2 0-4 .3-5.5 1.3"/><path d="M10 5v11.3"/>'),
sitemap: drawerIcon('<path d="M3 5.5 7.5 4l5 1.5 4-1.5v11l-4 1.5-5-1.5-4.5 1.5z"/><path d="M7.5 4v11.5"/><path d="M12.5 5.5V17"/>'),
about: drawerIcon('<circle cx="10" cy="10" r="7"/><line x1="10" y1="9" x2="10" y2="13.5"/><line x1="10" y1="6.3" x2="10" y2="6.3"/>'),
contact: drawerIcon('<rect x="3" y="5" width="14" height="10" rx="1.5"/><path d="M3.5 5.8 10 11l6.5-5.2"/>')
};
// Keyed by the category slug parsed from NAV_CATEGORIES href (e.g.
// "/length/" -> "length"), so this stays in sync automatically as long
// as new categories reuse an existing slug or fall back to the default.
const CATEGORY_ICONS = {
length: drawerIcon('<path d="M3 14 14 3l3 3L6 17z"/><path d="M9.5 7.5l1.5 1.5"/><path d="M6.5 10.5 8 12"/><path d="M12.5 4.5 14 6"/>'),
area: drawerIcon('<rect x="4" y="4" width="12" height="12" rx="1.5"/>'),
volume: drawerIcon('<path d="M10 3 17 6.5 17 13.5 10 17 3 13.5 3 6.5z"/><path d="M3 6.5 10 10l7-3.5"/><path d="M10 10v7"/>'),
weight: drawerIcon('<path d="M10 3v14"/><path d="M4 6h12"/><path d="M4 6 1.5 11a2.5 2.5 0 0 0 5 0z"/><path d="M16 6l-2.5 5a2.5 2.5 0 0 0 5 0z"/>'),
temperature: drawerIcon('<path d="M10 3a2 2 0 0 0-2 2v7.1a3.5 3.5 0 1 0 4 0V5a2 2 0 0 0-2-2z"/><line x1="10" y1="14.5" x2="10" y2="14.5" stroke-width="3"/>'),
time: drawerIcon('<circle cx="10" cy="10" r="7"/><path d="M10 6v4l3 2"/>'),
speed: drawerIcon('<path d="M3 13a7 7 0 1 1 14 0"/><path d="M10 13l4-4"/><line x1="10" y1="13" x2="10" y2="13" stroke-width="3"/>'),
pressure: drawerIcon('<circle cx="10" cy="10" r="7"/><path d="M10 10l3-3"/><line x1="10" y1="6" x2="10" y2="6" stroke-width="3"/>'),
power: drawerIcon('<circle cx="10" cy="10" r="7"/><path d="M11 6 7 11h3l-1 4 4-5h-3z"/>'),
energy: drawerIcon('<path d="M11 2 4 12h5l-1 6 7-10h-5z"/>'),
electricity: drawerIcon('<path d="M8 3v4"/><path d="M12 3v4"/><path d="M6 7h8v3a4 4 0 0 1-4 4 4 4 0 0 1-4-4z"/><path d="M10 14v3"/>'),
frequency: drawerIcon('<path d="M2 10h2l1.5-5L9 15l2-8 1.5 3H18"/>'),
angle: drawerIcon('<path d="M4 15a6 6 0 0 1 12 0"/><path d="M4 15h12"/><path d="M10 15V9"/>'),
digital: drawerIcon('<rect x="3" y="4" width="14" height="12" rx="2"/><line x1="3" y1="10" x2="17" y2="10"/><line x1="6" y1="13.5" x2="6" y2="13.5" stroke-width="3"/>'),
currency: drawerIcon('<circle cx="10" cy="10" r="7"/><path d="M10 6.5v7"/><path d="M12 8a2 2 0 0 0-2-1.5 2 2 0 0 0 0 4 2 2 0 0 1 0 4 2 2 0 0 1-2-1.5"/>'),
density: drawerIcon('<path d="M8 3h4"/><path d="M9 3v5l-4.5 7a1.5 1.5 0 0 0 1.3 2.2h8.4A1.5 1.5 0 0 0 15.5 15L11 8V3"/>'),
"flow-rate": drawerIcon('<path d="M10 3s5 6 5 9.5A5 5 0 0 1 5 12.5C5 9 10 3 10 3z"/>'),
agriculture: drawerIcon('<path d="M10 17V6"/><path d="M10 6 7 3"/><path d="M10 6l3-3"/><path d="M10 9 7.5 6.5"/><path d="M10 9l2.5-2.5"/><path d="M10 12 7.5 9.5"/><path d="M10 12l2.5-2.5"/>'),
astronomy: drawerIcon('<circle cx="10" cy="10" r="2"/><ellipse cx="10" cy="10" rx="8" ry="3.2"/>'),
chemistry: drawerIcon('<path d="M8 3h4"/><path d="M8 3v5l-4 8.5A1 1 0 0 0 4.9 18h10.2a1 1 0 0 0 .9-1.5L12 8V3"/><path d="M6.5 12h7"/>'),
cooking: drawerIcon('<path d="M4 9h12"/><path d="M5 9v6a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9"/><path d="M2 9h2"/><path d="M16 9h2"/><path d="M10 6V4"/>'),
engineering: drawerIcon('<circle cx="10" cy="10" r="2.4"/><path d="M10 3v2"/><path d="M10 15v2"/><path d="M3 10h2"/><path d="M15 10h2"/><path d="M5.2 5.2l1.4 1.4"/><path d="M13.4 13.4l1.4 1.4"/><path d="M14.8 5.2l-1.4 1.4"/><path d="M6.6 13.4l-1.4 1.4"/>'),
force: drawerIcon('<path d="M4 10h10"/><path d="M11 6l3 4-3 4"/>'),
"fuel-economy": drawerIcon('<rect x="4" y="4" width="7" height="12" rx="1"/><path d="M11 8h2.5a1.5 1.5 0 0 1 1.5 1.5V13a1 1 0 0 0 2 0V8l-2-2"/><line x1="4" y1="8" x2="11" y2="8"/>'),
radiation: drawerIcon('<line x1="10" y1="10" x2="10" y2="10" stroke-width="3.2"/><circle cx="10" cy="10" r="7"/><path d="M10 3.5v3.4"/><path d="M15.2 12.7 12.3 11"/><path d="M4.8 12.7 7.7 11"/>'),
scientific: drawerIcon('<path d="M6 17h8"/><path d="M9 3 8 9"/><path d="M12 3l1 6"/><path d="M6.5 13.5a3.5 3.5 0 1 1 7 0"/>'),
torque: drawerIcon('<path d="M13.5 3.5a3.5 3.5 0 0 0-4.9 4.2L4 12.3v2.2h2.2l4.6-4.6a3.5 3.5 0 0 0 4.2-4.9l-2.3 2.3-1.4-1.4z"/>')
};
const DEFAULT_CATEGORY_ICON = drawerIcon('<path d="M4 7h9"/><path d="M11 4.5 13.5 7 11 9.5"/><path d="M16 13H7"/><path d="M9 10.5 6.5 13 9 15.5"/>');
// Every entry here is a real destination already used elsewhere in the
// site's own header nav (index.html#converter, index.html#calculators,
// index.html#popular, guides.html, sitemap.html, about.html,
// contact.html) - nothing new is invented.
const MOBILE_MAIN_NAV = [
{ id: "converter", label: "Converter", href: "index.html#converter" },
{ id: "categories", label: "Categories", expand: true },
{ id: "calculators", label: "Calculators", href: "index.html#calculators" },
{ id: "popular", label: "Popular", href: "index.html#popular" },
{ id: "guides", label: "Guides", href: "guides.html" },
{ id: "sitemap", label: "Sitemap", href: "sitemap.html" },
{ id: "about", label: "About", href: "about.html" },
{ id: "contact", label: "Contact", href: "contact.html" }
];
function categorySlugFromHref(href) {
const parts = String(href || "").split("/").filter(Boolean);
return parts.length ? parts[parts.length - 1] : "";
}
// Renders the shared site header (hamburger button, brand/logo, desktop
// top-nav with the Categories dropdown, and theme toggle) into the empty
// #siteHeader placeholder that every page now ships. This is the missing
// counterpart to renderMobileDrawer() below: both fill an empty shared
// placeholder from the same NAV_CATEGORIES/MOBILE_MAIN_NAV data so every
// page's navigation is rendered from one source of truth instead of being
// hand-authored per page.
function renderSiteHeader() {
const header = document.getElementById("siteHeader");
if (!header || header.childElementCount) return;
const topNavItemsHtml = MOBILE_MAIN_NAV.map((item) => {
if (item.expand) {
return `<div class="nav-dropdown"><button type="button" class="nav-dropdown-toggle" aria-haspopup="true" aria-expanded="false" aria-controls="categoriesNavMenu">${item.label}<span class="nav-caret" aria-hidden="true"></span></button><ul class="nav-dropdown-menu" id="categoriesNavMenu"></ul></div>`;
}
return `<a href="${item.href}">${item.label}</a>`;
}).join("");
header.innerHTML = `
<button class="mobile-menu-toggle" id="mobileMenuToggle" type="button" aria-label="Open menu" aria-haspopup="true" aria-expanded="false" aria-controls="mobileDrawer"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg></button>
<a class="brand" href="/index.html" aria-label="Universal Converter home"><img src="/logo.svg" alt="Universal Converter logo" width="38" height="38"><span>Universal Converter</span></a>
<nav class="top-nav" aria-label="Primary navigation">${topNavItemsHtml}</nav>
<button class="theme-toggle" id="themeToggle" type="button" aria-label="Switch color theme"><span class="theme-dot" aria-hidden="true"></span><span id="themeText">Dark</span></button>
`;
}
function renderMobileDrawer() {
const drawer = document.getElementById("mobileDrawer");
if (!drawer) return;
// On an SEO conversion page, the drawer's Categories submenu is
// restricted to that page's own category, reusing the exact same
// resolution already used for the desktop/tablet left sidebar
// (seoPageRestrictedCategoryId()) - not a separate guess from the H1.
// The homepage (no seo-page body class) is unaffected: the function
// returns null there and the full 27-category list renders as before.
const restrictedId = seoPageRestrictedCategoryId();
const restrictedHref = restrictedId ? categoryPageUrl(restrictedId) : null;
const navCategorySource = restrictedHref
  ? NAV_CATEGORIES.filter((category) => category.href === restrictedHref)
  : NAV_CATEGORIES;
// The categories submenu markup is built first so it can be embedded
// directly inside the "Categories" <li> below. It must live in normal
// document flow immediately after the Categories toggle button (not as
// a sibling appended after the whole nav list), otherwise it renders
// detached from the row that opens it.
const categoryItemsHtml = navCategorySource.map((category) => {
const slug = categorySlugFromHref(category.href);
const icon = CATEGORY_ICONS[slug] || DEFAULT_CATEGORY_ICON;
const unitCountSuffix = restrictedId ? ` (${categoryMap.get(restrictedId).units.length.toLocaleString("en-US")} units)` : "";
return `<li><a class="mobile-drawer-category-link" href="${category.href}">${icon}<span>${category.label}${unitCountSuffix}</span></a></li>`;
}).join("");
const navItemsHtml = MOBILE_MAIN_NAV.map((item) => {
const icon = MAIN_NAV_ICONS[item.id] || DEFAULT_CATEGORY_ICON;
if (item.expand) {
return `<li class="mobile-drawer-categories-item">
<button type="button" class="mobile-drawer-link mobile-drawer-categories-toggle" id="mobileDrawerCategoriesToggle" aria-expanded="false" aria-controls="mobileDrawerCategoriesPanel">${icon}<span>${item.label}</span>${CHEVRON_ICON}</button>
<div class="mobile-drawer-categories" id="mobileDrawerCategoriesPanel">
<ul class="mobile-drawer-category-list">${categoryItemsHtml}</ul>
</div>
</li>`;
}
return `<li><a class="mobile-drawer-link" href="${item.href}">${icon}<span>${item.label}</span>${CHEVRON_ICON}</a></li>`;
}).join("");
drawer.innerHTML = `
<div class="mobile-drawer-head">
<button type="button" class="mobile-drawer-close" id="mobileDrawerClose" aria-label="Close menu">
<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><line x1="5" y1="5" x2="15" y2="15"/><line x1="15" y1="5" x2="5" y2="15"/></svg>
</button>
</div>
<ul class="mobile-drawer-nav">${navItemsHtml}</ul>
`;
}
// Expands/collapses the Categories submenu as a true accordion: the
// panel stays `position: static` and part of normal document flow, so
// animating its height naturally pushes Calculators/Popular/Guides/etc.
// downward instead of overlaying them.
function toggleCategoriesPanel(panel, open) {
// Clear any in-progress transition listener before starting a new one.
if (panel._collapseTransitionHandler) {
panel.removeEventListener("transitionend", panel._collapseTransitionHandler);
panel._collapseTransitionHandler = null;
}
if (open) {
// Add the class first so padding is in place before we measure the
// content height we're animating toward.
panel.classList.add("open");
const targetHeight = panel.scrollHeight;
panel.style.maxHeight = "0px";
// Force a reflow so the browser registers the 0px starting point
// before we animate to the measured content height.
void panel.offsetHeight;
panel.style.maxHeight = targetHeight + "px";
const onDone = (event) => {
if (event.target !== panel || event.propertyName !== "max-height") return;
// Let the panel grow/shrink freely after opening (e.g. on resize)
// instead of staying pinned to the height measured at open time.
panel.style.maxHeight = "none";
panel.removeEventListener("transitionend", onDone);
panel._collapseTransitionHandler = null;
};
panel._collapseTransitionHandler = onDone;
panel.addEventListener("transitionend", onDone);
} else {
// Pin the panel to its current pixel height first (it may currently
// be "none") so there is a concrete starting point to animate from.
const currentHeight = panel.scrollHeight;
panel.style.maxHeight = currentHeight + "px";
void panel.offsetHeight;
panel.style.maxHeight = "0px";
const onDone = (event) => {
if (event.target !== panel || event.propertyName !== "max-height") return;
// Only now drop the padding, once the panel is visually collapsed.
panel.classList.remove("open");
panel.removeEventListener("transitionend", onDone);
panel._collapseTransitionHandler = null;
};
panel._collapseTransitionHandler = onDone;
panel.addEventListener("transitionend", onDone);
}
}
function initMobileDrawer() {
const toggle = document.getElementById("mobileMenuToggle");
const overlay = document.getElementById("mobileDrawerOverlay");
const drawer = document.getElementById("mobileDrawer");
if (!toggle || !overlay || !drawer) return null;
let lastFocused = null;
function focusableElements() {
return Array.prototype.slice.call(
drawer.querySelectorAll('a[href], button:not([disabled])')
).filter((el) => el.offsetParent !== null);
}
function openDrawer() {
lastFocused = document.activeElement;
overlay.hidden = false;
requestAnimationFrame(() => {
overlay.classList.add("open");
drawer.classList.add("open");
});
drawer.setAttribute("aria-hidden", "false");
toggle.setAttribute("aria-expanded", "true");
document.body.classList.add("mobile-drawer-open");
const main = document.querySelector("main");
if (main) main.setAttribute("inert", "");
const footer = document.querySelector(".site-footer");
if (footer) footer.setAttribute("inert", "");
const closeBtn = document.getElementById("mobileDrawerClose");
if (closeBtn) closeBtn.focus();
}
function closeDrawer() {
overlay.classList.remove("open");
drawer.classList.remove("open");
drawer.setAttribute("aria-hidden", "true");
toggle.setAttribute("aria-expanded", "false");
document.body.classList.remove("mobile-drawer-open");
const main = document.querySelector("main");
if (main) main.removeAttribute("inert");
const footer = document.querySelector(".site-footer");
if (footer) footer.removeAttribute("inert");
window.setTimeout(() => {
if (!drawer.classList.contains("open")) overlay.hidden = true;
}, 260);
if (lastFocused && typeof lastFocused.focus === "function") {
lastFocused.focus();
} else {
toggle.focus();
}
}
toggle.addEventListener("click", () => {
const isOpen = drawer.classList.contains("open");
if (isOpen) {
closeDrawer();
} else {
openDrawer();
}
});
overlay.addEventListener("click", closeDrawer);
drawer.addEventListener("click", (event) => {
const closeBtn = event.target.closest("#mobileDrawerClose");
if (closeBtn) {
closeDrawer();
return;
}
const categoriesToggle = event.target.closest("#mobileDrawerCategoriesToggle");
if (categoriesToggle) {
const panel = document.getElementById("mobileDrawerCategoriesPanel");
const isExpanded = categoriesToggle.getAttribute("aria-expanded") === "true";
categoriesToggle.setAttribute("aria-expanded", String(!isExpanded));
categoriesToggle.classList.toggle("is-open", !isExpanded);
if (panel) toggleCategoriesPanel(panel, !isExpanded);
return;
}
// Any real navigation link inside the drawer: let the browser follow
// it, but also close the drawer so it isn't left open behind the new
// page (relevant for same-page anchors like index.html#converter).
const link = event.target.closest("a[href]");
if (link) closeDrawer();
});
document.addEventListener("keydown", (event) => {
if (event.key !== "Escape") return;
if (!drawer.classList.contains("open")) return;
closeDrawer();
});
drawer.addEventListener("keydown", (event) => {
if (event.key !== "Tab") return;
const focusable = focusableElements();
if (!focusable.length) return;
const first = focusable[0];
const last = focusable[focusable.length - 1];
if (event.shiftKey && document.activeElement === first) {
event.preventDefault();
last.focus();
} else if (!event.shiftKey && document.activeElement === last) {
event.preventDefault();
first.focus();
}
});
return closeDrawer;
}
// ---------------------------------------------------------------------
// Responsive guard: the drawer is tablet/mobile-only (<1024px). It is
// never rendered or initialized while the viewport is desktop-width,
// and it's lazily rendered/initialized the first time the viewport
// drops below 1024px - so resizing a browser window, or rotating a
// tablet, across that breakpoint works correctly with no duplicate
// listeners and no drawer left open behind the desktop nav.
// ---------------------------------------------------------------------
const DESKTOP_NAV_MQ = window.matchMedia("(min-width: 1024px)");
let mobileDrawerReady = false;
let closeMobileDrawer = null;
function setupResponsiveMobileNav() {
if (DESKTOP_NAV_MQ.matches) {
if (closeMobileDrawer) closeMobileDrawer();
return;
}
if (mobileDrawerReady) return;
renderMobileDrawer();
closeMobileDrawer = initMobileDrawer();
mobileDrawerReady = true;
}
if (typeof DESKTOP_NAV_MQ.addEventListener === "function") {
DESKTOP_NAV_MQ.addEventListener("change", setupResponsiveMobileNav);
} else if (typeof DESKTOP_NAV_MQ.addListener === "function") {
DESKTOP_NAV_MQ.addListener(setupResponsiveMobileNav);
}
const storageKeys = {
theme: "uc-theme",
favorites: "uc-favorites",
recent: "uc-recent",
searches: "uc-recent-searches",
history: "uc-history",
precision: "uc-precision",
notation: "uc-notation",
customUnits: "uc-custom-units",
newsletter: "uc-newsletter"
};
const prefixes = [
["quetta", "Quetta", "Q", 1e30],
["ronna", "Ronna", "R", 1e27],
["yotta", "Yotta", "Y", 1e24],
["zetta", "Zetta", "Z", 1e21],
["exa", "Exa", "E", 1e18],
["peta", "Peta", "P", 1e15],
["tera", "Tera", "T", 1e12],
["giga", "Giga", "G", 1e9],
["mega", "Mega", "M", 1e6],
["kilo", "Kilo", "k", 1e3],
["hecto", "Hecto", "h", 1e2],
["deca", "Deca", "da", 1e1],
["", "", "", 1],
["deci", "Deci", "d", 1e-1],
["centi", "Centi", "c", 1e-2],
["milli", "Milli", "m", 1e-3],
["micro", "Micro", "u", 1e-6],
["nano", "Nano", "n", 1e-9],
["pico", "Pico", "p", 1e-12],
["femto", "Femto", "f", 1e-15],
["atto", "Atto", "a", 1e-18],
["zepto", "Zepto", "z", 1e-21],
["yocto", "Yocto", "y", 1e-24],
["ronto", "Ronto", "r", 1e-27],
["quecto", "Quecto", "q", 1e-30]
];
const seoConversions = [
{ slug: "meter-to-feet", categoryId: "length", from: "meter", to: "foot", title: "Meter to Feet", description: "Convert meters to feet with formula, examples, FAQ, and related length conversions." },
{ slug: "meters-to-feet", categoryId: "length", from: "meter", to: "foot", title: "Meters to Feet", description: "Convert meters to feet with a precise formula, examples, FAQ, and related length conversions." },
{ slug: "feet-to-meters", categoryId: "length", from: "foot", to: "meter", title: "Feet to Meters", description: "Convert feet to meters with exact international foot definitions and related length conversions." },
{ slug: "miles-to-km", categoryId: "length", from: "mile", to: "kilometer", title: "Miles to Kilometers", description: "Convert miles to kilometers with formula, examples, FAQ, and related distance conversions." },
{ slug: "km-to-miles", categoryId: "length", from: "kilometer", to: "mile", title: "Kilometers to Miles", description: "Convert kilometers to miles instantly with formula and related distance conversions." },
{ slug: "inches-to-cm", categoryId: "length", from: "inch", to: "centimeter", title: "Inches to Centimeters", description: "Convert inches to centimeters with exact formula and related length conversions." },
{ slug: "kg-to-lbs", categoryId: "weight", from: "kilogram", to: "pound", title: "kg to lbs", description: "Convert kilograms to pounds with a precise formula, FAQ, and related weight conversions." },
{ slug: "lbs-to-kg", categoryId: "weight", from: "pound", to: "kilogram", title: "lbs to kg", description: "Convert pounds to kilograms with precise formula, FAQ, and related weight conversions." },
{ slug: "grams-to-ounces", categoryId: "weight", from: "gram", to: "ounce", title: "Grams to Ounces", description: "Convert grams to ounces instantly with formula and related cooking or shipping conversions." },
{ slug: "celsius-to-fahrenheit", categoryId: "temperature", from: "celsius", to: "fahrenheit", title: "Celsius to Fahrenheit", description: "Convert Celsius to Fahrenheit with formula explanation, examples, FAQ, and related temperature conversions." },
{ slug: "fahrenheit-to-celsius", categoryId: "temperature", from: "fahrenheit", to: "celsius", title: "Fahrenheit to Celsius", description: "Convert Fahrenheit to Celsius with formula explanation, examples, and related temperature conversions." },
{ slug: "liter-to-gallon", categoryId: "volume", from: "liter", to: "gallon_us", title: "Liter to Gallon", description: "Convert liters to US gallons with formula, examples, FAQ, and related volume conversions." },
{ slug: "liters-to-gallons", categoryId: "volume", from: "liter", to: "gallon_us", title: "Liters to Gallons", description: "Convert liters to US gallons with a precise volume formula and related conversions." },
{ slug: "gallons-to-liters", categoryId: "volume", from: "gallon_us", to: "liter", title: "Gallons to Liters", description: "Convert US gallons to liters with precise formula and related liquid volume conversions." },
{ slug: "acre-to-hectare", categoryId: "area", from: "acre", to: "hectare", title: "Acre to Hectare", description: "Convert acres to hectares for agriculture, land, mapping, and property calculations." },
{ slug: "acres-to-hectares", categoryId: "area", from: "acre", to: "hectare", title: "Acres to Hectares", description: "Convert acres to hectares for agriculture, land, mapping, and property calculations." },
{ slug: "hectares-to-acres", categoryId: "area", from: "hectare", to: "acre", title: "Hectares to Acres", description: "Convert hectares to acres with formula, examples, FAQ, and related land conversions." },
{ slug: "square-feet-to-square-meters", categoryId: "area", from: "square_foot", to: "square_meter", title: "Square Feet to Square Meters", description: "Convert square feet to square meters for construction, real estate, and engineering work." },
{ slug: "mph-to-kmh", categoryId: "speed", from: "mile_per_hour", to: "kilometer_per_hour", title: "mph to km/h", description: "Convert miles per hour to kilometers per hour with formula and related speed conversions." },
{ slug: "psi-to-bar", categoryId: "pressure", from: "psi", to: "bar", title: "PSI to Bar", description: "Convert PSI to bar for pressure, engineering, tires, pumps, and industrial calculations." },
{ slug: "gb-to-mb", categoryId: "digital", from: "gigabyte", to: "megabyte", title: "GB to MB", description: "Convert gigabytes to megabytes with decimal storage definitions, examples, FAQ, and related digital storage conversions." },
{ slug: "watts-to-horsepower", categoryId: "power", from: "watt", to: "horsepower_mechanical", title: "Watts to Horsepower", description: "Convert watts to horsepower with formula and related power conversions." }
];
const popularConversions = [
{ name: "Kilograms to Pounds", displayName: "1 kg to lbs", category: "weight", from: "kg", to: "lb", value: "1", slug: "kg-to-lbs" },
{ name: "Celsius to Fahrenheit", displayName: "Celsius to Fahrenheit", category: "temperature", from: "c", to: "f", value: "0", slug: "celsius-to-fahrenheit" },
{ name: "Miles to Kilometers", displayName: "Miles to Kilometers", category: "length", from: "mi", to: "km", value: "1", slug: "miles-to-km" },
{ name: "Acres to Hectares", displayName: "Acres to Hectares", category: "area", from: "acre", to: "ha", value: "1", slug: "acres-to-hectares" },
{ name: "GB to MB", displayName: "GB to MB", category: "digital", from: "gb", to: "mb", value: "1", slug: "gb-to-mb" }
];
const blogPosts = [
{
title: "How unit converters stay accurate",
tag: "Accuracy",
summary: "Most reliable converters normalize values through a base unit, then format the result for humans.",
href: "unit-converter.html"
},
{
title: "Metric, imperial, and US customary units",
tag: "Global units",
summary: "A global converter needs overlapping systems, aliases, and formula notes so users find the unit they expect.",
href: "metric-vs-imperial.html"
},
{
title: "Celsius vs Fahrenheit",
tag: "Temperature",
summary: "Temperature conversion uses an offset formula, so the difference between scales matters more than a simple multiplier.",
href: "celsius-vs-fahrenheit.html"
},
{
title: "How digital storage units work",
tag: "Digital storage",
summary: "Bits, bytes, decimal prefixes, and binary prefixes explain why storage conversions can look different across devices.",
href: "digital-storage-units-guide.html"
}
];
const currencyFallbackRates = {
USD: 1.0,
EUR: 1.087,
GBP: 1.27,
JPY: 0.0064,
CHF: 1.11,
CAD: 0.73,
AUD: 0.66,
NZD: 0.6,
CNY: 0.138,
HKD: 0.128,
SGD: 0.745,
KRW: 0.00072,
INR: 0.012,
IDR: 6.2e-05,
MYR: 0.213,
THB: 0.0275,
PHP: 0.0172,
VND: 3.94e-05,
PKR: 0.0036,
BDT: 0.0084,
LKR: 0.0033,
NPR: 0.0075,
MMK: 0.00048,
KHR: 0.00024,
LAK: 4.6e-05,
BND: 0.745,
MOP: 0.124,
TWD: 0.0313,
MNT: 0.00029,
KZT: 0.00185,
UZS: 7.8e-05,
KGS: 0.0113,
TJS: 0.0916,
TMT: 0.286,
AFN: 0.0142,
AMD: 0.0026,
AZN: 0.588,
GEL: 0.365,
RUB: 0.0113,
BYN: 0.305,
UAH: 0.024,
MDL: 0.0558,
PLN: 0.253,
CZK: 0.0437,
HUF: 0.00277,
RON: 0.219,
BGN: 0.556,
HRK: 0.144,
RSD: 0.00927,
ALL: 0.0108,
MKD: 0.0177,
BAM: 0.556,
ISK: 0.00727,
NOK: 0.094,
SEK: 0.0958,
DKK: 0.1458,
TRY: 0.0289,
ILS: 0.269,
JOD: 1.41,
LBP: 1.12e-05,
SYP: 7.69e-05,
IQD: 0.000763,
IRR: 2.38e-05,
SAR: 0.2666,
AED: 0.2723,
QAR: 0.2747,
KWD: 3.253,
BHD: 2.653,
OMR: 2.6,
YER: 0.004,
EGP: 0.0204,
LYD: 0.206,
TND: 0.322,
DZD: 0.00745,
MAD: 0.0993,
MRU: 0.0252,
XOF: 0.00166,
XAF: 0.00166,
GHS: 0.068,
NGN: 0.00067,
XPF: 0.00911,
KES: 0.0077,
TZS: 0.000388,
UGX: 0.000268,
RWF: 0.000715,
BIF: 0.000343,
ETB: 0.0079,
SOS: 0.00175,
DJF: 0.00562,
SDG: 0.00167,
SSP: 0.000386,
ERN: 0.0667,
ZAR: 0.055,
NAD: 0.055,
BWP: 0.0735,
SZL: 0.055,
LSL: 0.055,
ZMW: 0.0385,
MWK: 0.000576,
MZN: 0.0157,
AOA: 0.00109,
CDF: 0.000355,
MGA: 0.000221,
MUR: 0.0217,
SCR: 0.0714,
KMF: 0.00221,
CVE: 0.0102,
STN: 0.0437,
GMD: 0.0139,
GNF: 0.000116,
SLE: 0.0435,
LRD: 0.00521,
MXN: 0.055,
BRL: 0.184,
ARS: 0.00104,
CLP: 0.00104,
COP: 0.00023,
PEN: 0.267,
BOB: 0.144,
PYG: 0.000134,
UYU: 0.0247,
VES: 0.0263,
GYD: 0.00478,
SRD: 0.0282,
TTD: 0.147,
JMD: 0.00637,
BSD: 1.0,
BBD: 0.5,
BZD: 0.496,
XCD: 0.37,
HTG: 0.00758,
DOP: 0.0166,
CUP: 0.0417,
HNL: 0.0405,
GTQ: 0.129,
NIO: 0.0272,
CRC: 0.00196,
PAB: 1.0,
PGK: 0.263,
FJD: 0.448,
SBD: 0.119,
TOP: 0.418,
VUV: 0.00836,
WST: 0.365,
BTN: 0.012,
MVR: 0.0648,
BMD: 1.0,
KYD: 1.2,
ANG: 0.559,
AWG: 0.559,
SHP: 1.27,
FKP: 1.27,
GIP: 1.27,
ZWG: 0.037,
KPW: 0.00111,
XCG: 0.559
};
const currencyMeta = {
USD: { name: 'US Dollar', country: 'United States', symbol: '$' },
EUR: { name: 'Euro', country: 'Eurozone', symbol: '€' },
GBP: { name: 'Pound Sterling', country: 'United Kingdom', symbol: '£' },
JPY: { name: 'Japanese Yen', country: 'Japan', symbol: '¥' },
CHF: { name: 'Swiss Franc', country: 'Switzerland', symbol: 'CHF' },
CAD: { name: 'Canadian Dollar', country: 'Canada', symbol: '$' },
AUD: { name: 'Australian Dollar', country: 'Australia', symbol: '$' },
NZD: { name: 'New Zealand Dollar', country: 'New Zealand', symbol: '$' },
CNY: { name: 'Chinese Yuan', country: 'China', symbol: '¥' },
HKD: { name: 'Hong Kong Dollar', country: 'Hong Kong', symbol: '$' },
SGD: { name: 'Singapore Dollar', country: 'Singapore', symbol: '$' },
KRW: { name: 'South Korean Won', country: 'South Korea', symbol: '₩' },
INR: { name: 'Indian Rupee', country: 'India', symbol: '₹' },
IDR: { name: 'Indonesian Rupiah', country: 'Indonesia', symbol: 'Rp' },
MYR: { name: 'Malaysian Ringgit', country: 'Malaysia', symbol: 'RM' },
THB: { name: 'Thai Baht', country: 'Thailand', symbol: '฿' },
PHP: { name: 'Philippine Peso', country: 'Philippines', symbol: '₱' },
VND: { name: 'Vietnamese Dong', country: 'Vietnam', symbol: '₫' },
PKR: { name: 'Pakistani Rupee', country: 'Pakistan', symbol: '₨' },
BDT: { name: 'Bangladeshi Taka', country: 'Bangladesh', symbol: '৳' },
LKR: { name: 'Sri Lankan Rupee', country: 'Sri Lanka', symbol: 'Rs' },
NPR: { name: 'Nepalese Rupee', country: 'Nepal', symbol: 'Rs' },
MMK: { name: 'Myanmar Kyat', country: 'Myanmar', symbol: 'K' },
KHR: { name: 'Cambodian Riel', country: 'Cambodia', symbol: '៛' },
LAK: { name: 'Lao Kip', country: 'Laos', symbol: '₭' },
BND: { name: 'Brunei Dollar', country: 'Brunei', symbol: '$' },
MOP: { name: 'Macanese Pataca', country: 'Macao', symbol: 'MOP$' },
TWD: { name: 'New Taiwan Dollar', country: 'Taiwan', symbol: 'NT$' },
MNT: { name: 'Mongolian Tugrik', country: 'Mongolia', symbol: '₮' },
KZT: { name: 'Kazakhstani Tenge', country: 'Kazakhstan', symbol: '₸' },
UZS: { name: 'Uzbekistani Som', country: 'Uzbekistan', symbol: 'so\'m' },
KGS: { name: 'Kyrgyzstani Som', country: 'Kyrgyzstan', symbol: 'с' },
TJS: { name: 'Tajikistani Somoni', country: 'Tajikistan', symbol: 'SM' },
TMT: { name: 'Turkmenistani Manat', country: 'Turkmenistan', symbol: 'm' },
AFN: { name: 'Afghan Afghani', country: 'Afghanistan', symbol: '؋' },
AMD: { name: 'Armenian Dram', country: 'Armenia', symbol: '֏' },
AZN: { name: 'Azerbaijani Manat', country: 'Azerbaijan', symbol: '₼' },
GEL: { name: 'Georgian Lari', country: 'Georgia', symbol: '₾' },
RUB: { name: 'Russian Ruble', country: 'Russia', symbol: '₽' },
BYN: { name: 'Belarusian Ruble', country: 'Belarus', symbol: 'Br' },
UAH: { name: 'Ukrainian Hryvnia', country: 'Ukraine', symbol: '₴' },
MDL: { name: 'Moldovan Leu', country: 'Moldova', symbol: 'L' },
PLN: { name: 'Polish Zloty', country: 'Poland', symbol: 'zł' },
CZK: { name: 'Czech Koruna', country: 'Czechia', symbol: 'Kč' },
HUF: { name: 'Hungarian Forint', country: 'Hungary', symbol: 'Ft' },
RON: { name: 'Romanian Leu', country: 'Romania', symbol: 'lei' },
BGN: { name: 'Bulgarian Lev', country: 'Bulgaria', symbol: 'лв' },
HRK: { name: 'Croatian Kuna', country: 'Croatia (legacy)', symbol: 'kn' },
RSD: { name: 'Serbian Dinar', country: 'Serbia', symbol: 'дин' },
ALL: { name: 'Albanian Lek', country: 'Albania', symbol: 'L' },
MKD: { name: 'Macedonian Denar', country: 'North Macedonia', symbol: 'ден' },
BAM: { name: 'Bosnia-Herzegovina Mark', country: 'Bosnia and Herzegovina', symbol: 'KM' },
ISK: { name: 'Icelandic Krona', country: 'Iceland', symbol: 'kr' },
NOK: { name: 'Norwegian Krone', country: 'Norway', symbol: 'kr' },
SEK: { name: 'Swedish Krona', country: 'Sweden', symbol: 'kr' },
DKK: { name: 'Danish Krone', country: 'Denmark', symbol: 'kr' },
TRY: { name: 'Turkish Lira', country: 'Turkiye', symbol: '₺' },
ILS: { name: 'Israeli New Shekel', country: 'Israel', symbol: '₪' },
JOD: { name: 'Jordanian Dinar', country: 'Jordan', symbol: 'د.ا' },
LBP: { name: 'Lebanese Pound', country: 'Lebanon', symbol: 'ل.ل' },
SYP: { name: 'Syrian Pound', country: 'Syria', symbol: '£S' },
IQD: { name: 'Iraqi Dinar', country: 'Iraq', symbol: 'ع.د' },
IRR: { name: 'Iranian Rial', country: 'Iran', symbol: '﷼' },
SAR: { name: 'Saudi Riyal', country: 'Saudi Arabia', symbol: '﷼' },
AED: { name: 'UAE Dirham', country: 'United Arab Emirates', symbol: 'د.إ' },
QAR: { name: 'Qatari Riyal', country: 'Qatar', symbol: '﷼' },
KWD: { name: 'Kuwaiti Dinar', country: 'Kuwait', symbol: 'د.ك' },
BHD: { name: 'Bahraini Dinar', country: 'Bahrain', symbol: '.د.ب' },
OMR: { name: 'Omani Rial', country: 'Oman', symbol: '﷼' },
YER: { name: 'Yemeni Rial', country: 'Yemen', symbol: '﷼' },
EGP: { name: 'Egyptian Pound', country: 'Egypt', symbol: '£' },
LYD: { name: 'Libyan Dinar', country: 'Libya', symbol: 'ل.د' },
TND: { name: 'Tunisian Dinar', country: 'Tunisia', symbol: 'د.ت' },
DZD: { name: 'Algerian Dinar', country: 'Algeria', symbol: 'د.ج' },
MAD: { name: 'Moroccan Dirham', country: 'Morocco', symbol: 'د.م.' },
MRU: { name: 'Mauritanian Ouguiya', country: 'Mauritania', symbol: 'UM' },
XOF: { name: 'West African CFA Franc', country: 'West African Economic and Monetary Union', symbol: 'CFA' },
XAF: { name: 'Central African CFA Franc', country: 'Central African Economic and Monetary Community', symbol: 'FCFA' },
GHS: { name: 'Ghanaian Cedi', country: 'Ghana', symbol: '₵' },
NGN: { name: 'Nigerian Naira', country: 'Nigeria', symbol: '₦' },
XPF: { name: 'CFP Franc', country: 'French Polynesia / New Caledonia', symbol: '₣' },
KES: { name: 'Kenyan Shilling', country: 'Kenya', symbol: 'KSh' },
TZS: { name: 'Tanzanian Shilling', country: 'Tanzania', symbol: 'TSh' },
UGX: { name: 'Ugandan Shilling', country: 'Uganda', symbol: 'USh' },
RWF: { name: 'Rwandan Franc', country: 'Rwanda', symbol: 'FRw' },
BIF: { name: 'Burundian Franc', country: 'Burundi', symbol: 'FBu' },
ETB: { name: 'Ethiopian Birr', country: 'Ethiopia', symbol: 'Br' },
SOS: { name: 'Somali Shilling', country: 'Somalia', symbol: 'Sh' },
DJF: { name: 'Djiboutian Franc', country: 'Djibouti', symbol: 'Fdj' },
SDG: { name: 'Sudanese Pound', country: 'Sudan', symbol: '£SD' },
SSP: { name: 'South Sudanese Pound', country: 'South Sudan', symbol: '£' },
ERN: { name: 'Eritrean Nakfa', country: 'Eritrea', symbol: 'Nfk' },
ZAR: { name: 'South African Rand', country: 'South Africa', symbol: 'R' },
NAD: { name: 'Namibian Dollar', country: 'Namibia', symbol: '$' },
BWP: { name: 'Botswana Pula', country: 'Botswana', symbol: 'P' },
SZL: { name: 'Eswatini Lilangeni', country: 'Eswatini', symbol: 'L' },
LSL: { name: 'Lesotho Loti', country: 'Lesotho', symbol: 'L' },
ZMW: { name: 'Zambian Kwacha', country: 'Zambia', symbol: 'ZK' },
MWK: { name: 'Malawian Kwacha', country: 'Malawi', symbol: 'MK' },
MZN: { name: 'Mozambican Metical', country: 'Mozambique', symbol: 'MT' },
AOA: { name: 'Angolan Kwanza', country: 'Angola', symbol: 'Kz' },
CDF: { name: 'Congolese Franc', country: 'DR Congo', symbol: 'FC' },
MGA: { name: 'Malagasy Ariary', country: 'Madagascar', symbol: 'Ar' },
MUR: { name: 'Mauritian Rupee', country: 'Mauritius', symbol: '₨' },
SCR: { name: 'Seychellois Rupee', country: 'Seychelles', symbol: '₨' },
KMF: { name: 'Comorian Franc', country: 'Comoros', symbol: 'CF' },
CVE: { name: 'Cape Verdean Escudo', country: 'Cabo Verde', symbol: '$' },
STN: { name: 'Sao Tome and Principe Dobra', country: 'Sao Tome and Principe', symbol: 'Db' },
GMD: { name: 'Gambian Dalasi', country: 'The Gambia', symbol: 'D' },
GNF: { name: 'Guinean Franc', country: 'Guinea', symbol: 'FG' },
SLE: { name: 'Sierra Leonean Leone', country: 'Sierra Leone', symbol: 'Le' },
LRD: { name: 'Liberian Dollar', country: 'Liberia', symbol: '$' },
MXN: { name: 'Mexican Peso', country: 'Mexico', symbol: '$' },
BRL: { name: 'Brazilian Real', country: 'Brazil', symbol: 'R$' },
ARS: { name: 'Argentine Peso', country: 'Argentina', symbol: '$' },
CLP: { name: 'Chilean Peso', country: 'Chile', symbol: '$' },
COP: { name: 'Colombian Peso', country: 'Colombia', symbol: '$' },
PEN: { name: 'Peruvian Sol', country: 'Peru', symbol: 'S/' },
BOB: { name: 'Bolivian Boliviano', country: 'Bolivia', symbol: 'Bs' },
PYG: { name: 'Paraguayan Guarani', country: 'Paraguay', symbol: '₲' },
UYU: { name: 'Uruguayan Peso', country: 'Uruguay', symbol: '$U' },
VES: { name: 'Venezuelan Bolivar', country: 'Venezuela', symbol: 'Bs.S' },
GYD: { name: 'Guyanese Dollar', country: 'Guyana', symbol: '$' },
SRD: { name: 'Surinamese Dollar', country: 'Suriname', symbol: '$' },
TTD: { name: 'Trinidad and Tobago Dollar', country: 'Trinidad and Tobago', symbol: '$' },
JMD: { name: 'Jamaican Dollar', country: 'Jamaica', symbol: '$' },
BSD: { name: 'Bahamian Dollar', country: 'The Bahamas', symbol: '$' },
BBD: { name: 'Barbadian Dollar', country: 'Barbados', symbol: '$' },
BZD: { name: 'Belize Dollar', country: 'Belize', symbol: '$' },
XCD: { name: 'East Caribbean Dollar', country: 'Organisation of Eastern Caribbean States', symbol: '$' },
HTG: { name: 'Haitian Gourde', country: 'Haiti', symbol: 'G' },
DOP: { name: 'Dominican Peso', country: 'Dominican Republic', symbol: 'RD$' },
CUP: { name: 'Cuban Peso', country: 'Cuba', symbol: '$' },
HNL: { name: 'Honduran Lempira', country: 'Honduras', symbol: 'L' },
GTQ: { name: 'Guatemalan Quetzal', country: 'Guatemala', symbol: 'Q' },
NIO: { name: 'Nicaraguan Cordoba', country: 'Nicaragua', symbol: 'C$' },
CRC: { name: 'Costa Rican Colon', country: 'Costa Rica', symbol: '₡' },
PAB: { name: 'Panamanian Balboa', country: 'Panama', symbol: 'B/.' },
PGK: { name: 'Papua New Guinea Kina', country: 'Papua New Guinea', symbol: 'K' },
FJD: { name: 'Fijian Dollar', country: 'Fiji', symbol: '$' },
SBD: { name: 'Solomon Islands Dollar', country: 'Solomon Islands', symbol: '$' },
TOP: { name: 'Tongan Paʻanga', country: 'Tonga', symbol: 'T$' },
VUV: { name: 'Vanuatu Vatu', country: 'Vanuatu', symbol: 'VT' },
WST: { name: 'Samoan Tala', country: 'Samoa', symbol: 'T' },
BTN: { name: 'Bhutanese Ngultrum', country: 'Bhutan', symbol: 'Nu.' },
MVR: { name: 'Maldivian Rufiyaa', country: 'Maldives', symbol: 'Rf' },
BMD: { name: 'Bermudian Dollar', country: 'Bermuda', symbol: '$' },
KYD: { name: 'Cayman Islands Dollar', country: 'Cayman Islands', symbol: '$' },
ANG: { name: 'Netherlands Antillean Guilder', country: 'Curacao and Sint Maarten (legacy; superseded by Caribbean Guilder, XCG, in 2025)', symbol: 'ƒ' },
AWG: { name: 'Aruban Florin', country: 'Aruba', symbol: 'ƒ' },
SHP: { name: 'Saint Helena Pound', country: 'Saint Helena', symbol: '£' },
FKP: { name: 'Falkland Islands Pound', country: 'Falkland Islands', symbol: '£' },
GIP: { name: 'Gibraltar Pound', country: 'Gibraltar', symbol: '£' },
ZWG: { name: 'Zimbabwe Gold', country: 'Zimbabwe', symbol: 'ZiG' },
KPW: { name: 'North Korean Won', country: 'North Korea', symbol: '₩' },
XCG: { name: 'Caribbean Guilder', country: 'Curacao and Sint Maarten', symbol: 'Cg' }
};
const categories = applyCustomUnits(buildCategories());
const categoryMap = new Map(categories.map((category) => [category.id, category]));
const seoMap = new Map(seoConversions.map((item) => [item.slug, item]));
let state = {
categoryId: "length",
fromUnitId: "meter",
toUnitId: "foot",
precision: clampNumber(Number(localStorage.getItem(storageKeys.precision)) || 12, 2, 15),
notation: localStorage.getItem(storageKeys.notation) || "auto",
lastRecordKey: ""
};
let historyTimer = 0;
let historyEnabled = false;
let pageInitPending = false;
let seoConversionDataCache = null;
let seoConversionDataResolved = false;
document.addEventListener("DOMContentLoaded", () => {
renderSiteHeader();
initTheme();
initHeroCanvas();
renderCategoryDropdownMenus();
initCategoriesNav();
setupResponsiveMobileNav();
initSeoConverterPage();
renderOverview();
initConverterApp();
initCalculators();
initNewsletter();
initAdmin();
// Service worker registration, cached-currency-rate loading, and the
// page_view analytics event are not required for first paint or first
// interaction. They are deferred below (load event / idle callback) so
// they no longer occupy the critical startup path, while preserving
// identical registration/fetch/tracking logic and firing exactly once.
if (document.body) document.body.classList.remove("is-loading");
});
// Service worker registration deferred until after the page has fully
// loaded (including images/subresources), matching the standard
// "register after load" pattern. Registration logic itself is unchanged.
window.addEventListener("load", () => {
registerServiceWorker();
});
function runWhenIdle(callback) {
if (typeof window.requestIdleCallback === "function") {
window.requestIdleCallback(callback);
} else {
window.setTimeout(callback, 1);
}
}
// Cached currency rate loading deferred to idle time. Behavior is
// unchanged: the currency tool already relies on the hard-coded fallback
// rates until this fetch resolves, whether that fetch is kicked off
// immediately or during an idle window.
runWhenIdle(() => {
loadCachedCurrencyRates();
});
// Page-view tracking deferred to idle time. dataLayer/gtag/sendBeacon
// logic inside trackEvent() is unchanged; this only delays when the
// single page_view event fires, not whether or how it fires.
runWhenIdle(() => {
trackEvent("page_view", { title: document.title });
});
function loadCachedCurrencyRates() {
// Reads the locally cached rates.json (produced offline by fetch_rates.py on a
// schedule) so the site never calls a live currency API during normal browsing.
// This is a same-origin static file read, not a network round trip to a provider.
fetch("/rates.json", { cache: "no-store" }).then((response) => {
if (!response.ok) throw new Error("rates.json not available");
return response.json();
}).then((payload) => {
if (!payload || !payload.rates) return;
Object.keys(payload.rates).forEach((code) => {
const rate = Number(payload.rates[code]);
if (!Number.isFinite(rate) || rate <= 0) return;
currencyFallbackRates[code] = rate;
});
const currencyCategory = categoryMap.get("currency");
if (currencyCategory) {
currencyCategory.units.forEach((unit) => {
if (currencyFallbackRates[unit.id] !== undefined) unit.factor = currencyFallbackRates[unit.id];
});
}
window.__currencyRatesMeta = { generatedAt: payload.generated_at, provider: payload.provider };
if (document.getElementById("currencyTool") && typeof updateCurrency === "function") updateCurrency();
}).catch(() => {
// Offline fallback rates already loaded synchronously above; nothing else to do.
});
}
function buildCategories() {
const lengthUnits = uniqueUnits([
...metricUnits("meter", "Meter", "m", 1, "The meter is the SI base unit of length."),
u("inch", "Inch", "in", 0.0254, "An inch is exactly 0.0254 meters.", ["inches"]),
u("foot", "Foot", "ft", 0.3048, "A foot is exactly 0.3048 meters.", ["feet"]),
u("yard", "Yard", "yd", 0.9144, "A yard is exactly 0.9144 meters."),
u("mile", "Mile", "mi", 1609.344, "A statute mile is exactly 1,609.344 meters."),
u("nautical_mile", "Nautical mile", "nmi", 1852, "A nautical mile is exactly 1,852 meters."),
u("survey_foot_us", "US survey foot", "ftUS", 1200 / 3937, "The US survey foot is 1200/3937 meters and is retained for legacy land records.", ["survey foot", "us survey feet"]),
u("angstrom", "Angstrom", "A", 1e-10, "An angstrom is 1e-10 meters."),
u("fathom", "Fathom", "ftm", 1.8288, "A fathom is six feet."),
u("chain", "Chain", "ch", 20.1168, "A surveyor's chain is 66 feet."),
u("link", "Link", "li", 0.201168, "A surveyor's link is 1/100 of a chain."),
u("rod", "Rod", "rd", 5.0292, "A rod is 16.5 feet."),
u("furlong", "Furlong", "fur", 201.168, "A furlong is 660 feet."),
u("league", "League", "lea", 4828.032, "A league is commonly treated as three statute miles."),
u("hand", "Hand", "hh", 0.1016, "A hand is four inches, often used for horse height."),
u("cubit", "Cubit", "cubit", 0.4572, "A common cubit is approximated as 18 inches."),
u("point", "Point", "pt", 0.0003527777778, "A desktop publishing point is 1/72 inch."),
u("pica", "Pica", "pc", 0.004233333333, "A pica is 12 points."),
u("astronomical_unit", "Astronomical unit", "AU", 149597870700, "An astronomical unit is the mean Earth-Sun distance."),
u("light_year", "Light-year", "ly", 9460730472580800, "A light-year is the distance light travels in a Julian year."),
u("parsec", "Parsec", "pc", 3.085677581491367e16, "A parsec is about 3.26156 light-years.")
]);
const areaUnits = uniqueUnits([
...squareMetricUnits("meter", "meter", "m", 1, "Square metric area unit."),
u("hectare", "Hectare", "ha", 10000, "A hectare is 10,000 square meters."),
u("acre", "Acre", "ac", 4046.8564224, "An international acre is 4,046.8564224 square meters."),
u("section", "Section", "section", 2589988.110336, "A US public land survey section is one square mile or 640 acres."),
u("township", "Township", "twp", 93239571.972096, "A survey township is 36 square miles."),
u("square_inch", "Square inch", "in2", 0.00064516, "A square inch is the area of a one-inch square."),
u("square_foot", "Square foot", "ft2", 0.09290304, "A square foot is exactly 0.09290304 square meters."),
u("square_yard", "Square yard", "yd2", 0.83612736, "A square yard is exactly 0.83612736 square meters."),
u("square_mile", "Square mile", "mi2", 2589988.110336, "A square mile is 640 acres."),
u("are", "Are", "a", 100, "An are is 100 square meters."),
u("barn", "Barn", "b", 1e-28, "A barn is a nuclear cross-section unit equal to 1e-28 square meters."),
u("rood", "Rood", "rood", 1011.7141056, "A rood is one quarter of an acre.")
]);
const volumeUnits = uniqueUnits([
...cubicMetricUnits("meter", "meter", "m", 1, "Cubic metric volume unit."),
...metricUnits("liter", "Liter", "L", 0.001, "A liter is one cubic decimeter."),
u("gallon_us", "Gallon", "gal", 0.003785411784, "A US liquid gallon is exactly 3.785411784 liters.", ["US gallon"]),
u("gallon_imperial", "Imperial gallon", "imp gal", 0.00454609, "An imperial gallon is exactly 4.54609 liters."),
u("quart_us", "Quart", "qt", 0.000946352946, "A US liquid quart is one quarter of a US gallon."),
u("quart_imperial", "Imperial quart", "imp qt", 0.0011365225, "An imperial quart is one quarter of an imperial gallon."),
u("pint_us", "Pint", "pt", 0.000473176473, "A US liquid pint is one eighth of a US gallon."),
u("pint_imperial", "Imperial pint", "imp pt", 0.00056826125, "An imperial pint is one eighth of an imperial gallon."),
u("fluid_ounce_us", "Fluid ounce", "fl oz", 0.0000295735295625, "A US fluid ounce is 1/128 of a US gallon."),
u("fluid_ounce_imperial", "Imperial fluid ounce", "imp fl oz", 0.0000284130625, "An imperial fluid ounce is 1/160 of an imperial gallon."),
u("cup_us", "Cup", "cup", 0.0002365882365, "A US customary cup is 236.5882365 milliliters."),
u("cup_metric", "Metric cup", "metric cup", 0.00025, "A metric cup is 250 milliliters."),
u("tablespoon_us", "Tablespoon", "tbsp", 0.00001478676478125, "A US tablespoon is half a US fluid ounce."),
u("tablespoon_metric", "Metric tablespoon", "metric tbsp", 0.000015, "A metric tablespoon is 15 milliliters."),
u("teaspoon_us", "Teaspoon", "tsp", 0.00000492892159375, "A US teaspoon is one third of a US tablespoon."),
u("teaspoon_metric", "Metric teaspoon", "metric tsp", 0.000005, "A metric teaspoon is 5 milliliters."),
u("barrel_oil", "Oil barrel", "bbl", 0.158987294928, "An oil barrel is 42 US gallons."),
u("bushel_us", "Bushel", "bu", 0.03523907016688, "A US bushel is about 35.239 liters."),
u("cubic_inch", "Cubic inch", "in3", 0.000016387064, "A cubic inch is the volume of a one-inch cube."),
u("cubic_foot", "Cubic foot", "ft3", 0.028316846592, "A cubic foot is exactly 0.028316846592 cubic meters."),
u("cubic_yard", "Cubic yard", "yd3", 0.764554857984, "A cubic yard is exactly 0.764554857984 cubic meters.")
]);
const massUnits = uniqueUnits([
...metricUnits("gram", "Gram", "g", 0.001, "A gram is one thousandth of a kilogram."),
u("tonne", "Metric ton", "t", 1000, "A metric ton is 1,000 kilograms.", ["metric tonne"]),
u("pound", "Pound", "lb", 0.45359237, "An avoirdupois pound is exactly 0.45359237 kilograms.", ["lbs"]),
u("ounce", "Ounce", "oz", 0.028349523125, "An avoirdupois ounce is 1/16 pound."),
u("troy_ounce", "Troy ounce", "oz t", 0.0311034768, "A troy ounce is exactly 31.1034768 grams."),
u("dram", "Dram", "dr", 0.0017718451953125, "An avoirdupois dram is 1/16 ounce."),
u("stone", "Stone", "st", 6.35029318, "A stone is 14 pounds."),
u("short_ton", "Short ton", "ton", 907.18474, "A US short ton is 2,000 pounds."),
u("long_ton", "Long ton", "long ton", 1016.0469088, "A British long ton is 2,240 pounds."),
u("hundredweight_us", "US hundredweight", "cwt", 45.359237, "A US short hundredweight is 100 pounds."),
u("hundredweight_imperial", "Imperial hundredweight", "long cwt", 50.80234544, "An imperial long hundredweight is 112 pounds."),
u("grain", "Grain", "gr", 0.00006479891, "A grain is exactly 64.79891 milligrams."),
u("carat", "Carat", "ct", 0.0002, "A metric carat is exactly 200 milligrams."),
u("slug", "Slug", "slug", 14.5939029372, "A slug is an imperial mass unit."),
u("atomic_mass_unit", "Atomic mass unit", "u", 1.6605390666e-27, "The unified atomic mass unit is used in atomic physics."),
u("solar_mass", "Solar mass", "Msun", 1.98847e30, "Solar mass is used in astronomy.")
]);
const timeUnits = uniqueUnits([
u("second", "Seconds", "s", 1, "The second is the SI base unit of time."),
...metricUnits("second", "Second", "s", 1, "Metric prefixed time unit.").filter((item) => item.id !== "second"),
u("minute", "Minutes", "min", 60, "A minute is 60 seconds."),
u("hour", "Hours", "h", 3600, "An hour is 3,600 seconds."),
u("day", "Days", "d", 86400, "A day is 86,400 seconds."),
u("week", "Weeks", "wk", 604800, "A week is seven days."),
u("fortnight", "Fortnight", "fn", 1209600, "A fortnight is 14 days."),
u("month", "Months", "mo", 2629746, "A month uses the average Gregorian month."),
u("year", "Years", "yr", 31556952, "A year uses the average Gregorian year of 365.2425 days."),
u("decade", "Decades", "decade", 315569520, "A decade is 10 average Gregorian years."),
u("century", "Centuries", "century", 3155695200, "A century is 100 average Gregorian years.")
]);
const pressureUnits = uniqueUnits([
...metricUnits("pascal", "Pascal", "Pa", 1, "The pascal is one newton per square meter."),
u("bar", "Bar", "bar", 100000, "A bar is exactly 100,000 pascals."),
u("millibar", "Millibar", "mbar", 100, "A millibar is 100 pascals."),
u("psi", "PSI", "psi", 6894.757293168, "Pounds per square inch."),
u("ksi", "KSI", "ksi", 6894757.293168, "Kips per square inch."),
u("atmosphere", "Atmosphere", "atm", 101325, "A standard atmosphere is exactly 101,325 pascals."),
u("torr", "Torr", "Torr", 133.3223684211, "A torr is 1/760 standard atmosphere."),
u("mmhg", "mmHg", "mmHg", 133.322387415, "Millimeters of mercury at standard gravity."),
u("inhg", "inHg", "inHg", 3386.389, "Inches of mercury."),
u("water_meter", "Meter of water", "mH2O", 9806.65, "Meter of water column."),
u("technical_atmosphere", "Technical atmosphere", "at", 98066.5, "Technical atmosphere is kilogram-force per square centimeter.")
]);
const energyUnits = uniqueUnits([
...metricUnits("joule", "Joule", "J", 1, "The joule is the SI derived unit of energy."),
u("calorie", "Calorie", "cal", 4.184, "A thermochemical calorie is 4.184 joules."),
u("kilocalorie", "Kilocalorie", "kcal", 4184, "A kilocalorie is 1,000 calories."),
u("watt_hour", "Watt-hour", "Wh", 3600, "A watt-hour is 3,600 joules."),
u("kilowatt_hour", "kWh", "kWh", 3600000, "A kilowatt-hour is 3.6 million joules."),
u("btu", "BTU", "BTU", 1055.05585262, "British thermal unit."),
u("therm_us", "US therm", "therm", 105480400, "US therm used for natural gas energy."),
u("electronvolt", "Electronvolt", "eV", 1.602176634e-19, "An electronvolt is the energy gained by an electron across one volt."),
u("erg", "Erg", "erg", 1e-7, "An erg is a CGS energy unit."),
u("foot_pound", "Foot-pound", "ft-lb", 1.3558179483314004, "Work from one pound-force over one foot.")
]);
const powerUnits = uniqueUnits([
...metricUnits("watt", "Watt", "W", 1, "The watt is one joule per second."),
u("horsepower_mechanical", "Horsepower", "hp", 745.6998715822702, "Mechanical horsepower."),
u("horsepower_metric", "Metric horsepower", "PS", 735.49875, "Metric horsepower."),
u("btu_hour", "BTU per hour", "BTU/h", 0.2930710701722222, "Power rate using BTU per hour."),
u("ton_refrigeration", "Ton of refrigeration", "TR", 3516.8528420667, "Cooling power equal to 12,000 BTU/h."),
u("foot_pound_second", "Foot-pound per second", "ft-lb/s", 1.3558179483314004, "Mechanical power rate.")
]);
const forceUnits = uniqueUnits([
...metricUnits("newton", "Newton", "N", 1, "The newton is the SI unit of force."),
u("dyne", "Dyne", "dyn", 1e-5, "A dyne is a CGS force unit."),
u("pound_force", "Pound-force", "lbf", 4.4482216152605, "Pound-force under standard gravity."),
u("kip", "Kip", "kip", 4448.2216152605, "A kip is 1,000 pound-force."),
u("kilogram_force", "Kilogram-force", "kgf", 9.80665, "Kilogram-force under standard gravity."),
u("ounce_force", "Ounce-force", "ozf", 0.27801385095378125, "Ounce-force.")
]);
const torqueUnits = uniqueUnits([
...metricUnits("newton_meter", "Newton meter", "N m", 1, "Newton meter is the SI torque unit."),
u("pound_foot", "Pound-foot", "lb ft", 1.3558179483314004, "Torque from one pound-force at one foot."),
u("pound_inch", "Pound-inch", "lb in", 0.1129848290276167, "Torque from one pound-force at one inch."),
u("ounce_inch", "Ounce-inch", "oz in", 0.007061551814226042, "Torque from one ounce-force at one inch."),
u("kilogram_force_meter", "Kilogram-force meter", "kgf m", 9.80665, "Torque from one kilogram-force at one meter.")
]);
const frequencyUnits = uniqueUnits([
...metricUnits("hertz", "Hertz", "Hz", 1, "The hertz is one cycle per second."),
u("rpm", "Revolutions per minute", "rpm", 1 / 60, "Revolutions per minute converted to hertz."),
u("rps", "Revolutions per second", "rps", 1, "Revolutions per second."),
u("bpm", "Beats per minute", "bpm", 1 / 60, "Beats per minute as a frequency."),
u("rad_second", "Radians per second", "rad/s", 1 / (2 * Math.PI), "Angular frequency converted by one revolution equals 2*pi radians.")
]);
const digitalUnits = uniqueUnits([
...digitalStorageUnits(),
u("nibble", "Nibble", "nibble", 4, "A nibble is four bits."),
u("word_16", "16-bit word", "word", 16, "A common word size of 16 bits.")
]);
const angleUnits = uniqueUnits([
u("radian", "Radian", "rad", 1, "The radian is the SI angle unit."),
u("degree", "Degree", "deg", Math.PI / 180, "A degree is pi/180 radians."),
u("gradian", "Gradian", "gon", Math.PI / 200, "A gradian is 1/400 of a turn."),
u("turn", "Turn", "turn", 2 * Math.PI, "One full revolution."),
u("arcminute", "Arcminute", "arcmin", Math.PI / 10800, "One arcminute is 1/60 degree."),
u("arcsecond", "Arcsecond", "arcsec", Math.PI / 648000, "One arcsecond is 1/3600 degree."),
u("milliradian", "Milliradian", "mrad", 0.001, "One milliradian is 0.001 radians."),
u("circle", "Circle", "circle", 2 * Math.PI, "One complete circle.")
]);
const densityUnits = ratioUnits(
massUnits,
volumeUnits,
"per",
"density",
"Mass per volume density."
);
const flowUnits = ratioUnits(
volumeUnits,
timeUnits,
"per",
"flow",
"Volumetric flow rate."
);
const agricultureUnits = agricultureRateUnits(massUnits, volumeUnits, areaUnits);
const chemistryUnits = chemistryConcentrationUnits(massUnits, volumeUnits);
return [
c("length", "Length Converter", "Convert SI, imperial, US customary, astronomical, scientific, and historical length units.", "linear", "meter", "foot", lengthUnits, "Length uses the meter as the base unit."),
c("area", "Area Converter", "Convert land, construction, mapping, survey, and scientific area units.", "linear", "square_meter", "acre", areaUnits, "Area uses the square meter as the base unit."),
c("volume", "Volume Converter", "Convert metric, US customary, imperial, cooking, dry, and industrial volume units.", "linear", "liter", "gallon_us", volumeUnits, "Volume uses the cubic meter as the base unit."),
c("weight", "Mass/Weight Converter", "Convert SI mass, imperial weight, jewelry, atomic, and astronomy mass units.", "linear", "kilogram", "pound", massUnits, "Mass uses the kilogram as the base unit."),
c("temperature", "Temperature Converter", "Convert Celsius, Fahrenheit, Kelvin, Rankine, Delisle, Newton, Reaumur, and Romer.", "temperature", "celsius", "fahrenheit", temperatureUnits(), "Temperature conversions use absolute Kelvin internally."),
c("time", "Time Converter", "Convert SI time, civil time, historical durations, months, and years.", "linear", "hour", "day", timeUnits, "Months and years use the average Gregorian year."),
c("speed", "Speed Converter", "Convert road, aviation, marine, lab, and scientific speed units.", "linear", "kilometer_per_hour", "mile_per_hour", speedUnits(lengthUnits, timeUnits), "Speed uses meters per second as the base unit."),
c("pressure", "Pressure Converter", "Convert pascals, bars, PSI, atmospheres, mercury columns, water columns, and engineering pressure units.", "linear", "pascal", "psi", pressureUnits, "Pressure uses the pascal as the base unit."),
c("energy", "Energy Converter", "Convert joules, calories, kilowatt-hours, BTU, electronvolts, therms, and mechanical work units.", "linear", "joule", "kilowatt_hour", energyUnits, "Energy uses the joule as the base unit."),
c("power", "Power Converter", "Convert watts, horsepower, refrigeration tons, BTU per hour, and engineering power units.", "linear", "watt", "horsepower_mechanical", powerUnits, "Power uses the watt as the base unit."),
c("force", "Force Converter", "Convert newtons, dynes, pound-force, kilogram-force, kips, and ounce-force.", "linear", "newton", "pound_force", forceUnits, "Force uses the newton as the base unit."),
c("torque", "Torque Converter", "Convert newton meters, pound-feet, pound-inches, ounce-inches, and kilogram-force meters.", "linear", "newton_meter", "pound_foot", torqueUnits, "Torque uses the newton meter as the base unit."),
c("electricity", "Electricity Converter", "Convert electrical units by family and calculate voltage, current, resistance, power, and energy with context values.", "electricity", "volt", "kilovolt", electricityUnits(), "Electrical units convert directly within the same family; cross-family results use Ohm's law and time context."),
c("frequency", "Frequency Converter", "Convert hertz, SI frequency prefixes, RPM, beats per minute, and angular frequency.", "linear", "hertz", "rpm", frequencyUnits, "Frequency uses hertz as the base unit."),
c("digital", "Digital Storage Converter", "Convert bits, bytes, decimal storage, binary storage, nibbles, and word sizes.", "linear", "byte", "megabyte", digitalUnits, "Digital storage uses bits as the base unit."),
c("angle", "Angle Converter", "Convert radians, degrees, gradians, turns, arcminutes, arcseconds, and milliradians.", "linear", "degree", "radian", angleUnits, "Angle uses radians as the base unit."),
c("density", "Density Converter", "Convert thousands of mass-per-volume density combinations for science, engineering, agriculture, and fluids.", "linear", "kilogram_per_cubic_meter", "pound_per_cubic_foot", densityUnits, "Density uses kilograms per cubic meter as the base unit."),
c("flow", "Flow Rate Converter", "Convert volumetric flow rates across metric, US, imperial, industrial, and scientific units.", "linear", "liter_per_second", "gallon_us_per_minute", flowUnits, "Flow rate uses cubic meters per second as the base unit."),
c("fuel_economy", "Fuel Economy Converter", "Convert MPG, km/L, L/100 km, and related transport fuel economy units.", "fuel", "mile_per_gallon_us", "liter_per_100_kilometer", fuelUnits(), "Fuel economy converts between distance-per-volume and volume-per-distance formats."),
c("radiation", "Radiation Converter", "Convert radioactivity, absorbed dose, and equivalent dose units by compatible radiation family.", "multi", "gray", "rad_absorbed", radiationUnits(), "Radiation conversions are dimension-aware."),
c("chemistry", "Chemistry Converter", "Convert concentration, molarity, amount, and laboratory scientific units by compatible family.", "multi", "gram_per_liter", "milligram_per_liter", chemistryUnits, "Chemistry conversions are dimension-aware."),
c("agriculture", "Agriculture Converter", "Convert acres, hectares, yield, seed, fertilizer, irrigation, and application-rate units.", "multi", "acre", "hectare", agricultureUnits, "Agriculture conversions are grouped by area, mass rate, liquid rate, and yield rate."),
c("cooking", "Cooking Converter", "Convert cooking volume and mass units used in recipes and nutrition workflows.", "multi", "cup_us", "milliliter", cookingUnits(volumeUnits, massUnits), "Cooking units are dimension-aware because volume and mass require density to mix."),
c("astronomy", "Astronomy Converter", "Convert astronomical length, mass, time, and distance units by compatible family.", "multi", "astronomical_unit", "light_year", astronomyUnits(lengthUnits, massUnits, timeUnits), "Astronomy conversions are dimension-aware."),
c("engineering", "Engineering Converter", "Convert common stress, force, torque, power, and energy units used in engineering.", "multi", "psi", "pascal", engineeringUnits(pressureUnits, forceUnits, torqueUnits, powerUnits, energyUnits), "Engineering units are grouped by compatible dimensions."),
c("scientific", "Scientific Units Converter", "Convert SI derived units, scientific notation-friendly units, atomic units, and lab measurements.", "multi", "angstrom", "nanometer", scientificUnits(lengthUnits, massUnits, energyUnits, pressureUnits, frequencyUnits), "Scientific units are grouped by compatible dimensions."),
c("currency", "Currency Converter", "Convert major world currencies with offline fallback rates and optional API support.", "currency", "USD", "EUR", currencyUnits(), "Currency rates are offline estimates unless live API rates are loaded.")
];
}
function u(id, name, symbol, factor, definition, aliases, dimension) {
const allAliases = buildAliases(id, name, symbol, aliases || []);
return {
id,
name,
symbol,
factor,
definition: definition || `${name} conversion unit.`,
aliases: allAliases,
synonyms: allAliases,
dimension: dimension || "value"
};
}
function buildAliases(id, name, symbol, aliases) {
const values = new Set([id, name, symbol, id.replace(/_/g, " "), name.toLowerCase(), symbol.toLowerCase()]);
aliases.forEach((alias) => values.add(alias));
const lowerName = name.toLowerCase();
if (!lowerName.endsWith("s")) values.add(`${lowerName}s`);
const dictionary = {
kilogram: ["kg", "kilo", "kilos"],
pound: ["lb", "lbs", "pounds"],
ounce: ["oz", "ounces"],
mile: ["mi", "miles"],
kilometer: ["km", "kilometre", "kilometres", "kilometers"],
meter: ["m", "metre", "metres", "meters"],
foot: ["ft", "feet"],
inch: ["in", "inches"],
acre: ["ac", "acres"],
hectare: ["ha", "hectares"],
liter: ["l", "litre", "litres", "liters"],
gallon_us: ["gal", "gallon", "gallons", "us gallon", "us gallons"],
gallon_imperial: ["imperial gallon", "imperial gallons", "uk gallon", "uk gallons"],
cup_us: ["cup", "cups", "us cup", "us cups"],
cup_metric: ["metric cup", "metric cups"],
celsius: ["c", "centigrade"],
fahrenheit: ["f"],
kelvin: ["k"],
mile_per_hour: ["mph", "miles per hour"],
kilometer_per_hour: ["kmh", "kph", "km/h", "kilometers per hour"],
square_foot: ["sq ft", "ft2", "square feet"],
square_meter: ["sq m", "m2", "square metres", "square meters"],
psi: ["pounds per square inch"],
bar: ["bars"],
watt: ["w", "watts"],
horsepower_mechanical: ["hp", "horsepower"]
};
(dictionary[id] || []).forEach((alias) => values.add(alias));
return Array.from(values).filter(Boolean);
}
function c(id, name, description, type, defaultFrom, defaultTo, units, note) {
return { id, name, description, type, defaultFrom, defaultTo, units: uniqueUnits(units), note };
}
function metricUnits(baseId, baseName, baseSymbol, baseFactor, baseDefinition, options) {
const settings = options || {};
return prefixes.map(([key, prefixName, prefixSymbol, prefixFactor]) => {
const id = key ? `${key}${baseId}` : baseId;
const name = key ? `${prefixName}${baseName.toLowerCase()}` : baseName;
const symbol = `${prefixSymbol}${baseSymbol}`;
return u(id, name, symbol, baseFactor * prefixFactor, key ? `${name} is ${prefixFactor} ${baseName.toLowerCase()} units.` : baseDefinition, [], settings.dimension);
});
}
function squareMetricUnits(baseId, baseName, baseSymbol, baseFactor, definition) {
return prefixes.map(([key, prefixName, prefixSymbol, prefixFactor]) => {
const id = key ? `square_${key}${baseId}` : `square_${baseId}`;
const name = key ? `Square ${prefixName.toLowerCase()}${baseName}` : `Square ${baseName}`;
const symbol = `${prefixSymbol}${baseSymbol}2`;
return u(id, titleCase(name), symbol, baseFactor * prefixFactor * prefixFactor, definition, [], "area");
});
}
function cubicMetricUnits(baseId, baseName, baseSymbol, baseFactor, definition) {
return prefixes.map(([key, prefixName, prefixSymbol, prefixFactor]) => {
const id = key ? `cubic_${key}${baseId}` : `cubic_${baseId}`;
const name = key ? `Cubic ${prefixName.toLowerCase()}${baseName}` : `Cubic ${baseName}`;
const symbol = `${prefixSymbol}${baseSymbol}3`;
return u(id, titleCase(name), symbol, baseFactor * Math.pow(prefixFactor, 3), definition, [], "volume");
});
}
function ratioUnits(numerators, denominators, joiner, dimension, definition) {
const units = [];
uniqueUnits(numerators).forEach((top) => {
uniqueUnits(denominators).forEach((bottom) => {
units.push(u(
`${top.id}_per_${bottom.id}`,
`${top.name} ${joiner} ${bottom.name}`,
`${top.symbol}/${bottom.symbol}`,
top.factor / bottom.factor,
definition,
[],
dimension
));
});
});
return uniqueUnits(units);
}
function temperatureUnits() {
return [
u("celsius", "Celsius", "C", 1, "Celsius is a temperature scale with water freezing at 0 C and boiling at 100 C.", [], "temperature"),
u("fahrenheit", "Fahrenheit", "F", 1, "Fahrenheit is a temperature scale with water freezing at 32 F and boiling at 212 F.", [], "temperature"),
u("kelvin", "Kelvin", "K", 1, "Kelvin is the SI absolute temperature scale.", [], "temperature"),
u("rankine", "Rankine", "R", 1, "Rankine is an absolute Fahrenheit-based temperature scale.", [], "temperature"),
u("delisle", "Delisle", "De", 1, "Delisle is a historical temperature scale.", [], "temperature"),
u("newton_temperature", "Newton", "N", 1, "Newton is a historical temperature scale.", [], "temperature"),
u("reaumur", "Reaumur", "Re", 1, "Reaumur is a historical temperature scale.", [], "temperature"),
u("romer", "Romer", "Ro", 1, "Romer is a historical temperature scale.", [], "temperature")
];
}
function speedUnits(lengthUnits, timeUnits) {
const common = [
u("meter_per_second", "m/s", "m/s", 1, "Meters per second.", [], "speed"),
u("kilometer_per_hour", "km/h", "km/h", 1000 / 3600, "Kilometers per hour.", [], "speed"),
u("mile_per_hour", "mph", "mph", 1609.344 / 3600, "Miles per hour.", [], "speed"),
u("foot_per_second", "ft/s", "ft/s", 0.3048, "Feet per second.", [], "speed"),
u("knot", "Knots", "kn", 1852 / 3600, "A knot is one nautical mile per hour.", ["knots"], "speed"),
u("mach_standard", "Mach", "Ma", 340.29, "Mach at standard sea-level conditions.", [], "speed"),
u("speed_of_light", "Speed of light", "c", 299792458, "Speed of light in vacuum.", [], "speed")
];
const lengthSubset = lengthUnits.filter((item) => ["meter", "kilometer", "centimeter", "millimeter", "mile", "foot", "yard", "nautical_mile"].includes(item.id));
const timeSubset = timeUnits.filter((item) => ["second", "minute", "hour", "day"].includes(item.id));
return uniqueUnits([...common, ...ratioUnits(lengthSubset, timeSubset, "per", "speed", "Distance divided by time.")]);
}
function digitalStorageUnits() {
const decimal = [
["bit", "Bit", "bit", 1],
["byte", "Byte", "B", 8],
["kilobit", "Kilobit", "kb", 1e3],
["kilobyte", "KB", "KB", 8e3],
["megabit", "Megabit", "Mb", 1e6],
["megabyte", "MB", "MB", 8e6],
["gigabit", "Gigabit", "Gb", 1e9],
["gigabyte", "GB", "GB", 8e9],
["terabit", "Terabit", "Tb", 1e12],
["terabyte", "TB", "TB", 8e12],
["petabit", "Petabit", "Pb", 1e15],
["petabyte", "PB", "PB", 8e15],
["exabit", "Exabit", "Eb", 1e18],
["exabyte", "EB", "EB", 8e18],
["zettabyte", "ZB", "ZB", 8e21],
["yottabyte", "YB", "YB", 8e24]
];
const binary = [
["kibibyte", "KiB", "KiB", 8 * 1024],
["mebibyte", "MiB", "MiB", 8 * Math.pow(1024, 2)],
["gibibyte", "GiB", "GiB", 8 * Math.pow(1024, 3)],
["tebibyte", "TiB", "TiB", 8 * Math.pow(1024, 4)],
["pebibyte", "PiB", "PiB", 8 * Math.pow(1024, 5)],
["exbibyte", "EiB", "EiB", 8 * Math.pow(1024, 6)]
];
return [...decimal, ...binary].map(([id, name, symbol, factor]) => u(id, name, symbol, factor, `${name} digital storage unit.`, [], "storage"));
}
function electricityUnits() {
const voltage = metricUnits("volt", "Volt", "V", 1, "Volt is the SI unit of electric potential.", { dimension: "voltage" });
const current = metricUnits("ampere", "Ampere", "A", 1, "Ampere is the SI unit of electric current.", { dimension: "current" });
const resistance = metricUnits("ohm", "Ohm", "Ohm", 1, "Ohm is the SI unit of electrical resistance.", { dimension: "resistance" });
const charge = metricUnits("coulomb", "Coulomb", "C", 1, "Coulomb is the SI unit of electric charge.", { dimension: "charge" });
const capacitance = metricUnits("farad", "Farad", "F", 1, "Farad is the SI unit of capacitance.", { dimension: "capacitance" });
const conductance = metricUnits("siemens", "Siemens", "S", 1, "Siemens is the SI unit of conductance.", { dimension: "conductance" });
const inductance = metricUnits("henry", "Henry", "H", 1, "Henry is the SI unit of inductance.", { dimension: "inductance" });
const power = metricUnits("watt", "Watt", "W", 1, "Watt is one joule per second.", { dimension: "power" });
const energy = [u("watt_hour", "Watt-hour", "Wh", 3600, "Electrical energy over time.", [], "energy"), u("kilowatt_hour", "kWh", "kWh", 3600000, "Kilowatt-hour electrical energy.", [], "energy")];
return uniqueUnits([...voltage, ...current, ...resistance, ...charge, ...capacitance, ...conductance, ...inductance, ...power, ...energy]);
}
function fuelUnits() {
return [
fuel("mile_per_gallon_us", "Miles per US gallon", "mpg", "efficiency", 1609.344 / 0.003785411784),
fuel("mile_per_gallon_imperial", "Miles per imperial gallon", "mpg imp", "efficiency", 1609.344 / 0.00454609),
fuel("kilometer_per_liter", "Kilometers per liter", "km/L", "efficiency", 1000 / 0.001),
fuel("meter_per_liter", "Meters per liter", "m/L", "efficiency", 1 / 0.001),
fuel("liter_per_100_kilometer", "Liters per 100 kilometers", "L/100 km", "consumption", 0.001 / 100000),
fuel("liter_per_kilometer", "Liters per kilometer", "L/km", "consumption", 0.001 / 1000),
fuel("gallon_us_per_100_mile", "US gallons per 100 miles", "gal/100 mi", "consumption", 0.003785411784 / 160934.4)
];
}
function fuel(id, name, symbol, mode, factor) {
return { id, name, symbol, mode, factor, definition: `${name} fuel economy unit.`, aliases: [], dimension: "fuel" };
}
function radiationUnits() {
return [
u("becquerel", "Becquerel", "Bq", 1, "Becquerel is one radioactive decay per second.", [], "activity"),
u("curie", "Curie", "Ci", 3.7e10, "Curie is 3.7e10 becquerels.", [], "activity"),
u("gray", "Gray", "Gy", 1, "Gray is absorbed dose in joules per kilogram.", [], "absorbed_dose"),
u("rad_absorbed", "Rad", "rad", 0.01, "Rad is 0.01 gray.", [], "absorbed_dose"),
u("sievert", "Sievert", "Sv", 1, "Sievert is equivalent dose.", [], "equivalent_dose"),
u("rem", "Rem", "rem", 0.01, "Rem is 0.01 sievert.", [], "equivalent_dose"),
...metricUnits("gray", "Gray", "Gy", 1, "Metric gray.", { dimension: "absorbed_dose" }),
...metricUnits("sievert", "Sievert", "Sv", 1, "Metric sievert.", { dimension: "equivalent_dose" })
];
}
function chemistryConcentrationUnits(massUnits, volumeUnits) {
const massSubset = massUnits.filter((item) => ["kilogram", "gram", "milligram", "microgram", "pound", "ounce"].includes(item.id));
const volumeSubset = volumeUnits.filter((item) => ["cubic_meter", "liter", "milliliter", "microliter", "gallon_us", "fluid_ounce_us"].includes(item.id));
return uniqueUnits([
...ratioUnits(massSubset, volumeSubset, "per", "mass_concentration", "Mass concentration."),
u("mole", "Mole", "mol", 1, "Mole is the SI amount of substance unit.", [], "amount"),
...metricUnits("mole", "Mole", "mol", 1, "Metric mole.", { dimension: "amount" }),
u("mole_per_liter", "Mole per liter", "mol/L", 1000, "Molar concentration.", [], "molarity"),
u("millimole_per_liter", "Millimole per liter", "mmol/L", 1, "Millimolar concentration.", [], "molarity"),
u("micromole_per_liter", "Micromole per liter", "umol/L", 0.001, "Micromolar concentration.", [], "molarity"),
u("parts_per_million_water", "Parts per million water", "ppm", 0.001, "Approximate mg/L in water.", [], "mass_concentration"),
u("parts_per_billion_water", "Parts per billion water", "ppb", 0.000001, "Approximate ug/L in water.", [], "mass_concentration")
]);
}
function agricultureRateUnits(massUnits, volumeUnits, areaUnits) {
const areas = areaUnits.filter((item) => ["hectare", "acre", "square_meter", "square_kilometer", "square_foot", "square_mile"].includes(item.id));
const masses = massUnits.filter((item) => ["kilogram", "gram", "milligram", "tonne", "pound", "ounce", "short_ton"].includes(item.id));
const volumes = volumeUnits.filter((item) => ["liter", "milliliter", "cubic_meter", "gallon_us", "quart_us", "pint_us", "fluid_ounce_us"].includes(item.id));
const area = areas.map((item) => ({ ...item, dimension: "area" }));
const massRates = ratioUnits(masses, areas, "per", "mass_application_rate", "Mass application rate.");
const liquidRates = ratioUnits(volumes, areas, "per", "liquid_application_rate", "Liquid application rate.");
const yieldRates = ratioUnits([u("tonne", "Metric ton", "t", 1000, "Metric ton."), u("kilogram", "Kilogram", "kg", 1, "Kilogram."), u("bushel_wheat", "Bushel wheat", "bu wheat", 27.2155, "Approximate wheat bushel mass.")], areas, "per", "yield_rate", "Agricultural yield rate.");
return uniqueUnits([...area, ...massRates, ...liquidRates, ...yieldRates]);
}
function cookingUnits(volumeUnits, massUnits) {
const volumeIds = ["teaspoon_us", "teaspoon_metric", "tablespoon_us", "tablespoon_metric", "fluid_ounce_us", "cup_us", "cup_metric", "pint_us", "quart_us", "gallon_us", "milliliter", "liter"];
const massIds = ["gram", "kilogram", "milligram", "ounce", "pound"];
return uniqueUnits([
...volumeUnits.filter((item) => volumeIds.includes(item.id)).map((item) => ({ ...item, dimension: "volume" })),
...massUnits.filter((item) => massIds.includes(item.id)).map((item) => ({ ...item, dimension: "mass" })),
u("pinch", "Pinch", "pinch", 0.0000003080576, "A cooking pinch approximated as 1/16 teaspoon.", [], "volume"),
u("dash", "Dash", "dash", 0.0000006161152, "A cooking dash approximated as 1/8 teaspoon.", [], "volume")
]);
}
function astronomyUnits(lengthUnits, massUnits, timeUnits) {
return uniqueUnits([
...lengthUnits.filter((item) => ["astronomical_unit", "light_year", "parsec", "kilometer", "meter", "mile"].includes(item.id)).map((item) => ({ ...item, dimension: "distance" })),
...massUnits.filter((item) => ["kilogram", "tonne", "earth_mass", "solar_mass"].includes(item.id)).map((item) => ({ ...item, dimension: "mass" })),
u("earth_mass", "Earth mass", "Mearth", 5.9722e24, "Earth mass.", [], "mass"),
u("jupiter_mass", "Jupiter mass", "Mj", 1.89813e27, "Jupiter mass.", [], "mass"),
...timeUnits.filter((item) => ["second", "day", "year", "century"].includes(item.id)).map((item) => ({ ...item, dimension: "time" }))
]);
}
function engineeringUnits(pressureUnits, forceUnits, torqueUnits, powerUnits, energyUnits) {
return uniqueUnits([
...pressureUnits.map((item) => ({ ...item, dimension: "stress_pressure" })),
...forceUnits.map((item) => ({ ...item, dimension: "force" })),
...torqueUnits.map((item) => ({ ...item, dimension: "torque" })),
...powerUnits.map((item) => ({ ...item, dimension: "power" })),
...energyUnits.map((item) => ({ ...item, dimension: "energy" }))
]);
}
function scientificUnits(lengthUnits, massUnits, energyUnits, pressureUnits, frequencyUnits) {
return uniqueUnits([
...lengthUnits.filter((item) => ["angstrom", "nanometer", "micrometer", "meter", "astronomical_unit", "parsec"].includes(item.id)).map((item) => ({ ...item, dimension: "length" })),
...massUnits.filter((item) => ["atomic_mass_unit", "microgram", "milligram", "gram", "kilogram"].includes(item.id)).map((item) => ({ ...item, dimension: "mass" })),
...energyUnits.filter((item) => ["electronvolt", "joule", "kilojoule", "erg"].includes(item.id)).map((item) => ({ ...item, dimension: "energy" })),
...pressureUnits.filter((item) => ["pascal", "bar", "atmosphere", "torr"].includes(item.id)).map((item) => ({ ...item, dimension: "pressure" })),
...frequencyUnits.map((item) => ({ ...item, dimension: "frequency" }))
]);
}
function currencyUnits() {
return Object.keys(currencyFallbackRates).map((code) => {
const meta = currencyMeta[code] || { name: code, country: "", symbol: code };
const definition = meta.country
? `The ${meta.name} (${code}) is the official currency of ${meta.country}.`
: `${code} offline exchange-rate placeholder relative to USD.`;
return u(code, meta.name, meta.symbol, currencyFallbackRates[code], definition, [], "currency");
});
}
function applyCustomUnits(baseCategories) {
const custom = readArray(storageKeys.customUnits);
if (!custom.length) return baseCategories;
custom.forEach((item) => {
const category = baseCategories.find((entry) => entry.id === item.categoryId);
if (!category || !["linear", "currency"].includes(category.type)) return;
category.units.push(u(item.id, item.name, item.symbol, Number(item.factor), item.definition || "Custom admin unit.", ["custom"], "value"));
category.units = uniqueUnits(category.units);
});
return baseCategories;
}
function uniqueUnits(units) {
const seen = new Set();
return units.filter((item) => {
if (!item || seen.has(item.id)) return false;
seen.add(item.id);
return true;
});
}
function titleCase(value) {
return value.replace(/\b\w/g, (letter) => letter.toUpperCase());
}
function initTheme() {
const themeToggle = document.getElementById("themeToggle");
const savedTheme = localStorage.getItem(storageKeys.theme);
const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
setTheme(savedTheme || (prefersDark ? "dark" : "light"));
if (themeToggle) {
themeToggle.addEventListener("click", () => {
const nextTheme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
setTheme(nextTheme);
});
}
}
function setTheme(theme) {
document.documentElement.dataset.theme = theme;
localStorage.setItem(storageKeys.theme, theme);
const themeText = document.getElementById("themeText");
if (themeText) themeText.textContent = theme === "dark" ? "Light" : "Dark";
}
function initCategoriesNav() {
const dropdowns = document.querySelectorAll(".nav-dropdown");
if (!dropdowns.length) return;
function findDropdownContainer(dropdown) {
const header = dropdown.closest(".site-header");
return header ? header.querySelector(".category-dropdown-container") : null;
}
function closeDropdown(dropdown) {
dropdown.classList.remove("is-open");
const toggle = dropdown.querySelector(".nav-dropdown-toggle");
if (toggle) toggle.setAttribute("aria-expanded", "false");
const container = findDropdownContainer(dropdown);
if (container) container.classList.remove("open");
}
function closeAll(except) {
dropdowns.forEach((dropdown) => {
if (dropdown !== except) closeDropdown(dropdown);
});
}
dropdowns.forEach((dropdown) => {
const toggle = dropdown.querySelector(".nav-dropdown-toggle");
const menu = dropdown.querySelector(".nav-dropdown-menu");
const container = findDropdownContainer(dropdown);
if (!toggle || !menu) return;
toggle.addEventListener("click", (event) => {
event.preventDefault();
const isOpen = dropdown.classList.contains("is-open");
closeAll(dropdown);
const nextOpen = !isOpen;
dropdown.classList.toggle("is-open", nextOpen);
toggle.setAttribute("aria-expanded", String(nextOpen));
if (container) container.classList.toggle("open", nextOpen);
});
menu.addEventListener("click", (event) => {
if (event.target.closest("a")) closeDropdown(dropdown);
});
if (container) {
container.addEventListener("click", (event) => {
if (event.target.closest("a")) closeDropdown(dropdown);
});
}
dropdown.addEventListener("keydown", (event) => {
if (event.key === "Escape") {
closeDropdown(dropdown);
toggle.focus();
}
});
if (container) {
container.addEventListener("keydown", (event) => {
if (event.key === "Escape") {
closeDropdown(dropdown);
toggle.focus();
}
});
}
});
document.addEventListener("click", (event) => {
dropdowns.forEach((dropdown) => {
const container = findDropdownContainer(dropdown);
const insideDropdown = dropdown.contains(event.target);
const insideContainer = container && container.contains(event.target);
if (!insideDropdown && !insideContainer) closeDropdown(dropdown);
});
});
document.addEventListener("focusin", (event) => {
dropdowns.forEach((dropdown) => {
const container = findDropdownContainer(dropdown);
const insideDropdown = dropdown.contains(event.target);
const insideContainer = container && container.contains(event.target);
const header = dropdown.closest(".site-header");
const insideHeader = header && header.contains(event.target);
if (!insideDropdown && !insideContainer && !insideHeader) closeDropdown(dropdown);
});
});
}
function initHeroCanvas() {
const canvas = document.getElementById("heroCanvas");
if (!canvas) return;
const context = canvas.getContext("2d");
const reducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const marks = [];
let width = 0;
let height = 0;
let raf = 0;
function resize() {
const ratio = Math.min(window.devicePixelRatio || 1, 2);
width = canvas.clientWidth;
height = canvas.clientHeight;
canvas.width = Math.floor(width * ratio);
canvas.height = Math.floor(height * ratio);
context.setTransform(ratio, 0, 0, ratio, 0, 0);
marks.length = 0;
const count = Math.max(36, Math.floor(width / 26));
for (let index = 0; index < count; index += 1) {
marks.push({
x: Math.random() * width,
y: Math.random() * height,
length: 14 + Math.random() * 60,
speed: 0.12 + Math.random() * 0.42,
tilt: -0.6 + Math.random() * 1.2,
warm: Math.random() > 0.72
});
}
}
function drawGrid() {
context.clearRect(0, 0, width, height);
const theme = document.documentElement.dataset.theme;
const gridColor = theme === "dark" ? "rgba(255,255,255,0.07)" : "rgba(21,32,46,0.07)";
const accent = theme === "dark" ? "rgba(53,196,186,0.42)" : "rgba(15,159,154,0.36)";
const warm = theme === "dark" ? "rgba(246,189,96,0.42)" : "rgba(244,168,61,0.38)";
context.strokeStyle = gridColor;
context.lineWidth = 1;
for (let x = 0; x <= width; x += 52) drawLine(x, 0, x, height);
for (let y = 0; y <= height; y += 52) drawLine(0, y, width, y);
context.lineCap = "round";
marks.forEach((mark) => {
mark.y += reducedMotion ? 0 : mark.speed;
mark.x += reducedMotion ? 0 : mark.tilt * 0.15;
if (mark.y > height + 30) mark.y = -30;
if (mark.x < -60) mark.x = width + 60;
if (mark.x > width + 60) mark.x = -60;
context.strokeStyle = mark.warm ? warm : accent;
context.lineWidth = mark.warm ? 2 : 1.5;
drawLine(mark.x, mark.y, mark.x + mark.length, mark.y + mark.tilt * 18);
context.fillStyle = mark.warm ? warm : accent;
context.beginPath();
context.arc(mark.x, mark.y, 2.4, 0, Math.PI * 2);
context.fill();
});
if (!reducedMotion) raf = window.requestAnimationFrame(drawGrid);
}
function drawLine(x1, y1, x2, y2) {
context.beginPath();
context.moveTo(x1, y1);
context.lineTo(x2, y2);
context.stroke();
}
window.requestAnimationFrame(() => {
resize();
drawGrid();
});
let resizeRaf = 0;
window.addEventListener("resize", () => {
if (resizeRaf) window.cancelAnimationFrame(resizeRaf);
resizeRaf = window.requestAnimationFrame(() => {
resizeRaf = 0;
window.cancelAnimationFrame(raf);
resize();
drawGrid();
});
});
document.addEventListener("visibilitychange", () => {
if (document.hidden) {
window.cancelAnimationFrame(raf);
} else if (!reducedMotion) {
window.cancelAnimationFrame(raf);
drawGrid();
}
});
}
function applyPageConversion(pageConversion) {
const slug = currentPageSlug();
const category = categoryMap.get(pageConversion.categoryId);
const fromSelect = byId("fromUnit");
const toSelect = byId("toUnit");
if (!category || !fromSelect || !toSelect) {
return null;
}
const fromUnit = resolveUnitAlias(category, pageConversion.fromUnitId)
|| category.units.find((unit) => unit.id === pageConversion.fromUnitId)
|| category.units[0];
const toUnit = resolveUnitAlias(category, pageConversion.toUnitId)
|| category.units.find((unit) => unit.id === pageConversion.toUnitId)
|| category.units[Math.min(1, category.units.length - 1)]
|| category.units[0];
if (!fromUnit || !toUnit) {
return null;
}
selectCategory(category.id, { remember: false });
populateSelect(fromSelect, category.units, fromUnit.id);
populateSelect(toSelect, category.units, toUnit.id);
state.categoryId = category.id;
state.fromUnitId = fromUnit.id;
state.toUnitId = toUnit.id;
const sourceInput = byId("fromValue");
const targetInput = byId("toValue");
if (sourceInput) sourceInput.value = pageConversion.value || "1";
if (targetInput) targetInput.value = "";
updateConversion();
return pageConversion;
}
function initializeConverterFromPageRegistry() {
const slug = currentPageSlug();
const pageConversion = readSeoConversionData();
if (!pageConversion || !pageConversion.categoryId || !pageConversion.fromUnitId || !pageConversion.toUnitId) {
pageInitPending = false;
return null;
}
const registryLoaded = Boolean(categoryMap && categoryMap.size > 0 && byId("fromUnit") && byId("toUnit"));
if (!registryLoaded) {
pageInitPending = true;
window.requestAnimationFrame(() => {
pageInitPending = false;
initializeConverterFromPageRegistry();
});
return null;
}
pageInitPending = false;
return applyPageConversion(pageConversion);
}
function currentPageSlug() {
const pageData = typeof window !== "undefined" ? window.__seoPageData : null;
const slugFromPageData = pageData && typeof pageData.slug === "string" ? pageData.slug.trim() : "";
if (slugFromPageData) return slugFromPageData;
const container = document.getElementById("seoConverter");
const slugFromContainer = container?.dataset?.slug || "";
if (slugFromContainer) return slugFromContainer;
return inferSlugFromPath(preferredPagePath());
}
function preferredPagePath() {
const canonicalHref = document.querySelector('link[rel="canonical"]')?.getAttribute("href") || "";
const canonicalPath = canonicalHref ? tryParsePathname(canonicalHref) : "";
return canonicalPath || location.pathname || "";
}
function inferSlugFromPath(pathname) {
if (!pathname) return "";
const cleaned = String(pathname).trim();
const parsed = tryParsePathname(cleaned);
const segments = parsed.split("/").filter(Boolean);
if (!segments.length) return "";
const lastSegment = decodeURIComponent(segments[segments.length - 1] || "");
if (lastSegment && lastSegment.toLowerCase() !== "index.html" && lastSegment.toLowerCase() !== "index.htm") {
return lastSegment;
}
for (let index = segments.length - 2; index >= 0; index -= 1) {
const segment = decodeURIComponent(segments[index]);
if (!segment || segment.toLowerCase() === "index.html" || segment.toLowerCase() === "index.htm") continue;
return segment;
}
return lastSegment || "";
}
function tryParsePathname(value) {
if (!value) return "";
try {
const parsed = new URL(value, window.location.href);
return parsed.pathname;
} catch (error) {
return String(value).replace(/^https?:\/\//, "").split("/").slice(1).join("/");
}
}
function initConverterApp() {
const fromValue = document.getElementById("fromValue");
if (!fromValue) return;
const precisionControl = byId("precisionControl");
const notationMode = byId("notationMode");
precisionControl.value = String(state.precision);
notationMode.value = state.notation;
renderCategoryList();
renderOverview();
renderPopularConversions();
renderStoredLists();
const sharedConversion = readSharedConversion();
const pageConversion = initializeConverterFromPageRegistry();
if (pageConversion) {
if (sharedConversion && sharedConversion.categoryId !== pageConversion.categoryId) {
applySharedConversion(sharedConversion);
}
} else if (sharedConversion) {
state.categoryId = sharedConversion.categoryId;
selectCategory(state.categoryId, { remember: false });
applySharedConversion(sharedConversion);
} else if (!pageInitPending) {
selectCategory(state.categoryId, { remember: false });
}
bindConverterEvents();
historyEnabled = true;
}
function bindConverterEvents() {
byId("fromValue").addEventListener("input", updateConversion);
byId("fromUnit").addEventListener("change", (event) => {
state.fromUnitId = event.target.value;
updateConversion();
trackEvent("unit_change", { category: state.categoryId, unit: event.target.value });
trackEvent("unit_selected", { category: state.categoryId, unit: event.target.value, direction: "from" });
});
byId("toUnit").addEventListener("change", (event) => {
state.toUnitId = event.target.value;
updateConversion();
trackEvent("unit_selected", { category: state.categoryId, unit: event.target.value, direction: "to" });
});
byId("swapButton").addEventListener("click", () => {
const fromSelect = byId("fromUnit");
const toSelect = byId("toUnit");
const nextFrom = toSelect.value;
const nextTo = fromSelect.value;
state.fromUnitId = nextFrom;
state.toUnitId = nextTo;
fromSelect.value = nextFrom;
toSelect.value = nextTo;
updateConversion();
trackEvent("swap_units", { category: state.categoryId });
});
byId("copyButton").addEventListener("click", copyResult);
byId("shareButton").addEventListener("click", shareResult);
byId("favoriteButton").addEventListener("click", toggleFavorite);
byId("precisionControl").addEventListener("input", (event) => {
state.precision = clampNumber(Number(event.target.value) || 12, 2, 15);
localStorage.setItem(storageKeys.precision, String(state.precision));
updateConversion();
});
byId("notationMode").addEventListener("change", (event) => {
state.notation = event.target.value;
localStorage.setItem(storageKeys.notation, state.notation);
updateConversion();
});
byId("clearFavorites").addEventListener("click", () => {
writeArray(storageKeys.favorites, []);
renderStoredLists();
updateFavoriteButton();
});
byId("clearRecent").addEventListener("click", () => {
writeArray(storageKeys.recent, []);
renderStoredLists();
});
byId("clearHistory").addEventListener("click", () => {
writeArray(storageKeys.history, []);
renderStoredLists();
});
document.querySelectorAll("[data-select-category]").forEach((button) => {
button.addEventListener("click", () => {
const category = categoryMap.get(button.dataset.selectCategory);
if (category) rememberSearch(category.name, "#converter", category.id);
selectCategory(button.dataset.selectCategory);
scrollToConverter();
});
});
["contextVoltage", "contextCurrent", "contextResistance", "contextHours", "contextDensity"].forEach((id) => {
const input = document.getElementById(id);
if (input) input.addEventListener("input", updateConversion);
});
const unitSearch = byId("unitSearch");
unitSearch.addEventListener("input", () => renderCategoryList(unitSearch.value));
initGlobalSearch();
document.addEventListener("keydown", handleGlobalKeyboard);
// On an individual SEO conversion page, the "Search all units" box above
// the (already single-category) left sidebar is removed entirely, so the
// panel starts directly with the category. The listener above is still
// attached first, then the now-orphaned elements are simply removed from
// the DOM - harmless, and keeps this as one small addition rather than
// restructuring the existing setup code. The homepage (no seo-page body
// class) is completely unaffected; this block does nothing there.
if (document.body && document.body.classList.contains("seo-page")) {
const unitSearchLabel = document.querySelector('label.field-label[for="unitSearch"]');
if (unitSearchLabel) unitSearchLabel.remove();
if (unitSearch) unitSearch.remove();
// The single-category left sidebar leaves a large empty area below the
// one remaining category card. Fill it with an ad placeholder reusing
// the exact same "sidebar-ad" class/markup already used for the right
// sidebar's advertisement, so it matches in style without any new CSS
// file changes - positioning is handled with an inline style on this
// one generated element only.
//
// This must be a SEPARATE grid item, not a child of .category-panel,
// so the category panel's own height stays exactly its content height
// (just the one category card) and never stretches. .tool-layout is a
// 3-column CSS grid (category-panel | converter-panel | activity-panel)
// with default row/column auto-placement; category-panel implicitly
// occupies column 1, row 1, so this new element is explicitly placed
// at column 1, row 2 - directly below it, same column width, as its
// own independent block.
const categoryListEl = document.getElementById("categoryList");
const categoryPanelEl = categoryListEl ? categoryListEl.closest(".category-panel") : null;
const toolLayoutEl = categoryPanelEl ? categoryPanelEl.closest(".tool-layout") : null;
if (toolLayoutEl && categoryPanelEl && !categoryPanelEl.parentElement.classList.contains("category-panel-stack")) {
// .tool-layout uses align-items: start, so a short category-panel simply
// leaves unused grid-cell space below it in row 1 - a sibling explicitly
// placed in "row 2" would land after the ENTIRE row (i.e. below the much
// taller converter-panel), not in that empty space. To actually fill the
// gap directly under the category card, category-panel and the new ad
// are both moved into one small wrapper that takes over category-panel's
// original grid slot and stacks its two children vertically itself.
const stack = document.createElement("div");
stack.className = "category-panel-stack";
stack.style.display = "flex";
stack.style.flexDirection = "column";
stack.style.gap = "1rem";
categoryPanelEl.insertAdjacentElement("beforebegin", stack);
stack.appendChild(categoryPanelEl);

const categorySidebarAd = document.createElement("aside");
categorySidebarAd.className = "sidebar-ad";
categorySidebarAd.setAttribute("data-ad-placement", "category-sidebar");
categorySidebarAd.setAttribute("aria-label", "Category sidebar advertisement placeholder");
categorySidebarAd.style.position = "static";
categorySidebarAd.textContent = "Advertisement";
stack.appendChild(categorySidebarAd);

// Height-balance against the main converter card: size the ad so the
// category card + gap + ad together roughly match the converter panel's
// height, capped at the existing .sidebar-ad style's own 280px minimum
// so it never collapses smaller than the site's normal ad slot size.
const converterPanelEl = toolLayoutEl.querySelector(".converter-panel");
if (converterPanelEl) {
requestAnimationFrame(() => {
const converterHeight = converterPanelEl.getBoundingClientRect().height;
const cardHeight = categoryPanelEl.getBoundingClientRect().height;
const gap = 16;
const targetAdHeight = converterHeight - cardHeight - gap;
if (targetAdHeight > 280) {
categorySidebarAd.style.minHeight = `${Math.round(targetAdHeight)}px`;
}
});
}

// Required mobile content order on SEO pages: Category, Converter,
// LEFT sidebar Advertisement, Favorite converters, then the remaining
// activity-panel content (Recently used, Conversion history) - with the
// activity panel's own RIGHT sidebar ad kept as a distinct, separate
// slot (not substituted, not duplicated), moved to the end of that
// panel for mobile only so it doesn't sit between the LEFT ad and
// Favorite converters. Desktop/tablet layout (LEFT ad directly under
// the category card; RIGHT ad at the top of the right sidebar) and the
// homepage are completely unaffected - this only runs on SEO pages, and
// every move is reversed if the viewport goes back above 900px.
//
// CSS `order` alone cannot achieve this: the LEFT ad lives nested inside
// .category-panel-stack (needed so it sits directly under the card on
// desktop - see the wrapper created above), not as a direct sibling of
// .converter-panel/.activity-panel, so `order` on it would have no
// effect relative to them. This does real DOM moves instead, gated by
// matchMedia so it responds correctly to viewport/orientation changes
// in both directions.
const mobileBreakpoint = window.matchMedia("(max-width: 900px)");
const activityPanelEl = toolLayoutEl.querySelector(".activity-panel");
const rightSidebarAdEl = activityPanelEl ? activityPanelEl.querySelector(".sidebar-ad[data-ad-placement=\"sidebar\"]") : null;
function applyMobileAdOrder(isMobile) {
if (isMobile) {
if (converterPanelEl) converterPanelEl.insertAdjacentElement("afterend", categorySidebarAd);
if (activityPanelEl && rightSidebarAdEl) activityPanelEl.appendChild(rightSidebarAdEl);
// DOM order alone was found (by direct measurement) not to be reliable
// here - some existing, unrelated CSS class elsewhere in the stylesheet
// happens to also set a "order" value that collides with these grid
// items, so explicit inline order values are set on all four .tool-layout
// children to guarantee the visual sequence regardless of that. Reset to
// "" (falls back to stylesheet/default) when returning to desktop.
stack.style.order = "1";
if (converterPanelEl) converterPanelEl.style.order = "2";
categorySidebarAd.style.order = "3";
if (activityPanelEl) activityPanelEl.style.order = "4";
} else {
stack.appendChild(categorySidebarAd);
if (activityPanelEl && rightSidebarAdEl) activityPanelEl.insertAdjacentElement("afterbegin", rightSidebarAdEl);
stack.style.order = "";
if (converterPanelEl) converterPanelEl.style.order = "";
categorySidebarAd.style.order = "";
if (activityPanelEl) activityPanelEl.style.order = "";
}
}
applyMobileAdOrder(mobileBreakpoint.matches);
mobileBreakpoint.addEventListener("change", (e) => applyMobileAdOrder(e.matches));

// Tablet-range fix (roughly 901-1160px): the site's own existing CSS at
// this width explicitly pins .converter-panel to grid-column: 1, but
// .category-panel-stack (holding the category card + LEFT ad) has no
// matching explicit placement, so it auto-places into that SAME column,
// stacking above the converter rather than using the second (~240-280px)
// column that rule defines but never assigns anything to - leaving it
// empty while the LEFT ad (sized to match the converter's height) renders
// as a huge block above everything. This does not touch that existing
// CSS; it only adds explicit placement for this breakpoint via inline
// styles, reverted when the viewport leaves this range.
const tabletBreakpoint = window.matchMedia("(min-width: 901px) and (max-width: 1160px)");
function applyTabletAdLayout(isTablet) {
if (isTablet) {
toolLayoutEl.insertBefore(categorySidebarAd, activityPanelEl);
// Category comes first (row 1, full width), then Converter + LEFT ad
// side-by-side in row 2.
categoryPanelEl.parentElement.style.gridColumn = "1 / -1";
categoryPanelEl.parentElement.style.gridRow = "1";
if (converterPanelEl) converterPanelEl.style.gridRow = "2";
categorySidebarAd.style.gridColumn = "2";
categorySidebarAd.style.gridRow = "2";
if (activityPanelEl) activityPanelEl.style.gridRow = "3";
} else if (!mobileBreakpoint.matches) {
stack.appendChild(categorySidebarAd);
categorySidebarAd.style.gridColumn = "";
categorySidebarAd.style.gridRow = "";
if (converterPanelEl) converterPanelEl.style.gridRow = "";
categoryPanelEl.parentElement.style.gridColumn = "";
categoryPanelEl.parentElement.style.gridRow = "";
if (activityPanelEl) activityPanelEl.style.gridRow = "";
}
}
applyTabletAdLayout(tabletBreakpoint.matches);
tabletBreakpoint.addEventListener("change", (e) => applyTabletAdLayout(e.matches));

// Visually remove the "Converter" kicker label and the category-name
// heading (e.g. "Mass/Weight Converter") above the converter description,
// on SEO pages only. These elements are hidden, not removed from the
// DOM: selectCategory() writes to both via textContent on every category
// change, and removing them outright would throw the same kind of
// null-reference error found and fixed earlier for the unit-search
// input. Hiding still lets the description sit directly at the top of
// the panel with no leftover gap, since a display:none element takes no
// layout space.
const activeCategoryKindEl = document.getElementById("activeCategoryKind");
const activeCategoryNameEl = document.getElementById("activeCategoryName");
if (activeCategoryKindEl) activeCategoryKindEl.style.display = "none";
if (activeCategoryNameEl) activeCategoryNameEl.style.display = "none";
}
}
}
function handleGlobalKeyboard(event) {
if (event.defaultPrevented || event.ctrlKey || event.metaKey || event.altKey) return;
const target = event.target;
const isTyping = target && (
target.isContentEditable ||
["INPUT", "SELECT", "TEXTAREA"].includes(target.tagName)
);
if (event.key === "/" && !isTyping) {
event.preventDefault();
const search = byId("globalSearch");
if (search) search.focus();
return;
}
if (event.key.toLowerCase() === "s" && !isTyping) {
event.preventDefault();
const swapButton = byId("swapButton");
if (swapButton) swapButton.click();
}
}
function byId(id) {
return document.getElementById(id);
}
function renderCategoryList(filter = "") {
const list = byId("categoryList");
if (!list) return;
const matches = filterCategories(filter);
list.innerHTML = "";
matches.forEach((category) => {
const button = document.createElement("button");
button.type = "button";
button.className = category.id === state.categoryId ? "active" : "";
button.innerHTML = `
<span class="category-row">
<span class="category-icon" aria-hidden="true">${escapeHtml(iconFor(category.id))}</span>
<span>
<span class="category-name">${escapeHtml(category.name)}</span>
<span class="category-meta">${category.units.length.toLocaleString("en-US")} units</span>
</span>
</span>
`;
button.addEventListener("click", () => selectCategory(category.id));
list.appendChild(button);
});
if (!matches.length) {
list.innerHTML = '<p class="empty-state">No matching converter found. Try a unit symbol, category name, or formula keyword.</p>';
}
}
function renderOverview() {
const overviewGrid = byId("overviewGrid");
if (!overviewGrid) return;
overviewGrid.innerHTML = categories.map((category) => {
const unitCount = category.units.length.toLocaleString("en-US");
const pageCount = conversionPageCountFor(category.id).toLocaleString("en-US");
const href = categoryPageUrl(category.id);
return `
<a class="overview-card" href="${escapeAttribute(href)}" aria-label="${escapeAttribute(category.name)}: ${unitCount} units, ${pageCount} conversion pages">
<span class="overview-icon" aria-hidden="true">${escapeHtml(iconFor(category.id))}</span>
<h3>${escapeHtml(category.name)}</h3>
<p>${escapeHtml(category.description)}</p>
<div class="unit-chips">
<span>${unitCount} units</span>
<span>${pageCount} conversion pages</span>
</div>
</a>
`;
}).join("");
}
function renderPopularConversions() {
const grid = byId("popularGrid");
if (!grid) return;
const generated = [
...popularConversions,
...seoConversions
.filter((item) => !popularConversions.some((popular) => popular.slug === item.slug))
.map((item) => ({ name: item.title, displayName: item.title, category: item.categoryId, from: item.from, to: item.to, value: "1", slug: item.slug }))
];
grid.innerHTML = generated.map((item) => {
const resolved = resolveConversionRoute(item);
if (!resolved) return "";
const { category, from, to, href, value } = resolved;
const sampleAmount = Number.isFinite(parseInput(value)) ? parseInput(value) : 1;
const sample = convert(category, sampleAmount, from, to);
return `
<a href="${escapeAttribute(href)}" data-conversion-name="${escapeAttribute(item.name)}" data-route="${escapeAttribute(href)}" data-category="${escapeAttribute(category.id)}" data-from="${escapeAttribute(from.id)}" data-to="${escapeAttribute(to.id)}">
<span>${escapeHtml(item.displayName || item.name)}</span>
<strong>${formatNumber(sampleAmount)} ${escapeHtml(from.symbol)} = ${sample.ok ? formatNumber(sample.value) : ""} ${escapeHtml(to.symbol)}</strong>
<small>${escapeHtml(category.name)}</small>
</a>
`;
}).join("");
grid.querySelectorAll("a").forEach((link) => {
link.addEventListener("click", () => {
debugConversionRoute("popular_conversion_click", {
name: link.dataset.conversionName,
generatedUrl: link.getAttribute("href"),
targetRoute: "/converter",
category: link.dataset.category,
fromUnit: link.dataset.from,
toUnit: link.dataset.to
});
rememberSearch(link.querySelector("span")?.textContent || "Conversion page", link.getAttribute("href") || "#popular", link.dataset.category || "");
trackEvent("popular_conversion_click", {
name: link.dataset.conversionName,
route: link.dataset.route,
category: link.dataset.category,
from: link.dataset.from,
to: link.dataset.to
});
});
});
}
/* -------------------------------------------------------------------- *
 * Global site-wide search
 *
 * Loads /search-index.json (built by generate_search_index.py from the
 * SEO conversion registry + static page list, so it covers every
 * searchable page on the site) exactly once, then searches entirely
 * client-side against that in-memory array. Debounced, keyboard
 * navigable, ranked (never alphabetical).
 * -------------------------------------------------------------------- */
const searchState = {
loadPromise: null,
records: [],
activeIndex: -1,
currentResults: [],
debounceTimer: null
};
const SEARCH_DEBOUNCE_MS = 150;
const SEARCH_MAX_RESULTS = 15;
const SEARCH_DROPDOWN_GAP = 6; // px gap between the search field and the dropdown

/**
 * Keeps the #searchResults dropdown pinned directly beneath #globalSearch,
 * sized to fit whatever viewport space is available, and immune to
 * clipping from ancestors such as .hero (which uses overflow:hidden for
 * its background canvas). The dropdown is portaled to <body> the first
 * time this runs and positioned with position:fixed, so it always paints
 * above the rest of the page regardless of where it lives in the DOM.
 */
function positionSearchDropdown() {
const results = byId("searchResults");
const input = byId("globalSearch");
if (!results || !input) return;
if (results.parentElement !== document.body) {
document.body.appendChild(results);
}
const rect = input.getBoundingClientRect();
const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
const spaceBelow = viewportHeight - rect.bottom - SEARCH_DROPDOWN_GAP - 8;
const spaceAbove = rect.top - SEARCH_DROPDOWN_GAP - 8;
const openUpward = spaceBelow < 160 && spaceAbove > spaceBelow;
const available = Math.max(160, openUpward ? spaceAbove : spaceBelow);
results.style.left = `${rect.left}px`;
results.style.width = `${rect.width}px`;
results.style.maxHeight = `${Math.min(available, 600)}px`;
if (openUpward) {
results.style.top = "";
results.style.bottom = `${viewportHeight - rect.top + SEARCH_DROPDOWN_GAP}px`;
} else {
results.style.bottom = "";
results.style.top = `${rect.bottom + SEARCH_DROPDOWN_GAP}px`;
}
}

function trackSearchDropdownPosition() {
positionSearchDropdown();
window.addEventListener("scroll", positionSearchDropdown, true);
window.addEventListener("resize", positionSearchDropdown);
}

function untrackSearchDropdownPosition() {
window.removeEventListener("scroll", positionSearchDropdown, true);
window.removeEventListener("resize", positionSearchDropdown);
}

function loadSearchIndex() {
if (searchState.loadPromise) return searchState.loadPromise;
searchState.loadPromise = fetch(`${rootRelativePrefix()}search-index.json`)
.then((response) => {
if (!response.ok) throw new Error(`search-index.json ${response.status}`);
return response.json();
})
.then((data) => {
searchState.records = Array.isArray(data) ? data : [];
return searchState.records;
})
.catch((error) => {
console.error("Failed to load search index:", error);
searchState.records = [];
return searchState.records;
});
return searchState.loadPromise;
}

function normalizeSearchText(text) {
return String(text || "").toLowerCase().trim();
}

/* Ranking, lowest number wins (never alphabetical):
   1 exact title, 2 exact slug, 3 exact unit (from/to), 4 alias match,
   5 partial match, 6 keyword match. */
function scoreSearchRecord(record, termLower) {
if (!termLower) return null;
const title = normalizeSearchText(record.title);
const slug = normalizeSearchText(record.slug);
const from = normalizeSearchText(record.from);
const to = normalizeSearchText(record.to);
const category = normalizeSearchText(record.category);
const aliases = (record.aliases || []).map(normalizeSearchText);
const keywords = (record.keywords || []).map(normalizeSearchText);

if (title === termLower) return { rank: 1, field: "title" };
if (slug === termLower || slug.replace(/-/g, " ") === termLower) return { rank: 2, field: "slug" };
if (from === termLower || to === termLower) return { rank: 3, field: "unit" };
if (aliases.some((alias) => alias === termLower)) return { rank: 4, field: "alias" };

const titleWords = title.split(/\s+/);
if (titleWords.some((word) => word === termLower)) return { rank: 3, field: "title" };
if (title.includes(termLower)) return { rank: 5, field: "title" };
if (slug.includes(termLower.replace(/\s+/g, "-"))) return { rank: 5, field: "slug" };
if (from.includes(termLower) || to.includes(termLower)) return { rank: 5, field: "unit" };
if (category === termLower) return { rank: 3, field: "category" };
if (aliases.some((alias) => alias.includes(termLower))) return { rank: 5, field: "alias" };
if (category.includes(termLower)) return { rank: 5, field: "category" };
if (keywords.some((keyword) => keyword === termLower)) return { rank: 6, field: "keyword" };
if (keywords.some((keyword) => keyword.includes(termLower))) return { rank: 6, field: "keyword" };

return null;
}

function searchIndexRecords(term) {
const termLower = normalizeSearchText(term);
if (!termLower) return [];
const scored = [];
for (const record of searchState.records) {
const match = scoreSearchRecord(record, termLower);
if (match) scored.push({ record, rank: match.rank, field: match.field });
}
scored.sort((a, b) => {
if (a.rank !== b.rank) return a.rank - b.rank;
const lenDiff = a.record.title.length - b.record.title.length;
if (lenDiff !== 0) return lenDiff;
return a.record.title.localeCompare(b.record.title);
});
return scored.slice(0, SEARCH_MAX_RESULTS);
}

function highlightMatch(text, term) {
const safeText = escapeHtml(text || "");
const termTrimmed = (term || "").trim();
if (!termTrimmed) return safeText;
const safeTerm = escapeHtml(termTrimmed).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const pattern = new RegExp(`(${safeTerm})`, "ig");
return safeText.replace(pattern, "<mark>$1</mark>");
}

function categorySubtitleFor(record) {
if (record.category === "Home" || record.category === "Tools" || record.category === "About") {
return record.category;
}
if (!record.from && !record.to) return `${record.category} \u2022 Category`;
return `${record.category} \u2022 SEO converter`;
}

function renderSearchResults(query) {
const results = byId("searchResults");
const input = byId("globalSearch");
if (!results || !input) return;
const term = query.trim();
searchState.activeIndex = -1;
if (!term) {
results.innerHTML = "";
results.classList.remove("active");
untrackSearchDropdownPosition();
searchState.currentResults = [];
input.removeAttribute("aria-activedescendant");
input.setAttribute("aria-expanded", "false");
return;
}
loadSearchIndex().then(() => {
const matches = searchIndexRecords(term);
searchState.currentResults = matches;
results.innerHTML = "";
if (!matches.length) {
results.innerHTML = '<button type="button" disabled>No matching conversion found</button>';
results.classList.add("active");
input.setAttribute("aria-expanded", "true");
trackSearchDropdownPosition();
return;
}
matches.forEach((match, index) => {
const record = match.record;
const isCategoryPage = !record.from && !record.to && record.category !== "Home" && record.category !== "Tools" && record.category !== "About" && record.category !== "Guides";
const el = document.createElement(record.url.startsWith("#") ? "button" : "a");
el.id = `searchResultOption-${index}`;
el.setAttribute("role", "option");
if (el.tagName === "A") {
el.href = record.url;
} else {
el.type = "button";
}
el.innerHTML = `
<span class="search-result-row">
<span class="search-result-title">${highlightMatch(record.title, term)}</span>
<span class="search-result-badge">${escapeHtml(record.category)}</span>
</span>
<span class="search-result-meta">${escapeHtml(categorySubtitleFor(record))}</span>
`;
el.addEventListener("click", (event) => {
rememberSearch(record.title, record.url, isCategoryPage ? record.slug : "");
if (isCategoryPage && categoryMap.has(record.slug)) {
event.preventDefault();
selectCategory(record.slug);
scrollToConverter();
}
input.value = "";
results.classList.remove("active");
untrackSearchDropdownPosition();
input.setAttribute("aria-expanded", "false");
});
results.appendChild(el);
});
results.classList.add("active");
input.setAttribute("aria-expanded", "true");
trackSearchDropdownPosition();
});
}

function setActiveSearchResult(index) {
const results = byId("searchResults");
const input = byId("globalSearch");
if (!results || !input) return;
const options = Array.from(results.querySelectorAll('[role="option"]'));
if (!options.length) return;
options.forEach((option) => option.classList.remove("active"));
const clamped = ((index % options.length) + options.length) % options.length;
searchState.activeIndex = clamped;
const active = options[clamped];
active.classList.add("active");
if (typeof active.scrollIntoView === "function") {
active.scrollIntoView({ block: "nearest" });
}
input.setAttribute("aria-activedescendant", active.id);
}

function initGlobalSearch() {
const globalSearch = byId("globalSearch");
const searchResults = byId("searchResults");
if (!globalSearch || !searchResults) return;
globalSearch.setAttribute("role", "combobox");
globalSearch.setAttribute("aria-autocomplete", "list");
globalSearch.setAttribute("aria-expanded", "false");
globalSearch.setAttribute("aria-controls", "searchResults");
searchResults.setAttribute("role", "listbox");
loadSearchIndex();

const debouncedRender = (value) => {
clearTimeout(searchState.debounceTimer);
searchState.debounceTimer = setTimeout(() => renderSearchResults(value), SEARCH_DEBOUNCE_MS);
};

globalSearch.addEventListener("input", () => debouncedRender(globalSearch.value));
globalSearch.addEventListener("focus", () => {
if (globalSearch.value.trim()) renderSearchResults(globalSearch.value);
});
globalSearch.addEventListener("keydown", (event) => {
const options = () => Array.from(searchResults.querySelectorAll('[role="option"]'));
if (event.key === "ArrowDown") {
event.preventDefault();
if (!options().length) return;
setActiveSearchResult(searchState.activeIndex + 1);
} else if (event.key === "ArrowUp") {
event.preventDefault();
if (!options().length) return;
setActiveSearchResult(searchState.activeIndex - 1);
} else if (event.key === "Enter") {
const items = options();
if (searchState.activeIndex >= 0 && items[searchState.activeIndex]) {
event.preventDefault();
items[searchState.activeIndex].click();
}
} else if (event.key === "Escape") {
clearTimeout(searchState.debounceTimer);
globalSearch.value = "";
searchResults.innerHTML = "";
searchResults.classList.remove("active");
untrackSearchDropdownPosition();
globalSearch.setAttribute("aria-expanded", "false");
searchState.activeIndex = -1;
} else if (event.key === "Tab") {
searchResults.classList.remove("active");
untrackSearchDropdownPosition();
globalSearch.setAttribute("aria-expanded", "false");
}
});
document.addEventListener("click", (event) => {
// searchResults is portaled to <body> (see positionSearchDropdown), so it's
// no longer a DOM descendant of .hero-search — check both explicitly.
if (!event.target.closest(".hero-search") && !event.target.closest("#searchResults")) {
searchResults.classList.remove("active");
untrackSearchDropdownPosition();
globalSearch.setAttribute("aria-expanded", "false");
}
});
}
function conversionPageCountFor(id) {
const counts = {
length: 1981, area: 1261, volume: 4693, weight: 1561, temperature: 57, time: 1123, speed: 1191,
pressure: 1191, energy: 1123, power: 871, force: 871, torque: 813, electricity: 40603, frequency: 813,
digital: 553, angle: 57, density: 166057, flow: 102081, fuel_economy: 43, radiation: 2863, chemistry: 4291,
agriculture: 9121, cooking: 343, astronomy: 211, engineering: 24807, scientific: 2257, currency: 23871
};
return counts[id] || 0;
}
function categoryPageUrl(id) {
const slugs = { flow: "flow-rate", fuel_economy: "fuel-economy" };
return `/${slugs[id] || id}/`;
}
function iconFor(id) {
const icons = {
length: "m",
area: "m2",
volume: "L",
weight: "kg",
temperature: "C/F",
time: "h",
speed: "km/h",
pressure: "Pa",
energy: "J",
power: "W",
force: "N",
torque: "Nm",
electricity: "V",
frequency: "Hz",
digital: "GB",
angle: "deg",
density: "rho",
flow: "L/s",
fuel_economy: "mpg",
radiation: "Sv",
chemistry: "mol",
agriculture: "ha",
cooking: "cup",
astronomy: "AU",
engineering: "psi",
scientific: "SI",
currency: "USD"
};
return icons[id] || "U";
}
function seoPageRestrictedCategoryId() {
if (!document.body || !document.body.classList.contains("seo-page")) return null;
const idForSlug = { "flow-rate": "flow", "fuel-economy": "fuel_economy" };
const crumbLinks = document.querySelectorAll(".breadcrumb a[href]");
for (const a of crumbLinks) {
const href = a.getAttribute("href") || "";
const match = href.match(/^\/([a-z0-9-]+)\/?$/i);
if (!match) continue;
const candidate = idForSlug[match[1]] || match[1];
if (categoryMap.has(candidate)) return candidate;
}
return null;
}
function filterCategories(filter) {
const term = filter.trim().toLowerCase();
const restrictedId = seoPageRestrictedCategoryId();
const baseList = restrictedId ? categories.filter((c) => c.id === restrictedId) : categories;
if (!term) return baseList;
return baseList.filter((category) => {
const categoryText = `${category.name} ${category.description} ${category.id}`.toLowerCase();
return categoryText.includes(term) || category.units.some((item) => searchableUnitText(item).includes(term));
});
}
function searchableUnitText(item) {
return `${item.id} ${item.name} ${item.symbol} ${(item.aliases || []).join(" ")} ${(item.synonyms || []).join(" ")} ${item.definition}`.toLowerCase();
}
function selectCategory(categoryId, options = {}) {
const category = categoryMap.get(categoryId) || categories[0];
const remember = options.remember !== false;
state.categoryId = category.id;
state.fromUnitId = category.defaultFrom || category.units[0].id;
state.toUnitId = category.defaultTo || category.units[Math.min(1, category.units.length - 1)].id;
byId("activeCategoryName").textContent = category.name;
byId("activeCategoryDescription").textContent = category.description;
byId("activeCategoryKind").textContent = category.type === "currency" ? "Currency calculator" : category.type === "electricity" ? "Electrical calculator" : "Converter";
populateSelect(byId("fromUnit"), category.units, state.fromUnitId);
populateSelect(byId("toUnit"), category.units, state.toUnitId);
updateContextPanel(category);
renderCategoryList(byId("unitSearch")?.value || "");
updateFavoriteButton();
updateConversion();
if (remember) {
rememberRecent(category.id);
renderStoredLists();
trackEvent("select_category", { category: category.id });
trackEvent("category_opened", { category: category.id, category_name: category.name });
}
}
function populateSelect(select, units, selectedId) {
select.innerHTML = units.map((item) => `<option value="${escapeAttribute(item.id)}">${escapeHtml(item.name)} (${escapeHtml(item.symbol)})</option>`).join("");
select.value = selectedId;
}
function updateContextPanel(category) {
const panel = byId("contextPanel");
const help = byId("contextHelp");
if (!panel) return;
if (category.type !== "electricity") {
panel.hidden = true;
return;
}
panel.hidden = false;
panel.dataset.mode = "electricity";
help.textContent = "Cross-family electrical results use voltage, current, resistance, and hours. Same-family electrical units convert directly.";
}
const UNCOUNTABLE_UNIT_WORDS = new Set([
"water", "mercury", "celsius", "fahrenheit", "kelvin", "rankine", "delisle", "newton", "reaumur", "romer"
]);
const CATEGORY_CONVERSION_TAIL = {
length: "using the exact conversion factor",
area: "using the exact conversion factor",
volume: "using the appropriate conversion factor",
weight: "using the exact international conversion factor",
time: "using the exact conversion factor",
speed: "using the exact conversion factor",
pressure: "using the exact conversion factor",
energy: "using the exact conversion factor",
power: "using the appropriate conversion factor",
force: "using the exact conversion factor",
torque: "using the exact conversion factor",
frequency: "using the exact conversion factor",
digital: "using the exact conversion factor",
angle: "using the exact conversion factor",
density: "using the applicable density conversion factor",
flow: "using the applicable flow rate conversion factor"
};
function pluralizeWord(word) {
if (!word) return word;
const lower = word.toLowerCase();
const irregularPlurals = { foot: "feet", tooth: "teeth", datum: "data" };
if (irregularPlurals[lower]) {
const plural = irregularPlurals[lower];
const isCapitalized = word.charAt(0) === word.charAt(0).toUpperCase();
return isCapitalized ? plural.charAt(0).toUpperCase() + plural.slice(1) : plural;
}
if (/[sxz]$/.test(lower) || /(ch|sh)$/.test(lower)) return `${word}es`;
if (/[^aeiou]y$/.test(lower)) return `${word.slice(0, -1)}ies`;
return `${word}s`;
}
function pluralizeUnitName(unit) {
const name = typeof unit === "string" ? unit : unit && unit.name;
if (!name) return name;
if (name.includes("/")) return name;
const symbol = typeof unit === "object" && unit ? unit.symbol : null;
if (symbol && name.toLowerCase() === symbol.toLowerCase()) return name;
const perIndex = name.indexOf(" per ");
if (perIndex !== -1) return `${pluralizeUnitName(name.slice(0, perIndex))}${name.slice(perIndex)}`;
const ofIndex = name.indexOf(" of ");
if (ofIndex !== -1) return `${pluralizeUnitName(name.slice(0, ofIndex))}${name.slice(ofIndex)}`;
const match = name.match(/^(.*?)([A-Za-z]+)$/);
if (!match) return name;
const prefix = match[1];
const lastWord = match[2];
const lowerLastWord = lastWord.toLowerCase();
if (UNCOUNTABLE_UNIT_WORDS.has(lowerLastWord) || lowerLastWord.endsWith("s")) return name;
return `${prefix}${pluralizeWord(lastWord)}`;
}
function buildConversionDescription(category, fromUnit, toUnit) {
if (!category) return "";
if (!fromUnit || !toUnit) return category.description;
if (category.type === "temperature") {
const fromLabel = fromUnit.id === "kelvin" ? fromUnit.symbol : `\u00b0${fromUnit.symbol}`;
const toLabel = toUnit.id === "kelvin" ? toUnit.symbol : `\u00b0${toUnit.symbol}`;
return `Convert ${fromUnit.name} (${fromLabel}) to ${toUnit.name} (${toLabel}) using the standard temperature conversion formula.`;
}
if (category.type === "currency") {
return `Convert ${pluralizeUnitName(fromUnit)} (${fromUnit.id}) to ${pluralizeUnitName(toUnit)} (${toUnit.id}) using current exchange rates.`;
}
if (category.type === "fuel") {
return `Convert ${fromUnit.name} (${fromUnit.symbol}) to ${toUnit.name} (${toUnit.symbol}) using the fuel economy conversion formula.`;
}
if (category.type === "electricity") {
return `Convert ${pluralizeUnitName(fromUnit)} (${fromUnit.symbol}) to ${pluralizeUnitName(toUnit)} (${toUnit.symbol}) using the applicable electrical conversion factor.`;
}
if (category.type === "multi") {
return `Convert ${pluralizeUnitName(fromUnit)} (${fromUnit.symbol}) to ${pluralizeUnitName(toUnit)} (${toUnit.symbol}) using the applicable conversion factor for these units.`;
}
const tail = CATEGORY_CONVERSION_TAIL[category.id] || "using the exact conversion factor";
return `Convert ${pluralizeUnitName(fromUnit)} (${fromUnit.symbol}) to ${pluralizeUnitName(toUnit)} (${toUnit.symbol}) ${tail}.`;
}
function updateActiveCategoryDescription(category, fromUnit, toUnit) {
const node = byId("activeCategoryDescription");
if (!node || !category) return;
node.textContent = buildConversionDescription(category, fromUnit, toUnit);
}
function updateConversion() {
const category = categoryMap.get(state.categoryId);
const amount = parseInput(byId("fromValue").value);
const from = getUnit(category, byId("fromUnit").value);
const to = getUnit(category, byId("toUnit").value);
state.fromUnitId = from.id;
state.toUnitId = to.id;
updateActiveCategoryDescription(category, from, to);
const note = byId("conversionNote");
const output = byId("toValue");
const resultText = byId("resultText");
if (!Number.isFinite(amount)) {
output.value = "";
resultText.textContent = "Enter a number to convert";
note.textContent = "Use decimal or scientific notation, such as 1.25e6.";
updateDefinitionPanel(category, from, to, null);
return;
}
const result = convert(category, amount, from, to);
if (!result.ok) {
output.value = "";
resultText.textContent = result.message;
note.textContent = result.note || category.note || "This conversion needs compatible units.";
updateDefinitionPanel(category, from, to, result);
return;
}
const formatted = formatNumber(result.value);
output.value = formatted;
resultText.textContent = `${formatNumber(amount)} ${from.name} = ${formatted} ${to.name}`;
note.textContent = result.note || category.note || "Results update instantly as you type.";
updateDefinitionPanel(category, from, to, result);
scheduleHistoryRecord(category, amount, from, result.value, to);
}
function updateDefinitionPanel(category, from, to, result) {
const fromDefinition = byId("fromDefinition");
if (!fromDefinition) return;
byId("fromDefinition").textContent = from.definition || `${from.name} definition.`;
byId("toDefinition").textContent = to.definition || `${to.name} definition.`;
byId("formulaText").textContent = result && result.formula
? result.formula
: formulaFor(category, from, to);
}
function formulaFor(category, from, to) {
if (category.type === "temperature") return "Convert the source temperature to Kelvin, then convert Kelvin to the target scale.";
if (category.type === "fuel") return "Normalize fuel economy to distance per volume, inverting consumption units when needed.";
if (category.type === "multi" && from.dimension !== to.dimension) return "Choose units from the same measurement family for a direct conversion.";
if (category.type === "electricity" && from.dimension !== to.dimension) return "Use Ohm's law and energy over time: V = I x R, P = V x I, E = P x time.";
return `Result = input x ${compactNumber(from.factor)} / ${compactNumber(to.factor)}.`;
}
function parseInput(value) {
if (typeof value !== "string") return NaN;
const normalized = value.replace(/,/g, "").trim();
if (normalized === "") return NaN;
return Number(normalized);
}
function getUnit(category, id) {
return category.units.find((item) => item.id === id) || category.units[0];
}
function resolveCategoryByIdentifier(identifier) {
if (!identifier) return null;
if (categoryMap.has(identifier)) return categoryMap.get(identifier);
const normalized = normalizeRouteValue(identifier);
if (!normalized) return null;
const byId = categories.find((category) => normalizeRouteValue(category.id) === normalized);
if (byId) return byId;
const byName = categories.find((category) => {
const candidates = [category.name, category.title, category.label, ...(category.aliases || []), ...(category.synonyms || [])]
.filter(Boolean)
.map((value) => normalizeRouteValue(value));
return candidates.some((candidate) => candidate === normalized || candidate.includes(normalized) || normalized.includes(candidate));
});
return byName || null;
}
function resolveUnitAlias(category, value) {
const term = normalizeRouteValue(value);
if (!category || !term) return null;
const exactMatch = category.units.find((unit) => {
const aliases = [unit.id, unit.name, unit.symbol, ...(unit.aliases || []), ...(unit.synonyms || [])];
return aliases.some((alias) => normalizeRouteValue(alias) === term);
});
if (exactMatch) return exactMatch;
const termKey = unitTokenKey(value);
if (!termKey) return null;
return category.units.find((unit) => {
const aliases = [unit.id, unit.name, unit.symbol, ...(unit.aliases || []), ...(unit.synonyms || [])];
return aliases.some((alias) => unitTokenKey(alias) === termKey);
}) || null;
}
function unitTokenKey(value) {
return normalizeRouteValue(value)
.split("_")
.filter(Boolean)
.map(singularizeToken)
.sort()
.join("_");
}
function singularizeToken(token) {
if (token.length <= 3) return token;
if (token.endsWith("ies")) return token.slice(0, -3) + "y";
if (/(ches|shes|xes|ses|zes)$/.test(token)) return token.slice(0, -2);
if (token.endsWith("s") && !token.endsWith("ss")) return token.slice(0, -1);
return token;
}
function findConversionFromParams(params) {
const slugConfig = seoMap.get(params.get("slug") || "");
const categoryId = params.get("category") || (slugConfig ? slugConfig.categoryId : "");
const fromValue = params.get("from") || (slugConfig ? slugConfig.from : "");
const toValue = params.get("to") || (slugConfig ? slugConfig.to : "");
const value = params.get("value") || "";
if (!fromValue || !toValue) return null;
const candidates = categoryId && categoryMap.has(categoryId)
? [categoryMap.get(categoryId)]
: categories;
for (const category of candidates) {
const from = resolveUnitAlias(category, fromValue);
const to = resolveUnitAlias(category, toValue);
if (from && to) {
return {
categoryId: category.id,
fromUnitId: from.id,
toUnitId: to.id,
value,
originalFrom: fromValue,
originalTo: toValue,
route: window.location.pathname + window.location.search + window.location.hash
};
}
}
debugConversionRoute("converter_route_unresolved", {
category: categoryId || "",
from: fromValue,
to: toValue
});
return null;
}
function normalizeRouteValue(value) {
return String(value || "").trim().toLowerCase().replace(/\+/g, " ").replace(/[_\s-]+/g, "_");
}
function convert(category, amount, from, to) {
if (from.id === to.id) return { ok: true, value: amount, note: "Same-unit conversion.", formula: "Source and target units are identical." };
if (category.type === "linear" || category.type === "currency") {
return {
ok: true,
value: amount * from.factor / to.factor,
note: category.type === "currency" ? "Currency uses offline fallback rates unless live API rates were loaded." : category.note,
formula: `Result = ${formatNumber(amount)} x ${compactNumber(from.factor)} / ${compactNumber(to.factor)}.`
};
}
if (category.type === "temperature") {
const kelvin = toKelvin(amount, from.id);
return { ok: true, value: fromKelvin(kelvin, to.id), note: "Temperature conversion uses Kelvin as the intermediate absolute scale.", formula: formulaFor(category, from, to) };
}
if (category.type === "multi") {
if (from.dimension !== to.dimension) {
return { ok: false, message: "Choose compatible unit families", note: `${from.name} and ${to.name} measure different things.` };
}
return { ok: true, value: amount * from.factor / to.factor, note: `${titleCase(from.dimension.replace(/_/g, " "))} units are compatible.`, formula: `Result = ${formatNumber(amount)} x ${compactNumber(from.factor)} / ${compactNumber(to.factor)}.` };
}
if (category.type === "electricity") return convertElectricity(amount, from, to);
if (category.type === "fuel") return convertFuel(amount, from, to);
return { ok: false, message: "Conversion unavailable" };
}
function toKelvin(value, unitId) {
if (unitId === "celsius") return value + 273.15;
if (unitId === "fahrenheit") return (value - 32) * 5 / 9 + 273.15;
if (unitId === "rankine") return value * 5 / 9;
if (unitId === "delisle") return 373.15 - value * 2 / 3;
if (unitId === "newton_temperature") return value * 100 / 33 + 273.15;
if (unitId === "reaumur") return value * 5 / 4 + 273.15;
if (unitId === "romer") return (value - 7.5) * 40 / 21 + 273.15;
return value;
}
function fromKelvin(value, unitId) {
if (unitId === "celsius") return value - 273.15;
if (unitId === "fahrenheit") return (value - 273.15) * 9 / 5 + 32;
if (unitId === "rankine") return value * 9 / 5;
if (unitId === "delisle") return (373.15 - value) * 3 / 2;
if (unitId === "newton_temperature") return (value - 273.15) * 33 / 100;
if (unitId === "reaumur") return (value - 273.15) * 4 / 5;
if (unitId === "romer") return (value - 273.15) * 21 / 40 + 7.5;
return value;
}
function convertFuel(amount, from, to) {
const base = from.mode === "consumption" ? 1 / (amount * from.factor) : amount * from.factor;
const value = to.mode === "consumption" ? 1 / (base * to.factor) : base / to.factor;
if (!Number.isFinite(value)) return { ok: false, message: "Enter a nonzero fuel economy value", note: "Consumption units invert the efficiency value." };
return { ok: true, value, note: "Fuel economy supports both distance-per-volume and volume-per-distance units.", formula: formulaFor(categoryMap.get("fuel_economy"), from, to) };
}
function convertElectricity(amount, from, to) {
if (from.dimension === to.dimension) {
return { ok: true, value: amount * from.factor / to.factor, note: "Electrical units in the same family convert directly.", formula: `Result = ${formatNumber(amount)} x ${compactNumber(from.factor)} / ${compactNumber(to.factor)}.` };
}
const source = amount * from.factor;
const voltage = positiveContext("contextVoltage");
const current = positiveContext("contextCurrent");
const resistance = positiveContext("contextResistance");
const hours = positiveContext("contextHours");
const seconds = hours * 3600;
const baseByDimension = {};
if (from.dimension === "voltage") {
baseByDimension.voltage = source;
if (resistance) baseByDimension.current = source / resistance;
if (current) baseByDimension.resistance = source / current;
if (current) baseByDimension.power = source * current;
}
if (from.dimension === "current") {
baseByDimension.current = source;
if (resistance) baseByDimension.voltage = source * resistance;
if (voltage) baseByDimension.resistance = voltage / source;
if (voltage) baseByDimension.power = voltage * source;
}
if (from.dimension === "resistance") {
baseByDimension.resistance = source;
if (voltage) baseByDimension.current = voltage / source;
if (current) baseByDimension.voltage = current * source;
if (voltage) baseByDimension.power = voltage * voltage / source;
if (current) baseByDimension.power = current * current * source;
}
if (from.dimension === "power") {
baseByDimension.power = source;
if (current) baseByDimension.voltage = source / current;
if (voltage) baseByDimension.current = source / voltage;
if (voltage) baseByDimension.resistance = voltage * voltage / source;
}
if (from.dimension === "energy") {
baseByDimension.energy = source;
if (seconds) baseByDimension.power = source / seconds;
}
if (baseByDimension.power && seconds) baseByDimension.energy = baseByDimension.power * seconds;
const value = baseByDimension[to.dimension];
if (!Number.isFinite(value)) {
return { ok: false, message: "Add the needed electrical context", note: "Cross-family electrical calculations need voltage, current, resistance, or hours." };
}
return { ok: true, value: value / to.factor, note: "Electrical result uses the context values shown above.", formula: "V = I x R, P = V x I, and E = P x time." };
}
function positiveContext(id) {
const input = byId(id);
if (!input) return 0;
const value = parseInput(input.value);
return Number.isFinite(value) && value > 0 ? value : 0;
}
function formatNumber(value) {
if (!Number.isFinite(value)) return "";
if (Object.is(value, -0)) value = 0;
const precision = clampNumber(state.precision || 12, 2, 15);
const absolute = Math.abs(value);
if (state.notation === "scientific") return trimExponent(value.toExponential(precision - 1));
if (state.notation === "engineering") return formatEngineering(value, precision);
if (state.notation === "decimal") {
return new Intl.NumberFormat("en-US", { maximumFractionDigits: precision, useGrouping: true }).format(value);
}
if (absolute !== 0 && (absolute < 1e-6 || absolute >= 1e12)) return trimExponent(value.toExponential(precision - 1));
return new Intl.NumberFormat("en-US", {
maximumSignificantDigits: precision,
maximumFractionDigits: precision
}).format(value);
}
function compactNumber(value) {
if (!Number.isFinite(value)) return "";
if (Math.abs(value) >= 1e6 || (Math.abs(value) > 0 && Math.abs(value) < 1e-4)) return trimExponent(value.toExponential(8));
return String(Number(value.toPrecision(10)));
}
function formatEngineering(value, precision) {
if (value === 0) return "0";
const exponent = Math.floor(Math.log10(Math.abs(value)) / 3) * 3;
const mantissa = value / Math.pow(10, exponent);
return `${Number(mantissa.toPrecision(precision))}e${exponent}`;
}
function trimExponent(value) {
return value.replace(/\.?0+e/, "e");
}
function scheduleHistoryRecord(category, amount, from, value, to) {
if (!historyEnabled) return;
window.clearTimeout(historyTimer);
const key = `${category.id}:${amount}:${from.id}:${to.id}:${value}`;
historyTimer = window.setTimeout(() => {
if (state.lastRecordKey === key) return;
state.lastRecordKey = key;
const history = readArray(storageKeys.history);
history.unshift({
categoryId: category.id,
categoryName: category.name,
text: `${formatNumber(amount)} ${from.symbol} = ${formatNumber(value)} ${to.symbol}`,
timestamp: new Date().toISOString()
});
writeArray(storageKeys.history, uniqueHistory(history).slice(0, 12));
renderStoredLists();
trackEvent("conversion_completed", {
category: category.id,
from_unit: from.id,
to_unit: to.id,
input_value: amount,
output_value: value
});
}, 350);
}
function uniqueHistory(history) {
const seen = new Set();
return history.filter((item) => {
const key = `${item.categoryId}:${item.text}`;
if (seen.has(key)) return false;
seen.add(key);
return true;
});
}
function toggleFavorite() {
const favorites = readArray(storageKeys.favorites);
const exists = favorites.includes(state.categoryId);
const next = exists ? favorites.filter((id) => id !== state.categoryId) : [state.categoryId, ...favorites].slice(0, 12);
writeArray(storageKeys.favorites, next);
renderStoredLists();
updateFavoriteButton();
if (!exists) trackEvent("favorite_saved", { category: state.categoryId });
}
function updateFavoriteButton() {
const button = byId("favoriteButton");
if (!button) return;
const favorites = readArray(storageKeys.favorites);
const active = favorites.includes(state.categoryId);
button.classList.toggle("is-active", active);
button.setAttribute("aria-pressed", String(active));
button.innerHTML = active ? '<span aria-hidden="true">-</span> Saved' : '<span aria-hidden="true">+</span> Favorite';
}
function rememberRecent(categoryId) {
const recent = readArray(storageKeys.recent).filter((id) => id !== categoryId);
recent.unshift(categoryId);
writeArray(storageKeys.recent, recent.slice(0, 8));
}
function rememberSearch(label, url, categoryId = "") {
if (!label || !url) return;
const entry = { label, url, categoryId, timestamp: new Date().toISOString() };
const searches = readArray(storageKeys.searches).filter((item) => `${item.label}:${item.url}` !== `${label}:${url}`);
searches.unshift(entry);
writeArray(storageKeys.searches, searches.slice(0, 6));
renderRecentSearches();
trackEvent("search_used", { search_term: label, destination: url, category: categoryId || "" });
}
function renderRecentSearches() {
const element = byId("recentSearches");
if (!element) return;
const searches = readArray(storageKeys.searches).filter((item) => item && item.label && item.url);
if (!searches.length) {
element.innerHTML = "";
return;
}
element.innerHTML = '<span>Recently searched</span>';
searches.slice(0, 5).forEach((item) => {
if (item.categoryId && categoryMap.has(item.categoryId)) {
const button = document.createElement("button");
button.type = "button";
button.textContent = item.label;
button.addEventListener("click", () => {
selectCategory(item.categoryId);
scrollToConverter();
});
element.appendChild(button);
return;
}
const link = document.createElement("a");
link.href = item.url;
link.textContent = item.label;
element.appendChild(link);
});
}
function resolveConversionRoute(item) {
const category = categoryMap.get(item.category);
if (!category) {
debugConversionRoute("popular_conversion_invalid_category", item);
return null;
}
const from = resolveUnitAlias(category, item.from);
const to = resolveUnitAlias(category, item.to);
if (!from || !to) {
debugConversionRoute("popular_conversion_invalid_units", {
name: item.name,
category: item.category,
from: item.from,
to: item.to,
resolvedFrom: from ? from.id : "",
resolvedTo: to ? to.id : ""
});
return null;
}
return {
category,
from,
to,
value: item.value || "1",
href: converterRouteUrl({
category: category.id,
from: item.from,
to: item.to,
value: item.value || "1",
slug: item.slug || ""
})
};
}
function rootRelativePrefix() {
const scriptEl = document.querySelector('script[src$="app.js"]');
if (scriptEl) {
const src = scriptEl.getAttribute("src") || "";
return src.replace(/app\.js$/, "");
}
return "";
}
function converterRouteUrl({ category, from, to, value = "1", slug = "" }) {
const params = new URLSearchParams({ category, from, to, value });
if (slug) params.set("slug", slug);
return `${rootRelativePrefix()}index.html?${params.toString()}#converter`;
}
function conversionPageUrl(slug) {
const config = seoMap.get(slug);
if (!config) return mainConverterUrlForConversion(slug);
return converterRouteUrl({
category: config.categoryId,
from: config.from,
to: config.to,
value: "1",
slug
});
}
function mainConverterUrlForConversion(slug) {
const config = seoMap.get(slug);
if (!config) return `${rootRelativePrefix()}index.html#converter`;
const params = new URLSearchParams({
category: config.categoryId,
from: config.from,
to: config.to,
value: "1"
});
return `${rootRelativePrefix()}index.html?${params.toString()}#converter`;
}
function renderStoredLists() {
renderCategoryMiniList("favoritesList", readArray(storageKeys.favorites), "No favorites yet. Save a converter to keep it here.");
renderCategoryMiniList("recentList", readArray(storageKeys.recent), "Recent converters will appear here after you use them.");
renderRecentSearches();
renderHistory();
}
function renderCategoryMiniList(elementId, ids, emptyText) {
const element = byId(elementId);
if (!element) return;
element.innerHTML = "";
const validIds = ids.filter((id) => categoryMap.has(id));
if (!validIds.length) {
element.innerHTML = `<p class="empty-state">${emptyText}</p>`;
return;
}
validIds.forEach((id) => {
const category = categoryMap.get(id);
const button = document.createElement("button");
button.type = "button";
button.textContent = category.name;
button.addEventListener("click", () => selectCategory(id));
element.appendChild(button);
});
}
function renderHistory() {
const element = byId("historyList");
if (!element) return;
const history = readArray(storageKeys.history);
if (!history.length) {
element.innerHTML = '<p class="empty-state">Your latest conversions stay on this device and work offline.</p>';
return;
}
element.innerHTML = history.map((item) => `
<div class="history-item">
<strong>${escapeHtml(item.text)}</strong>
<span>${escapeHtml(item.categoryName)}</span>
</div>
`).join("");
}
async function copyResult() {
const text = byId("resultText").textContent;
const note = byId("conversionNote");
try {
await navigator.clipboard.writeText(text);
note.textContent = "Result copied to clipboard.";
trackEvent("copy_result", { category: state.categoryId });
} catch (error) {
note.textContent = "Copy is unavailable in this browser, but the result is ready to select.";
}
}
async function shareResult() {
const text = byId("resultText").textContent;
const note = byId("conversionNote");
const shareUrl = buildShareUrl();
const shareData = { title: "Universal Converter", text, url: shareUrl };
try {
if (navigator.share) {
await navigator.share(shareData);
note.textContent = "Share dialog opened.";
} else {
await navigator.clipboard.writeText(`${text} - ${shareUrl}`);
note.textContent = "Share text copied to clipboard.";
}
trackEvent("share_result", { category: state.categoryId });
} catch (error) {
note.textContent = "Share was cancelled or unavailable.";
}
}
function buildShareUrl() {
const url = new URL(window.location.href);
url.searchParams.set("category", state.categoryId);
url.searchParams.set("from", state.fromUnitId);
url.searchParams.set("to", state.toUnitId);
url.searchParams.set("value", byId("fromValue").value || "1");
url.hash = "converter";
return url.toString();
}
function readSeoConversionData() {
// Cached per page load: the underlying inputs (window.__seoPageData, the
// #seoConverter dataset, categoryMap, and the current location) do not
// change during a single page load, so this result is safe to compute once
// and reuse instead of re-deriving it on every call (initSeoConverterPage()
// and initializeConverterFromPageRegistry() both need this same value).
if (seoConversionDataResolved) return seoConversionDataCache;
seoConversionDataCache = computeSeoConversionData();
seoConversionDataResolved = true;
return seoConversionDataCache;
}
function computeSeoConversionData() {
const pageData = typeof window !== "undefined" ? window.__seoPageData : null;
const slugFromPageData = pageData && typeof pageData.slug === "string" ? pageData.slug.trim() : "";
const container = document.getElementById("seoConverter");
const slugFromContainer = container?.dataset?.slug || "";
const slug = slugFromPageData || slugFromContainer || currentPageSlug() || "";
const categoryId = pageData && (pageData.categoryId || pageData.category);
const fromUnitId = pageData && (pageData.fromUnitId || pageData.from);
const toUnitId = pageData && (pageData.toUnitId || pageData.to);
const resolvedCategory = resolveCategoryByIdentifier(categoryId);
if (categoryId && fromUnitId && toUnitId && resolvedCategory) {
const resolvedFrom = resolveUnitAlias(resolvedCategory, fromUnitId);
const resolvedTo = resolveUnitAlias(resolvedCategory, toUnitId);
if (resolvedFrom && resolvedTo && resolvedFrom.id !== resolvedTo.id) {
return {
categoryId: resolvedCategory.id,
fromUnitId: resolvedFrom.id,
toUnitId: resolvedTo.id,
value: pageData.value || "1",
originalFrom: fromUnitId,
originalTo: toUnitId,
route: pageData.path || window.location.pathname
};
}
}
const lastSlugSegment = slug.includes("/") ? slug.split("/").filter(Boolean).pop() : slug;
const config = seoMap.get(slug) || (lastSlugSegment ? seoMap.get(lastSlugSegment) : null);
if (config) {
return {
categoryId: config.categoryId,
fromUnitId: config.from,
toUnitId: config.to,
value: "1",
originalFrom: config.from,
originalTo: config.to,
route: window.location.pathname
};
}
if (typeof window !== "undefined" && window.__seoConversion) return window.__seoConversion;
if (container) {
const categoryId = container.dataset.category;
const from = container.dataset.from;
const to = container.dataset.to;
const value = container.dataset.value || "1";
if (categoryId && from && to) {
return {
categoryId,
fromUnitId: from,
toUnitId: to,
value,
originalFrom: from,
originalTo: to,
route: window.location.pathname
};
}
}
const derived = deriveConversionFromPath(preferredPagePath()) || deriveConversionFromPath(location.pathname);
if (derived) return derived;
const currentPath = preferredPagePath() || window.location.pathname || "";
const routeSegments = currentPath.split("/").filter(Boolean);
const candidateSlug = routeSegments.length > 1 ? routeSegments[routeSegments.length - 1] : routeSegments[0] || "";
if (candidateSlug && candidateSlug.includes("-to-")) {
const fromToken = candidateSlug.split("-to-")[0];
const toToken = candidateSlug.split("-to-")[1];
if (fromToken && toToken) {
const categoryHintId = routeSegments.length > 1 ? routeSegments[0] : null;
const hintedCategory = categoryHintId ? categoryMap.get(categoryHintId) : null;
const searchOrder = hintedCategory
? [hintedCategory, ...categories.filter((category) => category !== hintedCategory)]
: categories;
for (const category of searchOrder) {
const fromUnit = resolveUnitAlias(category, fromToken);
const toUnit = resolveUnitAlias(category, toToken);
if (fromUnit && toUnit && fromUnit.id !== toUnit.id) {
return {
categoryId: category.id,
fromUnitId: fromUnit.id,
toUnitId: toUnit.id,
value: "1",
originalFrom: fromToken,
originalTo: toToken,
route: currentPath
};
}
}
}
}
return null;
}
function deriveConversionFromPath(pathname) {
const segments = String(pathname || "")
.split("/")
.map((segment) => decodeURIComponent(segment))
.filter(Boolean);
if (!segments.length) return null;
const cleanedSegments = segments.filter((segment) => {
const lower = segment.toLowerCase();
return lower !== "index.html" && lower !== "index.htm";
});
if (!cleanedSegments.length) return null;
const conversionSegment = [...cleanedSegments].reverse().find((segment) => segment.includes("-to-"));
if (!conversionSegment) return null;
const splitIndex = conversionSegment.indexOf("-to-");
const fromToken = conversionSegment.slice(0, splitIndex);
const toToken = conversionSegment.slice(splitIndex + 4);
if (!fromToken || !toToken) return null;
const hintedCategoryId = cleanedSegments.find((segment) => categoryMap.has(segment));
const hintedCategory = hintedCategoryId ? categoryMap.get(hintedCategoryId) : null;
const searchOrder = hintedCategory
? [hintedCategory, ...categories.filter((category) => category !== hintedCategory)]
: categories;
for (const category of searchOrder) {
const fromUnit = resolveUnitAlias(category, fromToken);
const toUnit = resolveUnitAlias(category, toToken);
if (fromUnit && toUnit && fromUnit.id !== toUnit.id) {
return {
categoryId: category.id,
fromUnitId: fromUnit.id,
toUnitId: toUnit.id,
value: "1",
originalFrom: fromToken,
originalTo: toToken,
route: pathname
};
}
}
return null;
}
function renderSeoConverterShell() {
return `
<section class="tool-section" id="converter" aria-labelledby="converterTitle">
<div class="section-heading">
<div>
<p class="eyebrow">Professional calculator style</p>
<h2 id="converterTitle">World-scale conversion engine</h2>
</div>
<div class="metric-strip" aria-label="Converter summary">
<span>30+ categories</span>
<span>Thousands of units</span>
<span>Instant results</span>
<span>Offline ready</span>
</div>
</div>
<div class="tool-layout">
<aside class="category-panel" aria-label="Converter categories">
<label class="field-label" for="unitSearch">Search all units</label>
<input class="compact-search" id="unitSearch" type="search" placeholder="Search all units">
<div class="category-list" id="categoryList"></div>
</aside>
<section class="converter-panel" aria-label="Active converter">
<div class="converter-header">
<div>
<p class="panel-kicker" id="activeCategoryKind">Converter</p>
<h2 id="activeCategoryName">Length Converter</h2>
<p id="activeCategoryDescription">Convert metric, imperial, and nautical distance units.</p>
</div>
<button class="favorite-button" id="favoriteButton" type="button" aria-pressed="false">
<span aria-hidden="true">+</span>
Favorite
</button>
</div>
<div class="converter-grid">
<label class="unit-box" for="fromValue">
<span>From Unit</span>
<input id="fromValue" type="text" inputmode="decimal" value="1" autocomplete="off">
<select id="fromUnit" aria-label="From unit"></select>
</label>
<button class="swap-button" id="swapButton" type="button" aria-label="Swap units">&#8644;</button>
<label class="unit-box" for="toValue">
<span>To Unit</span>
<input id="toValue" type="text" readonly>
<select id="toUnit" aria-label="To unit"></select>
</label>
</div>
<div class="converter-controls" aria-label="Result formatting controls">
<label>Decimal control
<input id="precisionControl" type="number" min="2" max="15" value="12">
</label>
<label>Notation
<select id="notationMode">
<option value="auto">Auto</option>
<option value="decimal">Decimal</option>
<option value="scientific">Scientific</option>
<option value="engineering">Engineering</option>
</select>
</label>
</div>
<div class="context-panel" id="contextPanel" hidden>
<div class="context-copy">
<strong>Context values</strong>
<span id="contextHelp">Some unit families need one extra value for a physically accurate result.</span>
</div>
<div class="context-grid electricity-context">
<label>Voltage
<input id="contextVoltage" type="number" min="0" step="any" value="120">
</label>
<label>Current
<input id="contextCurrent" type="number" min="0" step="any" value="10">
</label>
<label>Resistance
<input id="contextResistance" type="number" min="0" step="any" value="12">
</label>
<label>Hours
<input id="contextHours" type="number" min="0" step="any" value="1">
</label>
</div>
<div class="context-grid agriculture-context">
<label>Liquid density, kg/L
<input id="contextDensity" type="number" min="0" step="any" value="1">
</label>
</div>
</div>
<div class="result-bar">
<div>
<span class="result-label">Result</span>
<strong id="resultText">1 meter = 3.28084 feet</strong>
</div>
<div class="result-actions">
<button class="copy-button" id="copyButton" type="button">Copy result</button>
<button class="copy-button secondary" id="shareButton" type="button">Share</button>
</div>
</div>
<section class="converter-ad-slot" data-ad-placement="converter" aria-label="Converter advertisement placeholder">
<span>Advertisement</span>
<strong>Converter ad slot</strong>
<p>Reserved below the result so the calculator remains usable.</p>
</section>
<div class="definition-panel" id="definitionPanel">
<article>
<span>From definition</span>
<p id="fromDefinition">Meter is the SI base unit of length.</p>
</article>
<article>
<span>To definition</span>
<p id="toDefinition">Foot equals exactly 0.3048 meters.</p>
</article>
<article>
<span>Formula</span>
<p id="formulaText">Multiply by the source factor, then divide by the target factor.</p>
</article>
</div>
<p class="conversion-note" id="conversionNote">Results update instantly as you type.</p>
</section>
<aside class="activity-panel" aria-label="Saved and recent conversions">
<aside class="sidebar-ad" data-ad-placement="sidebar" aria-label="Sidebar advertisement placeholder">
Advertisement
</aside>
<section>
<div class="activity-heading">
<h3>Favorite converters</h3>
<button type="button" id="clearFavorites">Clear</button>
</div>
<div class="mini-list" id="favoritesList"></div>
</section>
<section>
<div class="activity-heading">
<h3>Recently used</h3>
<button type="button" id="clearRecent">Clear</button>
</div>
<div class="mini-list" id="recentList"></div>
</section>
<section>
<div class="activity-heading">
<h3>Conversion history</h3>
<button type="button" id="clearHistory">Clear</button>
</div>
<div class="history-list" id="historyList"></div>
</section>
</aside>
</div>
</section>
`;
}
function readSharedConversion() {
const params = new URLSearchParams(window.location.search);
const shared = findConversionFromParams(params);
if (!shared) return null;
debugConversionRoute("converter_route_loaded", {
route: shared.route,
category: shared.categoryId,
fromParam: shared.originalFrom,
toParam: shared.originalTo,
selectedFromUnit: shared.fromUnitId,
selectedToUnit: shared.toUnitId
});
return shared;
}
function applySharedConversion(sharedConversion) {
const category = categoryMap.get(sharedConversion.categoryId);
if (!category) return;
const from = category.units.some((unit) => unit.id === sharedConversion.fromUnitId)
? sharedConversion.fromUnitId
: state.fromUnitId;
const to = category.units.some((unit) => unit.id === sharedConversion.toUnitId)
? sharedConversion.toUnitId
: state.toUnitId;
state.fromUnitId = from;
state.toUnitId = to;
byId("fromUnit").value = from;
byId("toUnit").value = to;
if (sharedConversion.value && Number.isFinite(parseInput(sharedConversion.value))) {
byId("fromValue").value = sharedConversion.value;
}
updateConversion();
const fromUnit = getUnit(category, from);
const toUnit = getUnit(category, to);
rememberSearch(`${fromUnit.name} to ${toUnit.name}`, "#converter", category.id);
debugConversionRoute("converter_route_applied", {
category: category.id,
fromUnit: fromUnit.id,
toUnit: toUnit.id,
value: byId("fromValue").value || "1"
});
}
function initSeoConverterPage() {
const container = document.getElementById("seoConverter");
if (!container) return;
const seoConversion = readSeoConversionData();
if (!seoConversion) {
const slug = container.dataset.slug || location.pathname.split("/").filter(Boolean).pop();
if (typeof mainConverterUrlForConversion === "function") {
window.location.replace(mainConverterUrlForConversion(slug));
}
return;
}
const category = categoryMap.get(seoConversion.categoryId);
const from = category ? getUnit(category, seoConversion.fromUnitId) : null;
const to = category ? getUnit(category, seoConversion.toUnitId) : null;
if (!category || !from || !to) {
const slug = container.dataset.slug || location.pathname.split("/").filter(Boolean).pop();
if (typeof mainConverterUrlForConversion === "function") {
window.location.replace(mainConverterUrlForConversion(slug));
}
return;
}
window.__seoConversion = seoConversion;
const target = container.closest(".tool-section") || container.closest(".seo-converter-column") || container;
target.outerHTML = renderSeoConverterShell();
}
function initCalculators() {
if (!document.getElementById("currencyTool")) return;
initCurrencyTool();
bindCalc(["percentValue", "percentBase"], updatePercentage);
bindCalc(["bmiWeight", "bmiHeight"], updateBmi);
bindCalc(["birthDate"], updateAge);
bindCalc(["dateStart", "dateOffset"], updateDateCalc);
bindCalc(["loanAmount", "loanRate", "loanYears"], updateMortgage);
bindCalc(["tripDistance", "fuelEfficiency", "fuelPrice"], updateFuelCost);
bindCalc(["seedArea", "seedRate", "seedLoss", "fertArea", "fertRate", "fertBags", "yieldMass", "yieldArea", "yieldPrice", "irrigationArea", "irrigationDepth", "irrigationEfficiency"], updateAgricultureTools);
initAgriTabs();
renderBlog();
setDefaultDates();
updatePercentage();
updateBmi();
updateAge();
updateDateCalc();
updateMortgage();
updateFuelCost();
updateAgricultureTools();
}
function bindCalc(ids, callback) {
ids.forEach((id) => {
const input = byId(id);
if (input) {
input.addEventListener("input", () => {
callback();
trackEvent("calculator_used", { calculator: calculatorForInput(id), control: id });
});
}
});
}
function calculatorForInput(id) {
if (id.startsWith("percent")) return "percentage";
if (id.startsWith("bmi")) return "bmi";
if (id.startsWith("birth")) return "age";
if (id.startsWith("date")) return "date";
if (id.startsWith("loan")) return "mortgage";
if (id.startsWith("trip") || id.startsWith("fuel")) return "fuel_cost";
if (id.startsWith("seed")) return "seed_rate";
if (id.startsWith("fert")) return "fertilizer";
if (id.startsWith("yield")) return "yield";
if (id.startsWith("irrigation")) return "irrigation";
return "calculator";
}
function initCurrencyTool() {
const from = byId("currencyFrom");
const to = byId("currencyTo");
const codes = Object.keys(currencyFallbackRates);
from.innerHTML = codes.map((code) => `<option value="${code}">${code}</option>`).join("");
to.innerHTML = from.innerHTML;
from.value = "USD";
to.value = "EUR";
["currencyAmount", "currencyFrom", "currencyTo"].forEach((id) => byId(id).addEventListener("input", () => {
updateCurrency();
trackEvent("calculator_used", { calculator: "currency", control: id });
}));
byId("currencyFrom").addEventListener("change", () => {
updateCurrency();
trackEvent("calculator_used", { calculator: "currency", control: "currencyFrom" });
});
byId("currencyTo").addEventListener("change", () => {
updateCurrency();
trackEvent("calculator_used", { calculator: "currency", control: "currencyTo" });
});
byId("currencyRefresh").addEventListener("click", refreshCurrencyRates);
updateCurrency();
}
function updateCurrency() {
const amount = parseInput(byId("currencyAmount").value);
const from = byId("currencyFrom").value;
const to = byId("currencyTo").value;
const result = amount * currencyFallbackRates[from] / currencyFallbackRates[to];
byId("currencyResult").textContent = `${formatNumber(amount)} ${from} = ${formatNumber(result)} ${to}`;
}
async function refreshCurrencyRates() {
const endpoint = byId("currencyApi").value.trim();
const result = byId("currencyResult");
if (!endpoint) {
result.textContent = "Add an API endpoint or use offline fallback rates.";
return;
}
try {
const base = byId("currencyFrom").value;
const response = await fetch(endpoint.replace("{base}", encodeURIComponent(base)));
const data = await response.json();
if (!data || !data.rates) throw new Error("Missing rates");
Object.keys(data.rates).forEach((code) => {
if (currencyFallbackRates[code]) currencyFallbackRates[code] = currencyFallbackRates[base] / Number(data.rates[code]);
});
updateCurrency();
trackEvent("currency_refresh", { base });
} catch (error) {
result.textContent = "Could not load live rates. Offline fallback remains active.";
}
}
function updatePercentage() {
const value = parseInput(byId("percentValue").value);
const base = parseInput(byId("percentBase").value);
byId("percentageResult").textContent = `${formatNumber(base * value / 100)} result`;
}
function updateBmi() {
const weight = parseInput(byId("bmiWeight").value);
const heightCm = parseInput(byId("bmiHeight").value);
const bmi = weight / Math.pow(heightCm / 100, 2);
const label = bmi < 18.5 ? "Underweight" : bmi < 25 ? "Normal" : bmi < 30 ? "Overweight" : "Obesity range";
byId("bmiResult").textContent = Number.isFinite(bmi) ? `BMI ${formatNumber(bmi)} - ${label}` : "Enter weight and height";
}
function updateAge() {
const value = byId("birthDate").value;
if (!value) {
byId("ageResult").textContent = "Choose a date";
return;
}
const birth = new Date(`${value}T00:00:00`);
const today = new Date();
let years = today.getFullYear() - birth.getFullYear();
const beforeBirthday = today.getMonth() < birth.getMonth() || (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate());
if (beforeBirthday) years -= 1;
const days = Math.floor((today - birth) / 86400000);
byId("ageResult").textContent = `${years} years old, ${days.toLocaleString("en-US")} days`;
}
function updateDateCalc() {
const startValue = byId("dateStart").value;
const offset = Number(byId("dateOffset").value) || 0;
if (!startValue) {
byId("dateResult").textContent = "Choose a start date";
return;
}
const date = new Date(`${startValue}T00:00:00`);
date.setDate(date.getDate() + offset);
byId("dateResult").textContent = `${offset} days later: ${date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}`;
}
function updateMortgage() {
const principal = parseInput(byId("loanAmount").value);
const annualRate = parseInput(byId("loanRate").value) / 100;
const years = parseInput(byId("loanYears").value);
const months = years * 12;
const monthlyRate = annualRate / 12;
const payment = monthlyRate === 0 ? principal / months : principal * monthlyRate / (1 - Math.pow(1 + monthlyRate, -months));
byId("mortgageResult").textContent = Number.isFinite(payment) ? `${money(payment)} per month` : "Enter loan details";
}
function updateFuelCost() {
const distance = parseInput(byId("tripDistance").value);
const litersPer100 = parseInput(byId("fuelEfficiency").value);
const price = parseInput(byId("fuelPrice").value);
const cost = distance / 100 * litersPer100 * price;
byId("fuelCostResult").textContent = Number.isFinite(cost) ? `${money(cost)} estimated fuel cost` : "Enter trip details";
}
function initAgriTabs() {
const tabs = Array.from(document.querySelectorAll("[data-agri-tool]"));
function selectAgriTab(tab) {
tabs.forEach((item) => {
const isSelected = item === tab;
item.classList.toggle("active", isSelected);
item.setAttribute("aria-selected", isSelected ? "true" : "false");
item.setAttribute("tabindex", isSelected ? "0" : "-1");
});
document.querySelectorAll("[data-agri-panel]").forEach((item) => item.classList.remove("active"));
document.querySelector(`[data-agri-panel="${tab.dataset.agriTool}"]`).classList.add("active");
}
tabs.forEach((tab, index) => {
tab.addEventListener("click", () => selectAgriTab(tab));
tab.addEventListener("keydown", (event) => {
let newIndex = null;
switch (event.key) {
case "ArrowRight":
newIndex = (index + 1) % tabs.length;
break;
case "ArrowLeft":
newIndex = (index - 1 + tabs.length) % tabs.length;
break;
case "Home":
newIndex = 0;
break;
case "End":
newIndex = tabs.length - 1;
break;
default:
return;
}
event.preventDefault();
const newTab = tabs[newIndex];
selectAgriTab(newTab);
newTab.focus();
});
});
}
function updateAgricultureTools() {
const seed = parseInput(byId("seedArea").value) * parseInput(byId("seedRate").value) * (1 + parseInput(byId("seedLoss").value) / 100);
byId("seedResult").textContent = `${formatNumber(seed)} kg seed required`;
const fertKg = parseInput(byId("fertArea").value) * parseInput(byId("fertRate").value);
const bags = fertKg / parseInput(byId("fertBags").value);
byId("fertResult").textContent = `${formatNumber(fertKg)} kg, ${formatNumber(bags)} bags`;
const yieldRate = parseInput(byId("yieldMass").value) / parseInput(byId("yieldArea").value);
const revenue = parseInput(byId("yieldMass").value) * parseInput(byId("yieldPrice").value);
byId("yieldResult").textContent = `${formatNumber(yieldRate)} t/ha, ${money(revenue)} revenue`;
const irrigation = parseInput(byId("irrigationArea").value) * 10000 * parseInput(byId("irrigationDepth").value) / 1000 / (parseInput(byId("irrigationEfficiency").value) / 100);
byId("irrigationResult").textContent = `${formatNumber(irrigation)} m3 water required`;
}
function setDefaultDates() {
const today = new Date().toISOString().slice(0, 10);
if (byId("dateStart")) byId("dateStart").value = today;
}
function money(value) {
return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(value);
}
function renderBlog() {
const grid = byId("blogGrid");
if (!grid) return;
grid.innerHTML = blogPosts.map((post) => `
<article>
<span>${escapeHtml(post.tag)}</span>
<h3>${escapeHtml(post.title)}</h3>
<p>${escapeHtml(post.summary)}</p>
<a href="${escapeAttribute(post.href || "guides.html")}">Read guide</a>
</article>
`).join("");
}
function initNewsletter() {
const form = byId("newsletterForm");
if (!form) return;
form.addEventListener("submit", (event) => {
event.preventDefault();
const email = byId("newsletterEmail").value.trim();
if (!email) return;
const subscribers = readArray(storageKeys.newsletter);
subscribers.unshift({ email, date: new Date().toISOString() });
writeArray(storageKeys.newsletter, subscribers.slice(0, 100));
byId("newsletterStatus").textContent = "Thanks for subscribing! You're on the list.";
form.reset();
trackEvent("newsletter_signup", {});
});
}
function initAdmin() {
const form = byId("adminUnitForm");
if (!form) return;
const select = byId("adminCategory");
select.innerHTML = categories
.filter((category) => ["linear", "currency"].includes(category.type))
.map((category) => `<option value="${category.id}">${escapeHtml(category.name)}</option>`)
.join("");
const tableBody = byId("adminUnitTableBody");
const searchInput = byId("adminSearch");
const exportBtn = byId("adminExportBtn");
const importBtn = byId("adminImportBtn");
const importInput = byId("adminImportInput");
const clearBtn = byId("adminClearBtn");
const cancelEditBtn = byId("adminCancelEdit");
const statusEl = byId("adminFormStatus");
const submitBtn = form.querySelector('button[type="submit"]') || byId("adminSubmitBtn");
let editingId = null;

function setStatus(message) {
if (statusEl) statusEl.textContent = message || "";
}
function exitEditMode() {
editingId = null;
if (submitBtn) submitBtn.textContent = "Add unit";
if (cancelEditBtn) cancelEditBtn.hidden = true;
}

form.addEventListener("submit", (event) => {
event.preventDefault();
const categoryId = byId("adminCategory").value;
const name = byId("adminUnitName").value.trim();
const symbol = byId("adminUnitSymbol").value.trim();
const factor = Number(byId("adminUnitFactor").value);
const definition = byId("adminUnitDefinition").value.trim();
if (!name || !symbol || !Number.isFinite(factor) || factor <= 0) {
setStatus("Enter a unit name, symbol, and a positive conversion factor.");
return;
}
const custom = readArray(storageKeys.customUnits);
if (editingId) {
const index = custom.findIndex((item) => item.id === editingId);
if (index !== -1) {
custom[index] = { ...custom[index], categoryId, name, symbol, factor, definition };
}
writeArray(storageKeys.customUnits, custom);
setStatus(`Updated "${name}". Reload to refresh the converter lists.`);
trackEvent("admin_edit_unit", { category: categoryId });
exitEditMode();
} else {
custom.unshift({
categoryId,
id: `custom_${slug(name)}_${Date.now()}`,
name,
symbol,
factor,
definition
});
writeArray(storageKeys.customUnits, custom.slice(0, 100));
setStatus(`Added "${name}". Reload to include it in the converter lists.`);
trackEvent("admin_add_unit", { category: categoryId });
}
renderAdminList();
form.reset();
});

if (cancelEditBtn) {
cancelEditBtn.addEventListener("click", () => {
exitEditMode();
form.reset();
setStatus("");
});
}
if (searchInput) {
searchInput.addEventListener("input", () => renderAdminList());
}
if (exportBtn) {
exportBtn.addEventListener("click", () => {
const custom = readArray(storageKeys.customUnits);
const blob = new Blob([JSON.stringify(custom, null, 2)], { type: "application/json" });
const url = URL.createObjectURL(blob);
const link = document.createElement("a");
link.href = url;
link.download = "custom-units.json";
document.body.appendChild(link);
link.click();
link.remove();
URL.revokeObjectURL(url);
trackEvent("admin_export_units", { count: custom.length });
});
}
if (importBtn && importInput) {
importBtn.addEventListener("click", () => importInput.click());
importInput.addEventListener("change", () => {
const file = importInput.files && importInput.files[0];
if (!file) return;
const reader = new FileReader();
reader.onload = () => {
try {
const parsed = JSON.parse(String(reader.result));
if (!Array.isArray(parsed)) throw new Error("invalid");
const existing = readArray(storageKeys.customUnits);
const seen = new Set(existing.map((item) => item.id));
const additions = parsed.filter((item) => item && item.id && item.name && item.symbol && !seen.has(item.id));
const merged = existing.concat(additions).slice(0, 100);
writeArray(storageKeys.customUnits, merged);
renderAdminList();
setStatus(`Imported ${additions.length} custom unit${additions.length === 1 ? "" : "s"}.`);
trackEvent("admin_import_units", { count: additions.length });
} catch (error) {
setStatus("That file could not be read as custom-unit JSON.");
}
};
reader.readAsText(file);
importInput.value = "";
});
}
if (clearBtn) {
clearBtn.addEventListener("click", () => {
if (!window.confirm("Remove all custom units from this device? This cannot be undone.")) return;
writeArray(storageKeys.customUnits, []);
exitEditMode();
form.reset();
renderAdminList();
setStatus("All custom units cleared.");
trackEvent("admin_clear_units", {});
});
}
if (tableBody) {
tableBody.addEventListener("click", (event) => {
const editTarget = event.target.closest("[data-edit]");
const deleteTarget = event.target.closest("[data-delete]");
if (editTarget) {
const id = editTarget.getAttribute("data-edit");
const custom = readArray(storageKeys.customUnits);
const item = custom.find((entry) => entry.id === id);
if (!item) return;
byId("adminCategory").value = item.categoryId;
byId("adminUnitName").value = item.name;
byId("adminUnitSymbol").value = item.symbol;
byId("adminUnitFactor").value = item.factor;
byId("adminUnitDefinition").value = item.definition || "";
editingId = id;
if (submitBtn) submitBtn.textContent = "Update unit";
if (cancelEditBtn) cancelEditBtn.hidden = false;
setStatus(`Editing "${item.name}".`);
form.scrollIntoView({ behavior: "smooth", block: "start" });
} else if (deleteTarget) {
const id = deleteTarget.getAttribute("data-delete");
if (!window.confirm("Delete this custom unit?")) return;
const custom = readArray(storageKeys.customUnits).filter((entry) => entry.id !== id);
writeArray(storageKeys.customUnits, custom);
if (editingId === id) {
exitEditMode();
form.reset();
}
renderAdminList();
setStatus("Custom unit deleted.");
trackEvent("admin_delete_unit", {});
}
});
}
renderAdminList();
}
function renderAdminList() {
const tableBody = byId("adminUnitTableBody");
const emptyState = byId("adminEmptyState");
const searchInput = byId("adminSearch");
if (!tableBody) return;
const custom = readArray(storageKeys.customUnits);
const query = searchInput ? searchInput.value.trim().toLowerCase() : "";
const filtered = !query ? custom : custom.filter((item) => {
const category = categoryMap.get(item.categoryId);
const categoryName = category ? category.name : item.categoryId;
return [item.name, item.symbol, categoryName].some((value) => String(value || "").toLowerCase().includes(query));
});
if (!custom.length) {
tableBody.innerHTML = "";
if (emptyState) {
emptyState.hidden = false;
emptyState.textContent = "No custom units yet. Add one above and it will appear here.";
}
return;
}
if (!filtered.length) {
tableBody.innerHTML = "";
if (emptyState) {
emptyState.hidden = false;
emptyState.textContent = "No custom units match your search.";
}
return;
}
if (emptyState) emptyState.hidden = true;
tableBody.innerHTML = filtered.map((item) => {
const category = categoryMap.get(item.categoryId);
const categoryName = category ? category.name : item.categoryId;
return `
<tr>
<td data-label="Name"><strong>${escapeHtml(item.name)}</strong></td>
<td data-label="Category">${escapeHtml(categoryName)}</td>
<td data-label="Symbol">${escapeHtml(item.symbol)}</td>
<td data-label="Factor">${escapeHtml(item.factor)}</td>
<td data-label="Definition">${escapeHtml(item.definition || "\u2014")}</td>
<td data-label="Actions" class="admin-row-actions">
<button type="button" class="admin-edit-btn" data-edit="${escapeAttribute(item.id)}">Edit</button>
<button type="button" class="admin-delete-btn" data-delete="${escapeAttribute(item.id)}">Delete</button>
</td>
</tr>`;
}).join("");
}
function registerServiceWorker() {
if ("serviceWorker" in navigator && location.protocol !== "file:") {
const appScript = document.querySelector('script[src$="app.js"]');
const appUrl = appScript ? appScript.src : new URL("app.js", window.location.href).href;
const workerUrl = new URL("service-worker.js", appUrl).href;
navigator.serviceWorker.register(workerUrl).catch(() => {});
}
}
function trackEvent(name, payload) {
const data = payload || {};
window.dataLayer = window.dataLayer || [];
window.dataLayer.push({ event: name, payload: data, timestamp: new Date().toISOString() });
if (typeof window.gtag === "function" && window.UC_GA_READY) {
if (name === "page_view") {
window.gtag("event", "page_view", {
page_title: document.title,
page_location: window.location.href,
page_path: window.location.pathname
});
} else {
window.gtag("event", gaEventName(name), gaPayload(data));
}
}
const config = window.UC_ANALYTICS;
if (config && config.enabled && config.endpoint && navigator.sendBeacon) {
navigator.sendBeacon(config.endpoint, JSON.stringify({ event: name, payload: data }));
}
}
function gaEventName(name) {
const names = {
select_category: "select_category",
unit_change: "unit_change",
copy_result: "copy_result",
share_result: "share_result",
currency_refresh: "calculator_used",
newsletter_signup: "newsletter_signup",
admin_add_unit: "admin_add_unit",
admin_edit_unit: "admin_edit_unit",
admin_delete_unit: "admin_delete_unit",
admin_export_units: "admin_export_units",
admin_import_units: "admin_import_units",
admin_clear_units: "admin_clear_units",
swap_units: "swap_units"
};
return names[name] || name;
}
function gaPayload(payload) {
const result = {};
Object.entries(payload || {}).forEach(([key, value]) => {
if (value === undefined || value === null) return;
result[key] = typeof value === "number" || typeof value === "boolean" ? value : String(value).slice(0, 100);
});
return result;
}
function debugConversionRoute(eventName, payload) {
const data = payload || {};
if (window.console && typeof window.console.info === "function") {
window.console.info(`[Universal Converter] ${eventName}`, data);
}
}
function readArray(key) {
try {
const value = JSON.parse(localStorage.getItem(key) || "[]");
return Array.isArray(value) ? value : [];
} catch (error) {
return [];
}
}
function writeArray(key, value) {
localStorage.setItem(key, JSON.stringify(value));
}
function clampNumber(value, min, max) {
return Math.min(max, Math.max(min, value));
}
function slug(value) {
return String(value).toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
}
function escapeHtml(value) {
return String(value)
.replace(/&/g, "&amp;")
.replace(/</g, "&lt;")
.replace(/>/g, "&gt;")
.replace(/"/g, "&quot;")
.replace(/'/g, "&#039;");
}
function escapeAttribute(value) {
return escapeHtml(value).replace(/`/g, "&#096;");
}
function scrollToConverter() {
const converter = document.getElementById("converter");
if (converter) converter.scrollIntoView({ behavior: "smooth", block: "start" });
}
}());
