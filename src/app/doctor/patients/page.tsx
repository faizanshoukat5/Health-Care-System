'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/stores/auth-store'
import { useQuery } from '@tanstack/react-query'
import { useDoctorUpdates } from '@/hooks/useWebSocket'
import { Button } from '@/components/ui/button'
import { 
  UserGroupIcon,
  ChevronLeftIcon,
  MagnifyingGlassIcon,
  PhoneIcon,
  EnvelopeIcon,
  CalendarDaysIcon,
  ClipboardDocumentListIcon,
  HeartIcon,
  DocumentTextIcon,
  BellIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'
import { format } from 'date-fns'

// API function
const fetchPatients = async (doctorId: string, token: string) => {
  const response = await fetch(`/api/doctor/${doctorId}/patients`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  })
  if (!response.ok) throw new Error('Failed to fetch patients')
  return response.json()
}

export default function DoctorPatientsPage() {
  const { user, token } = useAuth()
  const [doctorId, setDoctorId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

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

  // Data query with enhanced real-time updates
  const { data: patients, isLoading, refetch } = useQuery({
    queryKey: ['doctor-patients', doctorId],
    queryFn: () => fetchPatients(doctorId!, token!),
    enabled: !!doctorId && !!token,
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000, // Refetch every minute
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  })

  // Enhanced real-time updates with WebSocket
  const { newPatients, newAppointments, isConnected, clearUpdates, lastUpdate } = useDoctorUpdates(doctorId || undefined)

  // Real-time updates for new patients
  useEffect(() => {
    if (!doctorId || !token) return

    // Listen for patient list updates
    const handlePatientListUpdate = () => {
      console.log('[Doctor] Patient list update received, refetching...')
      refetch()
    }

    // Listen for new appointment bookings
    const handleNewAppointment = () => {
      console.log('[Doctor] New appointment detected, refreshing patient list...')
      setTimeout(() => refetch(), 1000) // Small delay to ensure DB is updated
    }

    // Listen for patient list refresh requests
    const handlePatientListRefresh = () => {
      console.log('[Doctor] Patient list refresh requested, refetching...')
      refetch()
    }

    // Custom event listeners for real-time updates
    window.addEventListener('patient-list-update', handlePatientListUpdate)
    window.addEventListener('new-appointment-booked', handleNewAppointment)
    window.addEventListener('patient-list-refresh', handlePatientListRefresh)

    // Cleanup
    return () => {
      window.removeEventListener('patient-list-update', handlePatientListUpdate)
      window.removeEventListener('new-appointment-booked', handleNewAppointment)
      window.removeEventListener('patient-list-refresh', handlePatientListRefresh)
    }
  }, [doctorId, token, refetch])

  if (!user) {
    return <div>Please log in to access patients</div>
  }

  // Filter patients
  const filteredPatients = patients?.filter((patient: any) => {
    return patient.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
           patient.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
           patient.user.email.toLowerCase().includes(searchTerm.toLowerCase())
  }) || []

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <Link href="/doctor/dashboard">
                <Button variant="ghost" size="sm">
                  <ChevronLeftIcon className="h-4 w-4 mr-1" />
                  Back to Dashboard
                </Button>
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">My Patients</h1>
              
              {/* Real-time connection status and notifications */}
              <div className="flex items-center space-x-2">
                {isConnected ? (
                  <div className="flex items-center space-x-1 text-green-600">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-xs font-medium">Live</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-1 text-gray-400">
                    <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                    <span className="text-xs">Offline</span>
                  </div>
                )}
                
                {(newPatients > 0 || newAppointments > 0) && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={clearUpdates}
                    className="relative"
                  >
                    <BellIcon className="h-4 w-4 mr-1" />
                    {newPatients > 0 && `${newPatients} new patient${newPatients > 1 ? 's' : ''}`}
                    {newPatients > 0 && newAppointments > 0 && ', '}
                    {newAppointments > 0 && `${newAppointments} new appointment${newAppointments > 1 ? 's' : ''}`}
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="relative">
            <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by patient name or email..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Patients List */}
        <div className="bg-white rounded-lg shadow-sm border">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading patients...</p>
            </div>
          ) : filteredPatients.length === 0 ? (
            <div className="p-8 text-center">
              <UserGroupIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No patients found</h3>
              <p className="text-gray-500">
                {searchTerm 
                  ? 'Try adjusting your search criteria.' 
                  : 'You don\'t have any patients yet.'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredPatients.map((patient: any) => (
                <div key={patient.id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-semibold text-lg">
                            {patient.firstName[0]}{patient.lastName[0]}
                          </span>
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-gray-900">
                          {patient.firstName} {patient.lastName}
                        </h3>
                        <p className="text-sm text-gray-600">{patient.user.email}</p>
                        <div className="flex items-center space-x-4 mt-2">
                          <div className="text-sm text-gray-500">
                            <strong>Age:</strong> {patient.age || 'N/A'}
                          </div>
                          <div className="text-sm text-gray-500">
                            <strong>Gender:</strong> {patient.gender || 'N/A'}
                          </div>
                          <div className="text-sm text-gray-500">
                            <strong>Phone:</strong> {patient.phoneNumber || 'N/A'}
                          </div>
                        </div>
                        {patient.appointments?.length > 0 && (
                          <div className="mt-2 text-sm text-gray-500">
                            <strong>Last Appointment:</strong> {format(new Date(patient.appointments[0].dateTime), 'MMM dd, yyyy')}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col space-y-2">
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          <EnvelopeIcon className="h-4 w-4 mr-1" />
                          Email
                        </Button>
                        {patient.phoneNumber && (
                          <Button size="sm" variant="outline">
                            <PhoneIcon className="h-4 w-4 mr-1" />
                            Call
                          </Button>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          <CalendarDaysIcon className="h-4 w-4 mr-1" />
                          Schedule
                        </Button>
                        <Button size="sm" variant="outline">
                          <ClipboardDocumentListIcon className="h-4 w-4 mr-1" />
                          Records
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Patient Summary Cards */}
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Total Appointments</p>
                          <p className="text-xl font-semibold text-gray-900">{patient.appointments?.length || 0}</p>
                        </div>
                        <CalendarDaysIcon className="h-8 w-8 text-blue-600" />
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Medical Records</p>
                          <p className="text-xl font-semibold text-gray-900">{patient.medicalRecords?.length || 0}</p>
                        </div>
                        <DocumentTextIcon className="h-8 w-8 text-green-600" />
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Recent Vitals</p>
                          <p className="text-xl font-semibold text-gray-900">
                            {patient.vitals?.length > 0 ? 'Updated' : 'None'}
                          </p>
                        </div>
                        <HeartIcon className="h-8 w-8 text-red-600" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
