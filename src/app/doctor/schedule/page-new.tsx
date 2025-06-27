'use client'

import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/stores/auth-store'
import { Button } from '@/components/ui/button'
import { 
  ClockIcon,
  ChevronLeftIcon,
  CalendarDaysIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'

interface ScheduleDay {
  isActive: boolean
  startTime: string | null
  endTime: string | null
  breakStart: string | null
  breakEnd: string | null
}

interface DoctorSchedule {
  id: string
  firstName: string
  lastName: string
  specialization: string
  availability: Record<string, ScheduleDay>
}

const daysOfWeek = [
  'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'
]

const dayDisplayNames = {
  monday: 'Monday',
  tuesday: 'Tuesday', 
  wednesday: 'Wednesday',
  thursday: 'Thursday',
  friday: 'Friday',
  saturday: 'Saturday',
  sunday: 'Sunday'
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
  if (!response.ok) throw new Error('Failed to fetch schedule')
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
      const response = await fetch(`/api/doctor/${user?.id}/dashboard`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      })
      if (!response.ok) throw new Error('Failed to fetch doctor profile')
      const result = await response.json()
      return result.doctor
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
      queryClient.invalidateQueries({ queryKey: ['doctors-available'] }) // Invalidate patient-side data
      setEditingDay(null)
    }
  })

  if (!user) {
    return <div>Please log in to access schedule</div>
  }

  if (isLoading) {
    return <div>Loading schedule...</div>
  }

  const currentSchedule = scheduleData?.availability || {}

  // Initialize schedule with defaults if not present
  const initializeSchedule = () => {
    const initialized: Record<string, ScheduleDay> = {}
    daysOfWeek.forEach(day => {
      initialized[day] = currentSchedule[day] || {
        isActive: false,
        startTime: '09:00',
        endTime: '17:00',
        breakStart: '12:00',
        breakEnd: '13:00'
      }
    })
    return initialized
  }

  const schedule = initializeSchedule()

  const handleToggleDay = (day: string) => {
    const newSchedule = {
      ...schedule,
      [day]: {
        ...schedule[day],
        isActive: !schedule[day].isActive
      }
    }
    updateScheduleMutation.mutate(newSchedule)
  }

  const handleUpdateTime = (day: string, field: keyof ScheduleDay, value: string | boolean) => {
    const newSchedule = {
      ...schedule,
      [day]: {
        ...schedule[day],
        [field]: value
      }
    }
    updateScheduleMutation.mutate(newSchedule)
  }

  const formatTime = (time: string | null) => {
    if (!time) return 'Not set'
    return time
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
                Dr. {scheduleData?.firstName} {scheduleData?.lastName}
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
              Set your availability for each day of the week. Changes will be immediately available to patients.
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
                const daySchedule = schedule[day]
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

                      <button
                        onClick={() => setEditingDay(isEditing ? null : day)}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        {isEditing ? 'Cancel' : 'Edit'}
                      </button>
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
                              value={daySchedule.startTime || '09:00'}
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
                              value={daySchedule.endTime || '17:00'}
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
            <li>• Changes to your schedule are immediately visible to patients</li>
            <li>• Break times are automatically blocked from patient bookings</li>
            <li>• You can temporarily disable specific days when needed</li>
            <li>• Existing appointments are not affected by schedule changes</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
