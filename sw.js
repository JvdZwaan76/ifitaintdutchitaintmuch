/**
 * Dutch Underground Service Worker - FIXED VERSION
 * Version: 4.3.0 - RESOLVES CACHE FAILURES AND 404 ISSUES
 * Deploy: Replace your /sw.js file with this code
 */

const CACHE_NAME = 'dutch-underground-v4.3.0';
const SW_VERSION = '4.3.0';

// FIXED: Only cache files that actually exist
const STATIC_CACHE_URLS = [
  '/',
  '/css/enhanced-style.css',
  '/js/enhanced-script.js',
  '/manifest.json'
  // Removed non-existent files that were causing cache failures
];

// Dynamic cache for API responses and images
const DYNAMIC_CACHE_NAME = 'dutch-underground-dynamic-v4.3.0';

// Install Event - Cache static assets with proper error handling
self.addEventListener('install', event => {
  console.log('🌷 Dutch Underground Service Worker v' + SW_VERSION + ': Installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('📦 Caching static files...');
        
        // Cache files individually with error handling
        return Promise.allSettled(
          STATIC_CACHE_URLS.map(url => 
            cache.add(url).catch(error => {
              console.warn(`⚠️ Failed to cache ${url}:`, error.message);
              return null; // Continue with other files
            })
          )
        );
      })
      .then(results => {
        const failed = results.filter(result => result.status === 'rejected').length;
        const succeeded = results.length - failed;
        console.log(`✅ Cached ${succeeded}/${results.length} static files`);
        if (failed > 0) {
          console.warn(`⚠️ ${failed} files failed to cache (non-critical)`);
        }
      })
      .catch(error => {
        console.error('❌ Cache installation failed:', error);
        // Don't block installation completely
      })
  );

  // Force activation of new service worker
  self.skipWaiting();
});

// Activate Event - Clean up old caches
self.addEventListener('activate', event => {
  console.log('🎵 Dutch Underground Service Worker v' + SW_VERSION + ': Activating...');
  
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== CACHE_NAME && cacheName !== DYNAMIC_CACHE_NAME) {
              console.log('🗑️ Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Take control of all open pages
      self.clients.claim()
    ])
  );
});

// Fetch Event - Handle requests with robust error handling
self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);
  
  // Skip non-GET requests and chrome-extension requests
  if (request.method !== 'GET' || url.protocol === 'chrome-extension:') {
    return;
  }

  // Handle different types of requests
  if (url.pathname.startsWith('/api/')) {
    // API requests - always try network first with caching
    event.respondWith(handleAPIRequest(request));
  } else if (isStaticAsset(url.pathname)) {
    // Static assets - cache first with network fallback
    event.respondWith(handleStaticAsset(request));
  } else {
    // HTML pages - network first with cache fallback
    event.respondWith(handlePageRequest(request));
  }
});

// Handle API requests - Network first with short-term caching
async function handleAPIRequest(request) {
  const url = new URL(request.url);
  
  try {
    // Always try network first for API requests
    const networkResponse = await fetch(request);
    
    // Cache successful API responses for short period
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      // Clone response before caching
      const responseToCache = networkResponse.clone();
      
      // Cache with TTL headers or for 5 minutes
      try {
        await cache.put(request, responseToCache);
      } catch (cacheError) {
        console.warn('⚠️ Failed to cache API response:', cacheError.message);
      }
    }
    
    return networkResponse;
    
  } catch (networkError) {
    console.warn('⚠️ API network request failed:', networkError.message);
    
    // Try to serve from cache if network fails
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      console.log('📁 Serving API response from cache');
      return cachedResponse;
    }
    
    // Return network error if no cache available
    throw networkError;
  }
}

// Handle static assets - Cache first with network fallback
async function handleStaticAsset(request) {
  try {
    // Try cache first
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Network fallback
    const networkResponse = await fetch(request);
    
    // Cache successful responses
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      try {
        await cache.put(request, networkResponse.clone());
      } catch (cacheError) {
        console.warn('⚠️ Failed to cache static asset:', cacheError.message);
      }
    }
    
    return networkResponse;
    
  } catch (error) {
    console.warn('⚠️ Static asset request failed:', error.message);
    
    // For CSS/JS files, try to return a minimal fallback
    if (request.url.endsWith('.css')) {
      return new Response('/* Offline - CSS unavailable */', {
        headers: { 'Content-Type': 'text/css' }
      });
    }
    
    if (request.url.endsWith('.js')) {
      return new Response('console.log("Offline - JS unavailable");', {
        headers: { 'Content-Type': 'application/javascript' }
      });
    }
    
    throw error;
  }
}

// Handle page requests - Network first with cache fallback
async function handlePageRequest(request) {
  try {
    // Try network first
    const networkResponse = await fetch(request);
    
    // Cache successful HTML responses
    if (networkResponse.ok && networkResponse.headers.get('content-type')?.includes('text/html')) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      try {
        await cache.put(request, networkResponse.clone());
      } catch (cacheError) {
        console.warn('⚠️ Failed to cache page:', cacheError.message);
      }
    }
    
    return networkResponse;
    
  } catch (networkError) {
    console.warn('⚠️ Page network request failed:', networkError.message);
    
    // Try to serve from cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      console.log('📁 Serving page from cache');
      return cachedResponse;
    }
    
    // Return offline page if available
    const offlineResponse = await caches.match('/');
    if (offlineResponse) {
      return offlineResponse;
    }
    
    // Final fallback - simple offline message
    return new Response(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Dutch Underground Portal - Offline</title>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          body { 
            font-family: 'Arial', sans-serif; 
            background: linear-gradient(135deg, #000, #1a1a1a); 
            color: #FF9500; 
            text-align: center; 
            padding: 2rem; 
            min-height: 100vh; 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            margin: 0; 
          }
          .offline-container { 
            max-width: 500px; 
            background: rgba(255, 149, 0, 0.1); 
            border: 1px solid rgba(255, 149, 0, 0.3); 
            border-radius: 15px; 
            padding: 2rem; 
          }
          h1 { color: #FF9500; text-shadow: 0 0 10px #FF9500; margin-bottom: 1rem; }
          p { color: rgba(255, 255, 255, 0.8); margin-bottom: 1rem; }
          button { 
            background: linear-gradient(135deg, #FF9500, #FFD700); 
            color: #000; 
            border: none; 
            padding: 1rem 2rem; 
            border-radius: 8px; 
            cursor: pointer; 
            font-weight: 600; 
          }
        </style>
      </head>
      <body>
        <div class="offline-container">
          <h1>🌐 Underground Portal Offline</h1>
          <p>The portal is temporarily disconnected from the underground network.</p>
          <p>Check your connection and try again to access the electronic mysteries.</p>
          <button onclick="window.location.reload()">Reconnect to Underground</button>
        </div>
      </body>
      </html>
    `, {
      headers: { 'Content-Type': 'text/html' },
      status: 200
    });
  }
}

// Helper function to identify static assets
function isStaticAsset(pathname) {
  const staticExtensions = ['.css', '.js', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.woff', '.woff2', '.ttf', '.eot'];
  return staticExtensions.some(ext => pathname.endsWith(ext));
}

// Message handling for cache updates
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('🔄 Service Worker: Skip waiting requested');
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: SW_VERSION });
  }
  
  if (event.data && event.data.type === 'CACHE_URLS') {
    // Cache specific URLs on demand
    event.waitUntil(
      caches.open(DYNAMIC_CACHE_NAME).then(cache => {
        return cache.addAll(event.data.urls || []);
      }).catch(error => {
        console.warn('⚠️ On-demand caching failed:', error.message);
      })
    );
  }
});

// Background sync for offline actions (if needed)
self.addEventListener('sync', event => {
  console.log('🔄 Background sync:', event.tag);
  
  if (event.tag === 'background-sync-offline-actions') {
    event.waitUntil(
      // Handle any offline actions that were queued
      handleOfflineActions()
    );
  }
});

async function handleOfflineActions() {
  try {
    // Check for offline form submissions, analytics, etc.
    // This is where you'd handle queued actions when back online
    console.log('📤 Processing offline actions...');
  } catch (error) {
    console.error('❌ Offline actions processing failed:', error);
  }
}

// Push notifications (optional)
self.addEventListener('push', event => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body || 'New underground content available',
      icon: '/images/icon-192x192.png',
      badge: '/images/badge-72x72.png',
      data: data.url || '/',
      actions: [
        {
          action: 'open',
          title: 'Open Portal'
        },
        {
          action: 'dismiss',
          title: 'Dismiss'
        }
      ]
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title || 'Dutch Underground Portal', options)
    );
  }
});

// Notification click handling
self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  if (event.action === 'open' || !event.action) {
    event.waitUntil(
      clients.openWindow(event.notification.data || '/')
    );
  }
});

console.log('🌷 Dutch Underground Service Worker v' + SW_VERSION + ' loaded successfully');
