'use client'

import React, { useState } from 'react'
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import { useAuth } from '@/stores/auth-store'
import { Button } from '@/components/ui/button'
import { 
  HeartIcon,
  ChevronLeftIcon,
  PlusCircleIcon,
  ChartBarIcon,
  ClockIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'
import { format } from 'date-fns'

interface VitalSigns {
  bloodPressure: {
    systolic: number
    diastolic: number
  }
  heartRate?: number
  temperature?: number
  weight?: number
  height?: number
  oxygenSaturation?: number
  bloodSugar?: number
}

const logVitalSigns = async (data: any) => {
  const response = await fetch('/api/patient/vitals', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  if (!response.ok) throw new Error('Failed to log vital signs')
  return response.json()
}

const fetchRecentVitals = async () => {
  const response = await fetch('/api/patient/vitals/recent')
  if (!response.ok) throw new Error('Failed to fetch recent vitals')
  return response.json()
}

export default function LogVitals() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  
  const [vitals, setVitals] = useState<VitalSigns>({
    bloodPressure: { systolic: 0, diastolic: 0 }
  })
  
  const [errors, setErrors] = useState<Record<string, string>>({})

  const { data: recentVitals, isLoading } = useQuery({
    queryKey: ['recent-vitals'],
    queryFn: fetchRecentVitals
  })

  const logMutation = useMutation({
    mutationFn: logVitalSigns,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recent-vitals'] })
      queryClient.invalidateQueries({ queryKey: ['patient-dashboard'] })
      alert('Vital signs logged successfully!')
      setVitals({ bloodPressure: { systolic: 0, diastolic: 0 } })
      setErrors({})
    },
    onError: (error) => {
      alert(`Failed to log vital signs: ${error.message}`)
    }
  })

  const validateVitals = () => {
    const newErrors: Record<string, string> = {}
    
    if (!vitals.bloodPressure.systolic || vitals.bloodPressure.systolic < 70 || vitals.bloodPressure.systolic > 200) {
      newErrors.systolic = 'Systolic pressure must be between 70-200 mmHg'
    }
    
    if (!vitals.bloodPressure.diastolic || vitals.bloodPressure.diastolic < 40 || vitals.bloodPressure.diastolic > 120) {
      newErrors.diastolic = 'Diastolic pressure must be between 40-120 mmHg'
    }
    
    if (vitals.heartRate && (vitals.heartRate < 40 || vitals.heartRate > 200)) {
      newErrors.heartRate = 'Heart rate must be between 40-200 bpm'
    }
    
    if (vitals.temperature && (vitals.temperature < 35 || vitals.temperature > 42)) {
      newErrors.temperature = 'Temperature must be between 35-42°C'
    }
    
    if (vitals.weight && (vitals.weight < 20 || vitals.weight > 300)) {
      newErrors.weight = 'Weight must be between 20-300 kg'
    }
    
    if (vitals.height && (vitals.height < 100 || vitals.height > 250)) {
      newErrors.height = 'Height must be between 100-250 cm'
    }
    
    if (vitals.oxygenSaturation && (vitals.oxygenSaturation < 70 || vitals.oxygenSaturation > 100)) {
      newErrors.oxygenSaturation = 'Oxygen saturation must be between 70-100%'
    }
    
    if (vitals.bloodSugar && (vitals.bloodSugar < 3 || vitals.bloodSugar > 30)) {
      newErrors.bloodSugar = 'Blood sugar must be between 3-30 mmol/L'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateVitals()) {
      return
    }
    
    // Filter out empty values
    const filteredVitals = Object.entries(vitals).reduce((acc, [key, value]) => {
      if (key === 'bloodPressure') {
        if (value.systolic && value.diastolic) {
          acc[key] = value
        }
      } else if (value && value !== 0) {
        acc[key] = value
      }
      return acc
    }, {} as any)
    
    logMutation.mutate(filteredVitals)
  }

  const updateVital = (key: string, value: number | string) => {
    if (key === 'systolic' || key === 'diastolic') {
      setVitals(prev => ({
        ...prev,
        bloodPressure: {
          ...prev.bloodPressure,
          [key]: Number(value)
        }
      }))
    } else {
      setVitals(prev => ({
        ...prev,
        [key]: value ? Number(value) : undefined
      }))
    }
  }

  const getBPStatus = (systolic: number, diastolic: number) => {
    if (systolic >= 140 || diastolic >= 90) return { status: 'High', color: 'text-red-600' }
    if (systolic >= 130 || diastolic >= 80) return { status: 'Elevated', color: 'text-yellow-600' }
    if (systolic >= 120 || diastolic >= 80) return { status: 'Normal High', color: 'text-yellow-600' }
    return { status: 'Normal', color: 'text-green-600' }
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
              <h1 className="text-xl font-semibold text-gray-900">Log Vital Signs</h1>
            </div>
            <Link href="/patient/vitals/history">
              <Button variant="outline">
                <ChartBarIcon className="h-4 w-4 mr-2" />
                View History
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Vital Signs Form */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center mb-6">
              <HeartIcon className="h-6 w-6 text-red-500 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900">Record Your Vitals</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Blood Pressure - Required */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Blood Pressure <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <input
                      type="number"
                      placeholder="Systolic"
                      value={vitals.bloodPressure.systolic || ''}
                      onChange={(e) => updateVital('systolic', e.target.value)}
                      className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                        errors.systolic ? 'border-red-500' : 'border-gray-300'
                      }`}
                      required
                    />
                    {errors.systolic && <p className="text-xs text-red-500 mt-1">{errors.systolic}</p>}
                  </div>
                  <div>
                    <input
                      type="number"
                      placeholder="Diastolic"
                      value={vitals.bloodPressure.diastolic || ''}
                      onChange={(e) => updateVital('diastolic', e.target.value)}
                      className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                        errors.diastolic ? 'border-red-500' : 'border-gray-300'
                      }`}
                      required
                    />
                    {errors.diastolic && <p className="text-xs text-red-500 mt-1">{errors.diastolic}</p>}
                  </div>
                </div>
                <p className="text-xs text-gray-500">Format: Systolic/Diastolic (e.g., 120/80 mmHg)</p>
                {vitals.bloodPressure.systolic && vitals.bloodPressure.diastolic && (
                  <p className={`text-sm font-medium ${getBPStatus(vitals.bloodPressure.systolic, vitals.bloodPressure.diastolic).color}`}>
                    Status: {getBPStatus(vitals.bloodPressure.systolic, vitals.bloodPressure.diastolic).status}
                  </p>
                )}
              </div>

              {/* Heart Rate */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Heart Rate (bpm)
                </label>
                <input
                  type="number"
                  placeholder="e.g., 72"
                  value={vitals.heartRate || ''}
                  onChange={(e) => updateVital('heartRate', e.target.value)}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    errors.heartRate ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.heartRate && <p className="text-xs text-red-500 mt-1">{errors.heartRate}</p>}
                <p className="text-xs text-gray-500">Normal range: 60-100 bpm</p>
              </div>

              {/* Temperature */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Temperature (°C)
                </label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="e.g., 36.5"
                  value={vitals.temperature || ''}
                  onChange={(e) => updateVital('temperature', e.target.value)}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    errors.temperature ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.temperature && <p className="text-xs text-red-500 mt-1">{errors.temperature}</p>}
                <p className="text-xs text-gray-500">Normal range: 36.1-37.2°C</p>
              </div>

              {/* Weight */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Weight (kg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="e.g., 70.5"
                  value={vitals.weight || ''}
                  onChange={(e) => updateVital('weight', e.target.value)}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    errors.weight ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.weight && <p className="text-xs text-red-500 mt-1">{errors.weight}</p>}
              </div>

              {/* Height */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Height (cm)
                </label>
                <input
                  type="number"
                  placeholder="e.g., 175"
                  value={vitals.height || ''}
                  onChange={(e) => updateVital('height', e.target.value)}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    errors.height ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.height && <p className="text-xs text-red-500 mt-1">{errors.height}</p>}
              </div>

              {/* Oxygen Saturation */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Oxygen Saturation (%)
                </label>
                <input
                  type="number"
                  placeholder="e.g., 98"
                  value={vitals.oxygenSaturation || ''}
                  onChange={(e) => updateVital('oxygenSaturation', e.target.value)}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    errors.oxygenSaturation ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.oxygenSaturation && <p className="text-xs text-red-500 mt-1">{errors.oxygenSaturation}</p>}
                <p className="text-xs text-gray-500">Normal range: 95-100%</p>
              </div>

              {/* Blood Sugar */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Blood Sugar (mmol/L)
                </label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="e.g., 5.5"
                  value={vitals.bloodSugar || ''}
                  onChange={(e) => updateVital('bloodSugar', e.target.value)}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    errors.bloodSugar ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.bloodSugar && <p className="text-xs text-red-500 mt-1">{errors.bloodSugar}</p>}
                <p className="text-xs text-gray-500">Normal fasting: 4.0-5.4 mmol/L</p>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={logMutation.isPending}
              >
                {logMutation.isPending ? 'Logging...' : 'Log Vital Signs'}
              </Button>
            </form>
          </div>

          {/* Recent Readings */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Recent Readings</h2>
            
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : recentVitals && recentVitals.length > 0 ? (
              <div className="space-y-4">
                {recentVitals.slice(0, 5).map((reading: any, index: number) => (
                  <div key={index} className="border-l-4 border-blue-500 pl-4 py-3">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium text-gray-900">
                        {format(new Date(reading.recordedAt), 'MMM dd, yyyy • h:mm a')}
                      </p>
                      <ClockIcon className="h-4 w-4 text-gray-400" />
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Blood Pressure</p>
                        <p className="font-medium">
                          {reading.bloodPressure?.systolic}/{reading.bloodPressure?.diastolic} mmHg
                        </p>
                      </div>
                      {reading.heartRate && (
                        <div>
                          <p className="text-gray-600">Heart Rate</p>
                          <p className="font-medium">{reading.heartRate} bpm</p>
                        </div>
                      )}
                      {reading.temperature && (
                        <div>
                          <p className="text-gray-600">Temperature</p>
                          <p className="font-medium">{reading.temperature}°C</p>
                        </div>
                      )}
                      {reading.weight && (
                        <div>
                          <p className="text-gray-600">Weight</p>
                          <p className="font-medium">{reading.weight} kg</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                <Link href="/patient/vitals/history">
                  <Button variant="outline" className="w-full">
                    View All Readings
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="text-center py-8">
                <HeartIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No previous readings</p>
                <p className="text-sm text-gray-400 mt-2">
                  Start logging your vital signs to track your health trends
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
