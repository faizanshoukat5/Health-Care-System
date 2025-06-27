'use client'

import React, { useState } from 'react'
import { useAuth } from '@/stores/auth-store'
import { Button } from '@/components/ui/button'
import { 
  PhoneIcon,
  ChevronLeftIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  UserCircleIcon,
  HeartIcon,
  DocumentTextIcon,
  ChatBubbleLeftRightIcon,
  MagnifyingGlassIcon,
  PlusIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'
import { format } from 'date-fns'

// Mock emergency cases data
const mockEmergencyCases = [
  {
    id: '1',
    patient: {
      firstName: 'Robert',
      lastName: 'Williams',
      email: 'robert.w@email.com',
      age: 45,
      phoneNumber: '+1-555-0123',
    },
    priority: 'HIGH',
    category: 'CHEST_PAIN',
    description: 'Patient reports severe chest pain and shortness of breath',
    reportedAt: new Date('2024-01-15T13:45:00'),
    status: 'ACTIVE',
    vitalSigns: {
      bloodPressure: '180/120',
      heartRate: 110,
      temperature: 98.6,
      oxygenSaturation: 92,
    },
    location: 'Home - 123 Main St, Anytown',
    emergencyContact: {
      name: 'Mary Williams',
      relationship: 'Wife',
      phone: '+1-555-0124',
    },
  },
  {
    id: '2',
    patient: {
      firstName: 'Linda',
      lastName: 'Davis',
      email: 'linda.d@email.com',
      age: 67,
      phoneNumber: '+1-555-0125',
    },
    priority: 'MEDIUM',
    category: 'FALL_INJURY',
    description: 'Patient fell at home, possible hip fracture',
    reportedAt: new Date('2024-01-15T14:20:00'),
    status: 'RESPONDED',
    vitalSigns: {
      bloodPressure: '140/90',
      heartRate: 88,
      temperature: 98.2,
      oxygenSaturation: 96,
    },
    location: 'Home - 456 Oak Ave, Anytown',
    emergencyContact: {
      name: 'Tom Davis',
      relationship: 'Son',
      phone: '+1-555-0126',
    },
  },
]

export default function DoctorEmergencyPage() {
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('ALL')

  if (!user) {
    return <div>Please log in to access emergency cases</div>
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH': return 'bg-red-100 text-red-800 border-red-200'
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'LOW': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-red-100 text-red-800'
      case 'RESPONDED': return 'bg-blue-100 text-blue-800'
      case 'RESOLVED': return 'bg-green-100 text-green-800'
      case 'TRANSFERRED': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'CHEST_PAIN': return HeartIcon
      case 'FALL_INJURY': return ExclamationTriangleIcon
      case 'BREATHING_DIFFICULTY': return HeartIcon
      case 'SEVERE_PAIN': return ExclamationTriangleIcon
      default: return DocumentTextIcon
    }
  }

  const handleContactPatient = (phoneNumber: string) => {
    window.open(`tel:${phoneNumber}`)
  }

  const handleContactEmergency = (phoneNumber: string) => {
    window.open(`tel:${phoneNumber}`)
  }

  // Filter cases
  const filteredCases = mockEmergencyCases.filter((case_) => {
    const matchesSearch = case_.patient.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         case_.patient.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         case_.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         case_.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesPriority = priorityFilter === 'ALL' || case_.priority === priorityFilter
    return matchesSearch && matchesPriority
  })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-red-600 text-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <Link href="/doctor/dashboard">
                <Button variant="ghost" size="sm" className="text-white hover:bg-red-700">
                  <ChevronLeftIcon className="h-4 w-4 mr-1" />
                  Back to Dashboard
                </Button>
              </Link>
              <div className="flex items-center space-x-2">
                <ExclamationTriangleIcon className="h-6 w-6" />
                <h1 className="text-2xl font-bold">Emergency Cases</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm opacity-90">Emergency Hotline</p>
                <p className="text-lg font-semibold">911</p>
              </div>
              <Button className="bg-white text-red-600 hover:bg-gray-100">
                <PhoneIcon className="h-4 w-4 mr-2" />
                Call 911
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Emergency Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Cases</p>
                <p className="text-2xl font-semibold text-red-600">2</p>
              </div>
              <ExclamationTriangleIcon className="h-8 w-8 text-red-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">High Priority</p>
                <p className="text-2xl font-semibold text-orange-600">1</p>
              </div>
              <div className="h-8 w-8 bg-orange-100 rounded-full flex items-center justify-center">
                <ExclamationTriangleIcon className="h-5 w-5 text-orange-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Responded</p>
                <p className="text-2xl font-semibold text-blue-600">1</p>
              </div>
              <UserCircleIcon className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Response</p>
                <p className="text-2xl font-semibold text-green-600">8min</p>
              </div>
              <ClockIcon className="h-8 w-8 text-green-600" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by patient name, category, or description..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <select
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
              >
                <option value="ALL">All Priorities</option>
                <option value="HIGH">High Priority</option>
                <option value="MEDIUM">Medium Priority</option>
                <option value="LOW">Low Priority</option>
              </select>
            </div>
          </div>
        </div>

        {/* Emergency Cases */}
        <div className="space-y-6">
          {filteredCases.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
              <ExclamationTriangleIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No emergency cases found</h3>
              <p className="text-gray-500">
                {searchTerm || priorityFilter !== 'ALL' 
                  ? 'Try adjusting your search or filter criteria.' 
                  : 'No active emergency cases at the moment.'}
              </p>
            </div>
          ) : (
            filteredCases.map((case_) => {
              const CategoryIcon = getCategoryIcon(case_.category)
              
              return (
                <div key={case_.id} className={`bg-white rounded-lg shadow-sm border-l-4 ${
                  case_.priority === 'HIGH' ? 'border-l-red-500' :
                  case_.priority === 'MEDIUM' ? 'border-l-yellow-500' :
                  'border-l-green-500'
                } p-6`}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                          case_.priority === 'HIGH' ? 'bg-red-100' :
                          case_.priority === 'MEDIUM' ? 'bg-yellow-100' :
                          'bg-green-100'
                        }`}>
                          <CategoryIcon className={`h-8 w-8 ${
                            case_.priority === 'HIGH' ? 'text-red-600' :
                            case_.priority === 'MEDIUM' ? 'text-yellow-600' :
                            'text-green-600'
                          }`} />
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-xl font-semibold text-gray-900">
                            {case_.patient.firstName} {case_.patient.lastName}
                          </h3>
                          <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium border ${getPriorityColor(case_.priority)}`}>
                            {case_.priority} PRIORITY
                          </span>
                          <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(case_.status)}`}>
                            {case_.status}
                          </span>
                        </div>
                        <p className="text-gray-600 mb-2">{case_.description}</p>
                        <div className="flex items-center space-x-6 text-sm text-gray-500">
                          <div className="flex items-center">
                            <ClockIcon className="h-4 w-4 mr-1" />
                            Reported: {format(case_.reportedAt, 'MMM dd, h:mm a')}
                          </div>
                          <div>Age: {case_.patient.age}</div>
                          <div>Location: {case_.location}</div>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col space-y-2">
                      <Button
                        size="sm"
                        className="bg-red-600 hover:bg-red-700"
                        onClick={() => handleContactPatient(case_.patient.phoneNumber)}
                      >
                        <PhoneIcon className="h-4 w-4 mr-1" />
                        Call Patient
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleContactEmergency(case_.emergencyContact.phone)}
                      >
                        <PhoneIcon className="h-4 w-4 mr-1" />
                        Call Contact
                      </Button>
                    </div>
                  </div>

                  {/* Vital Signs */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-600 mb-1">Blood Pressure</p>
                      <p className="text-lg font-semibold text-gray-900">{case_.vitalSigns.bloodPressure}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-600 mb-1">Heart Rate</p>
                      <p className="text-lg font-semibold text-gray-900">{case_.vitalSigns.heartRate} bpm</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-600 mb-1">Temperature</p>
                      <p className="text-lg font-semibold text-gray-900">{case_.vitalSigns.temperature}°F</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-600 mb-1">Oxygen Sat</p>
                      <p className="text-lg font-semibold text-gray-900">{case_.vitalSigns.oxygenSaturation}%</p>
                    </div>
                  </div>

                  {/* Emergency Contact */}
                  <div className="bg-blue-50 rounded-lg p-4 mb-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Emergency Contact</h4>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{case_.emergencyContact.name}</p>
                        <p className="text-sm text-gray-600">{case_.emergencyContact.relationship} • {case_.emergencyContact.phone}</p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleContactEmergency(case_.emergencyContact.phone)}
                      >
                        <PhoneIcon className="h-4 w-4 mr-1" />
                        Call
                      </Button>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-between items-center">
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">
                        <DocumentTextIcon className="h-4 w-4 mr-1" />
                        View Records
                      </Button>
                      <Button size="sm" variant="outline">
                        <ChatBubbleLeftRightIcon className="h-4 w-4 mr-1" />
                        Send Message
                      </Button>
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                        Update Status
                      </Button>
                      <Button size="sm" variant="outline">
                        Transfer Case
                      </Button>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </main>
    </div>
  )
}
