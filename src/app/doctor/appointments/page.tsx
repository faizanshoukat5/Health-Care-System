'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/stores/auth-store'
import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { 
  CalendarDaysIcon,
  ChevronLeftIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  PhoneIcon,
  VideoCameraIcon,
  ClockIcon,
  MapPinIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'
import { format, isToday, isTomorrow, isPast } from 'date-fns'

// API function
const fetchAppointments = async (doctorId: string, token: string) => {
  const response = await fetch(`/api/doctor/${doctorId}/appointments`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  })
  if (!response.ok) throw new Error('Failed to fetch appointments')
  return response.json()
}

export default function DoctorAppointmentsPage() {
  const { user, token } = useAuth()
  const [doctorId, setDoctorId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')

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

  // Data query
  const { data: appointments, isLoading } = useQuery({
    queryKey: ['doctor-appointments', doctorId],
    queryFn: () => fetchAppointments(doctorId!, token!),
    enabled: !!doctorId && !!token,
  })

  if (!user) {
    return <div>Please log in to access appointments</div>
  }

  // Filter appointments
  const filteredAppointments = appointments?.filter((appointment: any) => {
    const matchesSearch = appointment.patient.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         appointment.patient.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         appointment.type.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'ALL' || appointment.status === statusFilter
    return matchesSearch && matchesStatus
  }) || []

  const getAppointmentStatus = (appointment: any) => {
    const appointmentDate = new Date(appointment.dateTime)
    if (isPast(appointmentDate) && appointment.status !== 'COMPLETED') {
      return 'MISSED'
    }
    return appointment.status
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return 'bg-green-100 text-green-800'
      case 'SCHEDULED': return 'bg-blue-100 text-blue-800'
      case 'COMPLETED': return 'bg-gray-100 text-gray-800'
      case 'CANCELLED': return 'bg-red-100 text-red-800'
      case 'MISSED': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getDateLabel = (date: Date) => {
    if (isToday(date)) return 'Today'
    if (isTomorrow(date)) return 'Tomorrow'
    return format(date, 'MMM dd, yyyy')
  }

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
              <h1 className="text-2xl font-bold text-gray-900">Appointments</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by patient name or appointment type..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <FunnelIcon className="h-5 w-5 text-gray-400" />
              <select
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="ALL">All Status</option>
                <option value="SCHEDULED">Scheduled</option>
                <option value="CONFIRMED">Confirmed</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        {/* Appointments List */}
        <div className="bg-white rounded-lg shadow-sm border">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading appointments...</p>
            </div>
          ) : filteredAppointments.length === 0 ? (
            <div className="p-8 text-center">
              <CalendarDaysIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No appointments found</h3>
              <p className="text-gray-500">
                {searchTerm || statusFilter !== 'ALL' 
                  ? 'Try adjusting your search or filter criteria.' 
                  : 'You don\'t have any appointments scheduled yet.'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredAppointments.map((appointment: any) => {
                const appointmentDate = new Date(appointment.dateTime)
                const status = getAppointmentStatus(appointment)
                
                return (
                  <div key={appointment.id} className="p-6 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4">
                          <div className="flex-shrink-0">
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-blue-600 font-semibold">
                                {appointment.patient.firstName[0]}{appointment.patient.lastName[0]}
                              </span>
                            </div>
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg font-medium text-gray-900">
                              {appointment.patient.firstName} {appointment.patient.lastName}
                            </h3>
                            <p className="text-sm text-gray-600">{appointment.patient.user.email}</p>
                            <div className="flex items-center space-x-4 mt-1">
                              <div className="flex items-center text-sm text-gray-500">
                                <CalendarDaysIcon className="h-4 w-4 mr-1" />
                                {getDateLabel(appointmentDate)}
                              </div>
                              <div className="flex items-center text-sm text-gray-500">
                                <ClockIcon className="h-4 w-4 mr-1" />
                                {format(appointmentDate, 'h:mm a')}
                              </div>
                              <div className="flex items-center text-sm text-gray-500">
                                <MapPinIcon className="h-4 w-4 mr-1" />
                                {appointment.location || 'Office'}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">
                            {appointment.type.replace('_', ' ')}
                          </p>
                          <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
                            {status}
                          </span>
                        </div>
                        <div className="flex space-x-2">
                          {appointment.type === 'VIDEO_CONSULTATION' && (
                            <Button size="sm" variant="outline">
                              <VideoCameraIcon className="h-4 w-4 mr-1" />
                              Join Video
                            </Button>
                          )}
                          <Button size="sm" variant="outline">
                            <PhoneIcon className="h-4 w-4 mr-1" />
                            Contact
                          </Button>
                        </div>
                      </div>
                    </div>
                    {appointment.notes && (
                      <div className="mt-4 ml-16">
                        <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                          <strong>Notes:</strong> {appointment.notes}
                        </p>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
