'use client'

import React from 'react'
import { useAuth } from '@/stores/auth-store'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'
import {
  Bars3Icon,
  XMarkIcon,
  UserGroupIcon,
  ChartBarIcon,
  CogIcon,
  BellIcon,
  UsersIcon,
  CalendarDaysIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  HomeIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline'
import { Button } from '@/components/ui/button'
import { quickNav } from '@/components/nav-utils'
import { useState } from 'react'

interface AdminLayoutProps {
  children: React.ReactNode
}

const sidebarItems = [
  {
    name: 'Dashboard',
    href: quickNav.admin.dashboard,
    icon: HomeIcon
  },
  {
    name: 'Doctors',
    href: quickNav.admin.doctors,
    icon: UserGroupIcon
  },
  {
    name: 'Patients',
    href: quickNav.admin.patients,
    icon: UsersIcon
  },
  {
    name: 'Appointments',
    href: quickNav.admin.appointments,
    icon: CalendarDaysIcon
  },
  {
    name: 'Analytics',
    href: quickNav.admin.analytics,
    icon: ChartBarIcon
  },
  {
    name: 'Billing',
    href: quickNav.admin.billing,
    icon: CurrencyDollarIcon
  },
  {
    name: 'Reports',
    href: quickNav.admin.reports,
    icon: DocumentTextIcon
  },
  {
    name: 'Notifications',
    href: quickNav.admin.notifications,
    icon: BellIcon
  },
  {
    name: 'Settings',
    href: quickNav.admin.settings,
    icon: CogIcon
  }
]

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { user, logout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }
    
    if (user.role !== 'ADMIN') {
      router.push('/dashboard')
      return
    }
  }, [user, router])

  if (!user || user.role !== 'ADMIN') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Access Denied</h2>
          <p className="text-gray-600 mt-2">You need admin privileges to access this area.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
          <div className="fixed left-0 top-0 h-full w-64 bg-white shadow-xl">
            <div className="flex h-16 items-center justify-between px-4 border-b">
              <h1 className="text-lg font-semibold text-gray-900">Admin Panel</h1>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(false)}
              >
                <XMarkIcon className="h-6 w-6" />
              </Button>
            </div>
            <nav className="mt-4 px-4 space-y-2">
              {sidebarItems.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-blue-100 text-blue-900'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <item.icon className="h-5 w-5 mr-3" />
                    {item.name}
                  </Link>
                )
              })}
            </nav>
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:w-64 lg:block">
        <div className="flex h-full flex-col bg-white shadow-lg">
          <div className="flex h-16 items-center px-6 border-b bg-blue-600">
            <h1 className="text-lg font-semibold text-white">Admin Panel</h1>
          </div>
          <nav className="flex-1 mt-6 px-4 space-y-2">
            {sidebarItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-100 text-blue-900'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <item.icon className="h-5 w-5 mr-3" />
                  {item.name}
                </Link>
              )
            })}
          </nav>
          <div className="p-4 border-t">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
                  <span className="text-white font-medium">
                    {user.email?.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">{user.email}</p>
                <p className="text-xs text-gray-500">Administrator</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={logout}
              className="w-full flex items-center justify-center"
            >
              <ArrowRightOnRectangleIcon className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar for mobile */}
        <div className="sticky top-0 z-40 flex h-16 items-center bg-white shadow-sm border-b lg:hidden">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(true)}
            className="ml-4"
          >
            <Bars3Icon className="h-6 w-6" />
          </Button>
          <h1 className="ml-4 text-lg font-semibold text-gray-900">Admin Panel</h1>
          <div className="ml-auto mr-4">
            <Button
              variant="outline"
              size="sm"
              onClick={logout}
            >
              <ArrowRightOnRectangleIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Page content */}
        <main className="py-6">
          {children}
        </main>
      </div>
    </div>
  )
}
