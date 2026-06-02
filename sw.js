const CACHE_VERSION = "zyranex-offline-v6";
const APP_SHELL = [
    "./",
    "index.html",
    "articles/index.html",
    "articles/detail/index.html",
    "offline/index.html",
    "assets/css/styles.css?v=5",
    "assets/js/identity.js?v=1",
    "assets/js/script.js?v=5",
    "data/articles.json",
    "assets/images/brand/zyranex.webp",
    "assets/images/brand/zyranex-16x16.webp",
    "assets/images/brand/zyranex-32x32.webp",
    "assets/images/brand/zyranex-48x48.webp",
    "assets/images/brand/favicon.ico",
    "assets/images/brand/favicon-48x48.png",
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
                    .match(toScopeUrl("offline/index.html"), {
                        ignoreSearch: true,
                    })
                    .then((response) => response || Response.error()),
            ),
        );
        return;
    }

    if (!isSameOrigin(requestUrl)) return;

    if (requestUrl.pathname.endsWith("/data/articles.json")) {
        event.respondWith(
            fetch(request)
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
                .catch(() =>
                    caches
                        .match(request)
                        .then((response) => response || Response.error()),
                ),
        );
        return;
    }

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
