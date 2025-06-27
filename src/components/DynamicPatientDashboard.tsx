'use client'

import React, { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/stores/auth-store'
import { usePatientUpdates } from '@/lib/real-time-updates'
import { Button } from '@/components/ui/button'
import { 
  CalendarDaysIcon, 
  HeartIcon, 
  ClipboardDocumentListIcon,
  ChatBubbleLeftRightIcon,
  BellIcon,
  UserCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  PlusCircleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'
import { format, isToday, formatDistanceToNow } from 'date-fns'

// Enhanced API functions with better error handling
const fetchPatientData = async (patientId: string, token: string) => {
  const response = await fetch(`/api/patient/${patientId}/dashboard`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  })
  if (!response.ok) throw new Error('Failed to fetch patient data')
  return response.json()
}

const fetchUpcomingAppointments = async (patientId: string, token: string) => {
  const response = await fetch(`/api/patient/${patientId}/appointments/upcoming`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  })
  if (!response.ok) throw new Error('Failed to fetch appointments')
  return response.json()
}

const fetchRecentVitals = async (patientId: string, token: string) => {
  const response = await fetch(`/api/patient/${patientId}/vitals/recent`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  })
  if (!response.ok) throw new Error('Failed to fetch vitals')
  return response.json()
}

const fetchActivePrescriptions = async (patientId: string, token: string) => {
  const response = await fetch(`/api/patient/${patientId}/prescriptions/active`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  })
  if (!response.ok) throw new Error('Failed to fetch prescriptions')
  return response.json()
}

const fetchNotifications = async (userId: string, token: string) => {
  const response = await fetch(`/api/notifications/${userId}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  })
  if (!response.ok) throw new Error('Failed to fetch notifications')
  return response.json()
}

interface DynamicPatientDashboardProps {
  patientId?: string
  compact?: boolean
}

export default function DynamicPatientDashboard({ patientId: propPatientId, compact = false }: DynamicPatientDashboardProps) {
  const { user, token } = useAuth()
  
  // Get patient ID from auth or props
  const patientId = propPatientId || (user?.role === 'PATIENT' ? user.id : null)
  
  // Real-time updates hook
  const {
    isConnected,
    lastUpdate,
    updatePatient,
    updateAppointments,
    updateNotifications,
    updateVitals,
    updatePrescriptions
  } = usePatientUpdates(patientId || undefined)

  // Enhanced queries with real-time updates
  const { data: patientData, isLoading: loadingPatient, refetch: refetchPatient } = useQuery({
    queryKey: ['patient-data', patientId],
    queryFn: () => fetchPatientData(patientId!, token!),
    enabled: !!patientId && !!token,
    staleTime: 30000, // 30 seconds
    refetchInterval: isConnected ? 180000 : false, // 3 minutes when connected
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  })

  const { data: appointments, isLoading: loadingAppointments, refetch: refetchAppointments } = useQuery({
    queryKey: ['upcoming-appointments', patientId],
    queryFn: () => fetchUpcomingAppointments(patientId!, token!),
    enabled: !!patientId && !!token,
    staleTime: 10000, // 10 seconds
    refetchInterval: isConnected ? 60000 : false, // 1 minute when connected
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  })

  const { data: vitals, isLoading: loadingVitals, refetch: refetchVitals } = useQuery({
    queryKey: ['recent-vitals', patientId],
    queryFn: () => fetchRecentVitals(patientId!, token!),
    enabled: !!patientId && !!token,
    staleTime: 60000, // 1 minute
    refetchInterval: isConnected ? 120000 : false, // 2 minutes when connected
    refetchOnWindowFocus: true,
  })

  const { data: prescriptions, isLoading: loadingPrescriptions, refetch: refetchPrescriptions } = useQuery({
    queryKey: ['active-prescriptions', patientId],
    queryFn: () => fetchActivePrescriptions(patientId!, token!),
    enabled: !!patientId && !!token,
    staleTime: 120000, // 2 minutes
    refetchInterval: isConnected ? 300000 : false, // 5 minutes when connected
    refetchOnWindowFocus: true,
  })

  const { data: notifications, isLoading: loadingNotifications, refetch: refetchNotifications } = useQuery({
    queryKey: ['notifications', user?.id],
    queryFn: () => fetchNotifications(user!.id, token!),
    enabled: !!user?.id && !!token,
    staleTime: 30000, // 30 seconds
    refetchInterval: isConnected ? 60000 : false, // 1 minute when connected
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  })

  // Manual refresh function
  const refreshAllData = async () => {
    const promises = []
    
    promises.push(refetchPatient())
    promises.push(refetchAppointments())
    promises.push(refetchVitals())
    promises.push(refetchPrescriptions())
    promises.push(refetchNotifications())
    
    try {
      await Promise.all(promises)
      console.log('✅ All patient data refreshed successfully')
    } catch (error) {
      console.error('❌ Error refreshing patient data:', error)
    }
  }

  // Calculate health metrics with real-time updates
  const healthScore = React.useMemo(() => {
    if (!vitals || !prescriptions) return 0
    let score = 85 // Base score
    
    // Recent vitals check
    if (vitals.length > 0) {
      const recent = vitals[0]
      const bpNormal = recent.bloodPressure && 
        recent.bloodPressure.systolic >= 90 && recent.bloodPressure.systolic <= 140 &&
        recent.bloodPressure.diastolic >= 60 && recent.bloodPressure.diastolic <= 90
      
      if (bpNormal) score += 5
      
      if (recent.heartRate && recent.heartRate >= 60 && recent.heartRate <= 100) score += 5
    }
    
    // Medication adherence
    const activePrescriptions = prescriptions.filter((p: any) => p.status === 'ACTIVE')
    if (activePrescriptions.length === 0) score += 5 // No active medications needed
    
    return Math.min(100, score)
  }, [vitals, prescriptions])

  const quickStats = [
    { 
      label: 'Next Appointment', 
      value: appointments && appointments.length > 0 
        ? format(new Date(appointments[0].dateTime), 'MMM dd, h:mm a')
        : 'None scheduled',
      icon: CalendarDaysIcon, 
      color: 'blue',
      urgent: appointments && appointments.length > 0 && isToday(new Date(appointments[0].dateTime))
    },
    { 
      label: 'Active Prescriptions', 
      value: prescriptions ? prescriptions.filter((p: any) => p.status === 'ACTIVE').length.toString() : '0',
      icon: ClipboardDocumentListIcon, 
      color: 'green',
      urgent: false
    },
    { 
      label: 'Unread Messages', 
      value: notifications ? notifications.filter((n: any) => !n.isRead).length.toString() : '0',
      icon: ChatBubbleLeftRightIcon, 
      color: 'yellow',
      urgent: notifications && notifications.filter((n: any) => !n.isRead).length > 0
    },
    { 
      label: 'Health Score', 
      value: `${healthScore}%`,
      icon: HeartIcon, 
      color: healthScore >= 90 ? 'green' : healthScore >= 70 ? 'yellow' : 'red',
      urgent: healthScore < 70
    },
  ]

  if (loadingPatient || !patientId) {
    return (
      <div className="animate-pulse space-y-4 p-6">
        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
        <div className="h-8 bg-gray-200 rounded w-1/2"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    )
  }

  if (compact) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Patient Overview</h3>
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <button
              onClick={refreshAllData}
              className="p-1 hover:bg-gray-100 rounded"
              title="Refresh data"
            >
              <ArrowPathIcon className="h-4 w-4 text-gray-500" />
            </button>
            {lastUpdate && (
              <span className="text-xs text-gray-500">
                Updated {formatDistanceToNow(lastUpdate, { addSuffix: true })}
              </span>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          {quickStats.slice(0, 4).map((stat, index) => (
            <div key={index} className={`p-3 rounded-lg border ${stat.urgent ? 'ring-2 ring-red-200 bg-red-50' : 'bg-gray-50'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-600">{stat.label}</p>
                  <p className="text-sm font-semibold text-gray-900">{stat.value}</p>
                </div>
                <stat.icon className={`h-4 w-4 text-${stat.color}-600`} />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with real-time status */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">Patient Dashboard</h1>
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-sm text-gray-500">
                  {isConnected ? 'Live updates' : 'Offline'}
                </span>
                {lastUpdate && (
                  <span className="text-xs text-gray-400">
                    • Last updated {formatDistanceToNow(lastUpdate, { addSuffix: true })}
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={refreshAllData}
                className="flex items-center px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 border border-gray-200 rounded-md hover:bg-gray-50"
                title="Refresh all data"
              >
                <ArrowPathIcon className="h-4 w-4 mr-1" />
                Refresh
              </button>
              
              <div className="relative">
                <BellIcon className="h-6 w-6 text-gray-500 cursor-pointer hover:text-gray-700" />
                {notifications && notifications.filter((n: any) => !n.isRead).length > 0 && (
                  <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-xs text-white font-bold">
                      {notifications.filter((n: any) => !n.isRead).length}
                    </span>
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <UserCircleIcon className="h-8 w-8 text-gray-500" />
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-gray-700">
                    {patientData ? `${patientData.firstName} ${patientData.lastName}` : user?.email}
                  </span>
                  <span className="text-xs text-gray-500">Patient</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900">
            Welcome back{patientData ? `, ${patientData.firstName}` : ''}!
          </h2>
          <p className="text-gray-600">Here's your health overview for today.</p>
          {appointments && appointments.length > 0 && isToday(new Date(appointments[0].dateTime)) && (
            <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <ClockIcon className="h-4 w-4 inline mr-1" />
                You have an appointment today at {format(new Date(appointments[0].dateTime), 'h:mm a')} 
                with Dr. {appointments[0].doctor?.firstName} {appointments[0].doctor?.lastName}
              </p>
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {quickStats.map((stat, index) => (
            <div key={index} className={`bg-white rounded-lg shadow-sm border p-6 ${stat.urgent ? 'ring-2 ring-red-200' : ''}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                  {stat.urgent && (
                    <p className="text-xs text-red-600 mt-1">Requires attention</p>
                  )}
                </div>
                <stat.icon className={`h-8 w-8 text-${stat.color}-600`} />
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Link href="/patient/appointments/book">
                <Button className="w-full justify-start" variant="outline">
                  <CalendarDaysIcon className="h-5 w-5 mr-2" />
                  Book Appointment
                </Button>
              </Link>
              <Link href="/patient/vitals/log">
                <Button className="w-full justify-start" variant="outline">
                  <HeartIcon className="h-5 w-5 mr-2" />
                  Log Vital Signs
                </Button>
              </Link>
              <Link href="/patient/prescriptions">
                <Button className="w-full justify-start" variant="outline">
                  <ClipboardDocumentListIcon className="h-5 w-5 mr-2" />
                  View Prescriptions
                </Button>
              </Link>
            </div>
          </div>

          {/* Upcoming Appointments */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Upcoming Appointments</h3>
              <div className="flex items-center space-x-2">
                {loadingAppointments && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                )}
                <Link href="/patient/appointments">
                  <Button variant="ghost" size="sm">View All</Button>
                </Link>
              </div>
            </div>
            <div className="space-y-4">
              {loadingAppointments ? (
                <div className="animate-pulse space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              ) : appointments && appointments.length > 0 ? (
                appointments.slice(0, 3).map((appointment: any, index: number) => (
                  <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          Dr. {appointment.doctor?.firstName} {appointment.doctor?.lastName}
                        </p>
                        <p className="text-sm text-gray-600">{appointment.doctor?.specialization}</p>
                        <p className="text-xs text-gray-500">
                          {format(new Date(appointment.dateTime), 'MMM dd, yyyy • h:mm a')}
                        </p>
                        <p className="text-xs text-blue-600">{appointment.type.replace('_', ' ')}</p>
                      </div>
                      <div className="text-right">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          appointment.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' :
                          appointment.status === 'SCHEDULED' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {appointment.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <CalendarDaysIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No upcoming appointments</p>
                  <Link href="/patient/appointments/book">
                    <Button className="mt-2" size="sm">Book Your First Appointment</Button>
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Recent Notifications */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
              <div className="flex items-center space-x-2">
                {loadingNotifications && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                )}
                <Link href="/patient/notifications">
                  <Button variant="ghost" size="sm">View All</Button>
                </Link>
              </div>
            </div>
            <div className="space-y-4">
              {loadingNotifications ? (
                <div className="animate-pulse space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              ) : notifications && notifications.length > 0 ? (
                notifications.slice(0, 5).map((notification: any, index: number) => (
                  <div key={index} className={`flex items-start space-x-3 p-3 rounded-lg ${
                    !notification.isRead ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'
                  }`}>
                    <div className="flex-shrink-0">
                      {notification.type === 'APPOINTMENT_REMINDER' && <CalendarDaysIcon className="h-5 w-5 text-blue-600" />}
                      {notification.type === 'APPOINTMENT_CONFIRMED' && <CheckCircleIcon className="h-5 w-5 text-green-600" />}
                      {notification.type === 'LAB_RESULTS_AVAILABLE' && <ClipboardDocumentListIcon className="h-5 w-5 text-green-600" />}
                      {notification.type === 'SYSTEM_ALERT' && <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                      <p className="text-xs text-gray-600">{notification.message}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                    {!notification.isRead && (
                      <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <BellIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No notifications</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Health Overview */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Health Overview</h3>
            <div className="flex items-center space-x-2">
              {loadingVitals && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              )}
              <Link href="/patient/vitals">
                <Button variant="ghost" size="sm">
                  View Trends
                </Button>
              </Link>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {loadingVitals ? (
              <div className="animate-pulse col-span-4">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ) : vitals && vitals.length > 0 ? (
              <>
                {vitals[0].bloodPressure && (
                  <div>
                    <p className="text-sm text-gray-600">Blood Pressure</p>
                    <p className="text-lg font-semibold">
                      {vitals[0].bloodPressure.systolic}/{vitals[0].bloodPressure.diastolic}
                    </p>
                    <p className="text-xs text-gray-500">mmHg</p>
                  </div>
                )}
                {vitals[0].heartRate && (
                  <div>
                    <p className="text-sm text-gray-600">Heart Rate</p>
                    <p className="text-lg font-semibold">{vitals[0].heartRate}</p>
                    <p className="text-xs text-gray-500">bpm</p>
                  </div>
                )}
                {vitals[0].temperature && (
                  <div>
                    <p className="text-sm text-gray-600">Temperature</p>
                    <p className="text-lg font-semibold">{vitals[0].temperature}°F</p>
                    <p className="text-xs text-gray-500">
                      {formatDistanceToNow(new Date(vitals[0].recordedAt), { addSuffix: true })}
                    </p>
                  </div>
                )}
                {vitals[0].weight && (
                  <div>
                    <p className="text-sm text-gray-600">Weight</p>
                    <p className="text-lg font-semibold">{vitals[0].weight}</p>
                    <p className="text-xs text-gray-500">lbs</p>
                  </div>
                )}
              </>
            ) : (
              <div className="col-span-4 text-center py-8">
                <HeartIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">No vital signs recorded yet</p>
                <Link href="/patient/vitals/log">
                  <Button>
                    <PlusCircleIcon className="h-4 w-4 mr-2" />
                    Log Your First Reading
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
