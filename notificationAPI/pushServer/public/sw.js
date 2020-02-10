const cacheName = 'alligator-eyes';


// Cache all the files
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(cacheName).then(cache => {
      return cache.addAll([
        './',
        './index.html',
        './styles.css',
        './main.js',
        './manifest.json'
      ]);
    })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
  console.log('run script');
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.open(cacheName)
      .then(cache => cache.match(event.request, { ignoreSearch: true }))
      .then(response => {
        return response || fetch(event.request);
      })
  );
});


self.addEventListener('push', function (e) {
  var options = {
    body: 'This notification was generated from a push!',
    icon: 'https://picsum.photos/300/200',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: '2'
    },
    actions: [
      {
        action: 'explore',
        title: 'Explore this new world',
        icon: 'images/checkmark.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: 'images/xmark.png'
      }
    ]
  };
  e.waitUntil(
    self.registration.showNotification('Hello world!', options)
  );
});
