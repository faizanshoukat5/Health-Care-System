'use client'

import DynamicPatientDashboard from '@/components/DynamicPatientDashboard'

export default function PatientDashboardPage() {
  return <DynamicPatientDashboard />
}
import { useAuth } from '@/stores/auth-store'
import { useQuery } from '@tanstack/react-query'
import { 
  CalendarDaysIcon, 
  HeartIcon, 
  ClipboardDocumentListIcon,
  ChatBubbleLeftRightIcon,
  BellIcon,
  UserCircleIcon,
  ChartBarIcon,
  DocumentTextIcon,
  CameraIcon,
  PhoneIcon,
  MapPinIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  PlusCircleIcon
} from '@heroicons/react/24/outline'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { format, isToday, isTomorrow, formatDistanceToNow } from 'date-fns'

// API functions
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

export default function PatientDashboard() {
  const { user, token, logout } = useAuth()
  const [patientId, setPatientId] = useState<string | null>(null)

  // Fetch patient ID from user profile
  useEffect(() => {
    const fetchPatientProfile = async () => {
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
          if (data.patient) {
            setPatientId(data.patient.id)
          }
        } catch (error) {
          console.error('Failed to fetch patient profile:', error)
        }
      }
    }
    fetchPatientProfile()
  }, [user, token])

  // Data queries
  const { data: patientData, isLoading: loadingPatient } = useQuery({
    queryKey: ['patient-dashboard', patientId],
    queryFn: () => fetchPatientData(patientId!, token!),
    enabled: !!patientId && !!token,
  })

  const { data: appointments, isLoading: loadingAppointments } = useQuery({
    queryKey: ['upcoming-appointments', patientId],
    queryFn: () => fetchUpcomingAppointments(patientId!, token!),
    enabled: !!patientId && !!token,
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  })

  const { data: vitals, isLoading: loadingVitals } = useQuery({
    queryKey: ['recent-vitals', patientId],
    queryFn: () => fetchRecentVitals(patientId!, token!),
    enabled: !!patientId && !!token,
  })

  const { data: prescriptions, isLoading: loadingPrescriptions } = useQuery({
    queryKey: ['active-prescriptions', patientId],
    queryFn: () => fetchActivePrescriptions(patientId!, token!),
    enabled: !!patientId && !!token,
  })

  const { data: notifications, isLoading: loadingNotifications } = useQuery({
    queryKey: ['notifications', user?.id],
    queryFn: () => fetchNotifications(user!.id, token!),
    enabled: !!user?.id && !!token,
    refetchInterval: 2 * 60 * 1000, // Refetch every 2 minutes
  })

  // Calculate health metrics
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <HeartIcon className="h-8 w-8 text-blue-600" />
              <h1 className="text-xl font-semibold text-gray-900">Healthcare Platform</h1>
            </div>
            <div className="flex items-center space-x-4">
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

      {/* Emergency Banner */}
      {notifications && notifications.some((n: any) => n.type === 'SYSTEM_ALERT' && !n.isRead) && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <p className="text-sm text-red-700">
                You have urgent notifications that require immediate attention.
              </p>
            </div>
          </div>
        </div>
      )}

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
              <Link href="/patient/telemedicine">
                <Button className="w-full justify-start" variant="outline">
                  <CameraIcon className="h-5 w-5 mr-2" />
                  Start Video Consultation
                </Button>
              </Link>
              <Link href="/patient/records">
                <Button className="w-full justify-start" variant="outline">
                  <ClipboardDocumentListIcon className="h-5 w-5 mr-2" />
                  View Medical Records
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
                  <DocumentTextIcon className="h-5 w-5 mr-2" />
                  My Prescriptions
                </Button>
              </Link>
              <Link href="/patient/emergency">
                <Button className="w-full justify-start bg-red-600 hover:bg-red-700 text-white">
                  <PhoneIcon className="h-5 w-5 mr-2" />
                  Emergency Contact
                </Button>
              </Link>
            </div>
          </div>

          {/* Upcoming Appointments */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Upcoming Appointments</h3>
              <Link href="/patient/appointments">
                <Button variant="ghost" size="sm">View All</Button>
              </Link>
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
              <Link href="/patient/notifications">
                <Button variant="ghost" size="sm">View All</Button>
              </Link>
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
                      {notification.type === 'LAB_RESULTS_AVAILABLE' && <ClipboardDocumentListIcon className="h-5 w-5 text-green-600" />}
                      {notification.type === 'PRESCRIPTION_READY' && <DocumentTextIcon className="h-5 w-5 text-purple-600" />}
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
            <Link href="/patient/health-trends">
              <Button variant="ghost" size="sm">
                <ChartBarIcon className="h-4 w-4 mr-1" />
                View Trends
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {loadingVitals ? (
              <div className="animate-pulse">
                <div className="h-20 bg-gray-200 rounded-lg"></div>
              </div>
            ) : vitals && vitals.length > 0 ? (
              <>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-600">Blood Pressure</p>
                  <p className="text-xl font-bold text-blue-600">
                    {vitals[0].bloodPressure?.systolic}/{vitals[0].bloodPressure?.diastolic}
                  </p>
                  <p className="text-xs text-gray-500">
                    {vitals[0].bloodPressure?.systolic <= 140 && vitals[0].bloodPressure?.diastolic <= 90 ? 'Normal' : 'High'}
                  </p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-gray-600">Heart Rate</p>
                  <p className="text-xl font-bold text-green-600">{vitals[0].heartRate || '--'} bpm</p>
                  <p className="text-xs text-gray-500">
                    {vitals[0].heartRate && vitals[0].heartRate >= 60 && vitals[0].heartRate <= 100 ? 'Normal' : 'Monitor'}
                  </p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <p className="text-sm text-gray-600">Weight</p>
                  <p className="text-xl font-bold text-purple-600">{vitals[0].weight || '--'} kg</p>
                  <p className="text-xs text-gray-500">Latest reading</p>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <p className="text-sm text-gray-600">Last Updated</p>
                  <p className="text-xl font-bold text-yellow-600">
                    {formatDistanceToNow(new Date(vitals[0].recordedAt), { addSuffix: true })}
                  </p>
                  <p className="text-xs text-gray-500">
                    <Link href="/patient/vitals/log" className="text-blue-600 hover:underline">
                      Update now
                    </Link>
                  </p>
                </div>
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

        {/* Active Prescriptions Preview */}
        {prescriptions && prescriptions.length > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Active Prescriptions</h3>
              <Link href="/patient/prescriptions">
                <Button variant="ghost" size="sm">View All</Button>
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {prescriptions.filter((p: any) => p.status === 'ACTIVE').slice(0, 3).map((prescription: any, index: number) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-gray-900">
                        {typeof prescription.medications === 'string' 
                          ? JSON.parse(prescription.medications)[0]?.name || 'Medication'
                          : prescription.medications[0]?.name || 'Medication'
                        }
                      </p>
                      <p className="text-sm text-gray-600">{prescription.dosage}</p>
                      <p className="text-sm text-gray-600">{prescription.frequency}</p>
                      <p className="text-xs text-gray-500 mt-2">
                        Dr. {prescription.doctor?.firstName} {prescription.doctor?.lastName}
                      </p>
                    </div>
                    <CheckCircleIcon className="h-5 w-5 text-green-600" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
