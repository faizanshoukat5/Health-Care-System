'use client'

import React, { useState } from 'react'
import { useAuth } from '@/stores/auth-store'
import { Button } from '@/components/ui/button'
import {
  DocumentTextIcon,
  CalendarIcon,
  UserIcon,
  DownloadIcon,
  EyeIcon,
  FolderIcon,
  MagnifyingGlassIcon,
  ClockIcon,
  HeartIcon,
  BeakerIcon,
  PhotoIcon,
  PlusIcon
} from '@heroicons/react/24/outline'

export default function MedicalRecordsPage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('overview')
  const [searchTerm, setSearchTerm] = useState('')

  // Mock data
  const records = {
    overview: {
      totalRecords: 42,
      lastUpdated: '2024-06-20',
      recentVisits: 3,
      activePrescriptions: 2
    },
    visits: [
      {
        id: 1,
        date: '2024-06-20',
        provider: 'Dr. Sarah Johnson',
        type: 'Annual Checkup',
        diagnosis: 'Routine examination - healthy',
        notes: 'Patient reports feeling well. All vital signs normal.',
        attachments: ['blood_work_results.pdf']
      },
      {
        id: 2,
        date: '2024-05-15',
        provider: 'Dr. Michael Chen',
        type: 'Follow-up',
        diagnosis: 'Hypertension monitoring',
        notes: 'Blood pressure improved. Continue current medication.',
        attachments: []
      },
      {
        id: 3,
        date: '2024-04-02',
        provider: 'Dr. Emily Rodriguez',
        type: 'Specialist Consultation',
        diagnosis: 'Dermatology consultation',
        notes: 'Skin condition evaluated. Prescribed topical treatment.',
        attachments: ['dermatology_photos.jpg']
      }
    ],
    labResults: [
      {
        id: 1,
        date: '2024-06-18',
        test: 'Complete Blood Count',
        status: 'Normal',
        provider: 'LabCorp',
        results: {
          'White Blood Cells': '7.2 K/uL',
          'Red Blood Cells': '4.8 M/uL',
          'Hemoglobin': '14.2 g/dL',
          'Platelets': '285 K/uL'
        }
      },
      {
        id: 2,
        date: '2024-06-18',
        test: 'Lipid Panel',
        status: 'Borderline',
        provider: 'LabCorp',
        results: {
          'Total Cholesterol': '205 mg/dL',
          'LDL': '135 mg/dL',
          'HDL': '45 mg/dL',
          'Triglycerides': '150 mg/dL'
        }
      },
      {
        id: 3,
        date: '2024-05-10',
        test: 'Thyroid Function',
        status: 'Normal',
        provider: 'Quest Diagnostics',
        results: {
          'TSH': '2.1 mIU/L',
          'T4': '8.5 ug/dL',
          'T3': '120 ng/dL'
        }
      }
    ],
    prescriptions: [
      {
        id: 1,
        medication: 'Lisinopril 10mg',
        prescriber: 'Dr. Michael Chen',
        startDate: '2024-05-15',
        endDate: '2024-11-15',
        instructions: 'Take once daily with water',
        refills: 3,
        status: 'Active'
      },
      {
        id: 2,
        medication: 'Vitamin D3 2000 IU',
        prescriber: 'Dr. Sarah Johnson',
        startDate: '2024-06-20',
        endDate: '2024-12-20',
        instructions: 'Take once daily with food',
        refills: 5,
        status: 'Active'
      },
      {
        id: 3,
        medication: 'Hydrocortisone Cream 1%',
        prescriber: 'Dr. Emily Rodriguez',
        startDate: '2024-04-02',
        endDate: '2024-04-30',
        instructions: 'Apply to affected area twice daily',
        refills: 0,
        status: 'Completed'
      }
    ],
    imaging: [
      {
        id: 1,
        date: '2024-06-15',
        type: 'Chest X-Ray',
        provider: 'Radiology Associates',
        results: 'Normal chest structures. No acute findings.',
        images: ['chest_xray_001.jpg', 'chest_xray_002.jpg']
      },
      {
        id: 2,
        date: '2024-03-20',
        type: 'Ultrasound - Abdominal',
        provider: 'Imaging Center',
        results: 'Normal abdominal structures. No abnormalities detected.',
        images: ['abdominal_us_001.jpg']
      }
    ]
  }

  const tabs = [
    { id: 'overview', name: 'Overview', icon: FolderIcon },
    { id: 'visits', name: 'Visit Records', icon: DocumentTextIcon },
    { id: 'labs', name: 'Lab Results', icon: BeakerIcon },
    { id: 'prescriptions', name: 'Prescriptions', icon: HeartIcon },
    { id: 'imaging', name: 'Imaging', icon: PhotoIcon },
  ]

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'normal':
        return 'text-green-600 bg-green-100'
      case 'borderline':
        return 'text-yellow-600 bg-yellow-100'
      case 'abnormal':
        return 'text-red-600 bg-red-100'
      case 'active':
        return 'text-blue-600 bg-blue-100'
      case 'completed':
        return 'text-gray-600 bg-gray-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600">Please log in to view your medical records.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white shadow rounded-lg mb-8 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Medical Records</h1>
              <p className="text-gray-600 mt-1">Complete health history and documentation</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search records..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <Button>
                <PlusIcon className="h-4 w-4 mr-2" />
                Request Records
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <nav className="space-y-1 bg-white rounded-lg shadow p-4">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <tab.icon className="h-5 w-5 mr-3" />
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>

          {/* Main content */}
          <div className="lg:col-span-3">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                      <DocumentTextIcon className="h-8 w-8 text-blue-600" />
                      <div className="ml-4">
                        <p className="text-sm text-gray-600">Total Records</p>
                        <p className="text-2xl font-bold text-gray-900">{records.overview.totalRecords}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                      <CalendarIcon className="h-8 w-8 text-green-600" />
                      <div className="ml-4">
                        <p className="text-sm text-gray-600">Recent Visits</p>
                        <p className="text-2xl font-bold text-gray-900">{records.overview.recentVisits}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                      <HeartIcon className="h-8 w-8 text-red-600" />
                      <div className="ml-4">
                        <p className="text-sm text-gray-600">Active Prescriptions</p>
                        <p className="text-2xl font-bold text-gray-900">{records.overview.activePrescriptions}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                      <ClockIcon className="h-8 w-8 text-purple-600" />
                      <div className="ml-4">
                        <p className="text-sm text-gray-600">Last Updated</p>
                        <p className="text-lg font-bold text-gray-900">{records.overview.lastUpdated}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
                  <div className="space-y-4">
                    {records.visits.slice(0, 3).map((visit) => (
                      <div key={visit.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center">
                          <UserIcon className="h-8 w-8 text-gray-400" />
                          <div className="ml-4">
                            <p className="font-medium text-gray-900">{visit.type}</p>
                            <p className="text-sm text-gray-600">with {visit.provider}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-900">{visit.date}</p>
                          <Button variant="ghost" size="sm">
                            <EyeIcon className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'visits' && (
              <div className="bg-white rounded-lg shadow">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Visit Records</h3>
                </div>
                <div className="divide-y divide-gray-200">
                  {records.visits.map((visit) => (
                    <div key={visit.id} className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-lg font-medium text-gray-900">{visit.type}</h4>
                            <span className="text-sm text-gray-500">{visit.date}</span>
                          </div>
                          <p className="text-gray-600 mb-2">Provider: {visit.provider}</p>
                          <p className="text-gray-900 font-medium mb-2">Diagnosis: {visit.diagnosis}</p>
                          <p className="text-gray-700 mb-4">{visit.notes}</p>
                          {visit.attachments.length > 0 && (
                            <div className="flex items-center space-x-2">
                              <DocumentTextIcon className="h-4 w-4 text-gray-400" />
                              <span className="text-sm text-gray-600">
                                {visit.attachments.length} attachment(s)
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="ml-6 flex space-x-2">
                          <Button variant="ghost" size="sm">
                            <EyeIcon className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          <Button variant="ghost" size="sm">
                            <DownloadIcon className="h-4 w-4 mr-1" />
                            Download
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'labs' && (
              <div className="bg-white rounded-lg shadow">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Laboratory Results</h3>
                </div>
                <div className="divide-y divide-gray-200">
                  {records.labResults.map((lab) => (
                    <div key={lab.id} className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h4 className="text-lg font-medium text-gray-900">{lab.test}</h4>
                          <p className="text-gray-600">Provider: {lab.provider}</p>
                          <p className="text-gray-600">Date: {lab.date}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(lab.status)}`}>
                          {lab.status}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.entries(lab.results).map(([key, value]) => (
                          <div key={key} className="flex justify-between p-3 bg-gray-50 rounded">
                            <span className="font-medium">{key}:</span>
                            <span>{value}</span>
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 flex space-x-2">
                        <Button variant="ghost" size="sm">
                          <EyeIcon className="h-4 w-4 mr-1" />
                          View Details
                        </Button>
                        <Button variant="ghost" size="sm">
                          <DownloadIcon className="h-4 w-4 mr-1" />
                          Download Report
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'prescriptions' && (
              <div className="bg-white rounded-lg shadow">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Prescriptions</h3>
                </div>
                <div className="divide-y divide-gray-200">
                  {records.prescriptions.map((prescription) => (
                    <div key={prescription.id} className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-lg font-medium text-gray-900">{prescription.medication}</h4>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(prescription.status)}`}>
                              {prescription.status}
                            </span>
                          </div>
                          <p className="text-gray-600 mb-1">Prescribed by: {prescription.prescriber}</p>
                          <p className="text-gray-600 mb-1">Duration: {prescription.startDate} to {prescription.endDate}</p>
                          <p className="text-gray-700 mb-2">{prescription.instructions}</p>
                          <p className="text-sm text-gray-600">Refills remaining: {prescription.refills}</p>
                        </div>
                        <div className="ml-6 flex space-x-2">
                          <Button variant="ghost" size="sm">
                            <EyeIcon className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          {prescription.status === 'Active' && (
                            <Button size="sm">Request Refill</Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'imaging' && (
              <div className="bg-white rounded-lg shadow">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Medical Imaging</h3>
                </div>
                <div className="divide-y divide-gray-200">
                  {records.imaging.map((imaging) => (
                    <div key={imaging.id} className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="text-lg font-medium text-gray-900 mb-2">{imaging.type}</h4>
                          <p className="text-gray-600 mb-1">Provider: {imaging.provider}</p>
                          <p className="text-gray-600 mb-3">Date: {imaging.date}</p>
                          <p className="text-gray-700 mb-4">{imaging.results}</p>
                          <div className="flex items-center space-x-2">
                            <PhotoIcon className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-600">
                              {imaging.images.length} image(s)
                            </span>
                          </div>
                        </div>
                        <div className="ml-6 flex space-x-2">
                          <Button variant="ghost" size="sm">
                            <EyeIcon className="h-4 w-4 mr-1" />
                            View Images
                          </Button>
                          <Button variant="ghost" size="sm">
                            <DownloadIcon className="h-4 w-4 mr-1" />
                            Download
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
