const CACHE_VERSION = "zyranex-offline-v2";
const APP_SHELL = [
    "./",
    "index.html",
    "offline.html",
    "styles.css",
    "script.js",
    "zyranex.webp",
    "zyranex-16x16.webp",
    "zyranex-32x32.webp",
    "zyranex-48x48.webp",
    "favicon.ico",
    "assets/images/spawn.webp",
];

const toScopeUrl = (path) => new URL(path, self.registration.scope).toString();
const isSameOrigin = (url) => url.origin === self.location.origin;

self.addEventListener("install", (event) => {
    event.waitUntil(
        caches
            .open(CACHE_VERSION)
            .then((cache) =>
                cache.addAll(APP_SHELL.map((path) => toScopeUrl(path))),
            )
            .then(() => self.skipWaiting()),
    );
});

self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches
            .keys()
            .then((keys) =>
                Promise.all(
                    keys
                        .filter((key) => key !== CACHE_VERSION)
                        .map((key) => caches.delete(key)),
                ),
            )
            .then(() => self.clients.claim()),
    );
});

self.addEventListener("fetch", (event) => {
    const { request } = event;

    if (request.method !== "GET") return;

    const requestUrl = new URL(request.url);

    if (request.mode === "navigate") {
        event.respondWith(
            fetch(request).catch(() =>
                caches
                    .match(toScopeUrl("offline.html"), {
                        ignoreSearch: true,
                    })
                    .then((response) => response || Response.error()),
            ),
        );
        return;
    }

    if (!isSameOrigin(requestUrl)) return;

    event.respondWith(
        caches.match(request).then((cachedResponse) => {
            if (cachedResponse) return cachedResponse;

            return fetch(request)
                .then((networkResponse) => {
                    if (!networkResponse || networkResponse.status !== 200) {
                        return networkResponse;
                    }

                    const responseClone = networkResponse.clone();
                    caches.open(CACHE_VERSION).then((cache) => {
                        cache.put(request, responseClone);
                    });

                    return networkResponse;
                })
                .catch(
                    () =>
                        new Response("", {
                            status: 504,
                            statusText: "Offline",
                        }),
                );
        }),
    );
});
