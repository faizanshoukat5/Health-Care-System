'use client'

import React from 'react'
import { useAuth } from '@/stores/auth-store'
import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { 
  CalendarDaysIcon,
  ClockIcon,
  MapPinIcon,
  VideoCameraIcon,
  ChevronLeftIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'
import { format, isToday, isTomorrow, isPast } from 'date-fns'

const fetchAppointments = async (token: string) => {
  const response = await fetch('/api/patient/appointments', {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  })
  if (!response.ok) throw new Error('Failed to fetch appointments')
  return response.json()
}

export default function AppointmentsPage() {
  const { user, token } = useAuth()

  const { data: appointments, isLoading } = useQuery({
    queryKey: ['all-appointments'],
    queryFn: () => fetchAppointments(token!),
    enabled: !!token
  })

  const getStatusBadge = (status: string) => {
    const badges = {
      SCHEDULED: 'bg-blue-100 text-blue-800',
      CONFIRMED: 'bg-green-100 text-green-800',
      COMPLETED: 'bg-gray-100 text-gray-800',
      CANCELLED: 'bg-red-100 text-red-800'
    }
    return badges[status as keyof typeof badges] || 'bg-gray-100 text-gray-800'
  }

  const getAppointmentIcon = (type: string) => {
    return type === 'TELEMEDICINE' ? (
      <VideoCameraIcon className="h-5 w-5 text-blue-600" />
    ) : (
      <MapPinIcon className="h-5 w-5 text-green-600" />
    )
  }

  if (!user) {
    return <div>Please log in to view appointments</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <Link href="/patient/dashboard">
                <Button variant="ghost" size="sm">
                  <ChevronLeftIcon className="h-4 w-4 mr-1" />
                  Back to Dashboard
                </Button>
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">My Appointments</h1>
            </div>
            <Link href="/patient/appointments/book">
              <Button>
                <CalendarDaysIcon className="h-4 w-4 mr-2" />
                Book New Appointment
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-lg shadow-sm border p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : appointments && appointments.length > 0 ? (
          <div className="space-y-6">
            {appointments.map((appointment: any) => (
              <div key={appointment.id} className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      {getAppointmentIcon(appointment.type)}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          Dr. {appointment.doctor.firstName} {appointment.doctor.lastName}
                        </h3>
                        <p className="text-sm text-gray-600">{appointment.doctor.specialization}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(appointment.status)}`}>
                        {appointment.status}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <CalendarDaysIcon className="h-4 w-4" />
                        <span>
                          {format(new Date(appointment.dateTime), 'EEEE, MMMM d, yyyy')}
                          {isToday(new Date(appointment.dateTime)) && (
                            <span className="ml-1 text-blue-600 font-medium">(Today)</span>
                          )}
                          {isTomorrow(new Date(appointment.dateTime)) && (
                            <span className="ml-1 text-green-600 font-medium">(Tomorrow)</span>
                          )}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <ClockIcon className="h-4 w-4" />
                        <span>{format(new Date(appointment.dateTime), 'h:mm a')}</span>
                        <span className="text-gray-400">({appointment.duration} minutes)</span>
                      </div>
                    </div>

                    {appointment.reason && (
                      <div className="mb-4">
                        <p className="text-sm text-gray-700">
                          <strong>Reason:</strong> {appointment.reason}
                        </p>
                      </div>
                    )}

                    {appointment.meetingLink && (
                      <div className="mb-4">
                        <a 
                          href={appointment.meetingLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
                        >
                          <VideoCameraIcon className="h-4 w-4 mr-1" />
                          Join Video Call
                        </a>
                      </div>
                    )}
                  </div>

                  <div className="flex space-x-2">
                    {appointment.status === 'SCHEDULED' && !isPast(new Date(appointment.dateTime)) && (
                      <>
                        <Button size="sm" variant="outline">
                          <CheckCircleIcon className="h-4 w-4 mr-1" />
                          Confirm
                        </Button>
                        <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                          <XCircleIcon className="h-4 w-4 mr-1" />
                          Cancel
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <CalendarDaysIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No appointments</h3>
            <p className="mt-1 text-sm text-gray-500">
              You don't have any appointments scheduled.
            </p>
            <div className="mt-6">
              <Link href="/patient/appointments/book">
                <Button>
                  <CalendarDaysIcon className="h-4 w-4 mr-2" />
                  Book Your First Appointment
                </Button>
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
