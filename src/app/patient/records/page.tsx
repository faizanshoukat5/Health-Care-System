'use client'

import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/stores/auth-store'
import { Button } from '@/components/ui/button'
import { 
  DocumentTextIcon,
  ChevronLeftIcon,
  EyeIcon,
  ArrowDownTrayIcon,
  CalendarDaysIcon,
  UserIcon,
  ClipboardDocumentListIcon,
  FunnelIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'
import { format } from 'date-fns'

interface MedicalRecord {
  id: string
  appointmentDate: string
  diagnosis: string
  symptoms: string | string[]
  treatment: string
  vitals: any
  labResults?: any
  attachments?: string
  notes?: string
  doctor: {
    firstName: string
    lastName: string
    specialization: string
  }
  createdAt: string
}

const fetchMedicalRecords = async () => {
  const response = await fetch('/api/patient/medical-records')
  if (!response.ok) throw new Error('Failed to fetch medical records')
  return response.json()
}

export default function MedicalRecords() {
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'recent' | 'diagnosis' | 'doctor'>('all')
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null)

  const { data: records, isLoading } = useQuery({
    queryKey: ['medical-records'],
    queryFn: fetchMedicalRecords
  })

  const filteredRecords = React.useMemo(() => {
    if (!records) return []
    
    let filtered = records.filter((record: MedicalRecord) => {
      const searchMatch = !searchTerm || 
        record.diagnosis.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.doctor.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.doctor.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.doctor.specialization.toLowerCase().includes(searchTerm.toLowerCase())
      
      return searchMatch
    })

    if (filterType === 'recent') {
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      filtered = filtered.filter((record: MedicalRecord) => 
        new Date(record.appointmentDate) >= thirtyDaysAgo
      )
    }

    return filtered.sort((a: MedicalRecord, b: MedicalRecord) => 
      new Date(b.appointmentDate).getTime() - new Date(a.appointmentDate).getTime()
    )
  }, [records, searchTerm, filterType])

  const RecordCard = ({ record }: { record: MedicalRecord }) => (
    <div className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{record.diagnosis}</h3>
          <p className="text-sm text-gray-600">
            Dr. {record.doctor.firstName} {record.doctor.lastName} • {record.doctor.specialization}
          </p>
          <p className="text-sm text-gray-500">
            {format(new Date(record.appointmentDate), 'MMMM dd, yyyy')}
          </p>
        </div>
        <Button
          onClick={() => setSelectedRecord(record)}
          variant="outline"
          size="sm"
        >
          <EyeIcon className="h-4 w-4 mr-1" />
          View Details
        </Button>
      </div>
      
      {record.symptoms && (
        <div className="mb-3">
          <p className="text-sm font-medium text-gray-700">Symptoms:</p>
          <p className="text-sm text-gray-600">
            {typeof record.symptoms === 'string' 
              ? (() => {
                  try {
                    const parsed = JSON.parse(record.symptoms)
                    return Array.isArray(parsed) ? parsed.slice(0, 3).join(', ') : record.symptoms
                  } catch {
                    return record.symptoms
                  }
                })()
              : Array.isArray(record.symptoms) 
              ? record.symptoms.slice(0, 3).join(', ')
              : record.symptoms
            }
            {(() => {
              if (typeof record.symptoms === 'string') {
                try {
                  const parsed = JSON.parse(record.symptoms)
                  return Array.isArray(parsed) && parsed.length > 3 ? '...' : ''
                } catch {
                  return ''
                }
              }
              return Array.isArray(record.symptoms) && record.symptoms.length > 3 ? '...' : ''
            })()}
          </p>
        </div>
      )}
      
      <div className="mb-3">
        <p className="text-sm font-medium text-gray-700">Treatment:</p>
        <p className="text-sm text-gray-600 line-clamp-2">{record.treatment}</p>
      </div>
      
      {record.vitals && (
        <div className="flex items-center space-x-4 text-xs text-gray-500">
          {record.vitals.bloodPressure && (
            <span>BP: {record.vitals.bloodPressure.systolic}/{record.vitals.bloodPressure.diastolic}</span>
          )}
          {record.vitals.heartRate && (
            <span>HR: {record.vitals.heartRate} bpm</span>
          )}
          {record.vitals.temperature && (
            <span>Temp: {record.vitals.temperature}°C</span>
          )}
        </div>
      )}
    </div>
  )

  const RecordModal = ({ record, onClose }: { record: MedicalRecord, onClose: () => void }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Medical Record Details</h2>
            <Button onClick={onClose} variant="ghost" size="sm">×</Button>
          </div>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Header Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Appointment Information</h3>
              <div className="space-y-1 text-sm">
                <p><span className="font-medium">Date:</span> {format(new Date(record.appointmentDate), 'EEEE, MMMM dd, yyyy')}</p>
                <p><span className="font-medium">Doctor:</span> Dr. {record.doctor.firstName} {record.doctor.lastName}</p>
                <p><span className="font-medium">Specialization:</span> {record.doctor.specialization}</p>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Diagnosis</h3>
              <p className="text-sm text-gray-700">{record.diagnosis}</p>
            </div>
          </div>

          {/* Symptoms */}
          {record.symptoms && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Symptoms</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                {typeof record.symptoms === 'string' ? (
                  (() => {
                    try {
                      const parsed = JSON.parse(record.symptoms)
                      return Array.isArray(parsed) ? (
                        <ul className="list-disc list-inside space-y-1 text-sm">
                          {parsed.map((symptom: string, index: number) => (
                            <li key={index}>{symptom}</li>
                          ))}
                        </ul>
                      ) : <p className="text-sm">{record.symptoms}</p>
                    } catch {
                      return <p className="text-sm">{record.symptoms}</p>
                    }
                  })()
                ) : Array.isArray(record.symptoms) ? (
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    {record.symptoms.map((symptom: string, index: number) => (
                      <li key={index}>{symptom}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm">{record.symptoms}</p>
                )}
              </div>
            </div>
          )}

          {/* Treatment */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Treatment</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm whitespace-pre-wrap">{record.treatment}</p>
            </div>
          </div>

          {/* Vital Signs */}
          {record.vitals && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Vital Signs</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {record.vitals.bloodPressure && (
                    <div className="text-center">
                      <p className="text-xs text-gray-600">Blood Pressure</p>
                      <p className="font-medium">{record.vitals.bloodPressure.systolic}/{record.vitals.bloodPressure.diastolic}</p>
                    </div>
                  )}
                  {record.vitals.heartRate && (
                    <div className="text-center">
                      <p className="text-xs text-gray-600">Heart Rate</p>
                      <p className="font-medium">{record.vitals.heartRate} bpm</p>
                    </div>
                  )}
                  {record.vitals.temperature && (
                    <div className="text-center">
                      <p className="text-xs text-gray-600">Temperature</p>
                      <p className="font-medium">{record.vitals.temperature}°C</p>
                    </div>
                  )}
                  {record.vitals.weight && (
                    <div className="text-center">
                      <p className="text-xs text-gray-600">Weight</p>
                      <p className="font-medium">{record.vitals.weight} kg</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Lab Results */}
          {record.labResults && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Lab Results</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <pre className="text-sm whitespace-pre-wrap">{JSON.stringify(record.labResults, null, 2)}</pre>
              </div>
            </div>
          )}

          {/* Notes */}
          {record.notes && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Additional Notes</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm whitespace-pre-wrap">{record.notes}</p>
              </div>
            </div>
          )}

          {/* Attachments */}
          {record.attachments && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Attachments</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                {typeof record.attachments === 'string' ? (
                  JSON.parse(record.attachments).map((attachment: string, index: number) => (
                    <div key={index} className="flex items-center justify-between py-2 border-b last:border-b-0">
                      <span className="text-sm">{attachment}</span>
                      <Button size="sm" variant="outline">
                        <ArrowDownTrayIcon className="h-4 w-4 mr-1" />
                        Download
                      </Button>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">No attachments available</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/patient/dashboard">
                <Button variant="ghost" size="sm">
                  <ChevronLeftIcon className="h-4 w-4 mr-1" />
                  Back to Dashboard
                </Button>
              </Link>
              <h1 className="text-xl font-semibold text-gray-900">Medical Records</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Search records, diagnoses, or doctors..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Records</option>
                <option value="recent">Last 30 Days</option>
              </select>
              
              <Button variant="outline">
                <FunnelIcon className="h-4 w-4 mr-2" />
                Advanced Filters
              </Button>
            </div>
          </div>
        </div>

        {/* Records List */}
        <div className="space-y-6">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse bg-white rounded-lg p-6">
                  <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          ) : filteredRecords.length > 0 ? (
            <div className="space-y-4">
              {filteredRecords.map((record: MedicalRecord) => (
                <RecordCard key={record.id} record={record} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
              <ClipboardDocumentListIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Medical Records Found</h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || filterType !== 'all' 
                  ? 'No records match your current search or filter criteria.'
                  : 'You don\'t have any medical records yet. Your records will appear here after your appointments.'
                }
              </p>
              {(!searchTerm && filterType === 'all') && (
                <Link href="/patient/appointments/book">
                  <Button>
                    <CalendarDaysIcon className="h-4 w-4 mr-2" />
                    Book Your First Appointment
                  </Button>
                </Link>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Record Details Modal */}
      {selectedRecord && (
        <RecordModal 
          record={selectedRecord} 
          onClose={() => setSelectedRecord(null)} 
        />
      )}
    </div>
  )
}
