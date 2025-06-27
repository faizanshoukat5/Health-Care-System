'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  CalendarDaysIcon,
  ClockIcon,
  UserIcon,
  VideoCameraIcon,
  PhoneIcon,
  MapPinIcon,
  PlusIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline'

const AppointmentsPage = () => {
  const [activeTab, setActiveTab] = useState('upcoming')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')

  // Mock appointment data
  const appointments = [
    {
      id: 1,
      doctor: 'Dr. Sarah Johnson',
      specialty: 'Cardiologist',
      date: '2024-01-15',
      time: '10:00 AM',
      type: 'video',
      status: 'confirmed',
      location: 'Video Call',
      reason: 'Regular checkup',
      avatar: '/api/placeholder/40/40'
    },
    {
      id: 2,
      doctor: 'Dr. Michael Chen',
      specialty: 'Dermatologist',
      date: '2024-01-18',
      time: '2:30 PM',
      type: 'in-person',
      status: 'pending',
      location: '123 Medical Center, Room 205',
      reason: 'Skin consultation',
      avatar: '/api/placeholder/40/40'
    },
    {
      id: 3,
      doctor: 'Dr. Emily Davis',
      specialty: 'General Practitioner',
      date: '2024-01-22',
      time: '9:15 AM',
      type: 'phone',
      status: 'confirmed',
      location: 'Phone Call',
      reason: 'Follow-up consultation',
      avatar: '/api/placeholder/40/40'
    },
    {
      id: 4,
      doctor: 'Dr. Robert Wilson',
      specialty: 'Orthopedist',
      date: '2023-12-20',
      time: '11:00 AM',
      type: 'in-person',
      status: 'completed',
      location: '456 Health Plaza, Suite 102',
      reason: 'Knee examination',
      avatar: '/api/placeholder/40/40'
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'text-green-600 bg-green-100'
      case 'pending':
        return 'text-yellow-600 bg-yellow-100'
      case 'completed':
        return 'text-blue-600 bg-blue-100'
      case 'cancelled':
        return 'text-red-600 bg-red-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircleIcon className="h-4 w-4" />
      case 'pending':
        return <ExclamationTriangleIcon className="h-4 w-4" />
      case 'completed':
        return <CheckCircleIcon className="h-4 w-4" />
      case 'cancelled':
        return <XCircleIcon className="h-4 w-4" />
      default:
        return <ClockIcon className="h-4 w-4" />
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <VideoCameraIcon className="h-4 w-4 text-blue-500" />
      case 'phone':
        return <PhoneIcon className="h-4 w-4 text-green-500" />
      case 'in-person':
        return <MapPinIcon className="h-4 w-4 text-purple-500" />
      default:
        return <CalendarDaysIcon className="h-4 w-4" />
    }
  }

  const filteredAppointments = appointments.filter(appointment => {
    const matchesSearch = appointment.doctor.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         appointment.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         appointment.reason.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesFilter = filterStatus === 'all' || appointment.status === filterStatus
    
    const matchesTab = activeTab === 'all' || 
      (activeTab === 'upcoming' && ['confirmed', 'pending'].includes(appointment.status)) ||
      (activeTab === 'past' && ['completed', 'cancelled'].includes(appointment.status))
    
    return matchesSearch && matchesFilter && matchesTab
  })

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Appointments</h1>
              <p className="mt-2 text-gray-600">Manage your upcoming and past appointments</p>
            </div>
            <div className="mt-4 sm:mt-0">
              <Button className="flex items-center space-x-2">
                <PlusIcon className="h-4 w-4" />
                <span>Book Appointment</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'upcoming', name: 'Upcoming', count: appointments.filter(a => ['confirmed', 'pending'].includes(a.status)).length },
                { id: 'past', name: 'Past', count: appointments.filter(a => ['completed', 'cancelled'].includes(a.status)).length },
                { id: 'all', name: 'All', count: appointments.length }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors`}
                >
                  {tab.name} ({tab.count})
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search appointments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="confirmed">Confirmed</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {/* Appointments List */}
        <div className="space-y-4">
          {filteredAppointments.length > 0 ? (
            filteredAppointments.map((appointment) => (
              <div key={appointment.id} className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                      <UserIcon className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">{appointment.doctor}</h3>
                      <p className="text-sm text-gray-600">{appointment.specialty}</p>
                      <p className="text-sm text-gray-600 mt-1">{appointment.reason}</p>
                      
                      <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <CalendarDaysIcon className="h-4 w-4" />
                          <span>{appointment.date}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <ClockIcon className="h-4 w-4" />
                          <span>{appointment.time}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          {getTypeIcon(appointment.type)}
                          <span className="capitalize">{appointment.type}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-1 mt-2">
                        <MapPinIcon className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{appointment.location}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end space-y-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                      {getStatusIcon(appointment.status)}
                      <span className="ml-1 capitalize">{appointment.status}</span>
                    </span>
                    
                    {appointment.status === 'confirmed' && (
                      <div className="flex space-x-2">
                        {appointment.type === 'video' && (
                          <Button size="sm" className="flex items-center space-x-1">
                            <VideoCameraIcon className="h-4 w-4" />
                            <span>Join Call</span>
                          </Button>
                        )}
                        <Button variant="outline" size="sm">
                          Reschedule
                        </Button>
                      </div>
                    )}
                    
                    {appointment.status === 'pending' && (
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          Cancel
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <CalendarDaysIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No appointments found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || filterStatus !== 'all' 
                  ? 'Try adjusting your search or filter criteria.'
                  : 'Get started by booking your first appointment.'
                }
              </p>
              {!searchTerm && filterStatus === 'all' && (
                <div className="mt-6">
                  <Button className="flex items-center space-x-2 mx-auto">
                    <PlusIcon className="h-4 w-4" />
                    <span>Book Appointment</span>
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AppointmentsPage
