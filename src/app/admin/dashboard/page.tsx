'use client'

import React from 'react'
import { useAuth } from '@/stores/auth-store'
import { redirect } from 'next/navigation'
import {
  ChartBarIcon,
  UsersIcon,
  UserGroupIcon,
  CalendarDaysIcon,
  CurrencyDollarIcon,
  ClipboardDocumentListIcon,
  ShieldCheckIcon,
  ServerIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  ArrowUpIcon,
  ArrowDownIcon
} from '@heroicons/react/24/outline'

export default function AdminDashboardPage() {
  const { user, isAuthenticated } = useAuth()

  if (!isAuthenticated || user?.role !== 'ADMIN') {
    redirect('/login')
  }

  const stats = [
    {
      name: 'Total Users',
      value: '2,847',
      change: '+12%',
      changeType: 'increase',
      icon: UsersIcon,
      color: 'blue'
    },
    {
      name: 'Active Doctors',
      value: '23',
      change: '+3',
      changeType: 'increase',
      icon: UserGroupIcon,
      color: 'green'
    },
    {
      name: 'Total Patients',
      value: '2,824',
      change: '+15%',
      changeType: 'increase',
      icon: UsersIcon,
      color: 'purple'
    },
    {
      name: 'Appointments Today',
      value: '156',
      change: '-5%',
      changeType: 'decrease',
      icon: CalendarDaysIcon,
      color: 'orange'
    },
    {
      name: 'Monthly Revenue',
      value: '$124,350',
      change: '+22%',
      changeType: 'increase',
      icon: CurrencyDollarIcon,
      color: 'green'
    },
    {
      name: 'System Uptime',
      value: '99.9%',
      change: 'Stable',
      changeType: 'neutral',
      icon: ServerIcon,
      color: 'blue'
    }
  ]

  const recentActivities = [
    {
      type: 'user_registration',
      message: 'New patient registration: John Doe',
      time: '2 minutes ago',
      icon: UsersIcon,
      color: 'blue'
    },
    {
      type: 'appointment',
      message: 'Appointment scheduled: Dr. Smith with Jane Wilson',
      time: '5 minutes ago',
      icon: CalendarDaysIcon,
      color: 'green'
    },
    {
      type: 'payment',
      message: 'Payment processed: $250 from Michael Johnson',
      time: '12 minutes ago',
      icon: CurrencyDollarIcon,
      color: 'purple'
    },
    {
      type: 'alert',
      message: 'System backup completed successfully',
      time: '1 hour ago',
      icon: CheckCircleIcon,
      color: 'green'
    }
  ]

  const systemAlerts = [
    {
      type: 'warning',
      message: 'Database storage at 85% capacity',
      time: '2 hours ago',
      priority: 'medium'
    },
    {
      type: 'info',
      message: 'Scheduled maintenance tonight at 2 AM',
      time: '4 hours ago',
      priority: 'low'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <ShieldCheckIcon className="h-8 w-8 text-purple-600" />
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          </div>
          <p className="text-gray-600">
            Welcome back, {user?.firstName || 'Administrator'}. Here's what's happening with your healthcare platform.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {stats.map((stat) => (
            <div key={stat.name} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-full bg-${stat.color}-100`}>
                  <stat.icon className={`h-6 w-6 text-${stat.color}-600`} />
                </div>
              </div>
              <div className="mt-4 flex items-center">
                {stat.changeType === 'increase' && (
                  <ArrowUpIcon className="h-4 w-4 text-green-500 mr-1" />
                )}
                {stat.changeType === 'decrease' && (
                  <ArrowDownIcon className="h-4 w-4 text-red-500 mr-1" />
                )}
                <span className={`text-sm font-medium ${
                  stat.changeType === 'increase' ? 'text-green-600' : 
                  stat.changeType === 'decrease' ? 'text-red-600' : 'text-gray-600'
                }`}>
                  {stat.change}
                </span>
                <span className="text-sm text-gray-500 ml-1">from last month</span>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Activities */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Recent Activities</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {recentActivities.map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className={`p-2 rounded-full bg-${activity.color}-100`}>
                      <activity.icon className={`h-4 w-4 text-${activity.color}-600`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">{activity.message}</p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* System Alerts */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">System Alerts</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {systemAlerts.map((alert, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      {alert.type === 'warning' ? (
                        <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />
                      ) : (
                        <ClockIcon className="h-5 w-5 text-blue-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">{alert.message}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <p className="text-xs text-gray-500">{alert.time}</p>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          alert.priority === 'high' ? 'bg-red-100 text-red-800' :
                          alert.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {alert.priority} priority
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <a
                href="/admin/users"
                className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <UsersIcon className="h-6 w-6 text-blue-600 mr-3" />
                <span className="text-sm font-medium text-gray-900">Manage Users</span>
              </a>
              <a
                href="/admin/doctors"
                className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <UserGroupIcon className="h-6 w-6 text-green-600 mr-3" />
                <span className="text-sm font-medium text-gray-900">Manage Doctors</span>
              </a>
              <a
                href="/admin/analytics"
                className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <ChartBarIcon className="h-6 w-6 text-purple-600 mr-3" />
                <span className="text-sm font-medium text-gray-900">View Analytics</span>
              </a>
              <a
                href="/admin/settings"
                className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <ShieldCheckIcon className="h-6 w-6 text-orange-600 mr-3" />
                <span className="text-sm font-medium text-gray-900">System Settings</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}