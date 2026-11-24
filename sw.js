// Service worker: lets the Structure Labeler open offline after one online visit.
// Network-first for the app's own files (so updates arrive whenever you're online),
// falling back to the cached copy when the network is unavailable. Everything else
// (manifest.json probe, audio, saves) passes straight through untouched.
const CACHE = "structure-labeler-v1";
const SHELL = ["./", "index.html", "manifest.webmanifest", "icon-192.png", "icon-512.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

function isShell(url){
  if(url.origin !== self.location.origin) return false;
  const scope = new URL(self.registration.scope);
  if(!url.pathname.startsWith(scope.pathname)) return false;
  const rel = url.pathname.slice(scope.pathname.length);
  return rel === "" || SHELL.includes(rel);
}

self.addEventListener("fetch", e => {
  const req = e.request;
  if(req.method !== "GET") return;
  const url = new URL(req.url);
  if(!(req.mode === "navigate" || isShell(url))) return;
  const key = req.mode === "navigate" ? "./" : req;
  e.respondWith((async () => {
    const cache = await caches.open(CACHE);
    try {
      // Give the network a few seconds; a dead or captive connection falls back to the cache.
      const res = await Promise.race([
        fetch(req, {cache: "no-cache"}),
        new Promise((_, rej) => setTimeout(() => rej(new Error("timeout")), 4000)),
      ]);
      if(res.ok) cache.put(key, res.clone());
      return res;
    } catch(err){
      const hit = await cache.match(key, {ignoreSearch: true});
      if(hit) return hit;
      throw err;
    }
  })());
});
