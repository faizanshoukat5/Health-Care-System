// Healthcare Management Platform Service Worker
const CACHE_NAME = 'healthcare-v1.0.0'
const OFFLINE_CACHE = 'healthcare-offline-v1'
const API_CACHE = 'healthcare-api-v1'

// Resources to cache for offline use
const STATIC_RESOURCES = [
  '/',
  '/patient/dashboard',
  '/patient/appointments',
  '/doctor/dashboard',
  '/login',
  '/register',
  '/offline.html',
  // Add more critical routes here
]

// API endpoints to cache
const API_ENDPOINTS = [
  '/api/user',
  '/api/patient',
  '/api/doctor',
  '/api/appointments',
  '/api/notifications',
  // Add more API endpoints as needed
]

// Install event - cache static resources
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker')
  
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME)
      console.log('[SW] Caching static resources')
      
      try {
        await cache.addAll(STATIC_RESOURCES)
        console.log('[SW] Static resources cached successfully')
      } catch (error) {
        console.error('[SW] Failed to cache static resources:', error)
        // Cache individual resources to avoid failing the entire installation
        for (const resource of STATIC_RESOURCES) {
          try {
            await cache.add(resource)
          } catch (err) {
            console.warn(`[SW] Failed to cache ${resource}:`, err)
          }
        }
      }
      
      // Force activation
      self.skipWaiting()
    })()
  )
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker')
  
  event.waitUntil(
    (async () => {
      const cacheNames = await caches.keys()
      const oldCaches = cacheNames.filter(name => 
        name.startsWith('healthcare-') && name !== CACHE_NAME && name !== OFFLINE_CACHE && name !== API_CACHE
      )
      
      await Promise.all(
        oldCaches.map(cacheName => {
          console.log(`[SW] Deleting old cache: ${cacheName}`)
          return caches.delete(cacheName)
        })
      )
      
      // Claim all clients
      self.clients.claim()
      console.log('[SW] Service worker activated')
    })()
  )
})

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)
  
  // Skip non-HTTP requests
  if (!url.protocol.startsWith('http')) {
    return
  }
  
  // Handle API requests
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(request))
    return
  }
  
  // Handle static resources
  event.respondWith(handleStaticRequest(request))
})

// Handle API requests with network-first strategy
async function handleApiRequest(request) {
  const cache = await caches.open(API_CACHE)
  
  try {
    // Try network first
    const networkResponse = await fetch(request.clone())
    
    // Cache successful GET requests
    if (request.method === 'GET' && networkResponse.ok) {
      cache.put(request, networkResponse.clone())
    }
    
    return networkResponse
  } catch (error) {
    console.log('[SW] Network failed, trying cache for:', request.url)
    
    // If network fails, try cache
    const cachedResponse = await cache.match(request)
    if (cachedResponse) {
      console.log('[SW] Serving from cache:', request.url)
      return cachedResponse
    }
    
    // If both fail and it's a GET request, return offline data
    if (request.method === 'GET') {
      return new Response(
        JSON.stringify({
          error: 'Offline',
          message: 'This data is not available offline',
          cached: false
        }),
        {
          status: 503,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }
    
    // For non-GET requests, let the error propagate
    throw error
  }
}

// Handle static resources with cache-first strategy
async function handleStaticRequest(request) {
  const cache = await caches.open(CACHE_NAME)
  
  // Try cache first
  const cachedResponse = await cache.match(request)
  if (cachedResponse) {
    console.log('[SW] Serving from cache:', request.url)
    return cachedResponse
  }
  
  try {
    // If not in cache, try network
    const networkResponse = await fetch(request)
    
    // Cache the response for future use
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone())
    }
    
    return networkResponse
  } catch (error) {
    console.log('[SW] Network failed for:', request.url)
    
    // If both cache and network fail, show offline page for navigation requests
    if (request.destination === 'document') {
      const offlineResponse = await cache.match('/offline.html')
      if (offlineResponse) {
        return offlineResponse
      }
    }
    
    // Return a generic offline response
    return new Response(
      'Offline - This resource is not available',
      {
        status: 503,
        headers: { 'Content-Type': 'text/plain' }
      }
    )
  }
}

// Handle background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync triggered:', event.tag)
  
  if (event.tag === 'sync-offline-actions') {
    event.waitUntil(syncOfflineActions())
  }
})

// Sync offline actions when back online
async function syncOfflineActions() {
  console.log('[SW] Syncing offline actions')
  
  try {
    // Get offline queue from IndexedDB or localStorage
    const offlineActions = await getOfflineActions()
    
    for (const action of offlineActions) {
      try {
        await syncSingleAction(action)
        await removeOfflineAction(action.id)
        console.log('[SW] Synced offline action:', action.type)
      } catch (error) {
        console.error('[SW] Failed to sync action:', action.type, error)
      }
    }
    
    // Notify clients that sync is complete
    const clients = await self.clients.matchAll()
    clients.forEach(client => {
      client.postMessage({
        type: 'SYNC_COMPLETE',
        timestamp: new Date().toISOString()
      })
    })
  } catch (error) {
    console.error('[SW] Background sync failed:', error)
  }
}

// Helper functions for offline action management
async function getOfflineActions() {
  // In a real implementation, you'd use IndexedDB
  // For now, return empty array
  return []
}

async function removeOfflineAction(actionId) {
  // Remove action from IndexedDB
  console.log('[SW] Removing synced action:', actionId)
}

async function syncSingleAction(action) {
  const response = await fetch('/api/sync/offline', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(action)
  })
  
  if (!response.ok) {
    throw new Error(`Sync failed: ${response.statusText}`)
  }
  
  return response.json()
}

// Handle push notifications (for future implementation)
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received')
  
  if (!event.data) return
  
  const data = event.data.json()
  
  const options = {
    body: data.message,
    icon: '/icon-192.png',
    badge: '/badge-icon.png',
    tag: data.tag || 'default',
    data: data.data,
    actions: data.actions || [],
    requireInteraction: data.urgent || false,
    silent: false,
  }
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  )
})

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event.notification.tag)
  
  event.notification.close()
  
  const data = event.notification.data
  let url = '/'
  
  // Determine URL based on notification type
  if (data && data.type) {
    switch (data.type) {
      case 'appointment':
        url = '/patient/appointments'
        break
      case 'prescription':
        url = '/patient/prescriptions'
        break
      case 'vitals':
        url = '/patient/vitals'
        break
      default:
        url = '/patient/dashboard'
    }
  }
  
  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then(clients => {
      // Check if there's already a window open
      for (const client of clients) {
        if (client.url.includes(url) && 'focus' in client) {
          return client.focus()
        }
      }
      
      // Open new window
      if (self.clients.openWindow) {
        return self.clients.openWindow(url)
      }
    })
  )
})

console.log('[SW] Service worker script loaded')
