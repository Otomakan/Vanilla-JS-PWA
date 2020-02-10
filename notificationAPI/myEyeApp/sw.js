const cacheName = 'alligator-eyes';

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
			.then(cache => cache.match(event.request, {ignoreSearch: true}))
			.then(response => {
				return response || fetch(event.request);
			})
	);
});


self.addEventListener('notificationclick', function(event) {
	event.notification.close();
	if (event.action === 'archive') {
		silentlyArchiveEmail();
	} else {
		clients.openWindow('/inbox');
	}
}, false);