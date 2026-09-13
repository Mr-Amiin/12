(function () {
"use strict";
var config = window.UC_ADSENSE || {};
var publisherId = config.publisherId || (typeof ADSENSE_ID !== "undefined" ? ADSENSE_ID : "");
var enabled = Boolean(config.enabled || (typeof ADSENSE_ENABLED !== "undefined" && ADSENSE_ENABLED));
var placeholder = !publisherId || publisherId === "ca-pub-XXXXXXXXXXXX";
var slots = config.slots || {};
var metaName = "google-adsense-account";
var existingMeta = document.querySelectorAll('meta[name="' + metaName + '"]');
var CONSENT_KEY = "uc_cookie_consent";
if (existingMeta.length > 1) {
for (var i = 1; i < existingMeta.length; i += 1) {
existingMeta[i].parentNode.removeChild(existingMeta[i]);
}
}
if (!existingMeta.length && publisherId) {
var meta = document.createElement("meta");
meta.name = metaName;
meta.content = publisherId;
if (document.head) {
document.head.appendChild(meta);
} else if (document.documentElement) {
document.documentElement.insertBefore(meta, document.documentElement.firstChild);
}
} else if (existingMeta.length) {
existingMeta[0].content = publisherId;
}
document.querySelectorAll("[data-ad-placement]").forEach(function (slot) {
slot.classList.add("adsense-placeholder");
if (!slot.textContent.trim()) slot.textContent = "Advertisement";
});
function getConsent() {
try {
return window.localStorage.getItem(CONSENT_KEY);
} catch (e) {
return null;
}
}
function setConsent(value) {
try {
window.localStorage.setItem(CONSENT_KEY, value);
} catch (e) {
}
}
function activateAdvertisingScripts() {
document
.querySelectorAll('script[data-cookie-category="advertising"][data-src]')
.forEach(function (stub) {
if (stub.getAttribute("data-activated") === "true") return;
var real = document.createElement("script");
real.async = stub.hasAttribute("async");
real.setAttribute("crossorigin", "anonymous");
real.src = stub.getAttribute("data-src");
stub.setAttribute("data-activated", "true");
stub.parentNode.insertBefore(real, stub.nextSibling);
});
if (!document.querySelector('script[src*="pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"]')) {
var script = document.createElement("script");
script.async = true;
script.crossOrigin = "anonymous";
script.src = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=" + encodeURIComponent(publisherId);
document.head.appendChild(script);
}
}
function createResponsiveAd(adSlot) {
var ins = document.createElement("ins");
ins.className = "adsbygoogle";
ins.style.display = "block";
ins.setAttribute("data-ad-client", publisherId);
ins.setAttribute("data-ad-slot", adSlot || "REPLACE_WITH_SLOT_ID");
ins.setAttribute("data-ad-format", "auto");
ins.setAttribute("data-full-width-responsive", "true");
return ins;
}
function renderRealAds() {
document.querySelectorAll("[data-ad-placement]").forEach(function (slot) {
if (slot.getAttribute("data-adsbygoogle-processed") === "true") return;
var placement = slot.getAttribute("data-ad-placement");
var adSlot = slots[placement] || "REPLACE_WITH_SLOT_ID";
if (!enabled || placeholder || !publisherId || !adSlot || adSlot === "REPLACE_WITH_SLOT_ID") {
slot.setAttribute("data-ad-status", "placeholder");
return;
}
slot.innerHTML = "";
slot.appendChild(createResponsiveAd(adSlot));
var initScript = document.createElement("script");
initScript.textContent = "(adsbygoogle = window.adsbygoogle || []).push({});";
slot.appendChild(initScript);
slot.setAttribute("data-adsbygoogle-processed", "true");
});
}
function activateAdvertising() {
if (!enabled || placeholder) return;
activateAdvertisingScripts();
renderRealAds();
}
function activateAnalyticsIfConsented() {
if (typeof window.UC_activateAnalytics === "function") {
window.UC_activateAnalytics();
}
}
function onConsentGranted() {
activateAdvertising();
activateAnalyticsIfConsented();
}
function buildBanner() {
if (document.getElementById("ucCookieConsent")) return;
var banner = document.createElement("div");
banner.id = "ucCookieConsent";
banner.className = "uc-cookie-banner";
banner.setAttribute("role", "dialog");
banner.setAttribute("aria-live", "polite");
banner.setAttribute("aria-label", "Cookie notice");
var privacyHref = (function () {
var depth = (window.location.pathname.match(/\//g) || []).length - 1;
if (depth <= 0) return "privacy.html";
var prefix = "";
for (var d = 0; d < depth; d += 1) prefix += "../";
return prefix + "privacy.html";
})();
banner.innerHTML =
'<p class="uc-cookie-banner-text">We use cookies to improve your experience and to enable Google Analytics and Google AdSense. By continuing, you agree to our ' +
'<a href="' + privacyHref + '">Privacy Policy</a>.</p>' +
'<div class="uc-cookie-banner-actions">' +
'<button type="button" class="uc-cookie-decline" id="ucCookieDecline">Decline</button>' +
'<button type="button" class="uc-cookie-accept" id="ucCookieAccept">Accept</button>' +
"</div>";
document.body.appendChild(banner);
document.getElementById("ucCookieAccept").addEventListener("click", function () {
setConsent("accepted");
banner.parentNode.removeChild(banner);
onConsentGranted();
});
document.getElementById("ucCookieDecline").addEventListener("click", function () {
setConsent("declined");
banner.parentNode.removeChild(banner);
});
}
function initConsent() {
var consent = getConsent();
if (consent === "accepted") {
onConsentGranted();
return;
}
if (consent === "declined") {
return;
}
if (document.body) {
buildBanner();
} else {
document.addEventListener("DOMContentLoaded", buildBanner);
}
}
window.UC_openCookiePreferences = function () {
var existing = document.getElementById("ucCookieConsent");
if (existing) existing.parentNode.removeChild(existing);
buildBanner();
};
if (!enabled || placeholder) {
window.UC_openCookiePreferences = window.UC_openCookiePreferences || function () {};
} else {
initConsent();
}
})();
