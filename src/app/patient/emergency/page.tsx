'use client'

import React, { useState } from 'react'
import { useAuth } from '@/stores/auth-store'
import { Button } from '@/components/ui/button'
import { 
  PhoneIcon,
  ChevronLeftIcon,
  ExclamationTriangleIcon,
  MapPinIcon,
  ClockIcon,
  HeartIcon,
  UserGroupIcon,
  BuildingOfficeIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'

interface EmergencyContact {
  name: string
  phone: string
  relationship: string
  type: 'primary' | 'secondary' | 'medical'
}

const emergencyServices = [
  {
    name: 'Emergency Services',
    phone: '911',
    description: 'Police, Fire, Ambulance',
    type: 'emergency',
    icon: ExclamationTriangleIcon,
    color: 'bg-red-600 hover:bg-red-700'
  },
  {
    name: 'Poison Control',
    phone: '1-800-222-1222',
    description: '24/7 Poison Emergency',
    type: 'medical',
    icon: HeartIcon,
    color: 'bg-orange-600 hover:bg-orange-700'
  },
  {
    name: 'Crisis Helpline',
    phone: '988',
    description: 'Mental Health Crisis',
    type: 'mental',
    icon: UserGroupIcon,
    color: 'bg-blue-600 hover:bg-blue-700'
  }
]

const nearbyHospitals = [
  {
    name: 'City General Hospital',
    address: '123 Medical Center Dr',
    phone: '(555) 123-4567',
    distance: '2.1 miles',
    hasER: true
  },
  {
    name: 'St. Mary Medical Center',
    address: '456 Health St',
    phone: '(555) 234-5678',
    distance: '3.8 miles',
    hasER: true
  },
  {
    name: 'Regional Medical Clinic',
    address: '789 Care Ave',
    phone: '(555) 345-6789',
    distance: '1.5 miles',
    hasER: false
  }
]

export default function EmergencyContact() {
  const { user } = useAuth()
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([
    {
      name: 'John Smith',
      phone: '(555) 123-4567',
      relationship: 'Spouse',
      type: 'primary'
    },
    {
      name: 'Dr. Sarah Johnson',
      phone: '(555) 987-6543',
      relationship: 'Primary Care Physician',
      type: 'medical'
    }
  ])

  const handleCall = (phone: string) => {
    window.location.href = `tel:${phone}`
  }

  const getDirections = (address: string) => {
    const encodedAddress = encodeURIComponent(address)
    window.open(`https://maps.google.com/maps?q=${encodedAddress}`, '_blank')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-red-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/patient/dashboard">
                <Button variant="ghost" size="sm" className="text-white hover:bg-red-700">
                  <ChevronLeftIcon className="h-4 w-4 mr-1" />
                  Back to Dashboard
                </Button>
              </Link>
              <div className="flex items-center space-x-2">
                <ExclamationTriangleIcon className="h-6 w-6" />
                <h1 className="text-xl font-semibold">Emergency Contacts</h1>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Emergency Alert */}
      <div className="bg-red-50 border-l-4 border-red-400 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">
              <strong>Emergency Situation?</strong> If this is a life-threatening emergency, 
              <strong> call 911 immediately</strong> or go to the nearest emergency room.
            </p>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Emergency Services */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Emergency Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {emergencyServices.map((service, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center mb-4">
                  <div className={`p-2 rounded-lg ${service.color} text-white mr-3`}>
                    <service.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{service.name}</h3>
                    <p className="text-sm text-gray-600">{service.description}</p>
                  </div>
                </div>
                <Button
                  onClick={() => handleCall(service.phone)}
                  className={`w-full ${service.color} text-white`}
                >
                  <PhoneIcon className="h-4 w-4 mr-2" />
                  Call {service.phone}
                </Button>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Personal Emergency Contacts */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Your Emergency Contacts</h3>
              <Button variant="outline" size="sm">
                <UserGroupIcon className="h-4 w-4 mr-1" />
                Edit Contacts
              </Button>
            </div>
            
            <div className="space-y-4">
              {emergencyContacts.map((contact, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">{contact.name}</h4>
                      <p className="text-sm text-gray-600">{contact.relationship}</p>
                      <p className="text-sm text-gray-500">{contact.phone}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        contact.type === 'primary' ? 'bg-blue-100 text-blue-800' :
                        contact.type === 'medical' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {contact.type}
                      </span>
                      <Button
                        onClick={() => handleCall(contact.phone)}
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        <PhoneIcon className="h-4 w-4 mr-1" />
                        Call
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <div className="flex">
                <InformationCircleIcon className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="ml-3">
                  <p className="text-sm text-blue-700">
                    Keep your emergency contacts updated. Make sure they know your medical conditions, 
                    allergies, and current medications.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Nearby Hospitals */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Nearby Hospitals</h3>
              <Button variant="outline" size="sm">
                <MapPinIcon className="h-4 w-4 mr-1" />
                Find More
              </Button>
            </div>
            
            <div className="space-y-4">
              {nearbyHospitals.map((hospital, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="font-medium text-gray-900">{hospital.name}</h4>
                        {hospital.hasER && (
                          <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                            ER
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-1">{hospital.address}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span className="flex items-center">
                          <MapPinIcon className="h-4 w-4 mr-1" />
                          {hospital.distance}
                        </span>
                        <span className="flex items-center">
                          <PhoneIcon className="h-4 w-4 mr-1" />
                          {hospital.phone}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 mt-3">
                    <Button
                      onClick={() => handleCall(hospital.phone)}
                      size="sm"
                      variant="outline"
                      className="flex-1"
                    >
                      <PhoneIcon className="h-4 w-4 mr-1" />
                      Call
                    </Button>
                    <Button
                      onClick={() => getDirections(hospital.address)}
                      size="sm"
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <MapPinIcon className="h-4 w-4 mr-1" />
                      Directions
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Medical Information */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Important Medical Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-red-50 rounded-lg p-4">
              <h4 className="font-medium text-red-800 mb-2">Allergies</h4>
              <p className="text-sm text-red-700">
                Penicillin, Shellfish
              </p>
            </div>
            
            <div className="bg-orange-50 rounded-lg p-4">
              <h4 className="font-medium text-orange-800 mb-2">Medical Conditions</h4>
              <p className="text-sm text-orange-700">
                Diabetes Type 2, Hypertension
              </p>
            </div>
            
            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="font-medium text-blue-800 mb-2">Current Medications</h4>
              <p className="text-sm text-blue-700">
                Metformin 500mg, Lisinopril 10mg
              </p>
            </div>
          </div>
          
          <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
            <div className="flex">
              <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400 flex-shrink-0 mt-0.5" />
              <div className="ml-3">
                <h4 className="text-sm font-medium text-yellow-800">Emergency Instructions</h4>
                <p className="text-sm text-yellow-700 mt-1">
                  Always inform emergency responders about your allergies and current medications. 
                  Keep this information updated and easily accessible.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="/patient/vitals/log">
              <Button variant="outline" className="w-full">
                <HeartIcon className="h-4 w-4 mr-2" />
                Log Vitals
              </Button>
            </Link>
            <Link href="/patient/records">
              <Button variant="outline" className="w-full">
                <BuildingOfficeIcon className="h-4 w-4 mr-2" />
                Medical Records
              </Button>
            </Link>
            <Link href="/patient/prescriptions">
              <Button variant="outline" className="w-full">
                <ClockIcon className="h-4 w-4 mr-2" />
                Prescriptions
              </Button>
            </Link>
            <Link href="/patient/appointments/book">
              <Button variant="outline" className="w-full">
                <PhoneIcon className="h-4 w-4 mr-2" />
                Book Appointment
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
