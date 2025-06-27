'use client'

import React, { useState } from 'react'
import { useAuth } from '@/stores/auth-store'
import { Button } from '@/components/ui/button'
import { 
  VideoCameraIcon,
  MicrophoneIcon,
  PhoneIcon,
  ChatBubbleLeftRightIcon,
  ChevronLeftIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  CalendarDaysIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'

export default function TelemedicinePage() {
  const { user } = useAuth()
  const [isVideoEnabled, setIsVideoEnabled] = useState(false)
  const [isAudioEnabled, setIsAudioEnabled] = useState(false)

  if (!user) {
    return <div>Please log in to access telemedicine</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <Link href="/patient/dashboard">
                <Button variant="ghost" size="sm">
                  <ChevronLeftIcon className="h-4 w-4 mr-1" />
                  Back to Dashboard
                </Button>
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">Telemedicine</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border p-8">
          <div className="text-center mb-8">
            <VideoCameraIcon className="mx-auto h-16 w-16 text-blue-600 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Video Consultation</h2>
            <p className="text-gray-600">
              Connect with your healthcare providers from the comfort of your home
            </p>
          </div>

          {/* Device Check */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Device Check</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <VideoCameraIcon className="h-5 w-5 text-gray-600" />
                  <span>Camera Access</span>
                </div>
                <Button
                  onClick={() => setIsVideoEnabled(!isVideoEnabled)}
                  variant={isVideoEnabled ? "default" : "outline"}
                  size="sm"
                >
                  {isVideoEnabled ? (
                    <>
                      <CheckCircleIcon className="h-4 w-4 mr-2" />
                      Enabled
                    </>
                  ) : (
                    'Test Camera'
                  )}
                </Button>
              </div>
              
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <MicrophoneIcon className="h-5 w-5 text-gray-600" />
                  <span>Microphone Access</span>
                </div>
                <Button
                  onClick={() => setIsAudioEnabled(!isAudioEnabled)}
                  variant={isAudioEnabled ? "default" : "outline"}
                  size="sm"
                >
                  {isAudioEnabled ? (
                    <>
                      <CheckCircleIcon className="h-4 w-4 mr-2" />
                      Enabled
                    </>
                  ) : (
                    'Test Microphone'
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Scheduled Consultations</h3>
              <p className="text-gray-600 mb-4">Join your upcoming video appointments</p>
              <Link href="/patient/appointments">
                <Button className="w-full">
                  <CalendarDaysIcon className="h-4 w-4 mr-2" />
                  View Appointments
                </Button>
              </Link>
            </div>

            <div className="border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Emergency Consultation</h3>
              <p className="text-gray-600 mb-4">Connect with an available doctor immediately</p>
              <Button className="w-full bg-red-600 hover:bg-red-700">
                <PhoneIcon className="h-4 w-4 mr-2" />
                Emergency Call
              </Button>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-start space-x-3">
              <ExclamationTriangleIcon className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-blue-900 mb-2">Before Starting Your Consultation:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Ensure you have a stable internet connection</li>
                  <li>• Test your camera and microphone</li>
                  <li>• Find a quiet, well-lit location</li>
                  <li>• Have your insurance card and ID ready</li>
                  <li>• Prepare a list of current medications</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Demo Video Call (Placeholder) */}
          <div className="mt-8 text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Test Your Setup</h3>
            <div className="bg-gray-900 rounded-lg aspect-video flex items-center justify-center mb-4">
              <div className="text-center text-white">
                <VideoCameraIcon className="mx-auto h-12 w-12 mb-2 opacity-50" />
                <p className="text-sm opacity-75">Video preview will appear here</p>
              </div>
            </div>
            <div className="flex justify-center space-x-4">
              <Button variant="outline">
                <VideoCameraIcon className="h-4 w-4 mr-2" />
                Toggle Video
              </Button>
              <Button variant="outline">
                <MicrophoneIcon className="h-4 w-4 mr-2" />
                Toggle Audio
              </Button>
              <Button variant="outline">
                <ChatBubbleLeftRightIcon className="h-4 w-4 mr-2" />
                Test Chat
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
