'use client'

import React from 'react'
import Link from 'next/link'
import { 
  CalendarDaysIcon,
  VideoCameraIcon,
  DocumentTextIcon,
  HeartIcon,
  ChatBubbleLeftRightIcon,
  ClockIcon,
  ShieldCheckIcon,
  DevicePhoneMobileIcon,
  UserGroupIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  BellIcon
} from '@heroicons/react/24/outline'
import { Button } from '@/components/ui/button'

export default function ServicesPage() {
  const primaryServices = [
    {
      name: 'Online Appointment Booking',
      description: 'Schedule appointments with healthcare providers at your convenience, 24/7.',
      icon: CalendarDaysIcon,
      features: ['Real-time availability', 'Instant confirmation', 'Automated reminders', 'Easy rescheduling'],
      color: 'blue'
    },
    {
      name: 'Telemedicine Consultations',
      description: 'Connect with doctors via secure video calls from the comfort of your home.',
      icon: VideoCameraIcon,
      features: ['HD video quality', 'Secure encryption', 'Screen sharing', 'Digital prescriptions'],
      color: 'green'
    },
    {
      name: 'Electronic Health Records',
      description: 'Access your complete medical history and health information securely online.',
      icon: DocumentTextIcon,
      features: ['Complete health history', 'Lab results', 'Prescription tracking', 'Medical imaging'],
      color: 'purple'
    },
    {
      name: 'Health Monitoring',
      description: 'Track your vital signs, symptoms, and health metrics with smart monitoring tools.',
      icon: HeartIcon,
      features: ['Vital sign tracking', 'Symptom logging', 'Health trends', 'AI-powered insights'],
      color: 'red'
    }
  ]

  const additionalServices = [
    {
      name: 'Secure Messaging',
      description: 'Communicate directly with your healthcare team through encrypted messaging.',
      icon: ChatBubbleLeftRightIcon,
    },
    {
      name: '24/7 Emergency Support',
      description: 'Round-the-clock access to emergency healthcare guidance and support.',
      icon: ClockIcon,
    },
    {
      name: 'Privacy Protection',
      description: 'HIPAA-compliant security ensuring your medical data stays private and secure.',
      icon: ShieldCheckIcon,
    },
    {
      name: 'Mobile App Access',
      description: 'Full-featured mobile application for healthcare management on the go.',
      icon: DevicePhoneMobileIcon,
    },
    {
      name: 'Care Coordination',
      description: 'Seamless coordination between multiple healthcare providers and specialists.',
      icon: UserGroupIcon,
    },
    {
      name: 'Health Analytics',
      description: 'Comprehensive health analytics and personalized health recommendations.',
      icon: ChartBarIcon,
    },
    {
      name: 'Insurance Integration',
      description: 'Streamlined insurance verification and claims processing.',
      icon: CurrencyDollarIcon,
    },
    {
      name: 'Smart Notifications',
      description: 'Intelligent reminders for medications, appointments, and health checkups.',
      icon: BellIcon,
    }
  ]

  const plans = [
    {
      name: 'Basic',
      price: 'Free',
      description: 'Essential features for basic healthcare management',
      features: [
        'Online appointment booking',
        'Basic health records',
        'Secure messaging',
        'Mobile app access'
      ],
      highlighted: false
    },
    {
      name: 'Premium',
      price: '$29',
      period: '/month',
      description: 'Advanced features for comprehensive healthcare',
      features: [
        'Everything in Basic',
        'Telemedicine consultations',
        'Advanced health analytics',
        'Priority support',
        'Health monitoring tools',
        'Care coordination'
      ],
      highlighted: true
    },
    {
      name: 'Family',
      price: '$79',
      period: '/month',
      description: 'Complete healthcare solution for families',
      features: [
        'Everything in Premium',
        'Up to 6 family members',
        'Family health dashboard',
        'Pediatric care features',
        'Emergency family alerts',
        'Dedicated care coordinator'
      ],
      highlighted: false
    }
  ]

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'bg-blue-500 text-white',
      green: 'bg-green-500 text-white',
      purple: 'bg-purple-500 text-white',
      red: 'bg-red-500 text-white'
    }
    return colors[color as keyof typeof colors] || 'bg-gray-500 text-white'
  }

  return (
    <div className="bg-white">
      {/* Hero section */}
      <div className="relative isolate px-6 pt-14 lg:px-8">
        <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
          <div
            className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
          />
        </div>
        <div className="mx-auto max-w-2xl py-32 sm:py-48 lg:py-56">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              Comprehensive Healthcare Services
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Experience the future of healthcare with our complete suite of digital health services 
              designed to make quality care accessible, convenient, and secure.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link href="/register">
                <Button size="lg">Start Free Trial</Button>
              </Link>
              <Link href="/contact" className="text-sm font-semibold leading-6 text-gray-900">
                Schedule Demo <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Primary services */}
      <div className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center">
            <h2 className="text-base font-semibold leading-7 text-blue-600">Core Services</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Everything You Need for Complete Healthcare Management
            </p>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Our platform provides comprehensive healthcare services designed to streamline 
              your healthcare experience and improve outcomes.
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <div className="grid grid-cols-1 gap-x-8 gap-y-16 lg:grid-cols-2">
              {primaryServices.map((service) => (
                <div key={service.name} className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm hover:shadow-lg transition-shadow">
                  <div className="flex items-center">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${getColorClasses(service.color)}`}>
                      <service.icon className="h-6 w-6" aria-hidden="true" />
                    </div>
                    <h3 className="ml-4 text-xl font-semibold text-gray-900">{service.name}</h3>
                  </div>
                  <p className="mt-4 text-gray-600">{service.description}</p>
                  <ul className="mt-6 space-y-2">
                    {service.features.map((feature) => (
                      <li key={feature} className="flex items-center text-sm text-gray-600">
                        <div className="h-1.5 w-1.5 bg-blue-600 rounded-full mr-3" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Additional services */}
      <div className="bg-gray-50 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center">
            <h2 className="text-base font-semibold leading-7 text-blue-600">Additional Features</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Enhanced Healthcare Experience
            </p>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Additional features and services that make our platform the complete 
              healthcare solution for patients and providers.
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-4xl">
            <div className="grid grid-cols-1 gap-x-8 gap-y-10 lg:grid-cols-2 lg:gap-y-16">
              {additionalServices.map((service) => (
                <div key={service.name} className="relative pl-16">
                  <div className="text-base font-semibold leading-7 text-gray-900">
                    <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600">
                      <service.icon className="h-6 w-6 text-white" aria-hidden="true" />
                    </div>
                    {service.name}
                  </div>
                  <div className="mt-2 text-base leading-7 text-gray-600">{service.description}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Pricing section */}
      <div className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="text-base font-semibold leading-7 text-blue-600">Pricing</h2>
            <p className="mt-2 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
              Choose the Right Plan for You
            </p>
          </div>
          <p className="mx-auto mt-6 max-w-2xl text-center text-lg leading-8 text-gray-600">
            Start with our free plan and upgrade as your healthcare needs grow. 
            All plans include our core security and privacy features.
          </p>
          <div className="isolate mx-auto mt-16 grid max-w-md grid-cols-1 gap-y-8 sm:mt-20 lg:mx-0 lg:max-w-none lg:grid-cols-3 lg:gap-x-8">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-3xl p-8 ring-1 ${
                  plan.highlighted
                    ? 'bg-blue-600 ring-blue-600 text-white scale-105'
                    : 'bg-white ring-gray-200'
                }`}
              >
                <h3
                  className={`text-lg font-semibold leading-8 ${
                    plan.highlighted ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  {plan.name}
                </h3>
                <p className={`mt-4 text-sm leading-6 ${plan.highlighted ? 'text-blue-100' : 'text-gray-600'}`}>
                  {plan.description}
                </p>
                <p className="mt-6 flex items-baseline gap-x-1">
                  <span
                    className={`text-4xl font-bold tracking-tight ${
                      plan.highlighted ? 'text-white' : 'text-gray-900'
                    }`}
                  >
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span
                      className={`text-sm font-semibold leading-6 ${
                        plan.highlighted ? 'text-blue-100' : 'text-gray-600'
                      }`}
                    >
                      {plan.period}
                    </span>
                  )}
                </p>
                <ul
                  role="list"
                  className={`mt-8 space-y-3 text-sm leading-6 ${
                    plan.highlighted ? 'text-blue-100' : 'text-gray-600'
                  }`}
                >
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex gap-x-3">
                      <HeartIcon
                        className={`h-6 w-5 flex-none ${plan.highlighted ? 'text-blue-200' : 'text-blue-600'}`}
                        aria-hidden="true"
                      />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button
                  variant={plan.highlighted ? 'secondary' : 'default'}
                  className="mt-8 w-full"
                  asChild
                >
                  <Link href="/register">
                    {plan.name === 'Basic' ? 'Get Started Free' : 'Start Free Trial'}
                  </Link>
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA section */}
      <div className="bg-blue-600">
        <div className="px-6 py-24 sm:px-6 sm:py-32 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Ready to Experience Better Healthcare?
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-blue-100">
              Join thousands of satisfied patients and healthcare providers who have 
              transformed their healthcare experience with our platform.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link href="/register">
                <Button variant="secondary" size="lg">
                  Start Your Free Trial
                </Button>
              </Link>
              <Link href="/contact" className="text-sm font-semibold leading-6 text-white">
                Contact Sales <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
