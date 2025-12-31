self.addEventListener('install', event => {
  /* Runs once when the service worker is installed */

  event.waitUntil(
    caches.open('flappy-bird-cache').then(cache => {
      /* Create (or open) a cache to store app files */

      return cache.addAll([
        'index.html',        /* Main HTML file */
        'style.css',         /* Styling */
        'game.js',           /* Game logic */
        'manifest.json',     /* PWA configuration */
        'icon.png'           /* App icon */
      ]);
    })
  );
});


self.addEventListener('fetch', event => {
  /* Runs every time the app requests a file */

  event.respondWith(
    caches.match(event.request).then(response => {
      /* If the file exists in cache, use it */
      /* Otherwise, fetch it from the network */

      return response || fetch(event.request);
    })
  );
});

