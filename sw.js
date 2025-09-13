/**
 * Production Service Worker for If It Ain't Dutch, It Ain't Much
 * Optimized for performance, offline support, and Cloudflare integration
 * Version: 4.0.0 - Production Ready
 */

const CACHE_NAME = 'dutch-underground-v4.0.0';
const STATIC_CACHE_NAME = 'dutch-static-v4.0.0';
const DYNAMIC_CACHE_NAME = 'dutch-dynamic-v4.0.0';
const API_CACHE_NAME = 'dutch-api-v4.0.0';

// Critical files to cache immediately
const STATIC_FILES = [
  '/',
  '/css/enhanced-style.css',
  '/js/enhanced-script.js',
  '/manifest.json',
  '/offline.html',
  '/images/icon-192x192.png',
  '/images/icon-512x512.png',
  '/images/favicon-32x32.png',
  '/images/apple-touch-icon.png',
  // Critical fonts
  'https://fonts.gstatic.com/s/orbitron/v31/yMJMMIlzdpvBhQQL_SC3X9yhF25-T1nyGy6BoWgz.woff2',
  'https://fonts.gstatic.com/s/rajdhani/v21/LDIxapCSOBg7S-QT7p4JMeJqU6kI.woff2',
  'https://fonts.gstatic.com/s/inter/v18/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7SUc.woff2'
];

// Runtime caching strategies
const CACHE_STRATEGIES = {
  images: {
    strategy: 'CacheFirst',
    maxEntries: 100,
    maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
  },
  api: {
    strategy: 'NetworkFirst', 
    maxEntries: 50,
    maxAgeSeconds: 5 * 60, // 5 minutes
  },
  pages: {
    strategy: 'StaleWhileRevalidate',
    maxEntries: 20,
    maxAgeSeconds: 24 * 60 * 60, // 24 hours
  },
  audio: {
    strategy: 'CacheFirst',
    maxEntries: 10,
    maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
  }
};

// Install event - cache critical resources
self.addEventListener('install', (event) => {
  console.log('🌷 Dutch Underground Service Worker v4.0.0: Installing...');
  
  event.waitUntil(
    Promise.all([
      // Cache static files
      caches.open(STATIC_CACHE_NAME).then((cache) => {
        console.log('📦 Caching static files...');
        return cache.addAll(STATIC_FILES).catch((error) => {
          console.warn('⚠️ Some static files failed to cache:', error);
          // Continue with partial cache rather than failing completely
          return Promise.resolve();
        });
      }),
      // Skip waiting to activate immediately
      self.skipWaiting()
    ])
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('🎵 Dutch Underground Service Worker v4.0.0: Activating...');
  
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => 
              cacheName !== STATIC_CACHE_NAME && 
              cacheName !== DYNAMIC_CACHE_NAME &&
              cacheName !== API_CACHE_NAME &&
              cacheName.startsWith('dutch-')
            )
            .map((cacheName) => {
              console.log('🧹 Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            })
        );
      }),
      // Claim all clients immediately
      self.clients.claim(),
      // Clean up old cached entries
      cleanupOldEntries()
    ])
  );
});

// Enhanced fetch event handler
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Skip chrome-extension and other non-http(s) requests
  if (!url.protocol.startsWith('http')) {
    return;
  }
  
  // Skip analytics and tracking requests
  if (isAnalyticsRequest(url)) {
    event.respondWith(handleAnalyticsRequest(request));
    return;
  }
  
  // Handle API requests with network-first strategy
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(request));
    return;
  }
  
  // Handle blog content with stale-while-revalidate
  if (url.pathname.startsWith('/ade-2025-guide') || url.pathname.startsWith('/blog/')) {
    event.respondWith(handleBlogRequest(request));
    return;
  }
  
  // Handle image requests with cache-first
  if (isImageRequest(url)) {
    event.respondWith(handleImageRequest(request));
    return;
  }
  
  // Handle font requests with cache-first (long-term)
  if (isFontRequest(url)) {
    event.respondWith(handleFontRequest(request));
    return;
  }
  
  // Handle audio/media requests
  if (isAudioRequest(url)) {
    event.respondWith(handleAudioRequest(request));
    return;
  }
  
  // Handle page requests with stale-while-revalidate
  if (isPageRequest(request)) {
    event.respondWith(handlePageRequest(request));
    return;
  }
  
  // Default: try network first, fallback to cache
  event.respondWith(
    fetch(request)
      .then(response => {
        // Cache successful responses
        if (response.status === 200) {
          cacheResponse(request, response.clone(), DYNAMIC_CACHE_NAME);
        }
        return response;
      })
      .catch(() => caches.match(request))
  );
});

// Enhanced request handlers

async function handleApiRequest(request) {
  const url = new URL(request.url);
  
  try {
    // Always try network first for API requests
    const response = await fetch(request);
    
    // Cache successful GET requests briefly
    if (response.status === 200 && request.method === 'GET') {
      const responseToCache = new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: {
          ...Object.fromEntries(response.headers),
          'sw-cached': Date.now().toString(),
          'cache-control': 'max-age=300' // 5 minutes
        }
      });
      
      cacheResponse(request, responseToCache.clone(), API_CACHE_NAME);
      return responseToCache;
    }
    
    return response;
  } catch (error) {
    // Network failed, try cache for GET requests
    if (request.method === 'GET') {
      const cachedResponse = await caches.match(request);
      if (cachedResponse) {
        // Check if cached response is still fresh
        const cachedTime = cachedResponse.headers.get('sw-cached');
        const now = Date.now();
        const fiveMinutes = 5 * 60 * 1000;
        
        if (cachedTime && (now - parseInt(cachedTime)) < fiveMinutes) {
          return cachedResponse;
        }
      }
    }
    
    // Return offline API response
    return new Response(JSON.stringify({
      error: 'Offline',
      message: 'API request failed - device is offline',
      cached: false,
      timestamp: new Date().toISOString()
    }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

async function handleBlogRequest(request) {
  const url = new URL(request.url);
  
  try {
    // Stale-while-revalidate strategy
    const cachedResponse = await caches.match(request);
    const networkPromise = fetch(request);
    
    // Return cached version immediately if available
    if (cachedResponse) {
      // Update cache in background
      networkPromise
        .then(response => {
          if (response.status === 200) {
            cacheResponse(request, response, DYNAMIC_CACHE_NAME);
          }
        })
        .catch(() => {}); // Ignore background update errors
      
      return cachedResponse;
    }
    
    // No cache, wait for network
    const response = await networkPromise;
    if (response.status === 200) {
      cacheResponse(request, response.clone(), DYNAMIC_CACHE_NAME);
    }
    return response;
    
  } catch (error) {
    // Network failed, return cached version or offline page
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    return caches.match('/offline.html') || new Response('Offline - Content not available', {
      status: 503,
      statusText: 'Service Unavailable',
      headers: { 'Content-Type': 'text/plain' }
    });
  }
}

async function handleImageRequest(request) {
  try {
    // Check cache first for images
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Try network
    const response = await fetch(request);
    
    // Cache successful responses
    if (response.status === 200) {
      // Only cache images up to 2MB
      const contentLength = response.headers.get('content-length');
      if (!contentLength || parseInt(contentLength) < 2 * 1024 * 1024) {
        cacheResponse(request, response.clone(), DYNAMIC_CACHE_NAME);
      }
    }
    
    return response;
  } catch (error) {
    // Return placeholder or cached version
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Generate SVG placeholder
    const svgPlaceholder = `
      <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="offline-title">
        <title id="offline-title">Image offline</title>
        <rect width="400" height="300" fill="#FF9500" opacity="0.1"/>
        <text x="200" y="140" text-anchor="middle" fill="#FF9500" font-family="Arial" font-size="16">
          🌷 Dutch Underground
        </text>
        <text x="200" y="165" text-anchor="middle" fill="#FF9500" font-family="Arial" font-size="14">
          Image offline
        </text>
      </svg>
    `;
    
    return new Response(svgPlaceholder, {
      headers: { 'Content-Type': 'image/svg+xml' }
    });
  }
}

async function handleFontRequest(request) {
  try {
    // Check cache first for fonts (long-term caching)
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Try network
    const response = await fetch(request);
    
    // Cache successful font responses for a long time
    if (response.status === 200) {
      const responseToCache = new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: {
          ...Object.fromEntries(response.headers),
          'cache-control': 'max-age=31536000', // 1 year
          'sw-cached': Date.now().toString()
        }
      });
      
      cacheResponse(request, responseToCache.clone(), STATIC_CACHE_NAME);
      return responseToCache;
    }
    
    return response;
  } catch (error) {
    // Return cached font or let page use fallback fonts
    const cachedResponse = await caches.match(request);
    return cachedResponse || new Response('', { status: 404 });
  }
}

async function handleAudioRequest(request) {
  try {
    // Check cache first for audio
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Try network
    const response = await fetch(request);
    
    // Cache audio files (but not streaming audio)
    if (response.status === 200 && !request.url.includes('stream')) {
      const contentLength = response.headers.get('content-length');
      // Only cache audio files up to 10MB
      if (!contentLength || parseInt(contentLength) < 10 * 1024 * 1024) {
        cacheResponse(request, response.clone(), DYNAMIC_CACHE_NAME);
      }
    }
    
    return response;
  } catch (error) {
    // Return cached audio or error
    const cachedResponse = await caches.match(request);
    return cachedResponse || new Response('Audio offline', { status: 503 });
  }
}

async function handlePageRequest(request) {
  const url = new URL(request.url);
  
  try {
    // Try network first for pages
    const response = await fetch(request);
    
    // Cache successful HTML responses
    if (response.status === 200 && response.headers.get('content-type')?.includes('text/html')) {
      cacheResponse(request, response.clone(), DYNAMIC_CACHE_NAME);
    }
    
    return response;
  } catch (error) {
    // Network failed, try cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // For HTML requests, return offline page
    if (request.headers.get('accept')?.includes('text/html')) {
      return caches.match('/offline.html') || createOfflinePage();
    }
    
    // For other requests, return generic offline response
    return new Response('Offline - Content not available', {
      status: 503,
      statusText: 'Service Unavailable',
      headers: { 'Content-Type': 'text/plain' }
    });
  }
}

async function handleAnalyticsRequest(request) {
  try {
    // Try to send analytics request with short timeout
    const response = await fetch(request, { timeout: 1000 });
    return response;
  } catch (error) {
    // Fail silently for analytics
    return new Response('', { status: 200 });
  }
}

// Helper functions

function isPageRequest(request) {
  const accept = request.headers.get('accept') || '';
  return accept.includes('text/html');
}

function isImageRequest(url) {
  const pathname = url.pathname.toLowerCase();
  return /\.(jpg|jpeg|png|gif|webp|svg|ico|avif)$/i.test(pathname) ||
         url.pathname.includes('/images/');
}

function isFontRequest(url) {
  const pathname = url.pathname.toLowerCase();
  return /\.(woff|woff2|ttf|eot|otf)$/i.test(pathname) || 
         url.hostname === 'fonts.gstatic.com' ||
         url.pathname.includes('font');
}

function isAudioRequest(url) {
  const pathname = url.pathname.toLowerCase();
  return /\.(mp3|wav|ogg|m4a|aac|flac)$/i.test(pathname) ||
         url.hostname.includes('soundcloud') ||
         url.pathname.includes('audio');
}

function isAnalyticsRequest(url) {
  return url.hostname.includes('google-analytics.com') ||
         url.hostname.includes('googletagmanager.com') ||
         url.hostname.includes('analytics.google.com') ||
         url.hostname.includes('clarity.ms') ||
         url.pathname.includes('gtag') ||
         url.pathname.includes('analytics') ||
         url.pathname.includes('clarity');
}

// Utility functions

async function cacheResponse(request, response, cacheName) {
  try {
    const cache = await caches.open(cacheName);
    await cache.put(request, response);
  } catch (error) {
    console.warn('Failed to cache response:', error);
  }
}

async function cleanupOldEntries() {
  try {
    const cacheNames = [DYNAMIC_CACHE_NAME, API_CACHE_NAME];
    
    for (const cacheName of cacheNames) {
      const cache = await caches.open(cacheName);
      const requests = await cache.keys();
      
      const weekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
      
      for (const request of requests) {
        const response = await cache.match(request);
        if (response) {
          const cachedTime = response.headers.get('sw-cached');
          
          if (cachedTime && parseInt(cachedTime) < weekAgo) {
            await cache.delete(request);
            console.log('🧹 Cleaned old cache entry:', request.url);
          }
        }
      }
    }
  } catch (error) {
    console.warn('Cache cleanup failed:', error);
  }
}

function createOfflinePage() {
  const offlineHTML = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Offline | Dutch Underground Portal</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          background: linear-gradient(135deg, #000, #1a1a1a);
          color: #fff;
          text-align: center;
          padding: 50px 20px;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0;
        }
        .container {
          max-width: 600px;
        }
        h1 {
          color: #FF9500;
          font-size: 3rem;
          margin-bottom: 20px;
          text-shadow: 0 0 20px rgba(255, 149, 0, 0.5);
        }
        p {
          font-size: 1.2rem;
          margin-bottom: 30px;
          color: #ccc;
          line-height: 1.6;
        }
        .retry-btn {
          background: linear-gradient(135deg, #FF9500, #FFD700);
          color: #000;
          border: none;
          padding: 15px 30px;
          font-size: 1.1rem;
          border-radius: 8px;
          cursor: pointer;
          font-weight: bold;
          transition: transform 0.3s ease;
        }
        .retry-btn:hover {
          transform: translateY(-2px);
        }
        .offline-icon {
          font-size: 4rem;
          margin-bottom: 20px;
          opacity: 0.7;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="offline-icon">🌷</div>
        <h1>Underground Portal Offline</h1>
        <p>The electronic frequencies are currently unreachable. Check your connection and venture back into the underground realm.</p>
        <p><em>"In the darkness, bass still echoes..."</em></p>
        <button class="retry-btn" onclick="location.reload()">Reconnect to Underground</button>
      </div>
      <script>
        window.addEventListener('online', () => {
          location.reload();
        });
      </script>
    </body>
    </html>
  `;
  
  return new Response(offlineHTML, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' }
  });
}

// Background sync for offline form submissions
self.addEventListener('sync', (event) => {
  if (event.tag === 'access-request-sync') {
    event.waitUntil(syncAccessRequests());
  }
});

async function syncAccessRequests() {
  try {
    const cache = await caches.open(DYNAMIC_CACHE_NAME);
    const pendingRequests = await cache.match('pending-access-requests');
    
    if (pendingRequests) {
      const requests = await pendingRequests.json();
      
      for (const requestData of requests) {
        try {
          const response = await fetch('/api/access-request', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestData)
          });
          
          if (response.ok) {
            console.log('✅ Access request synced successfully');
          }
        } catch (error) {
          console.log('❌ Access request sync failed:', error);
          // Keep request for next sync attempt
          break;
        }
      }
      
      // Clear synced requests
      await cache.delete('pending-access-requests');
    }
  } catch (error) {
    console.log('🔄 Background sync failed:', error);
  }
}

// Push notification handling
self.addEventListener('push', (event) => {
  if (!event.data) return;
  
  let data;
  try {
    data = event.data.json();
  } catch (error) {
    data = { title: 'Dutch Underground Portal', body: event.data.text() };
  }
  
  const options = {
    body: data.body || 'New underground mysteries await...',
    icon: '/images/icon-192x192.png',
    badge: '/images/badge-72x72.png',
    image: data.image,
    data: data.url || '/',
    actions: [
      {
        action: 'open',
        title: 'Enter Portal',
        icon: '/images/action-open.png'
      },
      {
        action: 'close',
        title: 'Later',
        icon: '/images/action-close.png'
      }
    ],
    tag: 'dutch-underground-notification',
    renotify: true,
    requireInteraction: false,
    silent: false,
    vibrate: [200, 100, 200]
  };
  
  event.waitUntil(
    self.registration.showNotification(
      data.title || 'If It Ain\'t Dutch, It Ain\'t Much',
      options
    )
  );
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  const action = event.action;
  const data = event.notification.data;
  
  if (action === 'close') {
    return;
  }
  
  const urlToOpen = data || '/';
  
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Check if portal is already open
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            client.focus();
            if (urlToOpen !== '/') {
              client.navigate(urlToOpen);
            }
            return;
          }
        }
        
        // Open new window
        if (self.clients.openWindow) {
          return self.clients.openWindow(urlToOpen);
        }
      })
  );
});

// Message handling for client communication
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('🔄 Updating Dutch Underground Service Worker...');
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ 
      version: CACHE_NAME,
      features: ['offline_support', 'background_sync', 'push_notifications', 'performance_optimized']
    });
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );
      })
    );
  }
});

// Periodic background sync (where supported)
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'update-content') {
    event.waitUntil(updateCriticalContent());
  }
});

async function updateCriticalContent() {
  try {
    // Update critical pages in background
    const criticalPages = ['/', '/ade-2025-guide'];
    
    for (const page of criticalPages) {
      try {
        const response = await fetch(page);
        if (response.status === 200) {
          cacheResponse(page, response, DYNAMIC_CACHE_NAME);
          console.log('🔄 Updated cached page:', page);
        }
      } catch (error) {
        console.log('❌ Failed to update page:', page);
      }
    }
  } catch (error) {
    console.log('🔄 Background content update failed:', error);
  }
}

console.log('🌷 Dutch Underground Service Worker v4.0.0 loaded successfully');
