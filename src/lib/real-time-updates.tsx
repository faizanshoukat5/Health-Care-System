'use client'

import React, { createContext, useContext, useEffect, useState, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/stores/auth-store'
import { io, Socket } from 'socket.io-client'

// Real-time update context with WebSocket and SSE support
interface RealTimeContextType {
  isConnected: boolean
  isOnline: boolean
  lastUpdate: Date | null
  connectionType: 'websocket' | 'sse' | 'polling' | 'offline'
  patientUpdates: Record<string, any>
  appointmentUpdates: Record<string, any>
  notificationUpdates: Record<string, any>
  vitalsUpdates: Record<string, any>
  prescriptionUpdates: Record<string, any>
  conflictResolution: Record<string, any>
  triggerUpdate: (type: string, id: string, data: any) => void
  subscribeToPatientUpdates: (patientId: string) => void
  unsubscribeFromPatientUpdates: (patientId: string) => void
  resolveConflict: (id: string, resolution: 'local' | 'remote' | 'merge') => void
  syncOfflineChanges: () => Promise<void>
}

const RealTimeContext = createContext<RealTimeContextType | null>(null)

// Real-time update intervals (in milliseconds)
const UPDATE_INTERVALS = {
  appointments: 30000, // 30 seconds
  notifications: 60000, // 1 minute
  vitals: 120000, // 2 minutes
  prescriptions: 300000, // 5 minutes
  patientData: 180000, // 3 minutes
  heartbeat: 30000, // 30 seconds
  conflictCheck: 10000, // 10 seconds
}

// Offline storage key
const OFFLINE_QUEUE_KEY = 'healthcare_offline_queue'
const CACHE_VERSION_KEY = 'healthcare_cache_version'

export function RealTimeProvider({ children }: { children: React.ReactNode }) {
  const { user, token } = useAuth()
  const queryClient = useQueryClient()
  
  // Connection states
  const [isConnected, setIsConnected] = useState(false)
  const [isOnline, setIsOnline] = useState(typeof window !== 'undefined' ? navigator.onLine : true)
  const [connectionType, setConnectionType] = useState<'websocket' | 'sse' | 'polling' | 'offline'>('offline')
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  
  // Update states
  const [patientUpdates, setPatientUpdates] = useState<Record<string, any>>({})
  const [appointmentUpdates, setAppointmentUpdates] = useState<Record<string, any>>({})
  const [notificationUpdates, setNotificationUpdates] = useState<Record<string, any>>({})
  const [vitalsUpdates, setVitalsUpdates] = useState<Record<string, any>>({})
  const [prescriptionUpdates, setPrescriptionUpdates] = useState<Record<string, any>>({})
  const [conflictResolution, setConflictResolution] = useState<Record<string, any>>({})
  const [subscribedPatients, setSubscribedPatients] = useState<Set<string>>(new Set())
  
  // Connection refs
  const socketRef = useRef<Socket | null>(null)
  const eventSourceRef = useRef<EventSource | null>(null)
  const offlineQueueRef = useRef<any[]>([])
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Online/offline detection
  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleOnline = () => {
      setIsOnline(true)
      console.log('[RealTime] Back online - syncing changes')
      syncOfflineChanges()
      establishConnection()
    }

    const handleOffline = () => {
      setIsOnline(false)
      setConnectionType('offline')
      setIsConnected(false)
      console.log('[RealTime] Gone offline - enabling offline mode')
      disconnectAll()
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // WebSocket connection setup
  const establishWebSocketConnection = () => {
    if (!user || !token || !isOnline) return

    console.log('[RealTime] Establishing WebSocket connection')
    
    const socket = io({
      path: '/api/socketio',
      auth: { token },
      transports: ['websocket', 'polling'],
    })

    socket.on('connect', () => {
      console.log('[RealTime] WebSocket connected')
      setIsConnected(true)
      setConnectionType('websocket')
      setLastUpdate(new Date())
      
      // Subscribe to user-specific updates
      if (user.role === 'PATIENT') {
        socket.emit('subscribe:patient', user.id)
      } else if (user.role === 'DOCTOR') {
        socket.emit('subscribe:doctor', user.id)
      }
    })

    socket.on('disconnect', () => {
      console.log('[RealTime] WebSocket disconnected')
      setIsConnected(false)
      // Try SSE fallback
      establishSSEConnection()
    })

    // Real-time event handlers
    socket.on('appointment:updated', (data) => {
      console.log('[RealTime] Appointment updated via WebSocket', data)
      invalidateQueries('appointments')
      setAppointmentUpdates(prev => ({ ...prev, [data.id]: data }))
    })

    socket.on('vitals:updated', (data) => {
      console.log('[RealTime] Vitals updated via WebSocket', data)
      invalidateQueries('vitals')
      setVitalsUpdates(prev => ({ ...prev, [data.id]: data }))
    })

    socket.on('notification:updated', (data) => {
      console.log('[RealTime] Notification updated via WebSocket', data)
      invalidateQueries('notifications')
      setNotificationUpdates(prev => ({ ...prev, [data.id]: data }))
    })

    socket.on('patient:vitals:updated', (data) => {
      console.log('[RealTime] Patient vitals updated via WebSocket', data)
      invalidateQueries('patientData')
      setPatientUpdates(prev => ({ ...prev, [data.patientId]: data }))
    })

    socket.on('conflict:detected', (data) => {
      console.log('[RealTime] Conflict detected', data)
      setConflictResolution(prev => ({ ...prev, [data.id]: data }))
    })

    socket.on('error', (error) => {
      console.error('[RealTime] WebSocket error:', error)
      // Fallback to SSE
      establishSSEConnection()
    })

    socketRef.current = socket
    return socket
  }

  // Server-Sent Events connection setup
  const establishSSEConnection = () => {
    if (!user || !token || !isOnline || connectionType === 'websocket') return

    console.log('[RealTime] Establishing SSE connection')
    
    const eventSource = new EventSource('/api/events')
    
    eventSource.onopen = () => {
      console.log('[RealTime] SSE connected')
      setIsConnected(true)
      setConnectionType('sse')
      setLastUpdate(new Date())
    }

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        console.log('[RealTime] SSE message received:', data.type)
        
        switch (data.type) {
          case 'notifications':
            invalidateQueries('notifications')
            setNotificationUpdates(prev => ({ ...prev, [Date.now()]: data.data }))
            break
          case 'appointments':
            invalidateQueries('appointments')
            setAppointmentUpdates(prev => ({ ...prev, [Date.now()]: data.data }))
            break
          case 'patient_updates':
            invalidateQueries('patientData')
            setPatientUpdates(prev => ({ ...prev, [Date.now()]: data.data }))
            break
          case 'heartbeat':
            setLastUpdate(new Date())
            break
        }
      } catch (error) {
        console.error('[RealTime] SSE message parse error:', error)
      }
    }

    eventSource.onerror = () => {
      console.log('[RealTime] SSE error - falling back to polling')
      eventSource.close()
      setConnectionType('polling')
      setupPollingFallback()
    }

    eventSourceRef.current = eventSource
    return eventSource
  }

  // Polling fallback
  const setupPollingFallback = () => {
    if (!user || !token || !isOnline) return

    console.log('[RealTime] Setting up polling fallback')
    setConnectionType('polling')
    setIsConnected(true)
    
    // Continue with existing polling logic...
    const intervals: NodeJS.Timeout[] = []

    if (user.role === 'PATIENT') {
      intervals.push(
        setInterval(() => invalidateQueries('appointments'), UPDATE_INTERVALS.appointments),
        setInterval(() => invalidateQueries('notifications'), UPDATE_INTERVALS.notifications),
        setInterval(() => invalidateQueries('vitals'), UPDATE_INTERVALS.vitals),
        setInterval(() => invalidateQueries('prescriptions'), UPDATE_INTERVALS.prescriptions)
      )
    } else if (user.role === 'DOCTOR') {
      intervals.push(
        setInterval(() => invalidateQueries('appointments'), UPDATE_INTERVALS.appointments),
        setInterval(() => invalidateQueries('notifications'), UPDATE_INTERVALS.notifications),
        setInterval(() => invalidateQueries('patientData'), UPDATE_INTERVALS.patientData)
      )
    }

    return () => intervals.forEach(interval => clearInterval(interval))
  }

  // Main connection establishment
  const establishConnection = () => {
    if (!user || !token) return

    // Try WebSocket first
    const socket = establishWebSocketConnection()
    
    // If WebSocket fails, try SSE after a delay
    setTimeout(() => {
      if (!isConnected) {
        establishSSEConnection()
      }
    }, 3000)

    // If both fail, use polling
    setTimeout(() => {
      if (!isConnected) {
        setupPollingFallback()
      }
    }, 8000)
  }

  // Disconnect all connections
  const disconnectAll = () => {
    if (socketRef.current) {
      socketRef.current.disconnect()
      socketRef.current = null
    }
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
      eventSourceRef.current = null
    }
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current)
      retryTimeoutRef.current = null
    }
  }

  // Initialize connection when user is available
  useEffect(() => {
    if (user && token && isOnline) {
      establishConnection()
    } else {
      disconnectAll()
      setIsConnected(false)
    }

    return () => {
      disconnectAll()
    }
  }, [user, token, isOnline])

  // Offline queue and sync functionality
  const queueOfflineAction = (action: any) => {
    if (typeof window === 'undefined') return
    
    const queue = JSON.parse(localStorage.getItem(OFFLINE_QUEUE_KEY) || '[]')
    queue.push({
      ...action,
      timestamp: new Date().toISOString(),
      id: Date.now().toString(),
    })
    localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue))
    offlineQueueRef.current = queue
    console.log('[RealTime] Action queued for offline sync:', action.type)
  }

  const syncOfflineChanges = async () => {
    if (typeof window === 'undefined') return
    
    const queue = JSON.parse(localStorage.getItem(OFFLINE_QUEUE_KEY) || '[]')
    if (queue.length === 0) return

    console.log(`[RealTime] Syncing ${queue.length} offline changes`)
    
    for (const action of queue) {
      try {
        await syncSingleAction(action)
        console.log('[RealTime] Synced action:', action.type)
      } catch (error) {
        console.error('[RealTime] Failed to sync action:', action.type, error)
        // Keep failed actions in queue for retry
        continue
      }
    }

    // Clear successfully synced actions
    localStorage.removeItem(OFFLINE_QUEUE_KEY)
    offlineQueueRef.current = []
    
    // Refresh all data after sync
    invalidateQueries('appointments')
    invalidateQueries('notifications')
    invalidateQueries('vitals')
    invalidateQueries('prescriptions')
    invalidateQueries('patientData')
  }

  const syncSingleAction = async (action: any) => {
    const response = await fetch('/api/sync/offline', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(action),
    })
    
    if (!response.ok) {
      throw new Error(`Sync failed: ${response.statusText}`)
    }
    
    return response.json()
  }

  // Conflict resolution
  const resolveConflict = async (id: string, resolution: 'local' | 'remote' | 'merge') => {
    const conflict = conflictResolution[id]
    if (!conflict) return

    console.log(`[RealTime] Resolving conflict ${id} with strategy: ${resolution}`)
    
    try {
      let resolvedData
      
      switch (resolution) {
        case 'local':
          resolvedData = conflict.local
          break
        case 'remote':
          resolvedData = conflict.remote
          break
        case 'merge':
          resolvedData = { ...conflict.remote, ...conflict.local }
          break
      }

      // Apply resolution
      const response = await fetch('/api/conflicts/resolve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          conflictId: id,
          resolution: resolution,
          data: resolvedData,
        }),
      })

      if (response.ok) {
        // Remove conflict from state
        setConflictResolution(prev => {
          const updated = { ...prev }
          delete updated[id]
          return updated
        })
        
        // Refresh relevant data
        invalidateQueries(conflict.type)
        console.log('[RealTime] Conflict resolved successfully')
      }
    } catch (error) {
      console.error('[RealTime] Failed to resolve conflict:', error)
    }
  }

  // Version-based conflict detection
  const checkForConflicts = async (type: string, id: string, localVersion: string) => {
    try {
      const response = await fetch(`/api/conflicts/check?type=${type}&id=${id}&version=${localVersion}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      
      if (response.status === 409) {
        const conflictData = await response.json()
        setConflictResolution(prev => ({
          ...prev,
          [id]: {
            type,
            id,
            local: conflictData.local,
            remote: conflictData.remote,
            timestamp: new Date().toISOString(),
          }
        }))
        console.log('[RealTime] Conflict detected:', conflictData)
      }
    } catch (error) {
      console.error('[RealTime] Conflict check failed:', error)
    }
  }
  // Dynamic query invalidation based on user role and context
  const invalidateQueries = (type: string, id?: string) => {
    const timestamp = new Date()
    setLastUpdate(timestamp)

    switch (type) {
      case 'appointments':
        queryClient.invalidateQueries({ queryKey: ['upcoming-appointments'] })
        queryClient.invalidateQueries({ queryKey: ['all-appointments'] })
        queryClient.invalidateQueries({ queryKey: ['today-appointments'] })
        queryClient.invalidateQueries({ queryKey: ['doctor-appointments'] })
        break
      
      case 'notifications':
        queryClient.invalidateQueries({ queryKey: ['notifications'] })
        queryClient.invalidateQueries({ queryKey: ['doctor-notifications'] })
        break
      
      case 'vitals':
        queryClient.invalidateQueries({ queryKey: ['recent-vitals'] })
        queryClient.invalidateQueries({ queryKey: ['patient-vitals'] })
        break
      
      case 'prescriptions':
        queryClient.invalidateQueries({ queryKey: ['active-prescriptions'] })
        queryClient.invalidateQueries({ queryKey: ['patient-prescriptions'] })
        break
      
      case 'patientData':
        queryClient.invalidateQueries({ queryKey: ['patient-data'] })
        queryClient.invalidateQueries({ queryKey: ['doctor-patients'] })
        break
      
      case 'doctorSchedule':
        queryClient.invalidateQueries({ queryKey: ['available-doctors'] })
        queryClient.invalidateQueries({ queryKey: ['doctor-availability'] })
        queryClient.invalidateQueries({ queryKey: ['doctor-schedule'] })
        break

      default:
        // Invalidate all patient-related queries
        queryClient.invalidateQueries({ queryKey: ['patient'] })
        queryClient.invalidateQueries({ queryKey: ['doctor'] })
    }
  }

  // Setup automatic refresh intervals
  useEffect(() => {
    if (!isConnected || !user || !token) return

    const intervals: NodeJS.Timeout[] = []

    // Set up different intervals based on user role
    if (user.role === 'PATIENT') {
      // Patient-specific updates
      intervals.push(
        setInterval(() => invalidateQueries('appointments'), UPDATE_INTERVALS.appointments),
        setInterval(() => invalidateQueries('notifications'), UPDATE_INTERVALS.notifications),
        setInterval(() => invalidateQueries('vitals'), UPDATE_INTERVALS.vitals),
        setInterval(() => invalidateQueries('prescriptions'), UPDATE_INTERVALS.prescriptions)
      )
    } else if (user.role === 'DOCTOR') {
      // Doctor-specific updates
      intervals.push(
        setInterval(() => invalidateQueries('appointments'), UPDATE_INTERVALS.appointments),
        setInterval(() => invalidateQueries('notifications'), UPDATE_INTERVALS.notifications),
        setInterval(() => invalidateQueries('patientData'), UPDATE_INTERVALS.patientData),
        setInterval(() => invalidateQueries('doctorSchedule'), UPDATE_INTERVALS.prescriptions)
      )
    }

    return () => {
      intervals.forEach(interval => clearInterval(interval))
    }
  }, [isConnected, user, token, queryClient])

  // Listen for browser focus events to refresh data
  useEffect(() => {
    const handleFocus = () => {
      if (isConnected && user && token) {
        // Refresh all data when user returns to the tab
        invalidateQueries('appointments')
        invalidateQueries('notifications')
        if (user.role === 'PATIENT') {
          invalidateQueries('vitals')
          invalidateQueries('prescriptions')
        } else if (user.role === 'DOCTOR') {
          invalidateQueries('patientData')
          invalidateQueries('doctorSchedule')
        }
      }
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        handleFocus()
      }
    }

    window.addEventListener('focus', handleFocus)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      window.removeEventListener('focus', handleFocus)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [isConnected, user, token])

  // Enhanced trigger update function with offline support
  const triggerUpdate = (type: string, id: string, data: any) => {
    if (!isOnline) {
      queueOfflineAction({ type, id, data })
      return
    }

    console.log(`[RealTime] Triggering update: ${type}`)
    
    switch (type) {
      case 'patient':
        setPatientUpdates(prev => ({ ...prev, [id]: data }))
        break
      case 'appointment':
        setAppointmentUpdates(prev => ({ ...prev, [id]: data }))
        break
      case 'notification':
        setNotificationUpdates(prev => ({ ...prev, [id]: data }))
        break
      case 'vitals':
        setVitalsUpdates(prev => ({ ...prev, [id]: data }))
        break
      case 'prescription':
        setPrescriptionUpdates(prev => ({ ...prev, [id]: data }))
        break
    }
    
    invalidateQueries(type, id)
    setLastUpdate(new Date())
  }

  const subscribeToPatientUpdates = (patientId: string) => {
    setSubscribedPatients(prev => new Set([...prev, patientId]))
    if (socketRef.current) {
      socketRef.current.emit('subscribe:patient', patientId)
    }
  }

  const unsubscribeFromPatientUpdates = (patientId: string) => {
    setSubscribedPatients(prev => {
      const updated = new Set(prev)
      updated.delete(patientId)
      return updated
    })
    if (socketRef.current) {
      socketRef.current.emit('unsubscribe:patient', patientId)
    }
  }

  const value: RealTimeContextType = {
    isConnected,
    isOnline,
    lastUpdate,
    connectionType,
    patientUpdates,
    appointmentUpdates,
    notificationUpdates,
    vitalsUpdates,
    prescriptionUpdates,
    conflictResolution,
    triggerUpdate,
    subscribeToPatientUpdates,
    unsubscribeFromPatientUpdates,
    resolveConflict,
    syncOfflineChanges,
  }

  return (
    <RealTimeContext.Provider value={value}>
      {children}
    </RealTimeContext.Provider>
  )
}

// Use real-time updates hook
export function useRealTimeUpdates() {
  const context = useContext(RealTimeContext)
  if (!context) {
    throw new Error('useRealTimeUpdates must be used within a RealTimeProvider')
  }
  return context
}

// Hook for patient-specific real-time updates
export function usePatientUpdates(patientId?: string) {
  const { 
    isConnected, 
    lastUpdate, 
    patientUpdates, 
    appointmentUpdates, 
    notificationUpdates,
    vitalsUpdates,
    prescriptionUpdates,
    triggerUpdate 
  } = useRealTimeUpdates()

  const patientData = patientId ? patientUpdates[patientId] : null
  const patientAppointments = patientId ? appointmentUpdates[patientId] : null
  const patientNotifications = patientId ? notificationUpdates[patientId] : null
  const patientVitals = patientId ? vitalsUpdates[patientId] : null
  const patientPrescriptions = patientId ? prescriptionUpdates[patientId] : null

  const updatePatient = (data: any) => {
    if (patientId) {
      triggerUpdate('patient', patientId, data)
    }
  }

  const updateAppointments = (data: any) => {
    if (patientId) {
      triggerUpdate('appointment', patientId, data)
    }
  }

  const updateNotifications = (data: any) => {
    if (patientId) {
      triggerUpdate('notification', patientId, data)
    }
  }

  const updateVitals = (data: any) => {
    if (patientId) {
      triggerUpdate('vitals', patientId, data)
    }
  }

  const updatePrescriptions = (data: any) => {
    if (patientId) {
      triggerUpdate('prescription', patientId, data)
    }
  }

  return {
    isConnected,
    lastUpdate,
    patientData,
    patientAppointments,
    patientNotifications,
    patientVitals,
    patientPrescriptions,
    updatePatient,
    updateAppointments,
    updateNotifications,
    updateVitals,
    updatePrescriptions
  }
}

// Hook for doctor-specific real-time updates
export function useDoctorUpdates(doctorId?: string) {
  const { 
    isConnected, 
    lastUpdate, 
    appointmentUpdates, 
    notificationUpdates,
    subscribeToPatientUpdates,
    unsubscribeFromPatientUpdates,
    triggerUpdate 
  } = useRealTimeUpdates()

  const doctorAppointments = doctorId ? appointmentUpdates[doctorId] : null
  const doctorNotifications = doctorId ? notificationUpdates[doctorId] : null

  const updateDoctorAppointments = (data: any) => {
    if (doctorId) {
      triggerUpdate('appointment', doctorId, data)
    }
  }

  const updateDoctorNotifications = (data: any) => {
    if (doctorId) {
      triggerUpdate('notification', doctorId, data)
    }
  }

  const subscribeToPatient = (patientId: string) => {
    return subscribeToPatientUpdates(patientId)
  }

  const unsubscribeFromPatient = (patientId: string) => {
    unsubscribeFromPatientUpdates(patientId)
  }

  return {
    isConnected,
    lastUpdate,
    doctorAppointments,
    doctorNotifications,
    updateDoctorAppointments,
    updateDoctorNotifications,
    subscribeToPatient,
    unsubscribeFromPatient
  }
}
