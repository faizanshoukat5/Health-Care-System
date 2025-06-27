'use client'

import React, { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/stores/auth-store'
import { 
  ClockIcon,
  ChevronLeftIcon,
  CalendarDaysIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'

interface ScheduleDay {
  id?: string
  dayOfWeek: string
  startTime: string
  endTime: string
  isActive: boolean
  breakStart?: string
  breakEnd?: string
}

interface DoctorSchedule {
  availability: Record<string, ScheduleDay>
}

const daysOfWeek = [
  'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'
]

const dayDisplayNames = {
  MONDAY: 'Monday',
  TUESDAY: 'Tuesday', 
  WEDNESDAY: 'Wednesday',
  THURSDAY: 'Thursday',
  FRIDAY: 'Friday',
  SATURDAY: 'Saturday',
  SUNDAY: 'Sunday'
}

// Fetch doctor's current schedule
const fetchDoctorSchedule = async (doctorId: string, token: string) => {
  const response = await fetch(`/api/doctor/${doctorId}/schedule`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  })
  if (!response.ok) {
    if (response.status === 404) {
      // No schedule exists yet, return empty
      return { availability: {} }
    }
    throw new Error('Failed to fetch schedule')
  }
  return response.json()
}

// Update doctor's schedule
const updateDoctorSchedule = async (doctorId: string, availability: Record<string, ScheduleDay>, token: string) => {
  const response = await fetch(`/api/doctor/${doctorId}/schedule`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ availability }),
  })
  if (!response.ok) throw new Error('Failed to update schedule')
  return response.json()
}

export default function DoctorSchedulePage() {
  const { user, token } = useAuth()
  const queryClient = useQueryClient()
  const [editingDay, setEditingDay] = useState<string | null>(null)
  const [localSchedule, setLocalSchedule] = useState<Record<string, ScheduleDay>>({})

  // Get doctor profile to get doctorId
  const { data: doctorProfile } = useQuery({
    queryKey: ['doctor-profile', user?.id],
    queryFn: async () => {
      const response = await fetch(`/api/user/${user?.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      })
      if (!response.ok) throw new Error('Failed to fetch user profile')
      const result = await response.json()
      return result.user?.doctor
    },
    enabled: !!user && !!token
  })

  // Fetch current schedule
  const { data: scheduleData, isLoading } = useQuery({
    queryKey: ['doctor-schedule', doctorProfile?.id],
    queryFn: () => fetchDoctorSchedule(doctorProfile.id, token!),
    enabled: !!doctorProfile?.id && !!token
  })

  // Update schedule mutation
  const updateScheduleMutation = useMutation({
    mutationFn: (availability: Record<string, ScheduleDay>) => 
      updateDoctorSchedule(doctorProfile.id, availability, token!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctor-schedule'] })
      queryClient.invalidateQueries({ queryKey: ['doctors-available'] })
      setEditingDay(null)
    }
  })

  // Initialize local schedule when data loads
  React.useEffect(() => {
    if (scheduleData?.availability) {
      const initialized: Record<string, ScheduleDay> = {}
      daysOfWeek.forEach(day => {
        initialized[day] = scheduleData.availability[day] || {
          dayOfWeek: day,
          isActive: false,
          startTime: '09:00',
          endTime: '17:00',
          breakStart: '12:00',
          breakEnd: '13:00'
        }
      })
      setLocalSchedule(initialized)
    } else {
      // Initialize empty schedule
      const initialized: Record<string, ScheduleDay> = {}
      daysOfWeek.forEach(day => {
        initialized[day] = {
          dayOfWeek: day,
          isActive: false,
          startTime: '09:00',
          endTime: '17:00',
          breakStart: '12:00',
          breakEnd: '13:00'
        }
      })
      setLocalSchedule(initialized)
    }
  }, [scheduleData])

  const handleToggleDay = (day: string) => {
    const newSchedule = {
      ...localSchedule,
      [day]: {
        ...localSchedule[day],
        isActive: !localSchedule[day].isActive
      }
    }
    setLocalSchedule(newSchedule)
    updateScheduleMutation.mutate(newSchedule)
  }

  const handleUpdateTime = (day: string, field: keyof ScheduleDay, value: string) => {
    const newSchedule = {
      ...localSchedule,
      [day]: {
        ...localSchedule[day],
        [field]: value
      }
    }
    setLocalSchedule(newSchedule)
    // Debounce the update to avoid too many API calls
    setTimeout(() => {
      updateScheduleMutation.mutate(newSchedule)
    }, 500)
  }

  const formatTime = (time: string | null | undefined) => {
    if (!time) return 'Not set'
    // Convert 24-hour format to 12-hour format
    const [hours, minutes] = time.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
  }

  const currentSchedule = scheduleData?.availability || {}

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-lg font-medium text-gray-900">Access Denied</h2>
          <p className="text-gray-600 mt-2">Please log in to access the schedule page.</p>
          <Link href="/login" className="mt-4 inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Login
          </Link>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading schedule...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link 
                href="/doctor/dashboard"
                className="flex items-center text-gray-500 hover:text-gray-700"
              >
                <ChevronLeftIcon className="h-5 w-5 mr-1" />
                Back to Dashboard
              </Link>
              <div className="h-6 border-l border-gray-300" />
              <h1 className="text-xl font-semibold text-gray-900">My Schedule</h1>
            </div>

            <div className="flex items-center space-x-3">
              <CalendarDaysIcon className="h-5 w-5 text-blue-600" />
              <span className="text-sm text-gray-600">
                Dr. {doctorProfile?.firstName} {doctorProfile?.lastName}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Weekly Schedule</h2>
            <p className="text-sm text-gray-600 mt-1">
              Set your availability for each day of the week. Changes are saved automatically.
            </p>
          </div>

          <div className="p-6">
            {updateScheduleMutation.isPending && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-blue-700 text-sm">Updating schedule...</p>
              </div>
            )}

            <div className="space-y-6">
              {daysOfWeek.map((day) => {
                const daySchedule = localSchedule[day] || {
                  dayOfWeek: day,
                  isActive: false,
                  startTime: '09:00',
                  endTime: '17:00',
                  breakStart: '12:00',
                  breakEnd: '13:00'
                }
                const isEditing = editingDay === day

                return (
                  <div key={day} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <h3 className="text-lg font-medium text-gray-900">
                          {dayDisplayNames[day as keyof typeof dayDisplayNames]}
                        </h3>
                        <button
                          onClick={() => handleToggleDay(day)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            daySchedule.isActive ? 'bg-blue-600' : 'bg-gray-200'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              daySchedule.isActive ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>

                      {daySchedule.isActive && (
                        <button
                          onClick={() => setEditingDay(isEditing ? null : day)}
                          className="text-blue-600 hover:text-blue-700 text-sm"
                        >
                          {isEditing ? 'Done' : 'Edit Times'}
                        </button>
                      )}
                    </div>

                    {daySchedule.isActive && (
                      <div className="mt-4 grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Start Time
                          </label>
                          {isEditing ? (
                            <input
                              type="time"
                              value={daySchedule.startTime}
                              onChange={(e) => handleUpdateTime(day, 'startTime', e.target.value)}
                              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                            />
                          ) : (
                            <p className="text-gray-900">{formatTime(daySchedule.startTime)}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            End Time
                          </label>
                          {isEditing ? (
                            <input
                              type="time"
                              value={daySchedule.endTime}
                              onChange={(e) => handleUpdateTime(day, 'endTime', e.target.value)}
                              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                            />
                          ) : (
                            <p className="text-gray-900">{formatTime(daySchedule.endTime)}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Break Start
                          </label>
                          {isEditing ? (
                            <input
                              type="time"
                              value={daySchedule.breakStart || '12:00'}
                              onChange={(e) => handleUpdateTime(day, 'breakStart', e.target.value)}
                              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                            />
                          ) : (
                            <p className="text-gray-900">{formatTime(daySchedule.breakStart)}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Break End
                          </label>
                          {isEditing ? (
                            <input
                              type="time"
                              value={daySchedule.breakEnd || '13:00'}
                              onChange={(e) => handleUpdateTime(day, 'breakEnd', e.target.value)}
                              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                            />
                          ) : (
                            <p className="text-gray-900">{formatTime(daySchedule.breakEnd)}</p>
                          )}
                        </div>
                      </div>
                    )}

                    {!daySchedule.isActive && (
                      <p className="mt-2 text-sm text-gray-500">Not available on this day</p>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Tips */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-900 mb-2">💡 Tips for managing your schedule:</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Changes to your schedule are automatically saved</li>
            <li>• Break times are automatically blocked from patient bookings</li>
            <li>• You can temporarily disable specific days when needed</li>
            <li>• Existing appointments are not affected by schedule changes</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
