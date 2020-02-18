const cacheName = 'temporas';

self.addEventListener('push', function (e) {
  // const timeOfDay = e.data.text();
  // We can do e.data.json( )
  // console.log(e.data)
  // Here we use json just to show we can
  const timeOfDay = e.data.json().timeOfDay;

  var options = {
    body: `Time to take your ${timeOfDay} pill`,
    icon: '/images/icons/icon-512x512.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: '2'
    },
    actions: [
      {
        action: 'close',
        title: 'Close'
      }
    ]
  };
  e.waitUntil(
    self.registration.showNotification('Pill Time!', options)
  );
});

// Cache all the files to make a PWA
self.addEventListener('install', e => {
  console.log('installing')
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
