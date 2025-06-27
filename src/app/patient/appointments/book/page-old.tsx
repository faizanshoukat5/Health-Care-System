'use client'

import DynamicBookAppointment from '@/components/DynamicBookAppointment'

export default function BookAppointmentPage() {
  return <DynamicBookAppointment />
}
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/stores/auth-store'
import { Button } from '@/components/ui/button'
import { 
  CalendarDaysIcon,
  ClockIcon,
  UserIcon,
  HeartIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  VideoCameraIcon,
  MapPinIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'
import { format, addDays, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, isToday, isBefore } from 'date-fns'

interface Doctor {
  id: string
  firstName: string
  lastName: string
  specialization: string
  consultationFee: number
  availability: any
  isActive: boolean
}

interface TimeSlot {
  time: string
  available: boolean
}

const fetchDoctors = async (token: string) => {
  const response = await fetch('/api/doctors/available', {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  })
  if (!response.ok) throw new Error('Failed to fetch doctors')
  return response.json()
}

const fetchAvailableSlots = async (doctorId: string, date: string, token: string) => {
  const response = await fetch(`/api/doctors/${doctorId}/availability?date=${date}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  })
  if (!response.ok) throw new Error('Failed to fetch availability')
  return response.json()
}

const bookAppointment = async (appointmentData: any, token: string) => {
  const response = await fetch('/api/appointments/book', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    credentials: 'include',
    body: JSON.stringify(appointmentData)
  })
  
  const data = await response.json()
  
  if (!response.ok) {
    // Throw a more specific error message
    const errorMessage = data.message || data.error || `HTTP ${response.status}: ${response.statusText}`
    throw new Error(errorMessage)
  }
  
  return data
}

export default function BookAppointment() {
  const { user, token } = useAuth()
  const queryClient = useQueryClient()
  
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [selectedTime, setSelectedTime] = useState<string>('')
  const [appointmentType, setAppointmentType] = useState<'IN_PERSON' | 'TELEMEDICINE'>('IN_PERSON')
  const [reason, setReason] = useState('')
  const [currentWeek, setCurrentWeek] = useState(new Date())

  // Get current week dates
  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 })
  const weekEnd = endOfWeek(currentWeek, { weekStartsOn: 1 })
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd })

  const { data: doctors, isLoading: loadingDoctors, refetch: refetchDoctors } = useQuery({
    queryKey: ['available-doctors'],
    queryFn: () => fetchDoctors(token!),
    enabled: !!token,
    staleTime: 30000, // Consider data stale after 30 seconds
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
  })

  const { data: timeSlots, isLoading: loadingSlots } = useQuery({
    queryKey: ['doctor-availability', selectedDoctor?.id, format(selectedDate, 'yyyy-MM-dd')],
    queryFn: () => fetchAvailableSlots(selectedDoctor!.id, format(selectedDate, 'yyyy-MM-dd'), token!),
    enabled: !!selectedDoctor && !!selectedDate && !!token
  })

  const bookingMutation = useMutation({
    mutationFn: (appointmentData: any) => bookAppointment(appointmentData, token!),
    onSuccess: (data) => {
      console.log('✅ Booking successful:', data)
      queryClient.invalidateQueries({ queryKey: ['upcoming-appointments'] })
      alert('Appointment booked successfully!')
      // Reset form
      setSelectedDoctor(null)
      setSelectedDate(new Date())
      setSelectedTime('')
      setReason('')
    },
    onError: (error: any) => {
      console.error('❌ Booking failed:', error)
      alert(`Failed to book appointment: ${error.message}`)
    }
  })

  const handleBooking = () => {
    if (!selectedDoctor || !selectedTime || !reason) {
      alert('Please fill in all required fields')
      return
    }

    const appointmentDateTime = new Date(selectedDate)
    const [hours, minutes] = selectedTime.split(':')
    appointmentDateTime.setHours(parseInt(hours), parseInt(minutes))

    const bookingData = {
      doctorId: selectedDoctor.id,
      dateTime: appointmentDateTime.toISOString(),
      type: appointmentType,
      reason: reason.trim(),
      duration: 30
    }

    console.log('📅 Booking appointment with data:', bookingData)
    bookingMutation.mutate(bookingData)
  }

  const goToPreviousWeek = () => {
    setCurrentWeek(prev => addDays(prev, -7))
  }

  const goToNextWeek = () => {
    setCurrentWeek(prev => addDays(prev, 7))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/patient/dashboard">
                <Button variant="ghost" size="sm">
                  <ChevronLeftIcon className="h-4 w-4 mr-1" />
                  Back to Dashboard
                </Button>
              </Link>
              <h1 className="text-xl font-semibold text-gray-900">Book Appointment</h1>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  refetchDoctors()
                  queryClient.invalidateQueries({ queryKey: ['available-doctors'] })
                }}
                className="flex items-center px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 border border-gray-200 rounded-md hover:bg-gray-50"
                title="Refresh doctor availability"
              >
                <ArrowPathIcon className="h-4 w-4 mr-1" />
                Refresh
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Doctor Selection */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Select a Doctor</h2>
                <div className="text-xs text-gray-500">
                  Last updated: {new Date().toLocaleTimeString()}
                </div>
              </div>
              
              {/* Appointment Type */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Appointment Type
                </label>
                <div className="flex space-x-4">
                  <button
                    onClick={() => setAppointmentType('IN_PERSON')}
                    className={`flex items-center px-4 py-2 rounded-lg border-2 transition-colors ${
                      appointmentType === 'IN_PERSON'
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <MapPinIcon className="h-5 w-5 mr-2" />
                    In-Person Visit
                  </button>
                  <button
                    onClick={() => setAppointmentType('TELEMEDICINE')}
                    className={`flex items-center px-4 py-2 rounded-lg border-2 transition-colors ${
                      appointmentType === 'TELEMEDICINE'
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <VideoCameraIcon className="h-5 w-5 mr-2" />
                    Video Consultation
                  </button>
                </div>
              </div>

              {/* Doctors List */}
              {loadingDoctors ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse p-4 border rounded-lg">
                      <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {doctors?.map((doctor: Doctor) => (
                    <div
                      key={doctor.id}
                      onClick={() => setSelectedDoctor(doctor)}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                        selectedDoctor?.id === doctor.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                            <UserIcon className="h-6 w-6 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">
                              Dr. {doctor.firstName} {doctor.lastName}
                            </h3>
                            <p className="text-sm text-gray-600">{doctor.specialization}</p>
                            <p className="text-sm text-gray-500">
                              Consultation: ${doctor.consultationFee}
                            </p>
                          </div>
                        </div>
                        {selectedDoctor?.id === doctor.id && (
                          <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Date and Time Selection */}
          <div className="space-y-6">
            {/* Calendar */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Select Date</h3>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={goToPreviousWeek}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <ChevronLeftIcon className="h-5 w-5" />
                  </button>
                  <span className="text-sm font-medium">
                    {format(weekStart, 'MMM dd')} - {format(weekEnd, 'MMM dd, yyyy')}
                  </span>
                  <button
                    onClick={goToNextWeek}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <ChevronRightIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-7 gap-1 mb-2">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                  <div key={day} className="p-2 text-center text-xs font-medium text-gray-500">
                    {day}
                  </div>
                ))}
              </div>
              
              <div className="grid grid-cols-7 gap-1">
                {weekDays.map((date) => {
                  const isSelected = isSameDay(date, selectedDate)
                  const isPast = isBefore(date, new Date()) && !isToday(date)
                  
                  return (
                    <button
                      key={date.toString()}
                      onClick={() => !isPast && setSelectedDate(date)}
                      disabled={isPast}
                      className={`p-2 text-sm rounded transition-colors ${
                        isPast
                          ? 'text-gray-300 cursor-not-allowed'
                          : isSelected
                          ? 'bg-blue-600 text-white'
                          : isToday(date)
                          ? 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                          : 'hover:bg-gray-100'
                      }`}
                    >
                      {format(date, 'd')}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Time Slots */}
            {selectedDoctor && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Available Times</h3>
                
                {loadingSlots ? (
                  <div className="animate-pulse space-y-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="h-10 bg-gray-200 rounded"></div>
                    ))}
                  </div>
                ) : timeSlots?.length > 0 ? (
                  <div className="grid grid-cols-2 gap-2">
                    {timeSlots.map((slot: TimeSlot) => (
                      <button
                        key={slot.time}
                        onClick={() => slot.available && setSelectedTime(slot.time)}
                        disabled={!slot.available}
                        className={`p-3 text-sm rounded transition-colors ${
                          !slot.available
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : selectedTime === slot.time
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
                        }`}
                      >
                        {slot.time}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">
                    No available slots for this date
                  </p>
                )}
              </div>
            )}

            {/* Reason */}
            {selectedDoctor && selectedTime && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Reason for Visit</h3>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Please describe your symptoms or reason for this appointment..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={4}
                  required
                />
              </div>
            )}

            {/* Booking Summary & Confirm */}
            {selectedDoctor && selectedTime && reason && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking Summary</h3>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Doctor:</span> Dr. {selectedDoctor.firstName} {selectedDoctor.lastName}</p>
                  <p><span className="font-medium">Specialization:</span> {selectedDoctor.specialization}</p>
                  <p><span className="font-medium">Date:</span> {format(selectedDate, 'EEEE, MMMM dd, yyyy')}</p>
                  <p><span className="font-medium">Time:</span> {selectedTime}</p>
                  <p><span className="font-medium">Type:</span> {appointmentType.replace('_', ' ')}</p>
                  <p><span className="font-medium">Fee:</span> ${selectedDoctor.consultationFee}</p>
                </div>
                
                <Button
                  onClick={handleBooking}
                  disabled={bookingMutation.isPending}
                  className="w-full mt-6"
                >
                  {bookingMutation.isPending ? 'Booking...' : 'Confirm Booking'}
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
