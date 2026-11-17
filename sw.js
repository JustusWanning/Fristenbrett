// Offline: Seite aus dem Netz laden, wenn möglich; sonst die zuletzt gespeicherte Kopie.
// kalender.ics gibt es nicht auf dem Server: Die App legt die Datei im Gerät ab, und dieser Worker liefert sie aus.
const CACHE = "fristenbrett-v3";
const ICS = "fristenbrett-ics";
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(["./", "manifest.webmanifest", "icon-180.png"])).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE && k !== ICS).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  if (new URL(e.request.url).pathname.endsWith("/kalender.ics")) {
    e.respondWith(caches.open(ICS).then(c => c.match(e.request, { ignoreSearch: true }))
      .then(r => r || new Response("Keine Kalenderdatei vorhanden. Schließe die App und öffne sie neu.", { status: 404, headers: { "Content-Type": "text/plain; charset=utf-8" } })));
    return;
  }
  e.respondWith(fetch(e.request).then(r => { const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)).catch(() => {}); return r; })
    .catch(() => caches.match(e.request, { ignoreSearch: true }).then(r => r || caches.match("./"))));
});
