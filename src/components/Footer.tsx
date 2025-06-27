'use client'

import React from 'react'
import Link from 'next/link'
import {
  HeartIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  ClockIcon,
  ShieldCheckIcon,
  AcademicCapIcon,
  UserGroupIcon,
  DocumentTextIcon,
  VideoCameraIcon,
  CalendarDaysIcon,
  ChatBubbleLeftIcon,
  QuestionMarkCircleIcon,
  ExclamationTriangleIcon,
  GlobeAltIcon,
  DevicePhoneMobileIcon,
  ComputerDesktopIcon,
  BuildingOffice2Icon,
  StarIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline'
import { 
  FacebookIcon, 
  TwitterIcon, 
  InstagramIcon, 
  LinkedInIcon, 
  YouTubeIcon 
} from './ui/social-icons'

const Footer = () => {
  const currentYear = new Date().getFullYear()

  const quickLinks = [
    { name: 'Find Doctors', href: '/doctors', icon: UserGroupIcon },
    { name: 'Book Appointment', href: '/appointments/book', icon: CalendarDaysIcon },
    { name: 'Telemedicine', href: '/telemedicine', icon: VideoCameraIcon },
    { name: 'Emergency Services', href: '/emergency', icon: ExclamationTriangleIcon },
    { name: 'Lab Results', href: '/lab-results', icon: DocumentTextIcon },
    { name: 'Patient Portal', href: '/login', icon: ComputerDesktopIcon }
  ]

  const medicalServices = [
    { name: 'Cardiology', href: '/services/cardiology' },
    { name: 'Dermatology', href: '/services/dermatology' },
    { name: 'Pediatrics', href: '/services/pediatrics' },
    { name: 'Orthopedics', href: '/services/orthopedics' },
    { name: 'Neurology', href: '/services/neurology' },
    { name: 'Psychiatry', href: '/services/psychiatry' },
    { name: 'General Medicine', href: '/services/general-medicine' },
    { name: 'Surgery', href: '/services/surgery' }
  ]

  const patientResources = [
    { name: 'Health Education', href: '/education', icon: AcademicCapIcon },
    { name: 'Insurance Information', href: '/insurance', icon: ShieldCheckIcon },
    { name: 'Billing & Payments', href: '/billing', icon: CurrencyDollarIcon },
    { name: 'Medical Records', href: '/medical-records', icon: DocumentTextIcon },
    { name: 'Prescription Refills', href: '/prescriptions', icon: DocumentTextIcon },
    { name: 'Health & Wellness', href: '/wellness', icon: HeartIcon }
  ]

  const supportLinks = [
    { name: 'Help Center', href: '/help', icon: QuestionMarkCircleIcon },
    { name: 'Contact Support', href: '/contact', icon: ChatBubbleLeftIcon },
    { name: 'FAQs', href: '/faq', icon: QuestionMarkCircleIcon },
    { name: 'Privacy Policy', href: '/privacy', icon: ShieldCheckIcon },
    { name: 'Terms of Service', href: '/terms', icon: DocumentTextIcon },
    { name: 'Accessibility', href: '/accessibility', icon: UserGroupIcon }
  ]

  const locations = [
    {
      name: 'Main Medical Center',
      address: '123 Healthcare Blvd, Medical District',
      city: 'New York, NY 10001',
      phone: '(555) 123-4567',
      hours: 'Mon-Fri: 7AM-7PM, Sat-Sun: 8AM-5PM'
    },
    {
      name: 'West Side Clinic',
      address: '456 Wellness Ave, West Side',
      city: 'New York, NY 10025',
      phone: '(555) 234-5678',
      hours: 'Mon-Fri: 8AM-6PM, Sat: 9AM-3PM'
    },
    {
      name: 'Downtown Health Center',
      address: '789 Care Street, Downtown',
      city: 'New York, NY 10005',
      phone: '(555) 345-6789',
      hours: 'Mon-Fri: 7AM-8PM, Weekends: 24/7'
    }
  ]

  return (
    <footer className="bg-gray-900 text-white">
      {/* Emergency Banner */}
      <div className="bg-red-600 py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center space-x-6 text-center">
            <div className="flex items-center space-x-2">
              <ExclamationTriangleIcon className="h-5 w-5" />
              <span className="text-sm font-medium">Emergency: Call 911</span>
            </div>
            <div className="hidden sm:flex items-center space-x-2">
              <PhoneIcon className="h-5 w-5" />
              <span className="text-sm">24/7 Nurse Hotline: (555) 999-HELP</span>
            </div>
            <div className="hidden md:flex items-center space-x-2">
              <VideoCameraIcon className="h-5 w-5" />
              <Link href="/emergency/virtual" className="text-sm hover:underline">
                Virtual Emergency Consult
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-2 mb-6">
              <HeartIcon className="h-8 w-8 text-blue-400" />
              <span className="text-xl font-bold">HealthCare Platform</span>
            </div>
            <p className="text-gray-300 mb-6 leading-relaxed">
              Comprehensive healthcare management platform connecting patients with top-quality medical professionals. 
              Your health, our priority - providing accessible, efficient, and compassionate care.
            </p>
            
            {/* Social Media */}
            <div className="flex space-x-4 mb-6">
              <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors" aria-label="Facebook">
                <FacebookIcon className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors" aria-label="Twitter">
                <TwitterIcon className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors" aria-label="Instagram">
                <InstagramIcon className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors" aria-label="LinkedIn">
                <LinkedInIcon className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors" aria-label="YouTube">
                <YouTubeIcon className="h-6 w-6" />
              </a>
            </div>

            {/* Awards & Certifications */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm text-gray-400">
                <StarIcon className="h-4 w-4 text-yellow-400" />
                <span>HIPAA Compliant</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-400">
                <ShieldCheckIcon className="h-4 w-4 text-green-400" />
                <span>SOC 2 Type II Certified</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-400">
                <AcademicCapIcon className="h-4 w-4 text-blue-400" />
                <span>Joint Commission Accredited</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-6 text-blue-400">Quick Access</h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link 
                    href={link.href}
                    className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors group"
                  >
                    <link.icon className="h-4 w-4 group-hover:text-blue-400 transition-colors" />
                    <span>{link.name}</span>
                  </Link>
                </li>
              ))}
            </ul>

            <h4 className="text-md font-semibold mt-8 mb-4 text-blue-400">Medical Services</h4>
            <ul className="space-y-2">
              {medicalServices.slice(0, 4).map((service) => (
                <li key={service.name}>
                  <Link 
                    href={service.href}
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    {service.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/services" className="text-blue-400 hover:text-blue-300 transition-colors">
                  View All Services →
                </Link>
              </li>
            </ul>
          </div>

          {/* Patient Resources */}
          <div>
            <h3 className="text-lg font-semibold mb-6 text-blue-400">Patient Resources</h3>
            <ul className="space-y-3">
              {patientResources.map((resource) => (
                <li key={resource.name}>
                  <Link 
                    href={resource.href}
                    className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors group"
                  >
                    <resource.icon className="h-4 w-4 group-hover:text-blue-400 transition-colors" />
                    <span>{resource.name}</span>
                  </Link>
                </li>
              ))}
            </ul>

            <h4 className="text-md font-semibold mt-8 mb-4 text-blue-400">Support</h4>
            <ul className="space-y-2">
              {supportLinks.slice(0, 3).map((link) => (
                <li key={link.name}>
                  <Link 
                    href={link.href}
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact & Locations */}
          <div>
            <h3 className="text-lg font-semibold mb-6 text-blue-400">Contact & Locations</h3>
            
            {/* Main Contact */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center space-x-2 text-gray-300">
                <PhoneIcon className="h-4 w-4 text-blue-400" />
                <span>Main: (555) 123-CARE</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-300">
                <EnvelopeIcon className="h-4 w-4 text-blue-400" />
                <span>info@healthcare.com</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-300">
                <ClockIcon className="h-4 w-4 text-blue-400" />
                <span>24/7 Support Available</span>
              </div>
            </div>

            {/* Featured Location */}
            <div className="bg-gray-800 rounded-lg p-4 mb-4">
              <h4 className="font-semibold text-blue-400 mb-2">Main Medical Center</h4>
              <div className="space-y-1 text-sm text-gray-300">
                <div className="flex items-start space-x-2">
                  <MapPinIcon className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <div>123 Healthcare Blvd</div>
                    <div>New York, NY 10001</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <PhoneIcon className="h-4 w-4 text-blue-400" />
                  <span>(555) 123-4567</span>
                </div>
                <div className="flex items-center space-x-2">
                  <ClockIcon className="h-4 w-4 text-blue-400" />
                  <span>Mon-Fri: 7AM-7PM</span>
                </div>
              </div>
            </div>

            <Link 
              href="/locations" 
              className="text-blue-400 hover:text-blue-300 transition-colors text-sm"
            >
              View All Locations →
            </Link>
          </div>
        </div>

        {/* Mobile App Section */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-xl font-semibold mb-4 text-blue-400">Get Our Mobile App</h3>
              <p className="text-gray-300 mb-6">
                Access your health information, book appointments, and connect with your care team from anywhere.
              </p>
              <div className="flex space-x-4">
                <a 
                  href="#" 
                  className="inline-flex items-center space-x-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
                >
                  <DevicePhoneMobileIcon className="h-5 w-5" />
                  <div className="text-left">
                    <div className="text-xs">Download on the</div>
                    <div className="text-sm font-semibold">App Store</div>
                  </div>
                </a>
                <a 
                  href="#" 
                  className="inline-flex items-center space-x-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
                >
                  <DevicePhoneMobileIcon className="h-5 w-5" />
                  <div className="text-left">
                    <div className="text-xs">Get it on</div>
                    <div className="text-sm font-semibold">Google Play</div>
                  </div>
                </a>
              </div>
            </div>
            
            <div className="text-center lg:text-right">
              <div className="inline-flex items-center space-x-4 bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-4 rounded-lg">
                <div className="text-left">
                  <div className="text-2xl font-bold">50K+</div>
                  <div className="text-sm text-blue-200">Happy Patients</div>
                </div>
                <div className="text-left">
                  <div className="text-2xl font-bold">500+</div>
                  <div className="text-sm text-blue-200">Healthcare Providers</div>
                </div>
                <div className="text-left">
                  <div className="text-2xl font-bold">15+</div>
                  <div className="text-sm text-blue-200">Medical Specialties</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6">
              <p className="text-gray-400 text-sm">
                © {currentYear} HealthCare Platform. All rights reserved.
              </p>
              <div className="flex space-x-6 text-sm">
                <Link href="/privacy" className="text-gray-400 hover:text-white transition-colors">
                  Privacy Policy
                </Link>
                <Link href="/terms" className="text-gray-400 hover:text-white transition-colors">
                  Terms of Service
                </Link>
                <Link href="/accessibility" className="text-gray-400 hover:text-white transition-colors">
                  Accessibility
                </Link>
                <Link href="/sitemap" className="text-gray-400 hover:text-white transition-colors">
                  Sitemap
                </Link>
              </div>
            </div>
            
            <div className="flex items-center space-x-4 text-sm text-gray-400">
              <div className="flex items-center space-x-1">
                <GlobeAltIcon className="h-4 w-4" />
                <span>English (US)</span>
              </div>
              <div className="flex items-center space-x-1">
                <ShieldCheckIcon className="h-4 w-4 text-green-400" />
                <span>Secure & HIPAA Compliant</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
