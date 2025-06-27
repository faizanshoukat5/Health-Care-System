'use client'

import React, { useState } from 'react'
import { useAuth } from '@/stores/auth-store'
import { Button } from '@/components/ui/button'
import {
  DocumentTextIcon,
  ChartBarIcon,
  CalendarDaysIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  ArrowDownTrayIcon,
  PrinterIcon,
  ShareIcon
} from '@heroicons/react/24/outline'

export default function AdminReports() {
  const { user, token } = useAuth()
  const [activeCategory, setActiveCategory] = useState('financial')

  const reportCategories = [
    { id: 'financial', name: 'Financial Reports', icon: CurrencyDollarIcon },
    { id: 'patient', name: 'Patient Reports', icon: UserGroupIcon },
    { id: 'appointment', name: 'Appointment Reports', icon: CalendarDaysIcon },
    { id: 'performance', name: 'Performance Reports', icon: ChartBarIcon },
  ]

  const reports = {
    financial: [
      { name: 'Revenue Summary', description: 'Monthly and yearly revenue breakdown', lastGenerated: '2024-12-27' },
      { name: 'Payment Analytics', description: 'Payment methods and success rates', lastGenerated: '2024-12-26' },
      { name: 'Insurance Claims', description: 'Insurance claims processing report', lastGenerated: '2024-12-25' },
    ],
    patient: [
      { name: 'Patient Demographics', description: 'Age, gender, and location analysis', lastGenerated: '2024-12-27' },
      { name: 'Patient Satisfaction', description: 'Satisfaction scores and feedback', lastGenerated: '2024-12-26' },
      { name: 'Health Outcomes', description: 'Treatment effectiveness metrics', lastGenerated: '2024-12-25' },
    ],
    appointment: [
      { name: 'Appointment Volume', description: 'Daily, weekly, and monthly trends', lastGenerated: '2024-12-27' },
      { name: 'No-show Analysis', description: 'No-show rates and patterns', lastGenerated: '2024-12-26' },
      { name: 'Scheduling Efficiency', description: 'Booking and utilization rates', lastGenerated: '2024-12-25' },
    ],
    performance: [
      { name: 'Doctor Performance', description: 'Individual doctor metrics and KPIs', lastGenerated: '2024-12-27' },
      { name: 'Department Analysis', description: 'Department-wise performance comparison', lastGenerated: '2024-12-26' },
      { name: 'System Usage', description: 'Platform usage and engagement metrics', lastGenerated: '2024-12-25' },
    ],
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
        <p className="text-gray-600 mt-1">Generate comprehensive reports for insights and compliance</p>
      </div>

      {/* Report Categories */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {reportCategories.map((category) => (
          <button
            key={category.id}
            onClick={() => setActiveCategory(category.id)}
            className={`p-4 rounded-lg border text-left transition-colors ${
              activeCategory === category.id
                ? 'bg-blue-50 border-blue-200 text-blue-700'
                : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <category.icon className="h-6 w-6 mb-2" />
            <h3 className="font-medium">{category.name}</h3>
          </button>
        ))}
      </div>

      {/* Reports List */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            {reportCategories.find(c => c.id === activeCategory)?.name}
          </h2>
        </div>
        <div className="divide-y divide-gray-200">
          {reports[activeCategory as keyof typeof reports].map((report, index) => (
            <div key={index} className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900">{report.name}</h3>
                  <p className="text-gray-600 mt-1">{report.description}</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Last generated: {report.lastGenerated}
                  </p>
                </div>
                <div className="flex space-x-2 ml-4">
                  <Button variant="outline" size="sm">
                    <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                  <Button variant="outline" size="sm">
                    <PrinterIcon className="h-4 w-4 mr-2" />
                    Print
                  </Button>
                  <Button size="sm">
                    Generate
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Generate Section */}
      <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Quick Report Generation</h3>
            <p className="text-gray-600 mt-1">Generate custom reports with specific date ranges and filters</p>
          </div>
          <Button>
            <DocumentTextIcon className="h-4 w-4 mr-2" />
            Custom Report
          </Button>
        </div>
      </div>
    </div>
  )
}
