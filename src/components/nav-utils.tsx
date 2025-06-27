'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ReactNode } from 'react'
import { ChevronLeftIcon } from '@heroicons/react/24/outline'

interface NavLinkProps {
  href: string
  children: ReactNode
  className?: string
  activeClassName?: string
  exactMatch?: boolean
}

// Smart navigation link that applies active styles
export function NavLink({ 
  href, 
  children, 
  className = '', 
  activeClassName = '', 
  exactMatch = false 
}: NavLinkProps) {
  const pathname = usePathname()
  
  const isActive = exactMatch 
    ? pathname === href 
    : pathname?.startsWith(href)

  const finalClassName = isActive 
    ? `${className} ${activeClassName}`
    : className

  return (
    <Link href={href} className={finalClassName}>
      {children}
    </Link>
  )
}

interface BackButtonProps {
  href: string
  label?: string
  className?: string
}

// Back button component
export function BackButton({ 
  href, 
  label = 'Back', 
  className = 'text-gray-600 hover:text-gray-900 flex items-center text-sm font-medium' 
}: BackButtonProps) {
  return (
    <Link href={href} className={className}>
      <ChevronLeftIcon className="h-4 w-4 mr-1" />
      {label}
    </Link>
  )
}

// Breadcrumb component
interface BreadcrumbProps {
  items: Array<{
    label: string
    href?: string
    isActive?: boolean
  }>
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav className="flex" aria-label="Breadcrumb">
      <ol className="flex items-center space-x-4">
        {items.map((item, index) => (
          <li key={index}>
            <div className="flex items-center">
              {index > 0 && (
                <svg
                  className="flex-shrink-0 h-5 w-5 text-gray-300 mr-4"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  aria-hidden="true"
                >
                  <path d="M5.555 17.776l8-16 .894.448-8 16-.894-.448z" />
                </svg>
              )}
              {item.href && !item.isActive ? (
                <Link
                  href={item.href}
                  className="text-sm font-medium text-gray-500 hover:text-gray-700"
                >
                  {item.label}
                </Link>
              ) : (
                <span className={`text-sm font-medium ${
                  item.isActive ? 'text-gray-900' : 'text-gray-500'
                }`}>
                  {item.label}
                </span>
              )}
            </div>
          </li>
        ))}
      </ol>
    </nav>
  )
}

// Page header with navigation
interface PageHeaderProps {
  title: string
  subtitle?: string
  backButton?: {
    href: string
    label?: string
  }
  breadcrumbs?: Array<{
    label: string
    href?: string
    isActive?: boolean
  }>
  actions?: ReactNode
}

export function PageHeader({ 
  title, 
  subtitle, 
  backButton, 
  breadcrumbs, 
  actions 
}: PageHeaderProps) {
  return (
    <div className="bg-white border-b border-gray-200 px-4 py-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {backButton && (
          <div className="mb-4">
            <BackButton href={backButton.href} label={backButton.label} />
          </div>
        )}
        
        {breadcrumbs && (
          <div className="mb-4">
            <Breadcrumb items={breadcrumbs} />
          </div>
        )}
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
            {subtitle && (
              <p className="mt-1 text-sm text-gray-600">{subtitle}</p>
            )}
          </div>
          {actions && (
            <div className="flex items-center space-x-3">
              {actions}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Quick navigation shortcuts
export const quickNav = {
  // Doctor navigation
  doctor: {
    dashboard: '/doctor/dashboard',
    schedule: '/doctor/schedule',
    appointments: '/doctor/appointments',
    patients: '/doctor/patients',
    prescriptions: '/doctor/prescriptions',
    telemedicine: '/doctor/telemedicine',
    emergency: '/doctor/emergency',
  },
  // Patient navigation
  patient: {
    dashboard: '/patient/dashboard',
    appointments: '/patient/appointments',
    bookAppointment: '/patient/appointments/book',
    records: '/patient/records',
    prescriptions: '/patient/prescriptions',
    vitals: '/patient/vitals',
    logVitals: '/patient/vitals/log',
    telemedicine: '/patient/telemedicine',
    emergency: '/patient/emergency',
  },
  // Admin navigation
  admin: {
    dashboard: '/admin/dashboard',
    doctors: '/admin/doctors',
    analytics: '/admin/analytics',
    settings: '/admin/settings',
    notifications: '/admin/notifications',
    patients: '/admin/patients',
    appointments: '/admin/appointments',
    billing: '/admin/billing',
    reports: '/admin/reports',
  },
  // Auth navigation
  auth: {
    login: '/login',
    register: '/register',
  }
}

// Navigation helper functions
export function getDashboardRoute(userRole: string): string {
  switch (userRole.toLowerCase()) {
    case 'doctor':
      return quickNav.doctor.dashboard
    case 'patient':
      return quickNav.patient.dashboard
    case 'admin':
      return quickNav.admin.dashboard
    default:
      return quickNav.admin.dashboard
  }
}

export function getNavigationContext(pathname: string) {
  if (pathname.startsWith('/doctor/')) {
    return 'doctor'
  } else if (pathname.startsWith('/patient/')) {
    return 'patient'
  } else if (pathname.startsWith('/admin/')) {
    return 'admin'
  } else {
    return 'public'
  }
}
