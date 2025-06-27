'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { AuthProvider } from '@/stores/auth-store'
import { RealTimeProvider } from '@/lib/real-time-updates'
import { useEffect, useState } from 'react'

// Enhanced query client with offline support
const createQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 60 * 24, // 24 hours
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      retry: (failureCount, error: any) => {
        // Don't retry on 4xx errors except 408, 429
        if (error?.status >= 400 && error?.status < 500 && ![408, 429].includes(error?.status)) {
          return false
        }
        return failureCount < 3
      },
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
      networkMode: 'offlineFirst', // Enable offline-first behavior
    },
    mutations: {
      retry: (failureCount, error: any) => {
        // Don't retry mutations on client errors
        if (error?.status >= 400 && error?.status < 500) {
          return false
        }
        return failureCount < 2
      },
      networkMode: 'offlineFirst',
    },
  },
})

// Create persister for offline storage
const createPersister = () => {
  if (typeof window === 'undefined') return null
  
  return createSyncStoragePersister({
    storage: window.localStorage,
    key: 'healthcare-cache',
    serialize: JSON.stringify,
    deserialize: JSON.parse,
    throttleTime: 1000, // Throttle saves to once per second
  })
}

// PWA and service worker registration
const registerServiceWorker = async () => {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    console.log('Service workers not supported')
    return
  }

  try {
    console.log('[PWA] Registering service worker...')
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
    })

    console.log('[PWA] Service worker registered:', registration.scope)

    // Handle service worker updates
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing
      if (newWorker) {
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            console.log('[PWA] New service worker available')
            // You could show a notification to the user here
            if (window.confirm('A new version of the app is available. Reload to update?')) {
              window.location.reload()
            }
          }
        })
      }
    })

    // Listen for service worker messages
    navigator.serviceWorker.addEventListener('message', (event) => {
      console.log('[PWA] Message from service worker:', event.data)
      
      if (event.data.type === 'SYNC_COMPLETE') {
        // Refresh data after offline sync
        window.dispatchEvent(new CustomEvent('offline-sync-complete'))
      }
    })

    // Register for background sync (if supported)
    if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
      try {
        await (registration as any).sync.register('sync-offline-actions')
        console.log('[PWA] Background sync registered')
      } catch (error) {
        console.log('[PWA] Background sync not supported')
      }
    }

    return registration
  } catch (error) {
    console.error('[PWA] Service worker registration failed:', error)
  }
}

// Install prompt handling
const handleInstallPrompt = () => {
  if (typeof window === 'undefined') return

  let deferredPrompt: any = null

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
    deferredPrompt = e
    console.log('[PWA] Install prompt available')
    
    // Show custom install button/banner
    const installBanner = document.createElement('div')
    installBanner.innerHTML = `
      <div style="
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        background: #2563eb;
        color: white;
        padding: 12px;
        text-align: center;
        z-index: 9999;
        font-family: system-ui;
      ">
        <span>Install Healthcare Platform for offline access and faster loading</span>
        <button id="install-btn" style="
          background: white;
          color: #2563eb;
          border: none;
          padding: 8px 16px;
          border-radius: 4px;
          margin-left: 12px;
          cursor: pointer;
          font-weight: 600;
        ">Install</button>
        <button id="dismiss-btn" style="
          background: transparent;
          color: white;
          border: 1px solid white;
          padding: 8px 16px;
          border-radius: 4px;
          margin-left: 8px;
          cursor: pointer;
        ">Not Now</button>
      </div>
    `
    document.body.appendChild(installBanner)

    document.getElementById('install-btn')?.addEventListener('click', async () => {
      if (deferredPrompt) {
        deferredPrompt.prompt()
        const { outcome } = await deferredPrompt.userChoice
        console.log('[PWA] Install prompt outcome:', outcome)
        deferredPrompt = null
        installBanner.remove()
      }
    })

    document.getElementById('dismiss-btn')?.addEventListener('click', () => {
      installBanner.remove()
      deferredPrompt = null
    })
  })

  window.addEventListener('appinstalled', () => {
    console.log('[PWA] App installed successfully')
    deferredPrompt = null
  })
}

export function EnhancedProviders({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => createQueryClient())
  const [persister] = useState(() => createPersister())
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    
    // Register service worker and handle PWA features
    registerServiceWorker()
    handleInstallPrompt()
    
    // Add meta tags for PWA
    const addMetaTag = (name: string, content: string) => {
      let meta = document.querySelector(`meta[name="${name}"]`)
      if (!meta) {
        meta = document.createElement('meta')
        meta.setAttribute('name', name)
        document.head.appendChild(meta)
      }
      meta.setAttribute('content', content)
    }

    addMetaTag('apple-mobile-web-app-capable', 'yes')
    addMetaTag('apple-mobile-web-app-status-bar-style', 'default')
    addMetaTag('apple-mobile-web-app-title', 'Healthcare')
    addMetaTag('mobile-web-app-capable', 'yes')
    addMetaTag('theme-color', '#2563eb')

    // Add link tags for PWA
    const addLinkTag = (rel: string, href: string, sizes?: string) => {
      let link = document.querySelector(`link[rel="${rel}"]`)
      if (!link) {
        link = document.createElement('link')
        link.setAttribute('rel', rel)
        document.head.appendChild(link)
      }
      link.setAttribute('href', href)
      if (sizes) link.setAttribute('sizes', sizes)
    }

    addLinkTag('manifest', '/manifest.json')
    addLinkTag('apple-touch-icon', '/icon-192.png', '192x192')
    addLinkTag('icon', '/icon-512.png', '512x512')

    // Network status monitoring
    const handleOnline = () => {
      console.log('[PWA] Back online - invalidating queries')
      queryClient.invalidateQueries()
    }

    const handleOffline = () => {
      console.log('[PWA] Gone offline - enabling offline mode')
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [queryClient])

  // Show loading state during hydration
  if (!isClient) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Healthcare Platform...</p>
        </div>
      </div>
    )
  }

  // Render with or without persistence based on availability
  if (persister) {
    return (
      <PersistQueryClientProvider
        client={queryClient}
        persistOptions={{
          persister,
          maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
          buster: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
          dehydrateOptions: {
            shouldDehydrateQuery: (query: any) => {
              // Only persist successful queries
              return query.state.status === 'success'
            },
          },
        }}
      >
        <AuthProvider>
          <RealTimeProvider>
            {children}
            <ReactQueryDevtools initialIsOpen={false} />
          </RealTimeProvider>
        </AuthProvider>
      </PersistQueryClientProvider>
    )
  }

  // Fallback without persistence
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RealTimeProvider>
          {children}
          <ReactQueryDevtools initialIsOpen={false} />
        </RealTimeProvider>
      </AuthProvider>
    </QueryClientProvider>
  )
}
