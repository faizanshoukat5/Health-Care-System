'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { 
  CalendarIcon,
  ChartBarIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  UserGroupIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline'
import { useAuth } from '@/stores/auth-store'

interface AnalyticsData {
  overview: {
    totalAppointments: number
    completedAppointments: number
    cancelledAppointments: number
    scheduledAppointments: number
    totalDoctors: number
    totalPatients: number
    averageAppointmentsPerDay: number
    completionRate: number
  }
  trends: {
    date: string
    appointments: number
    completed: number
    cancelled: number
  }[]
  doctorStats: {
    id: string
    name: string
    specialization: string
    totalAppointments: number
    completedAppointments: number
    cancelledAppointments: number
    averageRating: number
    patientCount: number
  }[]
  appointmentsBySpecialization: {
    specialization: string
    count: number
    percentage: number
  }[]
  appointmentsByStatus: {
    status: string
    count: number
    percentage: number
  }[]
}

export default function AdminAnalyticsPage() {
  const { token } = useAuth()
  const [dateRange, setDateRange] = useState('30') // days
  const [selectedMetric, setSelectedMetric] = useState<'appointments' | 'doctors' | 'patients'>('appointments')

  // Fetch analytics data
  const { data: analytics, isLoading, error } = useQuery({
    queryKey: ['admin-analytics', dateRange],
    queryFn: async () => {
      const response = await fetch(`/api/admin/analytics?days=${dateRange}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      if (!response.ok) {
        throw new Error('Failed to fetch analytics')
      }
      return response.json()
    },
    enabled: !!token,
  })

  const StatCard = ({ 
    title, 
    value, 
    change, 
    icon: Icon, 
    trend 
  }: { 
    title: string
    value: string | number
    change?: string
    icon: any
    trend?: 'up' | 'down' | 'neutral'
  }) => {
    const getTrendColor = () => {
      if (trend === 'up') return 'text-green-600'
      if (trend === 'down') return 'text-red-600'
      return 'text-gray-600'
    }

    const TrendIcon = trend === 'up' ? TrendingUpIcon : trend === 'down' ? TrendingDownIcon : null

    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
            {change && (
              <div className={`flex items-center mt-2 ${getTrendColor()}`}>
                {TrendIcon && <TrendIcon className="h-4 w-4 mr-1" />}
                <span className="text-sm font-medium">{change}</span>
              </div>
            )}
          </div>
          <div className="p-3 bg-blue-100 rounded-lg">
            <Icon className="h-8 w-8 text-blue-600" />
          </div>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-96 bg-gray-200 rounded"></div>
            <div className="h-96 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <XCircleIcon className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error Loading Analytics</h3>
              <div className="mt-2 text-sm text-red-700">
                Failed to load analytics data. Please try again.
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600">Track system performance and appointment metrics</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="365">Last year</option>
          </select>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Appointments"
          value={analytics?.overview?.totalAppointments || 0}
          change="+12% from last period"
          icon={CalendarIcon}
          trend="up"
        />
        <StatCard
          title="Completion Rate"
          value={`${Math.round(analytics?.overview?.completionRate || 0)}%`}
          change="+5% from last period"
          icon={CheckCircleIcon}
          trend="up"
        />
        <StatCard
          title="Active Doctors"
          value={analytics?.overview?.totalDoctors || 0}
          change="2 new this month"
          icon={UserGroupIcon}
          trend="up"
        />
        <StatCard
          title="Avg Daily Appointments"
          value={Math.round(analytics?.overview?.averageAppointmentsPerDay || 0)}
          change="+8% from last period"
          icon={TrendingUpIcon}
          trend="up"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Appointment Trends */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Appointment Trends</h3>
          <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
            <div className="text-center">
              <ChartBarIcon className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-sm text-gray-500">Chart visualization would go here</p>
              <p className="text-xs text-gray-400">Integration with chart library needed</p>
            </div>
          </div>
        </div>

        {/* Appointments by Status */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Appointments by Status</h3>
          <div className="space-y-4">
            {analytics?.appointmentsByStatus?.map((item: any) => (
              <div key={item.status} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full mr-3 ${
                    item.status === 'COMPLETED' ? 'bg-green-500' :
                    item.status === 'SCHEDULED' ? 'bg-blue-500' :
                    item.status === 'CANCELLED' ? 'bg-red-500' :
                    'bg-gray-500'
                  }`}></div>
                  <span className="text-sm font-medium text-gray-900 capitalize">
                    {item.status.toLowerCase()}
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">{item.count}</div>
                  <div className="text-xs text-gray-500">{item.percentage}%</div>
                </div>
              </div>
            )) || (
              <div className="text-center py-8">
                <p className="text-sm text-gray-500">No status data available</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Doctor Performance Table */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Doctor Performance</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Doctor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Specialization
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Appointments
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Completed
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Completion Rate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Patients
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {analytics?.doctorStats?.map((doctor: any) => (
                <tr key={doctor.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{doctor.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{doctor.specialization}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{doctor.totalAppointments}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{doctor.completedAppointments}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {Math.round((doctor.completedAppointments / doctor.totalAppointments) * 100) || 0}%
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{doctor.patientCount}</div>
                  </td>
                </tr>
              )) || (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                    No doctor data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Specialization Distribution */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Appointments by Specialization</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {analytics?.appointmentsBySpecialization?.map((item: any) => (
            <div key={item.specialization} className="p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-sm font-medium text-gray-900">{item.specialization}</h4>
                <span className="text-sm text-gray-500">{item.percentage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full" 
                  style={{ width: `${item.percentage}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-600 mt-1">{item.count} appointments</p>
            </div>
          )) || (
            <div className="col-span-3 text-center py-8">
              <p className="text-sm text-gray-500">No specialization data available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
