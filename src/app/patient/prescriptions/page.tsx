'use client'

import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/stores/auth-store'
import { Button } from '@/components/ui/button'
import { 
  DocumentTextIcon,
  ChevronLeftIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  BeakerIcon as PillBottleIcon,
  CalendarDaysIcon,
  UserIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'
import { format, addDays, differenceInDays } from 'date-fns'

interface Prescription {
  id: string
  medications: any
  dosage: string
  frequency: string
  duration: string
  instructions: string
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED'
  doctor: {
    firstName: string
    lastName: string
    specialization: string
  }
  createdAt: string
  updatedAt: string
}

const fetchPrescriptions = async () => {
  const response = await fetch('/api/patient/prescriptions')
  if (!response.ok) throw new Error('Failed to fetch prescriptions')
  return response.json()
}

const markAsCompleted = async (prescriptionId: string) => {
  const response = await fetch(`/api/patient/prescriptions/${prescriptionId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: 'COMPLETED' })
  })
  if (!response.ok) throw new Error('Failed to update prescription')
  return response.json()
}

export default function Prescriptions() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [filter, setFilter] = useState<'all' | 'active' | 'completed' | 'cancelled'>('all')

  const { data: prescriptions, isLoading } = useQuery({
    queryKey: ['prescriptions'],
    queryFn: fetchPrescriptions
  })

  const completeMutation = useMutation({
    mutationFn: markAsCompleted,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prescriptions'] })
      queryClient.invalidateQueries({ queryKey: ['active-prescriptions'] })
    }
  })

  const filteredPrescriptions = React.useMemo(() => {
    if (!prescriptions) return []
    if (filter === 'all') return prescriptions
    return prescriptions.filter((p: Prescription) => p.status === filter.toUpperCase())
  }, [prescriptions, filter])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'text-green-600 bg-green-100'
      case 'COMPLETED': return 'text-blue-600 bg-blue-100'
      case 'CANCELLED': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACTIVE': return <CheckCircleIcon className="h-4 w-4" />
      case 'COMPLETED': return <CheckCircleIcon className="h-4 w-4" />
      case 'CANCELLED': return <XCircleIcon className="h-4 w-4" />
      default: return <ClockIcon className="h-4 w-4" />
    }
  }

  const isExpiringSoon = (prescription: Prescription) => {
    if (prescription.status !== 'ACTIVE') return false
    
    const createdDate = new Date(prescription.createdAt)
    const durationInDays = parseInt(prescription.duration.split(' ')[0]) || 30
    const expiryDate = addDays(createdDate, durationInDays)
    const daysUntilExpiry = differenceInDays(expiryDate, new Date())
    
    return daysUntilExpiry <= 7 && daysUntilExpiry > 0
  }

  const isExpired = (prescription: Prescription) => {
    if (prescription.status !== 'ACTIVE') return false
    
    const createdDate = new Date(prescription.createdAt)
    const durationInDays = parseInt(prescription.duration.split(' ')[0]) || 30
    const expiryDate = addDays(createdDate, durationInDays)
    
    return new Date() > expiryDate
  }

  const PrescriptionCard = ({ prescription }: { prescription: Prescription }) => {
    const medications = typeof prescription.medications === 'string' 
      ? JSON.parse(prescription.medications) 
      : prescription.medications

    const expiring = isExpiringSoon(prescription)
    const expired = isExpired(prescription)

    return (
      <div className={`border rounded-lg p-6 transition-all ${
        expired ? 'border-red-200 bg-red-50' : 
        expiring ? 'border-yellow-200 bg-yellow-50' : 
        'border-gray-200 bg-white hover:shadow-md'
      }`}>
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <PillBottleIcon className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">
                {Array.isArray(medications) ? medications[0]?.name || 'Medication' : 'Medication'}
              </h3>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(prescription.status)}`}>
                {getStatusIcon(prescription.status)}
                <span className="ml-1">{prescription.status}</span>
              </span>
            </div>
            
            {expired && (
              <div className="flex items-center text-red-600 text-sm mb-2">
                <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                This prescription has expired
              </div>
            )}
            
            {expiring && !expired && (
              <div className="flex items-center text-yellow-600 text-sm mb-2">
                <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                Expires soon - consider refilling
              </div>
            )}
            
            <p className="text-sm text-gray-600 mb-1">
              Dr. {prescription.doctor.firstName} {prescription.doctor.lastName} • {prescription.doctor.specialization}
            </p>
            <p className="text-xs text-gray-500">
              Prescribed on {format(new Date(prescription.createdAt), 'MMM dd, yyyy')}
            </p>
          </div>
          
          {prescription.status === 'ACTIVE' && !expired && (
            <Button
              onClick={() => completeMutation.mutate(prescription.id)}
              disabled={completeMutation.isPending}
              size="sm"
              variant="outline"
            >
              Mark Complete
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-sm font-medium text-gray-700">Dosage</p>
            <p className="text-sm text-gray-600">{prescription.dosage}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700">Frequency</p>
            <p className="text-sm text-gray-600">{prescription.frequency}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700">Duration</p>
            <p className="text-sm text-gray-600">{prescription.duration}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700">Status</p>
            <p className="text-sm text-gray-600">{prescription.status.toLowerCase()}</p>
          </div>
        </div>

        {prescription.instructions && (
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-700 mb-1">Instructions</p>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-sm text-gray-600">{prescription.instructions}</p>
            </div>
          </div>
        )}

        {Array.isArray(medications) && medications.length > 1 && (
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">All Medications</p>
            <div className="space-y-2">
              {medications.map((med: any, index: number) => (
                <div key={index} className="bg-gray-50 rounded p-2">
                  <p className="text-sm font-medium">{med.name}</p>
                  {med.strength && <p className="text-xs text-gray-600">Strength: {med.strength}</p>}
                  {med.notes && <p className="text-xs text-gray-600">{med.notes}</p>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

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
              <h1 className="text-xl font-semibold text-gray-900">My Prescriptions</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filter Tabs */}
        <div className="bg-white rounded-lg shadow-sm border mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              {[
                { key: 'all', label: 'All Prescriptions' },
                { key: 'active', label: 'Active' },
                { key: 'completed', label: 'Completed' },
                { key: 'cancelled', label: 'Cancelled' }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key as any)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    filter === tab.key
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                  {prescriptions && (
                    <span className="ml-2 bg-gray-100 text-gray-600 py-1 px-2 rounded-full text-xs">
                      {tab.key === 'all' 
                        ? prescriptions.length 
                        : prescriptions.filter((p: Prescription) => p.status === tab.key.toUpperCase()).length
                      }
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Prescriptions List */}
        <div className="space-y-6">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse bg-white rounded-lg p-6">
                  <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="h-3 bg-gray-200 rounded"></div>
                    <div className="h-3 bg-gray-200 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredPrescriptions.length > 0 ? (
            <div className="space-y-4">
              {filteredPrescriptions.map((prescription: Prescription) => (
                <PrescriptionCard key={prescription.id} prescription={prescription} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
              <DocumentTextIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {filter === 'all' ? 'No Prescriptions Found' : `No ${filter} Prescriptions`}
              </h3>
              <p className="text-gray-600 mb-6">
                {filter === 'all' 
                  ? 'You don\'t have any prescriptions yet. Your prescriptions will appear here after your doctor visits.'
                  : `You don't have any ${filter} prescriptions at the moment.`
                }
              </p>
              {filter === 'all' && (
                <Link href="/patient/appointments/book">
                  <Button>
                    <CalendarDaysIcon className="h-4 w-4 mr-2" />
                    Book Appointment
                  </Button>
                </Link>
              )}
            </div>
          )}
        </div>

        {/* Quick Stats */}
        {prescriptions && prescriptions.length > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Prescription Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">
                  {prescriptions.filter((p: Prescription) => p.status === 'ACTIVE').length}
                </p>
                <p className="text-sm text-gray-600">Active</p>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <p className="text-2xl font-bold text-yellow-600">
                  {prescriptions.filter((p: Prescription) => isExpiringSoon(p)).length}
                </p>
                <p className="text-sm text-gray-600">Expiring Soon</p>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">
                  {prescriptions.filter((p: Prescription) => p.status === 'COMPLETED').length}
                </p>
                <p className="text-sm text-gray-600">Completed</p>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <p className="text-2xl font-bold text-red-600">
                  {prescriptions.filter((p: Prescription) => isExpired(p)).length}
                </p>
                <p className="text-sm text-gray-600">Expired</p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
