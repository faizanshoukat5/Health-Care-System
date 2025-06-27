'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/stores/auth-store'
import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { 
  DocumentTextIcon,
  ChevronLeftIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  PlusIcon,
  PencilIcon,
  EyeIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'
import { format } from 'date-fns'

// API function
const fetchPrescriptions = async (doctorId: string, token: string) => {
  const response = await fetch(`/api/doctor/${doctorId}/prescriptions`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  })
  if (!response.ok) throw new Error('Failed to fetch prescriptions')
  return response.json()
}

export default function DoctorPrescriptionsPage() {
  const { user, token } = useAuth()
  const [doctorId, setDoctorId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')

  // Fetch doctor ID from user profile
  useEffect(() => {
    const fetchDoctorProfile = async () => {
      if (user?.id && token) {
        try {
          const response = await fetch(`/api/user/${user.id}/profile`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            credentials: 'include',
          })
          const data = await response.json()
          if (data.doctor) {
            setDoctorId(data.doctor.id)
          }
        } catch (error) {
          console.error('Failed to fetch doctor profile:', error)
        }
      }
    }
    fetchDoctorProfile()
  }, [user, token])

  // Data query
  const { data: prescriptions, isLoading } = useQuery({
    queryKey: ['doctor-prescriptions', doctorId],
    queryFn: () => fetchPrescriptions(doctorId!, token!),
    enabled: !!doctorId && !!token,
  })

  if (!user) {
    return <div>Please log in to access prescriptions</div>
  }

  // Filter prescriptions
  const filteredPrescriptions = prescriptions?.filter((prescription: any) => {
    const matchesSearch = prescription.medication.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         prescription.patient.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         prescription.patient.lastName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'ALL' || prescription.status === statusFilter
    return matchesSearch && matchesStatus
  }) || []

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800'
      case 'COMPLETED': return 'bg-gray-100 text-gray-800'
      case 'CANCELLED': return 'bg-red-100 text-red-800'
      case 'PENDING': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
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
              <h1 className="text-2xl font-bold text-gray-900">Prescriptions</h1>
            </div>
            <Button>
              <PlusIcon className="h-4 w-4 mr-2" />
              New Prescription
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by medication or patient name..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <FunnelIcon className="h-5 w-5 text-gray-400" />
              <select
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="ALL">All Status</option>
                <option value="ACTIVE">Active</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
                <option value="PENDING">Pending</option>
              </select>
            </div>
          </div>
        </div>

        {/* Prescriptions List */}
        <div className="bg-white rounded-lg shadow-sm border">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading prescriptions...</p>
            </div>
          ) : filteredPrescriptions.length === 0 ? (
            <div className="p-8 text-center">
              <DocumentTextIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No prescriptions found</h3>
              <p className="text-gray-500">
                {searchTerm || statusFilter !== 'ALL' 
                  ? 'Try adjusting your search or filter criteria.' 
                  : 'You haven\'t prescribed any medications yet.'}
              </p>
              <Button className="mt-4">
                <PlusIcon className="h-4 w-4 mr-2" />
                Create First Prescription
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredPrescriptions.map((prescription: any) => (
                <div key={prescription.id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                            <DocumentTextIcon className="h-6 w-6 text-green-600" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-medium text-gray-900">
                            {prescription.medication}
                          </h3>
                          <p className="text-sm text-gray-600">
                            For: {prescription.patient.firstName} {prescription.patient.lastName}
                          </p>
                          <div className="flex items-center space-x-4 mt-2">
                            <div className="text-sm text-gray-500">
                              <strong>Dosage:</strong> {prescription.dosage}
                            </div>
                            <div className="text-sm text-gray-500">
                              <strong>Frequency:</strong> {prescription.frequency}
                            </div>
                            <div className="text-sm text-gray-500">
                              <strong>Duration:</strong> {prescription.duration}
                            </div>
                          </div>
                          <div className="flex items-center space-x-4 mt-1">
                            <div className="text-sm text-gray-500">
                              <strong>Prescribed:</strong> {format(new Date(prescription.createdAt), 'MMM dd, yyyy')}
                            </div>
                            {prescription.startDate && (
                              <div className="text-sm text-gray-500">
                                <strong>Start Date:</strong> {format(new Date(prescription.startDate), 'MMM dd, yyyy')}
                              </div>
                            )}
                            {prescription.endDate && (
                              <div className="text-sm text-gray-500">
                                <strong>End Date:</strong> {format(new Date(prescription.endDate), 'MMM dd, yyyy')}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(prescription.status)}`}>
                        {prescription.status}
                      </span>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          <EyeIcon className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button size="sm" variant="outline">
                          <PencilIcon className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                      </div>
                    </div>
                  </div>
                  {prescription.instructions && (
                    <div className="mt-4 ml-16">
                      <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                        <strong>Instructions:</strong> {prescription.instructions}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
