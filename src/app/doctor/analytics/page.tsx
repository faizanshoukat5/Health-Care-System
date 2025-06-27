'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  ChartBarIcon,
  UsersIcon,
  CalendarDaysIcon,
  CurrencyDollarIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ArrowUpIcon,
  ArrowDownIcon
} from '@heroicons/react/24/outline'

const DoctorAnalyticsPage = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('month')
  
  // Mock analytics data
  const metrics = {
    totalPatients: 247,
    patientsGrowth: 12.5,
    appointmentsThisMonth: 89,
    appointmentsGrowth: 8.3,
    averageRating: 4.8,
    ratingChange: 0.2,
    revenue: 15420,
    revenueGrowth: 15.7
  }

  const appointmentStats = {
    completed: 76,
    cancelled: 8,
    noShow: 5,
    rescheduled: 12
  }

  const patientDemographics = [
    { ageGroup: '18-25', count: 28, percentage: 11.3 },
    { ageGroup: '26-35', count: 67, percentage: 27.1 },
    { ageGroup: '36-45', count: 89, percentage: 36.0 },
    { ageGroup: '46-55', count: 41, percentage: 16.6 },
    { ageGroup: '56-65', count: 15, percentage: 6.1 },
    { ageGroup: '65+', count: 7, percentage: 2.8 }
  ]

  const topConditions = [
    { condition: 'Hypertension', count: 45, percentage: 18.2 },
    { condition: 'Diabetes Type 2', count: 38, percentage: 15.4 },
    { condition: 'Annual Physical', count: 34, percentage: 13.8 },
    { condition: 'Anxiety', count: 28, percentage: 11.3 },
    { condition: 'Back Pain', count: 22, percentage: 8.9 }
  ]

  const weeklyAppointments = [
    { day: 'Mon', count: 12 },
    { day: 'Tue', count: 15 },
    { day: 'Wed', count: 18 },
    { day: 'Thu', count: 14 },
    { day: 'Fri', count: 16 },
    { day: 'Sat', count: 8 },
    { day: 'Sun', count: 3 }
  ]

  const recentReviews = [
    {
      patient: 'Sarah M.',
      rating: 5,
      comment: 'Excellent doctor, very thorough and caring.',
      date: '2024-01-15'
    },
    {
      patient: 'John D.',
      rating: 4,
      comment: 'Good experience, helpful advice.',
      date: '2024-01-14'
    },
    {
      patient: 'Mary K.',
      rating: 5,
      comment: 'Professional and knowledgeable.',
      date: '2024-01-13'
    }
  ]

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const MetricCard = ({ title, value, growth, icon: Icon, prefix = '', suffix = '' }: any) => (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">
            {prefix}{typeof value === 'number' ? value.toLocaleString() : value}{suffix}
          </p>
          {growth !== undefined && (
            <div className="flex items-center mt-2">
              {growth >= 0 ? (
                <ArrowUpIcon className="h-4 w-4 text-green-500" />
              ) : (
                <ArrowDownIcon className="h-4 w-4 text-red-500" />
              )}
              <span className={`text-sm font-medium ml-1 ${growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {Math.abs(growth)}%
              </span>
              <span className="text-sm text-gray-500 ml-1">vs last {selectedPeriod}</span>
            </div>
          )}
        </div>
        <div className="p-3 bg-blue-50 rounded-lg">
          <Icon className="h-6 w-6 text-blue-600" />
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
              <p className="mt-2 text-gray-600">Track your practice performance and patient insights</p>
            </div>
            <div className="mt-4 sm:mt-0">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="week">Last Week</option>
                <option value="month">Last Month</option>
                <option value="quarter">Last Quarter</option>
                <option value="year">Last Year</option>
              </select>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <MetricCard
            title="Total Patients"
            value={metrics.totalPatients}
            growth={metrics.patientsGrowth}
            icon={UsersIcon}
          />
          <MetricCard
            title="Appointments This Month"
            value={metrics.appointmentsThisMonth}
            growth={metrics.appointmentsGrowth}
            icon={CalendarDaysIcon}
          />
          <MetricCard
            title="Average Rating"
            value={metrics.averageRating}
            growth={metrics.ratingChange}
            icon={ArrowTrendingUpIcon}
            suffix="/5"
          />
          <MetricCard
            title="Revenue This Month"
            value={metrics.revenue}
            growth={metrics.revenueGrowth}
            icon={CurrencyDollarIcon}
            prefix="$"
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-2 mb-8">
          {/* Weekly Appointments Chart */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Weekly Appointments</h2>
            <div className="space-y-3">
              {weeklyAppointments.map((day) => (
                <div key={day.day} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600 w-12">{day.day}</span>
                  <div className="flex-1 mx-4">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${(day.count / 20) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  <span className="text-sm font-medium text-gray-900 w-8 text-right">{day.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Appointment Status */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Appointment Status</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                  <span className="text-sm text-gray-600">Completed</span>
                </div>
                <span className="text-sm font-medium text-gray-900">{appointmentStats.completed}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full mr-3"></div>
                  <span className="text-sm text-gray-600">Rescheduled</span>
                </div>
                <span className="text-sm font-medium text-gray-900">{appointmentStats.rescheduled}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-red-500 rounded-full mr-3"></div>
                  <span className="text-sm text-gray-600">Cancelled</span>
                </div>
                <span className="text-sm font-medium text-gray-900">{appointmentStats.cancelled}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-gray-500 rounded-full mr-3"></div>
                  <span className="text-sm text-gray-600">No Show</span>
                </div>
                <span className="text-sm font-medium text-gray-900">{appointmentStats.noShow}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2 mb-8">
          {/* Patient Demographics */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Patient Demographics</h2>
            <div className="space-y-3">
              {patientDemographics.map((group) => (
                <div key={group.ageGroup} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">{group.ageGroup}</span>
                  <div className="flex items-center space-x-3">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${group.percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900 w-8 text-right">{group.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Conditions */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Conditions Treated</h2>
            <div className="space-y-3">
              {topConditions.map((condition) => (
                <div key={condition.condition} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">{condition.condition}</span>
                  <div className="flex items-center space-x-3">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full"
                        style={{ width: `${condition.percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900 w-8 text-right">{condition.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Reviews */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Patient Reviews</h2>
            <Button variant="outline" size="sm">
              View All Reviews
            </Button>
          </div>
          <div className="space-y-4">
            {recentReviews.map((review, index) => (
              <div key={index} className="border-b last:border-b-0 pb-4 last:pb-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-medium text-gray-900">{review.patient}</span>
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <span
                            key={i}
                            className={`text-sm ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">{review.comment}</p>
                  </div>
                  <span className="text-xs text-gray-500">{review.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default DoctorAnalyticsPage
