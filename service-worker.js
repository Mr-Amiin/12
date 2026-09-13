const CACHE_NAME = "universal-converter-v13";
const APP_SHELL = [
"/",
"/index.html",
"/styles.css",
"/app.js",
"/adsense-config.js",
"/adsense.js",
"/analytics-config.js",
"/google-analytics.js",
"/logo.svg",
"/favicon.svg",
"/site.webmanifest",
"/unit-converter.html",
"/online-calculator.html",
"/sitemap.html",
"/404.html",
"/offline.html",
"/guides.html",
"/metric-vs-imperial.html",
"/what-is-a-kilometer.html",
"/acre-vs-hectare.html",
"/celsius-vs-fahrenheit.html",
"/digital-storage-units-guide.html",
"/pressure-units-guide.html",
"/references.html",
"/about.html",
"/contact.html",
"/privacy.html",
"/terms.html",
"/meter-to-feet/",
"/meters-to-feet/",
"/feet-to-meters/",
"/miles-to-km/",
"/km-to-miles/",
"/inches-to-cm/",
"/kg-to-lbs/",
"/lbs-to-kg/",
"/grams-to-ounces/",
"/celsius-to-fahrenheit/",
"/fahrenheit-to-celsius/",
"/liter-to-gallon/",
"/liters-to-gallons/",
"/gallons-to-liters/",
"/acre-to-hectare/",
"/acres-to-hectares/",
"/hectares-to-acres/",
"/square-feet-to-square-meters/",
"/mph-to-kmh/",
"/psi-to-bar/",
"/gb-to-mb/",
"/watts-to-horsepower/"
];
self.addEventListener("install", (event) => {
event.waitUntil(
caches.open(CACHE_NAME)
.then((cache) => cache.addAll(APP_SHELL))
.then(() => self.skipWaiting())
.catch(() => self.skipWaiting())
);
});
self.addEventListener("activate", (event) => {
event.waitUntil(
caches.keys().then((keys) => {
return Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)));
}).then(() => self.clients.claim())
);
});
self.addEventListener("fetch", (event) => {
if (event.request.method !== "GET") return;
if (new URL(event.request.url).origin !== self.location.origin) return;
event.respondWith(
caches.match(event.request).then((cached) => {
if (cached) return cached;
return fetch(event.request).then((response) => {
const copy = response.clone();
caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
return response;
}).catch(() => {
if (event.request.mode === "navigate") {
return caches.match("/offline.html").then((offline) => offline || caches.match("/index.html"));
}
return caches.match("/index.html");
});
})
);
});
