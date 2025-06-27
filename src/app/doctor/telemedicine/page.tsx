'use client'

import React, { useState } from 'react'
import { useAuth } from '@/stores/auth-store'
import { Button } from '@/components/ui/button'
import { 
  VideoCameraIcon,
  ChevronLeftIcon,
  PhoneIcon,
  ChatBubbleLeftRightIcon,
  ClockIcon,
  UserGroupIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  PlusIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'
import { format } from 'date-fns'

// Mock data for telemedicine sessions
const mockSessions = [
  {
    id: '1',
    patient: {
      firstName: 'John',
      lastName: 'Smith',
      email: 'john.smith@email.com',
    },
    scheduledTime: new Date('2024-01-15T14:00:00'),
    duration: 30,
    status: 'SCHEDULED',
    type: 'VIDEO_CONSULTATION',
    notes: 'Follow-up for blood pressure medication',
  },
  {
    id: '2',
    patient: {
      firstName: 'Sarah',
      lastName: 'Johnson',
      email: 'sarah.j@email.com',
    },
    scheduledTime: new Date('2024-01-15T15:30:00'),
    duration: 45,
    status: 'IN_PROGRESS',
    type: 'VIDEO_CONSULTATION',
    notes: 'Initial consultation for anxiety symptoms',
  },
]

export default function DoctorTelemedicinePage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<'scheduled' | 'active' | 'history'>('scheduled')

  if (!user) {
    return <div>Please log in to access telemedicine</div>
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SCHEDULED': return 'bg-blue-100 text-blue-800'
      case 'IN_PROGRESS': return 'bg-green-100 text-green-800'
      case 'COMPLETED': return 'bg-gray-100 text-gray-800'
      case 'CANCELLED': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const handleJoinSession = (sessionId: string) => {
    // In a real app, this would open the video call interface
    alert(`Joining video session ${sessionId}`)
  }

  const handleStartSession = (sessionId: string) => {
    // In a real app, this would start the video call
    alert(`Starting video session ${sessionId}`)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <Link href="/doctor/dashboard">
                <Button variant="ghost" size="sm">
                  <ChevronLeftIcon className="h-4 w-4 mr-1" />
                  Back to Dashboard
                </Button>
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">Telemedicine</h1>
            </div>
            <Button>
              <PlusIcon className="h-4 w-4 mr-2" />
              Schedule Video Call
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Today's Sessions</p>
                <p className="text-2xl font-semibold text-gray-900">5</p>
              </div>
              <VideoCameraIcon className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Now</p>
                <p className="text-2xl font-semibold text-gray-900">1</p>
              </div>
              <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                <div className="h-3 w-3 bg-green-600 rounded-full"></div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-semibold text-gray-900">12</p>
              </div>
              <CheckCircleIcon className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Time</p>
                <p className="text-2xl font-semibold text-gray-900">8.5h</p>
              </div>
              <ClockIcon className="h-8 w-8 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('scheduled')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'scheduled'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Scheduled Sessions
              </button>
              <button
                onClick={() => setActiveTab('active')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'active'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Active Sessions
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'history'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                History
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'scheduled' && (
              <div className="space-y-4">
                {mockSessions.filter(s => s.status === 'SCHEDULED').map((session) => (
                  <div key={session.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 font-semibold">
                              {session.patient.firstName[0]}{session.patient.lastName[0]}
                            </span>
                          </div>
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-medium text-gray-900">
                            {session.patient.firstName} {session.patient.lastName}
                          </h3>
                          <p className="text-sm text-gray-600">{session.patient.email}</p>
                          <div className="flex items-center space-x-4 mt-1">
                            <div className="flex items-center text-sm text-gray-500">
                              <ClockIcon className="h-4 w-4 mr-1" />
                              {format(session.scheduledTime, 'MMM dd, yyyy • h:mm a')}
                            </div>
                            <div className="text-sm text-gray-500">
                              Duration: {session.duration} min
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(session.status)}`}>
                          {session.status.replace('_', ' ')}
                        </span>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            onClick={() => handleStartSession(session.id)}
                          >
                            <VideoCameraIcon className="h-4 w-4 mr-1" />
                            Start Call
                          </Button>
                          <Button size="sm" variant="outline">
                            <ChatBubbleLeftRightIcon className="h-4 w-4 mr-1" />
                            Message
                          </Button>
                        </div>
                      </div>
                    </div>
                    {session.notes && (
                      <div className="mt-4 ml-16">
                        <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                          <strong>Notes:</strong> {session.notes}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
                {mockSessions.filter(s => s.status === 'SCHEDULED').length === 0 && (
                  <div className="text-center py-12">
                    <VideoCameraIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No scheduled sessions</h3>
                    <p className="text-gray-500">Your upcoming video consultations will appear here.</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'active' && (
              <div className="space-y-4">
                {mockSessions.filter(s => s.status === 'IN_PROGRESS').map((session) => (
                  <div key={session.id} className="border border-green-200 bg-green-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center relative">
                            <span className="text-green-600 font-semibold">
                              {session.patient.firstName[0]}{session.patient.lastName[0]}
                            </span>
                            <div className="absolute -top-1 -right-1 h-4 w-4 bg-green-500 rounded-full flex items-center justify-center">
                              <div className="h-2 w-2 bg-white rounded-full"></div>
                            </div>
                          </div>
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-medium text-gray-900">
                            {session.patient.firstName} {session.patient.lastName}
                          </h3>
                          <p className="text-sm text-gray-600">{session.patient.email}</p>
                          <div className="flex items-center space-x-4 mt-1">
                            <div className="flex items-center text-sm text-green-600 font-medium">
                              <div className="h-2 w-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                              Session in progress
                            </div>
                            <div className="text-sm text-gray-500">
                              Started: {format(session.scheduledTime, 'h:mm a')}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          onClick={() => handleJoinSession(session.id)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <VideoCameraIcon className="h-4 w-4 mr-1" />
                          Join Call
                        </Button>
                        <Button size="sm" variant="outline">
                          End Call
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                {mockSessions.filter(s => s.status === 'IN_PROGRESS').length === 0 && (
                  <div className="text-center py-12">
                    <ExclamationTriangleIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No active sessions</h3>
                    <p className="text-gray-500">Active video consultations will appear here.</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'history' && (
              <div className="text-center py-12">
                <CheckCircleIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Session history</h3>
                <p className="text-gray-500">Your completed video consultations will appear here.</p>
              </div>
            )}
          </div>
        </div>

        {/* Video Call Setup */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Video Call Settings</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">Camera & Microphone</h4>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <VideoCameraIcon className="h-4 w-4 mr-2" />
                  Test Camera
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <PhoneIcon className="h-4 w-4 mr-2" />
                  Test Microphone
                </Button>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">Connection</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Connection Status:</span>
                  <span className="text-green-600 font-medium">Good</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Network Speed:</span>
                  <span className="text-gray-900">45 Mbps</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
