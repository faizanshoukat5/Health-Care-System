'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/stores/auth-store'
import { useQuery } from '@tanstack/react-query'
import { useDoctorUpdates } from '@/hooks/useWebSocket'
import { Button } from '@/components/ui/button'
import { 
  CalendarDaysIcon,
  UserGroupIcon,
  ClipboardDocumentListIcon,
  DocumentTextIcon,
  ChartBarIcon,
  BellIcon,
  UserCircleIcon,
  ClockIcon,
  MapPinIcon,
  VideoCameraIcon,
  PhoneIcon,
  CurrencyDollarIcon,
  TrophyIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'
import { format, isToday, isTomorrow } from 'date-fns'

// API functions
const fetchDoctorData = async (doctorId: string, token: string) => {
  const response = await fetch(`/api/doctor/${doctorId}/dashboard`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  })
  if (!response.ok) throw new Error('Failed to fetch doctor data')
  return response.json()
}

const fetchTodayAppointments = async (doctorId: string, token: string) => {
  const response = await fetch(`/api/doctor/${doctorId}/appointments/today`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  })
  if (!response.ok) throw new Error('Failed to fetch appointments')
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

export default function DoctorDashboard() {
  const { user, token, logout } = useAuth()
  const [doctorId, setDoctorId] = useState<string | null>(null)

  // Fetch doctor ID from user profile
  useEffect(() => {
    const fetchDoctorProfile = async () => {
      if (user?.id && token) {
        try {
          const response = await fetch(`/api/user/${user.id}/profile`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            credentials: 'include',
          })
          const data = await response.json()
          if (data.doctor) {
            setDoctorId(data.doctor.id)
          }
        } catch (error) {
          console.error('Failed to fetch doctor profile:', error)
        }
      }
    }
    fetchDoctorProfile()
  }, [user, token])

  // Data queries with enhanced real-time updates
  const { data: doctorData, isLoading: loadingDoctor, refetch: refetchDoctorData } = useQuery({
    queryKey: ['doctor-dashboard', doctorId],
    queryFn: () => fetchDoctorData(doctorId!, token!),
    enabled: !!doctorId && !!token,
    staleTime: 60000, // 1 minute
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
    refetchOnWindowFocus: true,
  })

  const { data: todayAppointments, isLoading: loadingAppointments, refetch: refetchAppointments } = useQuery({
    queryKey: ['today-appointments', doctorId],
    queryFn: () => fetchTodayAppointments(doctorId!, token!),
    enabled: !!doctorId && !!token,
    staleTime: 30000, // 30 seconds
    refetchInterval: 2 * 60 * 1000, // Refetch every 2 minutes
    refetchOnWindowFocus: true,
  })

  const { data: notifications, refetch: refetchNotifications } = useQuery({
    queryKey: ['doctor-notifications', user?.id],
    queryFn: () => fetchNotifications(user!.id, token!),
    enabled: !!user?.id && !!token,
    staleTime: 30000, // 30 seconds
    refetchInterval: 2 * 60 * 1000, // Refetch every 2 minutes
    refetchOnWindowFocus: true,
  })

  // Enhanced real-time updates with WebSocket
  const { newPatients, newAppointments, isConnected, clearUpdates } = useDoctorUpdates(doctorId || undefined)

  // Real-time updates for new appointments and patients
  useEffect(() => {
    if (!doctorId || !token) return

    // Listen for new appointment bookings
    const handleNewAppointment = (event: any) => {
      console.log('[Doctor Dashboard] New appointment detected:', event.detail)
      
      // Refresh appointments and doctor data
      refetchAppointments()
      refetchDoctorData()
      refetchNotifications()
      
      // Show notification
      if (event.detail?.appointment) {
        const appointment = event.detail.appointment
        console.log(`🔔 New appointment booked: ${appointment.reason}`)
      }
    }

    // Listen for patient list updates
    const handlePatientUpdate = (event: any) => {
      console.log('[Doctor Dashboard] Patient list update:', event.detail)
      
      // Refresh doctor data (includes patient count)
      refetchDoctorData()
    }

    // Add event listeners
    window.addEventListener('new-appointment-booked', handleNewAppointment)
    window.addEventListener('patient-list-update', handlePatientUpdate)
    window.addEventListener('patient-list-refresh', handlePatientUpdate)

    return () => {
      window.removeEventListener('new-appointment-booked', handleNewAppointment)
      window.removeEventListener('patient-list-update', handlePatientUpdate)
      window.removeEventListener('patient-list-refresh', handlePatientUpdate)
    }
  }, [doctorId, token, refetchAppointments, refetchDoctorData, refetchNotifications])

  const quickStats = [
    {
      label: 'Today\'s Appointments',
      value: todayAppointments?.length || 0,
      icon: CalendarDaysIcon,
      color: 'text-blue-600',
      bg: 'bg-blue-50'
    },
    {
      label: 'Total Patients',
      value: doctorData?.totalPatients || 0,
      icon: UserGroupIcon,
      color: 'text-green-600',
      bg: 'bg-green-50'
    },
    {
      label: 'This Month Revenue',
      value: `$${doctorData?.monthlyRevenue || 0}`,
      icon: CurrencyDollarIcon,
      color: 'text-purple-600',
      bg: 'bg-purple-50'
    },
    {
      label: 'Patient Satisfaction',
      value: `${doctorData?.satisfaction || 0}%`,
      icon: TrophyIcon,
      color: 'text-yellow-600',
      bg: 'bg-yellow-50'
    }
  ]

  if (!user) {
    return <div>Please log in to access the doctor dashboard</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <ClipboardDocumentListIcon className="h-8 w-8 text-blue-600" />
                <h1 className="text-2xl font-bold text-gray-900">Doctor Dashboard</h1>
              </div>
            </div>

            <div className="flex items-center space-x-6">
              {/* Notifications */}
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
              
              {/* Profile */}
              <div className="flex items-center space-x-2">
                <UserCircleIcon className="h-8 w-8 text-gray-500" />
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-gray-700">
                    {doctorData ? `Dr. ${doctorData.firstName} ${doctorData.lastName}` : user?.email}
                  </span>
                  <span className="text-xs text-gray-500">
                    {doctorData?.specialization || 'Doctor'}
                  </span>
                </div>
                <Button 
                  onClick={logout} 
                  variant="ghost" 
                  size="sm"
                  className="text-gray-500 hover:text-gray-700"
                >
                  Logout
                </Button>
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
            Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'}
            {doctorData ? `, Dr. ${doctorData.firstName}` : ''}!
          </h2>
          <p className="text-gray-600">Here's your practice overview for today.</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {quickStats.map((stat, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-lg ${stat.bg}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Link href="/doctor/appointments">
                <Button className="w-full justify-start" variant="outline">
                  <CalendarDaysIcon className="h-5 w-5 mr-2" />
                  View All Appointments
                </Button>
              </Link>
              <Link href="/doctor/patients">
                <Button className="w-full justify-start" variant="outline">
                  <UserGroupIcon className="h-5 w-5 mr-2" />
                  Patient List
                </Button>
              </Link>
              <Link href="/doctor/prescriptions">
                <Button className="w-full justify-start" variant="outline">
                  <DocumentTextIcon className="h-5 w-5 mr-2" />
                  Manage Prescriptions
                </Button>
              </Link>
              <Link href="/doctor/schedule">
                <Button className="w-full justify-start" variant="outline">
                  <ClockIcon className="h-5 w-5 mr-2" />
                  Update Schedule
                </Button>
              </Link>
              <Link href="/doctor/telemedicine">
                <Button className="w-full justify-start" variant="outline">
                  <VideoCameraIcon className="h-5 w-5 mr-2" />
                  Video Consultations
                </Button>
              </Link>
              <Link href="/doctor/emergency">
                <Button className="w-full justify-start bg-red-600 hover:bg-red-700 text-white">
                  <PhoneIcon className="h-5 w-5 mr-2" />
                  Emergency Cases
                </Button>
              </Link>
            </div>
          </div>

          {/* Today's Appointments */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Today's Schedule</h3>
              <Link href="/doctor/appointments">
                <Button variant="ghost" size="sm">View All</Button>
              </Link>
            </div>
            <div className="space-y-4">
              {loadingAppointments ? (
                <div className="animate-pulse space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              ) : todayAppointments && todayAppointments.length > 0 ? (
                todayAppointments.slice(0, 5).map((appointment: any, index: number) => (
                  <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">
                          {appointment.patient?.firstName} {appointment.patient?.lastName}
                        </p>
                        <p className="text-sm text-gray-600">
                          {format(new Date(appointment.dateTime), 'h:mm a')} • {appointment.type}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {appointment.reason}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {appointment.type === 'TELEMEDICINE' ? (
                          <VideoCameraIcon className="h-4 w-4 text-blue-600" />
                        ) : (
                          <MapPinIcon className="h-4 w-4 text-green-600" />
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6">
                  <CalendarDaysIcon className="mx-auto h-8 w-8 text-gray-400" />
                  <p className="text-sm text-gray-500 mt-2">No appointments today</p>
                </div>
              )}
            </div>
          </div>

          {/* Recent Notifications */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Notifications</h3>
            <div className="space-y-3">
              {notifications && notifications.length > 0 ? (
                notifications.slice(0, 5).map((notification: any, index: number) => (
                  <div key={index} className={`p-3 rounded-lg border ${!notification.isRead ? 'bg-blue-50 border-blue-200' : 'bg-gray-50'}`}>
                    <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                    <p className="text-xs text-gray-600 mt-1">{notification.message}</p>
                    <p className="text-xs text-gray-400 mt-2">
                      {format(new Date(notification.createdAt), 'MMM d, h:mm a')}
                    </p>
                  </div>
                ))
              ) : (
                <div className="text-center py-6">
                  <BellIcon className="mx-auto h-8 w-8 text-gray-400" />
                  <p className="text-sm text-gray-500 mt-2">No new notifications</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Analytics Section */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Practice Analytics</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {doctorData?.weeklyAppointments || 0}
              </div>
              <div className="text-sm text-gray-600">Appointments This Week</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {doctorData?.avgConsultationTime || 0} min
              </div>
              <div className="text-sm text-gray-600">Avg Consultation Time</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {doctorData?.patientRetention || 0}%
              </div>
              <div className="text-sm text-gray-600">Patient Retention Rate</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
