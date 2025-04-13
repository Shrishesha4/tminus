// Firebase background worker for authentication persistence
self.addEventListener('install', (event) => {
  console.log('Service Worker installing');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker activating');
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Simple pass-through fetch handler
  if (event.request.method !== 'GET') return;
  
  // Add cache control for auth-related requests
  if (event.request.url.includes('auth') || 
      event.request.url.includes('token') || 
      event.request.url.includes('firebase')) {
    event.respondWith(
      fetch(event.request).then(response => {
        // Clone the response so we can return one and modify the other
        const responseToCache = response.clone();
        
        // Return the original response
        return response;
      }).catch(() => {
        // If fetch fails, try to return from cache
        return caches.match(event.request);
      })
    );
  } else {
    // For non-auth requests, just fetch normally
    event.respondWith(fetch(event.request));
  }
});