'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/stores/auth-store'

export default function DashboardPage() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }

    // Redirect based on user role
    if (user?.role === 'PATIENT') {
      router.push('/patient/dashboard')
    } else if (user?.role === 'DOCTOR') {
      router.push('/doctor/dashboard')
    } else if (user?.role === 'ADMIN') {
      router.push('/admin/dashboard')
    }
  }, [isAuthenticated, user?.role, router])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading your dashboard...</p>
      </div>
    </div>
  )
}
