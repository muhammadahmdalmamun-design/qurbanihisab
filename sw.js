// কুরবানীর হিসাব — অফলাইন সার্ভিস ওয়ার্কার
// অ্যাপ আপডেট করলে নিচের VERSION এর সংখ্যা বাড়িয়ে দিন, তাহলে ফোনে নতুন ফাইল আসবে।
const VERSION = "v1";
const CACHE = "qurbani-hisab-" + VERSION;
const FILES = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-maskable-512.png",
  "./icons/apple-touch-icon.png"
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith("qurbani-hisab-") && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET" || new URL(req.url).origin !== location.origin) return;
  // পেজ: আগে নেটওয়ার্ক (নতুন সংস্করণ), না পেলে ক্যাশ
  if (req.mode === "navigate") {
    e.respondWith(
      fetch(req).then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put("./index.html", copy));
        return res;
      }).catch(() => caches.match("./index.html"))
    );
    return;
  }
  // বাকি ফাইল: আগে ক্যাশ
  e.respondWith(caches.match(req).then((hit) => hit || fetch(req)));
});
