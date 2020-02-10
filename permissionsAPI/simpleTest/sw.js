console.log(self)

var CACHE_NAME = 'dependencies-cache';

// Files required to make this app work offline
var REQUIRED_FILES = [
  "/",
  "index.html"
]


self.addEventListener('install', function(event) {
  // Perform install step:  loading each required file into cache
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        // Add all offline dependencies to the cache
        return cache.addAll(REQUIRED_FILES);
      })
      .then(function() {
      	// At this point everything has been cached
        return self.skipWaiting();
      })
  );
});
console.log(self)

self.navigator.permissions.query({name:'notifications'}).then( permissionStatus => {
  console.log('hey')
  switch (permissionStatus.state) {
    case 'granted':
      console.log('granted');
      break;  
    case 'prompt':
      console.log('prompted');
      Notification.requestPermission(function(status) {
        console.log('Notification permission status:', status);
      });
      break;
    default:
      console.log('denied');
      
      break;
  }
}).catch(e=>{console.log(e)});

self.addEventListener('fetch', function(event) {
  console.log(event.request.url);
});