'use client'

import React from 'react'
import Link from 'next/link'
import { useAuth } from '@/stores/auth-store'
import {
  ShieldCheckIcon,
  ChartBarIcon,
  UsersIcon,
  CogIcon,
  ClipboardDocumentListIcon,
  ServerIcon
} from '@heroicons/react/24/outline'

interface AdminAccessProps {
  className?: string
  variant?: 'button' | 'card' | 'menu'
}

const AdminAccess: React.FC<AdminAccessProps> = ({ 
  className = '', 
  variant = 'button' 
}) => {
  const { user } = useAuth()

  // Only show for admin users
  if (!user || user.role !== 'ADMIN') {
    return null
  }

  const adminFeatures = [
    {
      name: 'Dashboard',
      href: '/admin/dashboard',
      icon: ChartBarIcon,
      description: 'Administrative overview and analytics'
    },
    {
      name: 'User Management',
      href: '/admin/users',
      icon: UsersIcon,
      description: 'Manage all platform users'
    },
    {
      name: 'System Settings',
      href: '/admin/settings',
      icon: CogIcon,
      description: 'Platform configuration'
    },
    {
      name: 'Audit Logs',
      href: '/admin/audit',
      icon: ClipboardDocumentListIcon,
      description: 'System audit trails'
    },
    {
      name: 'System Health',
      href: '/admin/system',
      icon: ServerIcon,
      description: 'Monitor system performance'
    }
  ]

  if (variant === 'button') {
    return (
      <Link
        href="/admin/dashboard"
        className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 shadow-sm transition-all duration-200 ${className}`}
      >
        <ShieldCheckIcon className="h-4 w-4 mr-2" />
        Admin Dashboard
      </Link>
    )
  }

  if (variant === 'card') {
    return (
      <div className={`bg-gradient-to-br from-purple-600 to-purple-800 rounded-lg shadow-lg p-6 text-white ${className}`}>
        <div className="flex items-center space-x-3 mb-4">
          <ShieldCheckIcon className="h-8 w-8 text-purple-200" />
          <div>
            <h3 className="text-lg font-semibold">Admin Access</h3>
            <p className="text-purple-200 text-sm">System administration panel</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {adminFeatures.slice(0, 4).map((feature) => (
            <Link
              key={feature.name}
              href={feature.href}
              className="flex items-center space-x-2 p-3 bg-purple-700 bg-opacity-50 rounded-md hover:bg-opacity-70 transition-all duration-200 group"
            >
              <feature.icon className="h-5 w-5 text-purple-200 group-hover:text-white" />
              <span className="text-sm font-medium group-hover:text-white">{feature.name}</span>
            </Link>
          ))}
        </div>
        
        <Link
          href="/admin/dashboard"
          className="mt-4 block text-center bg-white bg-opacity-20 hover:bg-opacity-30 rounded-md py-2 px-4 text-sm font-medium transition-all duration-200"
        >
          View Full Dashboard
        </Link>
      </div>
    )
  }

  if (variant === 'menu') {
    return (
      <div className={`bg-white rounded-lg shadow border p-4 ${className}`}>
        <div className="flex items-center space-x-2 mb-3">
          <ShieldCheckIcon className="h-5 w-5 text-purple-600" />
          <h4 className="font-medium text-gray-900">Admin Tools</h4>
        </div>
        
        <ul className="space-y-2">
          {adminFeatures.map((feature) => (
            <li key={feature.name}>
              <Link
                href={feature.href}
                className="flex items-center space-x-2 p-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors group"
                title={feature.description}
              >
                <feature.icon className="h-4 w-4 text-gray-400 group-hover:text-purple-600" />
                <span className="group-hover:text-purple-600">{feature.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    )
  }

  return null
}

export default AdminAccess
