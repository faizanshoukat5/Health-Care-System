/**
 * WebSocket client hook for real-time updates
 * Manages WebSocket connections and real-time event handling
 */

import { useEffect, useRef, useState } from 'react'
import { io, Socket } from 'socket.io-client'
import { useAuth } from '@/stores/auth-store'

interface WebSocketConfig {
  autoConnect?: boolean
  reconnectAttempts?: number
  reconnectDelay?: number
}

interface ConnectionState {
  isConnected: boolean
  isConnecting: boolean
  error: string | null
  lastConnected: Date | null
  reconnectAttempts: number
}

export function useWebSocket(config: WebSocketConfig = {}) {
  const { user, token } = useAuth()
  const socketRef = useRef<Socket | null>(null)
  const [connectionState, setConnectionState] = useState<ConnectionState>({
    isConnected: false,
    isConnecting: false,
    error: null,
    lastConnected: null,
    reconnectAttempts: 0
  })

  const {
    autoConnect = true,
    reconnectAttempts = 5,
    reconnectDelay = 3000
  } = config

  // Connect to WebSocket
  const connect = () => {
    if (!user || !token || socketRef.current?.connected) {
      return
    }

    console.log('[WebSocket] Connecting...')
    setConnectionState(prev => ({ ...prev, isConnecting: true, error: null }))

    try {
      const socket = io({
        path: '/api/socketio',
        auth: { token },
        transports: ['websocket', 'polling']
      })

      socket.on('connect', () => {
        console.log('[WebSocket] Connected successfully')
        setConnectionState(prev => ({
          ...prev,
          isConnected: true,
          isConnecting: false,
          lastConnected: new Date(),
          reconnectAttempts: 0,
          error: null
        }))

        // Subscribe to user-specific updates
        if (user.role === 'DOCTOR') {
          socket.emit('subscribe:doctor', user.id)
        } else if (user.role === 'PATIENT') {
          socket.emit('subscribe:patient', user.id)
        }
      })

      socket.on('disconnect', (reason) => {
        console.log('[WebSocket] Disconnected:', reason)
        setConnectionState(prev => ({
          ...prev,
          isConnected: false,
          isConnecting: false
        }))

        // Auto-reconnect if not manually disconnected
        if (reason !== 'io client disconnect') {
          setConnectionState(currentState => {
            if (currentState.reconnectAttempts < reconnectAttempts) {
              setTimeout(() => {
                setConnectionState(prev => ({
                  ...prev,
                  reconnectAttempts: prev.reconnectAttempts + 1
                }))
                connect()
              }, reconnectDelay)
            }
            return currentState
          })
        }
      })

      socket.on('connect_error', (error) => {
        console.error('[WebSocket] Connection error:', error)
        setConnectionState(prev => ({
          ...prev,
          isConnected: false,
          isConnecting: false,
          error: error.message
        }))
      })

      socketRef.current = socket

    } catch (error) {
      console.error('[WebSocket] Failed to create socket:', error)
      setConnectionState(prev => ({
        ...prev,
        isConnecting: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }))
    }
  }

  // Disconnect from WebSocket
  const disconnect = () => {
    if (socketRef.current) {
      console.log('[WebSocket] Disconnecting...')
      socketRef.current.disconnect()
      socketRef.current = null
      setConnectionState(prev => ({
        ...prev,
        isConnected: false,
        isConnecting: false
      }))
    }
  }

  // Emit event
  const emit = (event: string, data?: any) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(event, data)
      return true
    }
    console.warn('[WebSocket] Cannot emit - not connected')
    return false
  }

  // Subscribe to events
  const on = (event: string, callback: (data: any) => void) => {
    if (socketRef.current) {
      socketRef.current.on(event, callback)
    }
  }

  // Unsubscribe from events
  const off = (event: string, callback?: (data: any) => void) => {
    if (socketRef.current) {
      socketRef.current.off(event, callback)
    }
  }

  // Auto-connect on mount
  useEffect(() => {
    if (autoConnect && user && token) {
      connect()
    }

    // Cleanup on unmount
    return () => {
      disconnect()
    }
  }, [user, token, autoConnect])

  return {
    ...connectionState,
    connect,
    disconnect,
    emit,
    on,
    off,
    socket: socketRef.current
  }
}

/**
 * Hook for doctor-specific real-time updates
 */
export function useDoctorUpdates(doctorId?: string) {
  const { on, off, isConnected, emit } = useWebSocket()
  const [updates, setUpdates] = useState({
    newPatients: 0,
    newAppointments: 0,
    lastUpdate: null as Date | null
  })

  useEffect(() => {
    if (!isConnected || !doctorId) return

    // Handle new patient notifications
    const handleNewPatient = (data: any) => {
      console.log('[Doctor] New patient notification:', data)
      setUpdates(prev => ({
        ...prev,
        newPatients: prev.newPatients + 1,
        lastUpdate: new Date()
      }))

      // Emit browser event for components to react
      window.dispatchEvent(new CustomEvent('patient-list-update', {
        detail: { action: 'new_patient', ...data }
      }))
    }

    // Handle new appointment notifications
    const handleNewAppointment = (data: any) => {
      console.log('[Doctor] New appointment notification:', data)
      setUpdates(prev => ({
        ...prev,
        newAppointments: prev.newAppointments + 1,
        lastUpdate: new Date()
      }))

      // Emit browser event for components to react
      window.dispatchEvent(new CustomEvent('new-appointment-booked', {
        detail: { appointment: data }
      }))
    }

    // Handle patient list refresh requests
    const handlePatientListRefresh = (data: any) => {
      console.log('[Doctor] Patient list refresh requested:', data)
      
      // Emit browser event for components to react
      window.dispatchEvent(new CustomEvent('patient-list-refresh', {
        detail: data
      }))
    }

    // Subscribe to events
    on('patient:new', handleNewPatient)
    on('appointment:booked', handleNewAppointment)
    on('patient-list:refresh', handlePatientListRefresh)

    // Subscribe to doctor-specific updates
    emit('subscribe:doctor', doctorId)

    // Cleanup
    return () => {
      off('patient:new', handleNewPatient)
      off('appointment:booked', handleNewAppointment)
      off('patient-list:refresh', handlePatientListRefresh)
    }
  }, [isConnected, doctorId, on, off, emit])

  const clearUpdates = () => {
    setUpdates({ newPatients: 0, newAppointments: 0, lastUpdate: null })
  }

  return {
    ...updates,
    isConnected,
    clearUpdates
  }
}

/**
 * Hook for patient-specific real-time updates
 */
export function usePatientUpdates(patientId?: string) {
  const { on, off, isConnected, emit } = useWebSocket()
  const [updates, setUpdates] = useState({
    appointmentConfirmations: 0,
    lastUpdate: null as Date | null
  })

  useEffect(() => {
    if (!isConnected || !patientId) return

    // Handle appointment confirmations
    const handleAppointmentConfirmed = (data: any) => {
      console.log('[Patient] Appointment confirmed:', data)
      setUpdates(prev => ({
        ...prev,
        appointmentConfirmations: prev.appointmentConfirmations + 1,
        lastUpdate: new Date()
      }))

      // Emit browser event for components to react
      window.dispatchEvent(new CustomEvent('appointment-confirmed', {
        detail: data
      }))
    }

    // Handle appointment updates
    const handleAppointmentUpdate = (data: any) => {
      console.log('[Patient] Appointment updated:', data)
      
      // Emit browser event for components to react
      window.dispatchEvent(new CustomEvent('appointment-updated', {
        detail: data
      }))
    }

    // Subscribe to events
    on('appointment:confirmed', handleAppointmentConfirmed)
    on('appointment:updated', handleAppointmentUpdate)

    // Subscribe to patient-specific updates
    emit('subscribe:patient', patientId)

    // Cleanup
    return () => {
      off('appointment:confirmed', handleAppointmentConfirmed)
      off('appointment:updated', handleAppointmentUpdate)
    }
  }, [isConnected, patientId, on, off, emit])

  const updateAppointments = (appointmentData: any) => {
    // Emit WebSocket event for real-time updates
    emit('appointment:booked', appointmentData)
  }

  const clearUpdates = () => {
    setUpdates({ appointmentConfirmations: 0, lastUpdate: null })
  }

  return {
    ...updates,
    isConnected,
    updateAppointments,
    clearUpdates
  }
}
