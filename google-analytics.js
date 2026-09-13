(function () {
"use strict";
var config = window.UC_GOOGLE_ANALYTICS || {};
var measurementId = config.measurementId || "";
var isPlaceholder = !measurementId || measurementId === "GA_MEASUREMENT_ID";
var CONSENT_KEY = "uc_cookie_consent";
window.dataLayer = window.dataLayer || [];
window.gtag = window.gtag || function () {
window.dataLayer.push(arguments);
};
function hasConsent() {
try {
return window.localStorage.getItem(CONSENT_KEY) === "accepted";
} catch (e) {
return false;
}
}
function load() {
if (!config.enabled || isPlaceholder) {
window.UC_GA_READY = false;
return;
}
var script = document.createElement("script");
script.async = true;
script.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(measurementId);
document.head.appendChild(script);
window.gtag("js", new Date());
window.gtag("config", measurementId, {
send_page_view: false,
anonymize_ip: config.anonymizeIp !== false
});
window.UC_GA_READY = true;
}
window.UC_activateAnalytics = load;
if (isPlaceholder || !config.enabled) {
window.UC_GA_READY = false;
return;
}
if (hasConsent()) {
load();
}
})();
