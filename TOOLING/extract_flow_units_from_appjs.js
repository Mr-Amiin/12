// Minimal DOM/browser stubs so app.js's top-level IIFE can execute in Node.
class FakeStorage {
  constructor(){ this.map = {}; }
  getItem(k){ return this.map.hasOwnProperty(k) ? this.map[k] : null; }
  setItem(k,v){ this.map[k] = String(v); }
  removeItem(k){ delete this.map[k]; }
}
global.localStorage = new FakeStorage();
global.navigator = { serviceWorker: undefined, sendBeacon: () => {} };
const noop = () => {};
const fakeEl = () => ({
  addEventListener: noop, removeEventListener: noop, classList: { add: noop, remove: noop, toggle: noop, contains: () => false },
  appendChild: noop, setAttribute: noop, getAttribute: () => null, style: {}, dataset: {}, children: [], value: '',
  querySelector: () => null, querySelectorAll: () => [], focus: noop, click: noop
});
global.document = {
  addEventListener: noop, removeEventListener: noop,
  body: fakeEl(),
  querySelector: () => null, querySelectorAll: () => [], getElementById: () => null,
  createElement: () => fakeEl(),
};
global.window = global;
global.location = { protocol: 'https:' };
global.addEventListener = noop;
global.removeEventListener = noop;
global.gtag = undefined;
global.UC_GA_READY = false;
global.UC_ANALYTICS = undefined;
global.requestAnimationFrame = (fn) => fn();

require('/home/claude/app_extract.js');

const categories = global.__ALL_CATEGORIES__;
const flow = categories.find(c => c.id === 'flow');
console.log(JSON.stringify({
  id: flow.id,
  label: flow.label,
  unitCount: flow.units.length,
  units: flow.units
}));
