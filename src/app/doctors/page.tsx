'use client'

import React, { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/stores/auth-store'
import {
  MagnifyingGlassIcon,
  MapPinIcon,
  StarIcon,
  ClockIcon,
  PhoneIcon,
  AcademicCapIcon,
  UserGroupIcon,
  CalendarDaysIcon,
  VideoCameraIcon,
  HeartIcon,
  FunnelIcon,
  XMarkIcon,
  ChevronDownIcon,
  EyeIcon,
  BookmarkIcon
} from '@heroicons/react/24/outline'
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid'
import Link from 'next/link'

interface Doctor {
  id: string
  userId: string
  firstName: string
  lastName: string
  specialization: string
  licenseNumber: string
  experience: number
  education: string
  languages: string[]
  bio?: string
  rating?: number
  reviewCount?: number
  profileImage?: string
  isAvailable?: boolean
  nextAvailableSlot?: string
  consultationFee?: number
  location?: {
    city: string
    state: string
    address: string
  }
  telemedicineAvailable?: boolean
  user?: {
    email: string
  }
}

interface FilterState {
  search: string
  specialization: string
  location: string
  availability: string
  rating: string
  experience: string
  telemedicine: boolean
  sortBy: string
}

const specializations = [
  'General Medicine',
  'Cardiology',
  'Dermatology',
  'Endocrinology',
  'Gastroenterology',
  'Neurology',
  'Oncology',
  'Orthopedics',
  'Pediatrics',
  'Psychiatry',
  'Pulmonology',
  'Radiology',
  'Surgery',
  'Urology'
]

const experienceRanges = [
  { label: 'Any Experience', value: '' },
  { label: '1-3 years', value: '1-3' },
  { label: '4-7 years', value: '4-7' },
  { label: '8-15 years', value: '8-15' },
  { label: '15+ years', value: '15+' }
]

const sortOptions = [
  { label: 'Relevance', value: 'relevance' },
  { label: 'Rating (High to Low)', value: 'rating' },
  { label: 'Experience (High to Low)', value: 'experience' },
  { label: 'Price (Low to High)', value: 'price' },
  { label: 'Availability', value: 'availability' }
]

// Fetch doctors with filters
const fetchDoctors = async (filters: FilterState) => {
  const params = new URLSearchParams()
  
  if (filters.search) params.append('search', filters.search)
  if (filters.specialization) params.append('specialization', filters.specialization)
  if (filters.location) params.append('location', filters.location)
  if (filters.availability) params.append('availability', filters.availability)
  if (filters.rating) params.append('rating', filters.rating)
  if (filters.experience) params.append('experience', filters.experience)
  if (filters.telemedicine) params.append('telemedicine', 'true')
  if (filters.sortBy) params.append('sortBy', filters.sortBy)

  const response = await fetch(`/api/doctors/search?${params.toString()}`)
  if (!response.ok) throw new Error('Failed to fetch doctors')
  return response.json()
}

export default function FindDoctorsPage() {
  const { user } = useAuth()
  const [showFilters, setShowFilters] = useState(false)
  const [savedDoctors, setSavedDoctors] = useState<string[]>([])
  
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    specialization: '',
    location: '',
    availability: '',
    rating: '',
    experience: '',
    telemedicine: false,
    sortBy: 'relevance'
  })

  // Fetch doctors based on filters
  const { data: doctorsData, isLoading, error } = useQuery({
    queryKey: ['doctors', filters],
    queryFn: () => fetchDoctors(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  const doctors = doctorsData?.doctors || []
  const totalCount = doctorsData?.total || 0

  // Load saved doctors from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('savedDoctors')
    if (saved) {
      setSavedDoctors(JSON.parse(saved))
    }
  }, [])

  const handleFilterChange = (key: keyof FilterState, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const clearFilters = () => {
    setFilters({
      search: '',
      specialization: '',
      location: '',
      availability: '',
      rating: '',
      experience: '',
      telemedicine: false,
      sortBy: 'relevance'
    })
  }

  const toggleSaveDoctor = (doctorId: string) => {
    const updated = savedDoctors.includes(doctorId)
      ? savedDoctors.filter(id => id !== doctorId)
      : [...savedDoctors, doctorId]
    
    setSavedDoctors(updated)
    localStorage.setItem('savedDoctors', JSON.stringify(updated))
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <StarSolidIcon
        key={i}
        className={`h-4 w-4 ${i < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300'}`}
      />
    ))
  }

  const formatNextAvailable = (dateString?: string) => {
    if (!dateString) return 'No slots available'
    const date = new Date(dateString)
    return `Next: ${date.toLocaleDateString()} at ${date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    })}`
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-lg font-medium text-gray-900">Error Loading Doctors</h2>
          <p className="text-gray-600 mt-2">We're having trouble loading the doctors list. Please try again.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Find Doctors</h1>
                <p className="text-gray-600 mt-1">
                  Discover qualified healthcare providers near you
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  <FunnelIcon className="h-4 w-4 mr-2" />
                  Filters
                  {Object.values(filters).some(v => v && v !== 'relevance') && (
                    <span className="ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-blue-500 rounded-full">
                      {Object.values(filters).filter(v => v && v !== 'relevance').length}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Search Bar */}
            <div className="mt-6">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by doctor name, specialization, or condition..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="lg:grid lg:grid-cols-4 lg:gap-8">
          {/* Filters Sidebar */}
          <div className={`lg:col-span-1 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white rounded-lg shadow p-6 sticky top-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Filters</h3>
                {Object.values(filters).some(v => v && v !== 'relevance') && (
                  <button
                    onClick={clearFilters}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    Clear All
                  </button>
                )}
              </div>

              <div className="space-y-6">
                {/* Specialization */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Specialization
                  </label>
                  <select
                    value={filters.specialization}
                    onChange={(e) => handleFilterChange('specialization', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Specializations</option>
                    {specializations.map(spec => (
                      <option key={spec} value={spec}>{spec}</option>
                    ))}
                  </select>
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location
                  </label>
                  <div className="relative">
                    <MapPinIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="City, State"
                      value={filters.location}
                      onChange={(e) => handleFilterChange('location', e.target.value)}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Experience */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Experience
                  </label>
                  <select
                    value={filters.experience}
                    onChange={(e) => handleFilterChange('experience', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {experienceRanges.map(range => (
                      <option key={range.value} value={range.value}>{range.label}</option>
                    ))}
                  </select>
                </div>

                {/* Rating */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Minimum Rating
                  </label>
                  <select
                    value={filters.rating}
                    onChange={(e) => handleFilterChange('rating', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Any Rating</option>
                    <option value="4.5">4.5+ Stars</option>
                    <option value="4">4+ Stars</option>
                    <option value="3.5">3.5+ Stars</option>
                    <option value="3">3+ Stars</option>
                  </select>
                </div>

                {/* Availability */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Availability
                  </label>
                  <select
                    value={filters.availability}
                    onChange={(e) => handleFilterChange('availability', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Any Time</option>
                    <option value="today">Available Today</option>
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
                  </select>
                </div>

                {/* Telemedicine */}
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.telemedicine}
                      onChange={(e) => handleFilterChange('telemedicine', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Telemedicine Available</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="lg:col-span-3">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <p className="text-gray-600">
                  {isLoading ? 'Loading...' : `${totalCount} doctors found`}
                </p>
                {Object.values(filters).some(v => v && v !== 'relevance') && (
                  <span className="text-sm text-blue-600">
                    (Filtered results)
                  </span>
                )}
              </div>
              
              <div className="flex items-center space-x-4">
                <select
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {sortOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-1">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
                    <div className="flex space-x-4">
                      <div className="w-20 h-20 bg-gray-300 rounded-full"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                        <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                        <div className="h-4 bg-gray-300 rounded w-2/3"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Doctor Cards */}
            {!isLoading && (
              <div className="space-y-6">
                {doctors.length === 0 ? (
                  <div className="text-center py-12">
                    <UserGroupIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No doctors found</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Try adjusting your search criteria or filters.
                    </p>
                  </div>
                ) : (
                  doctors.map((doctor: Doctor) => (
                    <div key={doctor.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow duration-200">
                      <div className="p-6">
                        <div className="flex space-x-4">
                          {/* Doctor Photo */}
                          <div className="flex-shrink-0">
                            <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                              <span className="text-white text-xl font-bold">
                                {doctor.firstName?.charAt(0)}{doctor.lastName?.charAt(0)}
                              </span>
                            </div>
                          </div>

                          {/* Doctor Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <div>
                                <h3 className="text-lg font-medium text-gray-900">
                                  Dr. {doctor.firstName} {doctor.lastName}
                                </h3>
                                <p className="text-sm text-blue-600 font-medium">
                                  {doctor.specialization}
                                </p>
                                
                                {/* Rating */}
                                {doctor.rating && (
                                  <div className="flex items-center mt-1">
                                    <div className="flex items-center">
                                      {renderStars(doctor.rating)}
                                    </div>
                                    <span className="ml-2 text-sm text-gray-600">
                                      {doctor.rating} ({doctor.reviewCount || 0} reviews)
                                    </span>
                                  </div>
                                )}
                              </div>

                              <button
                                onClick={() => toggleSaveDoctor(doctor.id)}
                                className={`p-2 rounded-full transition-colors ${
                                  savedDoctors.includes(doctor.id)
                                    ? 'text-red-500 hover:text-red-600'
                                    : 'text-gray-400 hover:text-gray-500'
                                }`}
                              >
                                <HeartIcon className={`h-5 w-5 ${savedDoctors.includes(doctor.id) ? 'fill-current' : ''}`} />
                              </button>
                            </div>

                            {/* Details */}
                            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-600">
                              <div className="flex items-center">
                                <AcademicCapIcon className="h-4 w-4 mr-2" />
                                {doctor.experience} years experience
                              </div>
                              {doctor.location && (
                                <div className="flex items-center">
                                  <MapPinIcon className="h-4 w-4 mr-2" />
                                  {doctor.location.city}, {doctor.location.state}
                                </div>
                              )}
                              {doctor.languages && doctor.languages.length > 0 && (
                                <div className="flex items-center">
                                  <UserGroupIcon className="h-4 w-4 mr-2" />
                                  Languages: {doctor.languages.join(', ')}
                                </div>
                              )}
                              <div className="flex items-center">
                                <ClockIcon className="h-4 w-4 mr-2" />
                                {formatNextAvailable(doctor.nextAvailableSlot)}
                              </div>
                            </div>

                            {/* Bio */}
                            {doctor.bio && (
                              <p className="mt-3 text-sm text-gray-600 line-clamp-2">
                                {doctor.bio}
                              </p>
                            )}

                            {/* Features */}
                            <div className="mt-4 flex items-center space-x-4">
                              {doctor.telemedicineAvailable && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  <VideoCameraIcon className="h-3 w-3 mr-1" />
                                  Telemedicine
                                </span>
                              )}
                              {doctor.isAvailable && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  Available Today
                                </span>
                              )}
                              {doctor.consultationFee && (
                                <span className="text-sm text-gray-600">
                                  From ${doctor.consultationFee}
                                </span>
                              )}
                            </div>

                            {/* Action Buttons */}
                            <div className="mt-4 flex items-center space-x-3">
                              <Link
                                href={`/doctors/${doctor.id}`}
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                              >
                                <EyeIcon className="h-4 w-4 mr-2" />
                                View Profile
                              </Link>
                              {user && (
                                <Link
                                  href={`/appointments/book?doctorId=${doctor.id}`}
                                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                >
                                  <CalendarDaysIcon className="h-4 w-4 mr-2" />
                                  Book Appointment
                                </Link>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
