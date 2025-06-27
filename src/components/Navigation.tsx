'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/stores/auth-store'
import { Button } from '@/components/ui/button'
import {
  HomeIcon,
  CalendarDaysIcon,
  UserGroupIcon,
  CogIcon,
  BellIcon,
  UserCircleIcon,
  Bars3Icon,
  XMarkIcon,
  HeartIcon,
  VideoCameraIcon,
  DocumentTextIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  ClockIcon,
  PhoneIcon,
  ChatBubbleLeftIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  ClipboardDocumentListIcon,
  ExclamationTriangleIcon,
  BookOpenIcon,
  QuestionMarkCircleIcon,
  AcademicCapIcon,
  BuildingOffice2Icon,
  ShieldCheckIcon,
  InboxIcon,
  MapPinIcon,
  StarIcon,
  WrenchScrewdriverIcon,
  UsersIcon,
  DocumentCheckIcon,
  ClipboardIcon,
  PresentationChartLineIcon,
  ServerIcon,
  KeyIcon,
  ArchiveBoxIcon,
  ComputerDesktopIcon,
  DevicePhoneMobileIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline'

interface NavItem {
  name: string
  href: string
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
  isQuickAction?: boolean
  isEmergency?: boolean
  badge?: string | number
  description?: string
  category?: 'primary' | 'secondary' | 'admin' | 'emergency'
}

const Navigation = () => {
  const { user, logout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const userMenu = document.getElementById('user-menu')
      if (userMenu && !userMenu.contains(event.target as Node)) {
        setUserMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const publicNavItems: NavItem[] = [
    { name: 'Home', href: '/', icon: HomeIcon, description: 'Return to homepage' },
    { name: 'About Us', href: '/about', icon: HeartIcon, description: 'Learn about our healthcare platform' },
    { name: 'Services', href: '/services', icon: DocumentTextIcon, description: 'View our medical services' },
    { name: 'Find Doctors', href: '/doctors', icon: UserGroupIcon, description: 'Search for healthcare providers' },
    { name: 'Locations', href: '/locations', icon: MapPinIcon, description: 'Find our clinic locations' },
    { name: 'Contact', href: '/contact', icon: PhoneIcon, description: 'Get in touch with us' },
    { name: 'Help & Support', href: '/help', icon: QuestionMarkCircleIcon, description: 'Get help and support' },
  ]

  const patientNavItems: NavItem[] = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon, category: 'primary', description: 'Your personal health dashboard' },
    { name: 'Book Appointment', href: '/appointments/book', icon: PlusIcon, isQuickAction: true, category: 'primary', description: 'Schedule a new appointment' },
    { name: 'My Appointments', href: '/appointments', icon: CalendarDaysIcon, category: 'primary', description: 'View and manage appointments' },
    { name: 'Medical Records', href: '/medical-records', icon: DocumentTextIcon, category: 'primary', description: 'Access your medical history' },
    { name: 'Prescriptions', href: '/prescriptions', icon: ClipboardIcon, category: 'primary', description: 'View current prescriptions' },
    { name: 'Lab Results', href: '/lab-results', icon: DocumentCheckIcon, category: 'secondary', description: 'Check test results' },
    { name: 'Telemedicine', href: '/telemedicine', icon: VideoCameraIcon, category: 'secondary', description: 'Virtual consultations' },
    { name: 'Messages', href: '/messages', icon: ChatBubbleLeftIcon, badge: 3, category: 'secondary', description: 'Chat with healthcare providers' },
    { name: 'Billing & Insurance', href: '/billing', icon: CurrencyDollarIcon, category: 'secondary', description: 'Manage payments and insurance' },
    { name: 'Health Education', href: '/education', icon: BookOpenIcon, category: 'secondary', description: 'Learn about health topics' },
    { name: 'Family Members', href: '/family', icon: UsersIcon, category: 'secondary', description: 'Manage family health records' },
    { name: 'Emergency', href: '/emergency', icon: ExclamationTriangleIcon, isEmergency: true, category: 'emergency', description: 'Emergency contacts and info' },
  ]

  const doctorNavItems: NavItem[] = [
    { name: 'Dashboard', href: '/doctor/dashboard', icon: HomeIcon, category: 'primary', description: 'Doctor dashboard overview' },
    { name: 'Patients', href: '/doctor/patients', icon: UserGroupIcon, category: 'primary', description: 'View and manage patients' },
    { name: 'Appointments', href: '/doctor/appointments', icon: CalendarDaysIcon, badge: 5, category: 'primary', description: 'Today\'s appointments' },
    { name: 'Schedule', href: '/doctor/schedule', icon: ClockIcon, category: 'primary', description: 'Manage your availability' },
    { name: 'Medical Records', href: '/doctor/records', icon: ClipboardDocumentListIcon, category: 'primary', description: 'Patient medical records' },
    { name: 'Telemedicine', href: '/doctor/telemedicine', icon: VideoCameraIcon, category: 'secondary', description: 'Virtual consultations' },
    { name: 'Messages', href: '/doctor/messages', icon: ChatBubbleLeftIcon, badge: 8, category: 'secondary', description: 'Patient communications' },
    { name: 'Prescriptions', href: '/doctor/prescriptions', icon: ClipboardIcon, category: 'secondary', description: 'Manage prescriptions' },
    { name: 'Analytics', href: '/doctor/analytics', icon: ChartBarIcon, category: 'secondary', description: 'Practice analytics' },
    { name: 'Profile', href: '/doctor/profile', icon: UserCircleIcon, category: 'secondary', description: 'Professional profile' },
    { name: 'Education', href: '/doctor/education', icon: AcademicCapIcon, category: 'secondary', description: 'Continuing education' },
    { name: 'Research', href: '/doctor/research', icon: PresentationChartLineIcon, category: 'secondary', description: 'Clinical research' },
  ]

  const adminNavItems: NavItem[] = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: HomeIcon, category: 'primary', description: 'Administrative overview' },
    { name: 'Users Management', href: '/admin/users', icon: UserGroupIcon, category: 'primary', description: 'Manage all users' },
    { name: 'Doctors Management', href: '/admin/doctors', icon: UserGroupIcon, category: 'primary', description: 'Manage doctors and staff' },
    { name: 'Patients Overview', href: '/admin/patients', icon: UsersIcon, category: 'primary', description: 'Patient management' },
    { name: 'Appointments', href: '/admin/appointments', icon: CalendarDaysIcon, category: 'primary', description: 'System-wide appointments' },
    { name: 'Analytics & Reports', href: '/admin/analytics', icon: ChartBarIcon, category: 'admin', description: 'Platform analytics' },
    { name: 'System Settings', href: '/admin/settings', icon: CogIcon, category: 'admin', description: 'Platform configuration' },
    { name: 'Billing Management', href: '/admin/billing', icon: CurrencyDollarIcon, category: 'admin', description: 'Financial management' },
    { name: 'Content Management', href: '/admin/content', icon: DocumentTextIcon, category: 'admin', description: 'Manage platform content' },
    { name: 'Audit Logs', href: '/admin/audit', icon: ClipboardDocumentListIcon, category: 'admin', description: 'System audit trails' },
    { name: 'Security', href: '/admin/security', icon: ShieldCheckIcon, category: 'admin', description: 'Security management' },
    { name: 'System Health', href: '/admin/system', icon: ServerIcon, category: 'admin', description: 'System monitoring' },
    { name: 'Backup & Recovery', href: '/admin/backup', icon: ArchiveBoxIcon, category: 'admin', description: 'Data backup management' },
    { name: 'API Management', href: '/admin/api', icon: KeyIcon, category: 'admin', description: 'API keys and integrations' },
  ]

  const getNavItems = () => {
    if (!user) return publicNavItems
    
    switch (user.role) {
      case 'ADMIN':
        return adminNavItems
      case 'DOCTOR':
        return doctorNavItems
      case 'PATIENT':
        return patientNavItems
      default:
        return publicNavItems
    }
  }

  const navItems = getNavItems()
  const quickActions = navItems.filter(item => item.isQuickAction)
  const emergencyActions = navItems.filter(item => item.isEmergency)
  const primaryItems = navItems.filter(item => item.category === 'primary' || (!item.category && !item.isQuickAction && !item.isEmergency))
  const secondaryItems = navItems.filter(item => item.category === 'secondary')
  const adminItems = navItems.filter(item => item.category === 'admin')
  const regularNavItems = navItems.filter(item => !item.isQuickAction && !item.isEmergency)

  // Responsive navigation logic
  const primaryNavCount = user ? 5 : 4
  const showMoreDropdown = primaryItems.length > primaryNavCount

  const handleLogout = () => {
    logout()
    router.push('/')
    setUserMenuOpen(false)
    setMobileMenuOpen(false)
  }

  const isActive = (href: string) => {
    if (!pathname) return false
    if (href === '/') {
      return pathname === '/'
    }
    return pathname.startsWith(href)
  }

  return (
    <>
      <nav className="bg-white shadow-lg border-b sticky top-0 z-50" role="navigation" aria-label="Main navigation">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo and primary nav */}
            <div className="flex">
              <Link 
                href="/" 
                className="flex-shrink-0 flex items-center"
                aria-label="HealthCare Platform Home"
              >
                <HeartIcon className="h-8 w-8 text-blue-600" aria-hidden="true" />
                <span className="ml-2 text-xl font-bold text-gray-900">HealthCare</span>
              </Link>
              
              {/* Desktop navigation */}
              <div className="hidden lg:ml-10 lg:flex lg:space-x-8" role="menubar">
                {primaryItems.slice(0, primaryNavCount).map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`inline-flex items-center px-3 py-2 text-sm font-medium transition-colors duration-200 relative ${
                      isActive(item.href)
                        ? 'text-blue-600 border-b-2 border-blue-600'
                        : 'text-gray-700 hover:text-blue-600 hover:border-b-2 hover:border-blue-300'
                    }`}
                    role="menuitem"
                    aria-current={isActive(item.href) ? 'page' : undefined}
                    title={item.description}
                  >
                    <item.icon className="h-4 w-4 mr-2" aria-hidden="true" />
                    {item.name}
                    {item.badge && (
                      <span className="ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-500 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                ))}
                
                {/* More dropdown for additional items */}
                {showMoreDropdown && (
                  <div className="relative group">
                    <button className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md">
                      More
                      <svg className="ml-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    <div className="absolute left-0 mt-2 w-80 bg-white rounded-md shadow-lg py-2 border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                      {/* Secondary items */}
                      {secondaryItems.length > 0 && (
                        <div className="px-4 py-2">
                          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Services</h3>
                          <div className="grid grid-cols-1 gap-1">
                            {secondaryItems.map((item) => (
                              <Link
                                key={item.name}
                                href={item.href}
                                className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none rounded-md group"
                                title={item.description}
                              >
                                <item.icon className="h-4 w-4 mr-3 text-gray-400 group-hover:text-gray-600" aria-hidden="true" />
                                <div className="flex-1">
                                  <div className="flex items-center justify-between">
                                    <span>{item.name}</span>
                                    {item.badge && (
                                      <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-500 rounded-full">
                                        {item.badge}
                                      </span>
                                    )}
                                  </div>
                                  {item.description && (
                                    <p className="text-xs text-gray-500 mt-1">{item.description}</p>
                                  )}
                                </div>
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Admin items for admin users */}
                      {adminItems.length > 0 && user?.role === 'ADMIN' && (
                        <>
                          {secondaryItems.length > 0 && <hr className="my-2" />}
                          <div className="px-4 py-2">
                            <h3 className="text-xs font-semibold text-red-600 uppercase tracking-wide mb-2">Administration</h3>
                            <div className="grid grid-cols-1 gap-1">
                              {adminItems.map((item) => (
                                <Link
                                  key={item.name}
                                  href={item.href}
                                  className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-red-50 focus:bg-red-50 focus:outline-none rounded-md group"
                                  title={item.description}
                                >
                                  <item.icon className="h-4 w-4 mr-3 text-red-400 group-hover:text-red-600" aria-hidden="true" />
                                  <div className="flex-1">
                                    <span className="text-red-700">{item.name}</span>
                                    {item.description && (
                                      <p className="text-xs text-red-500 mt-1">{item.description}</p>
                                    )}
                                  </div>
                                </Link>
                              ))}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right side - Quick actions, Auth buttons or user menu */}
            <div className="flex items-center space-x-4">
              {user && (
                <>
                  {/* Quick action buttons */}
                  {quickActions.length > 0 && (
                    <div className="hidden md:flex items-center space-x-2">
                      {quickActions.map((action) => (
                        <Link
                          key={action.name}
                          href={action.href}
                          className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
                          title={action.description}
                        >
                          <action.icon className="h-4 w-4 mr-2" aria-hidden="true" />
                          <span className="hidden xl:inline">{action.name}</span>
                          <span className="xl:hidden">Book</span>
                        </Link>
                      ))}
                    </div>
                  )}

                  {/* Emergency action button */}
                  {emergencyActions.length > 0 && (
                    <div className="hidden md:flex items-center">
                      {emergencyActions.map((action) => (
                        <Link
                          key={action.name}
                          href={action.href}
                          className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 shadow-sm animate-pulse hover:animate-none"
                          title={action.description}
                        >
                          <action.icon className="h-4 w-4 mr-2" aria-hidden="true" />
                          <span className="hidden xl:inline">{action.name}</span>
                          <span className="xl:hidden">Emergency</span>
                        </Link>
                      ))}
                    </div>
                  )}

                  {/* Notifications with enhanced dropdown */}
                  <div className="relative group">
                    <button 
                      className="relative p-2 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg transition-all duration-200 hover:bg-gray-50"
                      aria-label="View notifications (3 unread)"
                      title="Notifications"
                    >
                      <BellIcon className="h-6 w-6" aria-hidden="true" />
                      <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium animate-pulse" aria-hidden="true">
                        3
                      </span>
                    </button>
                    
                    {/* Notification dropdown */}
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg py-2 border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                      <div className="px-4 py-2 border-b">
                        <h3 className="text-sm font-medium text-gray-900">Notifications</h3>
                      </div>
                      <div className="max-h-64 overflow-y-auto">
                        <div className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b">
                          <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0">
                              <div className="h-2 w-2 bg-blue-500 rounded-full mt-2"></div>
                            </div>
                            <div className="flex-1">
                              <p className="text-sm text-gray-900">New appointment scheduled</p>
                              <p className="text-xs text-gray-500 mt-1">2 minutes ago</p>
                            </div>
                          </div>
                        </div>
                        <div className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b">
                          <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0">
                              <div className="h-2 w-2 bg-green-500 rounded-full mt-2"></div>
                            </div>
                            <div className="flex-1">
                              <p className="text-sm text-gray-900">Lab results available</p>
                              <p className="text-xs text-gray-500 mt-1">1 hour ago</p>
                            </div>
                          </div>
                        </div>
                        <div className="px-4 py-3 hover:bg-gray-50 cursor-pointer">
                          <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0">
                              <div className="h-2 w-2 bg-yellow-500 rounded-full mt-2"></div>
                            </div>
                            <div className="flex-1">
                              <p className="text-sm text-gray-900">Prescription ready for pickup</p>
                              <p className="text-xs text-gray-500 mt-1">3 hours ago</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="px-4 py-2 border-t">
                        <Link href="/notifications" className="text-sm text-blue-600 hover:text-blue-700">
                          View all notifications
                        </Link>
                      </div>
                    </div>
                  </div>

                  {/* User menu */}
                  <div className="relative" id="user-menu">
                    <button
                      onClick={() => setUserMenuOpen(!userMenuOpen)}
                      className="flex items-center space-x-3 text-gray-700 hover:text-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md p-2"
                      aria-expanded={userMenuOpen}
                      aria-haspopup="true"
                      aria-label={`User menu for ${user.firstName || user.email}`}
                    >
                      <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center">
                        <span className="text-white text-sm font-medium" aria-hidden="true">
                          {user.firstName?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="hidden md:block text-left">
                        <div className="text-sm font-medium text-gray-900">
                          {user.firstName && user.lastName 
                            ? `${user.firstName} ${user.lastName}`
                            : user.email
                          }
                        </div>
                        <div className="text-xs text-gray-500 capitalize">
                          {user.role.toLowerCase().replace('_', ' ')}
                        </div>
                      </div>
                    </button>

                    {/* User dropdown */}
                    {userMenuOpen && (
                      <div 
                        className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg py-1 border focus:outline-none"
                        role="menu"
                        aria-orientation="vertical"
                        aria-labelledby="user-menu"
                      >
                        <div className="px-4 py-3 border-b">
                          <p className="text-sm font-medium text-gray-900">
                            {user.firstName && user.lastName 
                              ? `${user.firstName} ${user.lastName}`
                              : 'User'
                            }
                          </p>
                          <p className="text-sm text-gray-600">{user.email}</p>
                          <p className="text-xs text-blue-600 capitalize font-medium">
                            {user.role.toLowerCase().replace('_', ' ')}
                          </p>
                        </div>
                        <Link
                          href="/profile"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                          onClick={() => setUserMenuOpen(false)}
                          role="menuitem"
                        >
                          <UserCircleIcon className="h-4 w-4 mr-3" aria-hidden="true" />
                          View Profile
                        </Link>
                        <Link
                          href="/settings"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                          onClick={() => setUserMenuOpen(false)}
                          role="menuitem"
                        >
                          <CogIcon className="h-4 w-4 mr-3" aria-hidden="true" />
                          Settings
                        </Link>
                        {user.role === 'ADMIN' && (
                          <Link
                            href="/admin/dashboard"
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                            onClick={() => setUserMenuOpen(false)}
                            role="menuitem"
                          >
                            <ShieldCheckIcon className="h-4 w-4 mr-3" aria-hidden="true" />
                            Admin Dashboard
                          </Link>
                        )}
                        <hr className="my-1" />
                        <button
                          onClick={handleLogout}
                          className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 focus:bg-red-50 focus:outline-none"
                          role="menuitem"
                        >
                          <svg className="h-4 w-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          Sign Out
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}

              {!user && (
                <>
                  <Link href="/login">
                    <Button variant="ghost">Sign In</Button>
                  </Link>
                  <Link href="/register">
                    <Button>Get Started</Button>
                  </Link>
                </>
              )}

              {/* Mobile menu button */}
              <div className="md:hidden">
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="text-gray-700 hover:text-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md p-1"
                  aria-expanded={mobileMenuOpen}
                  aria-controls="mobile-menu"
                  aria-label="Toggle mobile menu"
                >
                  {mobileMenuOpen ? (
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  ) : (
                    <Bars3Icon className="h-6 w-6" aria-hidden="true" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t" id="mobile-menu">
            {/* User info section for mobile when logged in */}
            {user && (
              <div className="px-4 py-3 border-b bg-gray-50">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
                    <span className="text-white font-medium">
                      {user.firstName?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {user.firstName && user.lastName 
                        ? `${user.firstName} ${user.lastName}`
                        : user.email
                      }
                    </div>
                    <div className="text-xs text-blue-600 capitalize font-medium">
                      {user.role.toLowerCase().replace('_', ' ')}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Quick actions section for mobile */}
            {user && (quickActions.length > 0 || emergencyActions.length > 0) && (
              <div className="px-4 py-3 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
                <div className="text-xs font-medium text-blue-900 mb-3 px-1">Quick Actions</div>
                <div className="grid grid-cols-1 gap-2">
                  {quickActions.map((action) => (
                    <Link
                      key={action.name}
                      href={action.href}
                      className="flex items-center px-4 py-3 text-sm font-medium text-blue-700 bg-blue-100 hover:bg-blue-200 rounded-lg transition-all duration-200 shadow-sm"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <action.icon className="h-5 w-5 mr-3" />
                      <div className="flex-1">
                        <div>{action.name}</div>
                        {action.description && (
                          <div className="text-xs text-blue-600 mt-1">{action.description}</div>
                        )}
                      </div>
                    </Link>
                  ))}
                  {emergencyActions.map((action) => (
                    <Link
                      key={action.name}
                      href={action.href}
                      className="flex items-center px-4 py-3 text-sm font-medium text-red-700 bg-red-100 hover:bg-red-200 rounded-lg transition-all duration-200 animate-pulse hover:animate-none shadow-sm"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <action.icon className="h-5 w-5 mr-3" />
                      <div className="flex-1">
                        <div>{action.name}</div>
                        {action.description && (
                          <div className="text-xs text-red-600 mt-1">{action.description}</div>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Primary navigation items */}
            <div className="px-2 pt-2 pb-3" role="menu">
              <div className="space-y-1">
                {primaryItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center px-3 py-3 text-base font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset rounded-lg ${
                      isActive(item.href)
                        ? 'text-blue-600 bg-blue-50 border-l-4 border-blue-600'
                        : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                    role="menuitem"
                    aria-current={isActive(item.href) ? 'page' : undefined}
                  >
                    <item.icon className="h-5 w-5 mr-4" aria-hidden="true" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span>{item.name}</span>
                        {item.badge && (
                          <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-500 rounded-full">
                            {item.badge}
                          </span>
                        )}
                      </div>
                      {item.description && (
                        <div className="text-xs text-gray-500 mt-1">{item.description}</div>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Secondary navigation items */}
            {secondaryItems.length > 0 && (
              <div className="border-t px-2 py-3">
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 px-3">Additional Services</div>
                <div className="space-y-1">
                  {secondaryItems.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`flex items-center px-3 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset rounded-lg ${
                        isActive(item.href)
                          ? 'text-blue-600 bg-blue-50'
                          : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                      role="menuitem"
                      aria-current={isActive(item.href) ? 'page' : undefined}
                    >
                      <item.icon className="h-4 w-4 mr-3" aria-hidden="true" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span>{item.name}</span>
                          {item.badge && (
                            <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-500 rounded-full">
                              {item.badge}
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Admin navigation items */}
            {adminItems.length > 0 && user?.role === 'ADMIN' && (
              <div className="border-t px-2 py-3 bg-red-50">
                <div className="text-xs font-medium text-red-600 uppercase tracking-wide mb-2 px-3">Administration</div>
                <div className="space-y-1">
                  {adminItems.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`flex items-center px-3 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-inset rounded-lg ${
                        isActive(item.href)
                          ? 'text-red-700 bg-red-100'
                          : 'text-red-600 hover:text-red-700 hover:bg-red-100'
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                      role="menuitem"
                      aria-current={isActive(item.href) ? 'page' : undefined}
                    >
                      <item.icon className="h-4 w-4 mr-3" aria-hidden="true" />
                      <span>{item.name}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Mobile user actions when logged in */}
            {user && (
              <div className="border-t px-2 py-3 space-y-2">
                <Link
                  href="/profile"
                  className="flex items-center px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <UserCircleIcon className="h-5 w-5 mr-3" />
                  View Profile
                </Link>
                <Link
                  href="/settings" 
                  className="flex items-center px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <CogIcon className="h-5 w-5 mr-3" />
                  Settings
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center w-full px-3 py-2 text-base font-medium text-red-600 hover:bg-red-50"
                >
                  <svg className="h-5 w-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013 3v1" />
                  </svg>
                  Sign Out
                </button>
              </div>
            )}
            
            {!user && (
              <div className="border-t px-2 py-3 space-y-2">
                <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start">
                    Sign In
                  </Button>
                </Link>
                <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full">Get Started</Button>
                </Link>
              </div>
            )}
          </div>
        )}
      </nav>
    </>
  )
}

export default Navigation
