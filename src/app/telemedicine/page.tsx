'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import {
  VideoCameraIcon,
  MicrophoneIcon,
  SpeakerWaveIcon,
  PhoneXMarkIcon,
  ChatBubbleLeftIcon,
  ShareIcon,
  CogIcon,
  UserGroupIcon,
  ComputerDesktopIcon,
  VideoCameraSlashIcon,
  NoSymbolIcon
} from '@heroicons/react/24/outline'

const TelemedicinePage = () => {
  const [isInCall, setIsInCall] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOff, setIsVideoOff] = useState(false)
  const [showChat, setShowChat] = useState(false)
  const [chatMessage, setChatMessage] = useState('')
  const [messages, setMessages] = useState([
    { id: 1, sender: 'Dr. Sarah Johnson', message: 'Hello! How are you feeling today?', time: '10:30 AM', isDoctor: true },
    { id: 2, sender: 'You', message: 'Hi Dr. Johnson, I\'ve been having some chest discomfort.', time: '10:31 AM', isDoctor: false }
  ])
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const [upcomingCalls, setUpcomingCalls] = useState([
    {
      id: 1,
      doctor: 'Dr. Sarah Johnson',
      specialty: 'Cardiologist',
      time: '10:00 AM - 10:30 AM',
      date: 'Today',
      status: 'ready',
      avatar: '/api/placeholder/60/60'
    },
    {
      id: 2,
      doctor: 'Dr. Michael Chen',
      specialty: 'Dermatologist',
      time: '2:30 PM - 3:00 PM',
      date: 'Tomorrow',
      status: 'scheduled',
      avatar: '/api/placeholder/60/60'
    }
  ])

  useEffect(() => {
    // Simulate getting user video when component mounts
    if (videoRef.current && isInCall) {
      navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        .then(stream => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream
          }
        })
        .catch(err => console.log('Error accessing media devices:', err))
    }
  }, [isInCall])

  const handleStartCall = () => {
    setIsInCall(true)
  }

  const handleEndCall = () => {
    setIsInCall(false)
    setIsMuted(false)
    setIsVideoOff(false)
    setShowChat(false)
  }

  const toggleMute = () => {
    setIsMuted(!isMuted)
  }

  const toggleVideo = () => {
    setIsVideoOff(!isVideoOff)
  }

  const sendMessage = () => {
    if (chatMessage.trim()) {
      const newMessage = {
        id: messages.length + 1,
        sender: 'You',
        message: chatMessage,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isDoctor: false
      }
      setMessages([...messages, newMessage])
      setChatMessage('')
    }
  }

  if (isInCall) {
    return (
      <div className="min-h-screen bg-gray-900 flex">
        {/* Main video area */}
        <div className={`flex-1 relative ${showChat ? 'pr-80' : ''}`}>
          {/* Doctor's video (main) */}
          <div className="absolute inset-0">
            <div className="w-full h-full bg-gray-800 flex items-center justify-center">
              <div className="text-center">
                <div className="w-32 h-32 rounded-full bg-blue-500 flex items-center justify-center mx-auto mb-4">
                  <span className="text-white text-4xl font-bold">SJ</span>
                </div>
                <h3 className="text-white text-xl font-semibold">Dr. Sarah Johnson</h3>
                <p className="text-gray-300">Cardiologist</p>
              </div>
            </div>
          </div>

          {/* Your video (picture-in-picture) */}
          <div className="absolute top-4 right-4 w-48 h-36 bg-gray-700 rounded-lg overflow-hidden border-2 border-white">
            {isVideoOff ? (
              <div className="w-full h-full flex items-center justify-center">
                <VideoCameraSlashIcon className="h-8 w-8 text-gray-400" />
              </div>
            ) : (
              <video
                ref={videoRef}
                autoPlay
                muted
                className="w-full h-full object-cover"
              />
            )}
          </div>

          {/* Controls */}
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2">
            <div className="flex items-center space-x-4 bg-gray-800 rounded-full px-6 py-3">
              <button
                onClick={toggleMute}
                className={`p-3 rounded-full transition-colors ${
                  isMuted ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-600 hover:bg-gray-700'
                }`}
              >
                {isMuted ? (
                  <NoSymbolIcon className="h-5 w-5 text-white" />
                ) : (
                  <MicrophoneIcon className="h-5 w-5 text-white" />
                )}
              </button>

              <button
                onClick={toggleVideo}
                className={`p-3 rounded-full transition-colors ${
                  isVideoOff ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-600 hover:bg-gray-700'
                }`}
              >
                {isVideoOff ? (
                  <VideoCameraSlashIcon className="h-5 w-5 text-white" />
                ) : (
                  <VideoCameraIcon className="h-5 w-5 text-white" />
                )}
              </button>

              <button
                onClick={() => setShowChat(!showChat)}
                className="p-3 bg-gray-600 hover:bg-gray-700 rounded-full transition-colors"
              >
                <ChatBubbleLeftIcon className="h-5 w-5 text-white" />
              </button>

              <button className="p-3 bg-gray-600 hover:bg-gray-700 rounded-full transition-colors">
                <ShareIcon className="h-5 w-5 text-white" />
              </button>

              <button
                onClick={handleEndCall}
                className="p-3 bg-red-500 hover:bg-red-600 rounded-full transition-colors"
              >
                <PhoneXMarkIcon className="h-5 w-5 text-white" />
              </button>
            </div>
          </div>

          {/* Call info */}
          <div className="absolute top-4 left-4 bg-gray-800 bg-opacity-75 rounded-lg px-4 py-2">
            <p className="text-white text-sm">Call Duration: 05:23</p>
          </div>
        </div>

        {/* Chat sidebar */}
        {showChat && (
          <div className="w-80 bg-white flex flex-col">
            <div className="p-4 border-b bg-gray-50">
              <h3 className="font-semibold text-gray-900">Chat</h3>
            </div>
            
            <div className="flex-1 p-4 overflow-y-auto space-y-3">
              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.isDoctor ? 'justify-start' : 'justify-end'}`}>
                  <div className={`max-w-xs rounded-lg px-3 py-2 ${
                    message.isDoctor ? 'bg-gray-100 text-gray-900' : 'bg-blue-500 text-white'
                  }`}>
                    <p className="text-sm">{message.message}</p>
                    <p className={`text-xs mt-1 ${message.isDoctor ? 'text-gray-500' : 'text-blue-100'}`}>
                      {message.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="p-4 border-t">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Type a message..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <Button onClick={sendMessage} size="sm">
                  Send
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Telemedicine</h1>
          <p className="mt-2 text-gray-600">Connect with your healthcare providers remotely</p>
        </div>

        {/* Upcoming Video Calls */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Upcoming Video Calls</h2>
          <div className="grid gap-6 md:grid-cols-2">
            {upcomingCalls.map((call) => (
              <div key={call.id} className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-blue-600 font-semibold">
                        {call.doctor.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{call.doctor}</h3>
                      <p className="text-sm text-gray-600">{call.specialty}</p>
                      <div className="mt-2">
                        <p className="text-sm text-gray-500">{call.date}</p>
                        <p className="text-sm text-gray-500">{call.time}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col space-y-2">
                    {call.status === 'ready' ? (
                      <Button onClick={handleStartCall} className="flex items-center space-x-2">
                        <VideoCameraIcon className="h-4 w-4" />
                        <span>Join Call</span>
                      </Button>
                    ) : (
                      <Button variant="outline" disabled>
                        Scheduled
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
              <VideoCameraIcon className="h-8 w-8 text-blue-500 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Schedule Video Call</h3>
              <p className="text-sm text-gray-600 mb-4">Book a video consultation with your doctor</p>
              <Button variant="outline" className="w-full">Schedule</Button>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
              <ChatBubbleLeftIcon className="h-8 w-8 text-green-500 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Secure Messaging</h3>
              <p className="text-sm text-gray-600 mb-4">Send secure messages to your care team</p>
              <Button variant="outline" className="w-full">Message</Button>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
              <ComputerDesktopIcon className="h-8 w-8 text-purple-500 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Test Your Setup</h3>
              <p className="text-sm text-gray-600 mb-4">Check your camera and microphone</p>
              <Button variant="outline" className="w-full">Test Setup</Button>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Telemedicine Features</h2>
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Secure Video Calls</h3>
              <p className="text-sm text-gray-600">High-quality, HIPAA-compliant video consultations with your healthcare providers.</p>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Screen Sharing</h3>
              <p className="text-sm text-gray-600">Share medical documents, test results, or images during your consultation.</p>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Real-time Chat</h3>
              <p className="text-sm text-gray-600">Send secure messages during your video call or outside of appointments.</p>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Recording Options</h3>
              <p className="text-sm text-gray-600">With consent, record consultations for future reference and review.</p>
            </div>
          </div>
        </div>

        {/* System Requirements */}
        <div className="mt-6 bg-blue-50 rounded-lg p-6">
          <h3 className="font-medium text-blue-900 mb-2">System Requirements</h3>
          <div className="text-sm text-blue-800 space-y-1">
            <p>• Modern web browser (Chrome, Firefox, Safari, Edge)</p>
            <p>• Stable internet connection (minimum 1 Mbps upload/download)</p>
            <p>• Webcam and microphone</p>
            <p>• Allow camera and microphone permissions when prompted</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TelemedicinePage
