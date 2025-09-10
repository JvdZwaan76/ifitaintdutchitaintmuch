/**
 * Service Worker for If It Ain't Dutch, It Ain't Much
 * Enables Progressive Web App functionality, offline support, and caching
 */

const CACHE_NAME = 'dutch-mystery-v1.2.0';
const STATIC_CACHE_NAME = 'dutch-static-v1.2.0';
const DYNAMIC_CACHE_NAME = 'dutch-dynamic-v1.2.0';

// Files to cache immediately (critical resources)
const STATIC_FILES = [
  '/',
  '/css/enhanced-style.css',
  '/js/enhanced-script.js',
  '/manifest.json',
  '/404.html',
  '/offline.html',
  '/images/icon-192x192.png',
  '/images/icon-512x512.png',
  '/images/favicon-32x32.png',
  '/images/apple-touch-icon.png',
  // Add critical images
  '/images/og-dutch-mystery.jpg',
  '/images/logo-dutch-mystery.png',
  // Fonts (add actual font files)
  'https://fonts.gstatic.com/s/orbitron/v31/yMJMMIlzdpvBhQQL_SC3X9yhF25-T1nyGy6BoWgz.woff2',
  'https://fonts.gstatic.com/s/rajdhani/v21/LDIxapCSOBg7S-QT7p4JMeJqU6kI.woff2',
  'https://fonts.gstatic.com/s/inter/v18/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7SUc.woff2'
];

// Runtime caching strategies for different content types
const RUNTIME_CACHING = {
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
  analytics: {
    strategy: 'NetworkOnly',
  }
};

// Install event - cache critical resources
self.addEventListener('install', (event) => {
  console.log('🌷 Dutch Mystery Service Worker: Installing...');
  console.log('📁 Attempting to cache these critical files:', STATIC_FILES);
  console.log('📁 Optional files (won\'t fail if missing):', OPTIONAL_FILES);
  
  event.waitUntil(
    Promise.all([
      // Cache static files
      caches.open(STATIC_CACHE_NAME).then((cache) => {
        return cache.addAll(STATIC_FILES);
      }),
      // Skip waiting to activate immediately
      self.skipWaiting()
    ])
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('🎵 Dutch Mystery Service Worker: Activating...');
  
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => 
              cacheName !== STATIC_CACHE_NAME && 
              cacheName !== DYNAMIC_CACHE_NAME &&
              cacheName.startsWith('dutch-')
            )
            .map((cacheName) => {
              console.log('🧹 Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            })
        );
      }),
      // Claim all clients immediately
      self.clients.claim()
    ])
  );
});

// Fetch event - handle network requests
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
  
  // Skip analytics and tracking requests (let them fail gracefully)
  if (isAnalyticsRequest(url)) {
    event.respondWith(handleAnalyticsRequest(request));
    return;
  }
  
  // Handle API requests
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(request));
    return;
  }
  
  // Handle image requests
  if (isImageRequest(url)) {
    event.respondWith(handleImageRequest(request));
    return;
  }
  
  // Handle font requests
  if (isFontRequest(url)) {
    event.respondWith(handleFontRequest(request));
    return;
  }
  
  // Handle page requests
  if (isPageRequest(request)) {
    event.respondWith(handlePageRequest(request));
    return;
  }
  
  // Default: try network first, fallback to cache
  event.respondWith(
    fetch(request).catch(() => {
      return caches.match(request);
    })
  );
});

// Handle different types of requests with appropriate strategies

async function handlePageRequest(request) {
  const url = new URL(request.url);
  
  try {
    // Try network first
    const response = await fetch(request);
    
    // Cache successful responses
    if (response.status === 200) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    // Network failed, try cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // No cache, return offline page for HTML requests
    if (request.headers.get('accept').includes('text/html')) {
      return caches.match('/offline.html');
    }
    
    // For other requests, return a generic offline response
    return new Response('Offline - Content not available', {
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
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      
      // Only cache images up to 1MB
      const contentLength = response.headers.get('content-length');
      if (!contentLength || parseInt(contentLength) < 1024 * 1024) {
        cache.put(request, response.clone());
      }
    }
    
    return response;
  } catch (error) {
    // Return placeholder image if available
    const placeholder = await caches.match('/images/placeholder.png');
    if (placeholder) {
      return placeholder;
    }
    
    // Generate a simple SVG placeholder
    const svgPlaceholder = `
      <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
        <rect width="400" height="300" fill="#FF9500" opacity="0.1"/>
        <text x="200" y="150" text-anchor="middle" fill="#FF9500" font-family="Arial" font-size="16">
          🌷 Image offline
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
    // Check cache first for fonts
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Try network
    const response = await fetch(request);
    
    // Cache successful font responses for a long time
    if (response.status === 200) {
      const cache = await caches.open(STATIC_CACHE_NAME);
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    // Return cached response or let the page use fallback fonts
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    return new Response('', { status: 404 });
  }
}

async function handleApiRequest(request) {
  const url = new URL(request.url);
  
  try {
    // Always try network first for API requests
    const response = await fetch(request);
    
    // Cache successful GET requests for a short time
    if (response.status === 200 && request.method === 'GET') {
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      
      // Add cache headers to the response
      const responseToCache = new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: {
          ...response.headers,
          'sw-cached': Date.now()
        }
      });
      
      cache.put(request, responseToCache.clone());
      return responseToCache;
    }
    
    return response;
  } catch (error) {
    // Network failed, try cache for GET requests
    if (request.method === 'GET') {
      const cachedResponse = await caches.match(request);
      if (cachedResponse) {
        // Check if cached response is still fresh (5 minutes)
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
      message: 'API request failed - device is offline'
    }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

async function handleAnalyticsRequest(request) {
  try {
    // Try to send analytics request
    return await fetch(request);
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
  return /\.(jpg|jpeg|png|gif|webp|svg|ico)$/i.test(pathname);
}

function isFontRequest(url) {
  const pathname = url.pathname.toLowerCase();
  return /\.(woff|woff2|ttf|eot|otf)$/i.test(pathname) || 
         url.hostname === 'fonts.gstatic.com';
}

function isAnalyticsRequest(url) {
  return url.hostname.includes('google-analytics.com') ||
         url.hostname.includes('googletagmanager.com') ||
         url.hostname.includes('analytics.google.com') ||
         url.pathname.includes('gtag') ||
         url.pathname.includes('analytics');
}

// Background sync for form submissions when offline
self.addEventListener('sync', (event) => {
  if (event.tag === 'contact-form-sync') {
    event.waitUntil(syncContactForms());
  }
  if (event.tag === 'newsletter-sync') {
    event.waitUntil(syncNewsletterSignups());
  }
});

async function syncContactForms() {
  try {
    const cache = await caches.open(DYNAMIC_CACHE_NAME);
    const pendingForms = await cache.match('pending-forms');
    
    if (pendingForms) {
      const forms = await pendingForms.json();
      
      for (const formData of forms) {
        try {
          await fetch('/api/contact', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
          });
          
          console.log('📧 Contact form synced successfully');
        } catch (error) {
          console.log('❌ Contact form sync failed:', error);
        }
      }
      
      // Clear pending forms after sync attempt
      await cache.delete('pending-forms');
    }
  } catch (error) {
    console.log('🔄 Background sync failed:', error);
  }
}

async function syncNewsletterSignups() {
  try {
    const cache = await caches.open(DYNAMIC_CACHE_NAME);
    const pendingSignups = await cache.match('pending-newsletter');
    
    if (pendingSignups) {
      const signups = await pendingSignups.json();
      
      for (const signup of signups) {
        try {
          await fetch('/api/newsletter', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(signup)
          });
          
          console.log('📬 Newsletter signup synced successfully');
        } catch (error) {
          console.log('❌ Newsletter sync failed:', error);
        }
      }
      
      await cache.delete('pending-newsletter');
    }
  } catch (error) {
    console.log('🔄 Newsletter sync failed:', error);
  }
}

// Handle push notifications
self.addEventListener('push', (event) => {
  if (!event.data) {
    return;
  }
  
  const data = event.data.json();
  const options = {
    body: data.body || 'New Dutch mystery awaits...',
    icon: '/images/icon-192x192.png',
    badge: '/images/badge-72x72.png',
    image: data.image,
    data: data.url,
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
    tag: 'dutch-mystery-notification',
    renotify: true,
    requireInteraction: false,
    silent: false
  };
  
  event.waitUntil(
    self.registration.showNotification(
      data.title || 'If It Ain\'t Dutch, It Ain\'t Much',
      options
    )
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  const action = event.action;
  const data = event.notification.data;
  
  if (action === 'close') {
    return;
  }
  
  const urlToOpen = data || '/';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
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
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

// Handle app update notifications
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('🔄 Updating Dutch Mystery Service Worker...');
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
});

// Periodic background sync (for supported browsers)
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'update-content') {
    event.waitUntil(updateContentInBackground());
  }
});

async function updateContentInBackground() {
  try {
    // Refresh critical pages
    const criticalPages = ['/', '/store/', '/events/'];
    const cache = await caches.open(DYNAMIC_CACHE_NAME);
    
    for (const page of criticalPages) {
      try {
        const response = await fetch(page);
        if (response.status === 200) {
          await cache.put(page, response);
          console.log('🔄 Updated cached page:', page);
        }
      } catch (error) {
        console.log('❌ Failed to update page:', page, error);
      }
    }
  } catch (error) {
    console.log('🔄 Background content update failed:', error);
  }
}

// Cleanup old cached entries
async function cleanupCaches() {
  const cacheNames = await caches.keys();
  
  for (const cacheName of cacheNames) {
    if (cacheName.startsWith('dutch-dynamic')) {
      const cache = await caches.open(cacheName);
      const requests = await cache.keys();
      
      // Remove entries older than 7 days
      const weekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
      
      for (const request of requests) {
        const response = await cache.match(request);
        const cachedTime = response.headers.get('sw-cached');
        
        if (cachedTime && parseInt(cachedTime) < weekAgo) {
          await cache.delete(request);
          console.log('🧹 Cleaned old cache entry:', request.url);
        }
      }
    }
  }
}

// Run cleanup periodically
self.addEventListener('activate', (event) => {
  event.waitUntil(cleanupCaches());
});

console.log('🌷 Dutch Mystery Service Worker loaded successfully - Version', CACHE_NAME);
