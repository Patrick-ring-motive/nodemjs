let isServiceWorker = false;
try{

isServiceWorker=!!ServiceWorkerGlobalScope;
  
}catch(e){

  isServiceWorker = false;
  
}

if(!isServiceWorker){
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js');
  }
}else{
// Core assets
const loose = { ignoreVary: true, ignoreMethod: false, ignoreSearch: false };
const looser = { ignoreVary: true, ignoreMethod: true, ignoreSearch: false };
const loosest = { ignoreVary: true, ignoreMethod: true, ignoreSearch: true };
let coreAssets = [];
const endings = ['.js', '.jsx', '.ts', '.tsx', '.css', '.scss', '.json', '.jpg', '.png', '.gif', '.webp', '.svg', '.ico', '.woff', '.woff2'];
function checkEndings(fileURL) {
  for (let i = 0; i < endings.length; i++) {

    if (fileURL.toLowerCase().split('?')[0].endsWith(endings[i])) {

      return true;

    }

  }
  return false;
}

/*
// The activate handler takes care of cleaning up old caches.
self.addEventListener('activate', event => {
  const currentCaches = [];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return cacheNames.filter(cacheName => !currentCaches.includes(cacheName));
    }).then(cachesToDelete => {
      return Promise.all(cachesToDelete.map(cacheToDelete => {
        return caches.delete(cacheToDelete);
      }));
    }).then(() => self.clients.claim())
  );
});

*/


// On install, cache core assets
self.addEventListener('install', function(event) {

  // Cache core assets
  event.waitUntil(caches.open('app').then(function(cache) {
    for (let asset of coreAssets) {
      cache.add(new Request(asset));
    }
    return cache;
  }));

});

// Listen for request events
self.addEventListener('fetch', function(event) {

  // Get the request
  let request = event.request;

  // Bug fix
  // https://stackoverflow.com/a/49719964
  if (event.request.cache === 'only-if-cached' && event.request.mode !== 'same-origin') return;
  if (!request.url.startsWith(self.location.origin)) return;
  if (request.url.indexOf('GoogleAnalytics') > -1) return;






  // Images
  // CSS & JavaScript
  // Offline-first
  if ((request.headers.get('accept').toLowerCase().indexOf('text/css') > -1) || (request.headers.get('Accept').toLowerCase().indexOf('javascript') > -1) || checkEndings(request.url)) {
    event.respondWith(
      caches.match(request).then(function(response) {
        return response || caches.match(request, loose).then(function(response) {
          return response || caches.match(request, looser).then(function(response) {
            return response || caches.match(request, loosest).then(function(response) {
              return response || fetch(request).then(function(response) {

                // Save a copy of it in cache
                let copy = response.clone();
                event.waitUntil(caches.open('app').then(function(cache) {
                  return cache.put(request, copy);
                }));
                // Return the response
                return response;

              });
            });
          });
        });
      })
    );
    return;
  }


  // HTML files
  // Network-first
  if (request.headers.get('Accept').indexOf('html') > -1) {
    event.respondWith(
      fetch(request).then(function(response) {

        // Create a copy of the response and save it to the cache
        let copy = response.clone();
        event.waitUntil(caches.open('app').then(function(cache) {
          return cache.put(request, copy);
        }));

        // Return the response
        return response;

      }).catch(function(error) {

        // If there's no item in cache, respond with a fallback
        return caches.match(request).then(function(response) {
          return response || caches.match(request, loose).then(function(response) {
            return response || caches.match(request, looser).then(function(response) {
              return response || caches.match(request, loosest).then(function(response) {
                return response || caches.match('/offline.html');

              });
            });
          });
        });

      })
    );
  }


});
}