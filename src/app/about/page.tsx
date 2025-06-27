'use client'

import React from 'react'
import Link from 'next/link'
import { 
  HeartIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  AcademicCapIcon,
  ClockIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline'
import { Button } from '@/components/ui/button'

export default function AboutPage() {
  const stats = [
    { id: 1, name: 'Patients Served', value: '50,000+' },
    { id: 2, name: 'Healthcare Providers', value: '500+' },
    { id: 3, name: 'Years of Experience', value: '15+' },
    { id: 4, name: 'Satisfaction Rate', value: '99%' },
  ]

  const values = [
    {
      name: 'Patient-Centered Care',
      description:
        'We prioritize patient needs and experiences, ensuring every individual receives personalized, compassionate healthcare.',
      icon: HeartIcon,
    },
    {
      name: 'Privacy & Security',
      description:
        'Your medical data is protected with state-of-the-art security measures and HIPAA-compliant infrastructure.',
      icon: ShieldCheckIcon,
    },
    {
      name: 'Collaborative Approach',
      description:
        'We foster collaboration between patients, doctors, and healthcare teams for optimal health outcomes.',
      icon: UserGroupIcon,
    },
    {
      name: 'Continuous Innovation',
      description:
        'We leverage cutting-edge technology to improve healthcare delivery and patient experiences.',
      icon: AcademicCapIcon,
    },
    {
      name: '24/7 Availability',
      description:
        'Our platform provides round-the-clock access to healthcare services and emergency support.',
      icon: ClockIcon,
    },
    {
      name: 'Global Accessibility',
      description:
        'Connecting patients and providers worldwide through secure telemedicine and digital health solutions.',
      icon: GlobeAltIcon,
    },
  ]

  const team = [
    {
      name: 'Dr. Sarah Johnson',
      role: 'Chief Medical Officer',
      image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
      bio: 'Board-certified physician with 20+ years of experience in emergency medicine and healthcare technology.',
    },
    {
      name: 'Michael Chen',
      role: 'Chief Technology Officer',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
      bio: 'Technology leader specializing in healthcare systems, AI, and secure medical data platforms.',
    },
    {
      name: 'Dr. Emily Rodriguez',
      role: 'Head of Patient Experience',
      image: 'https://images.unsplash.com/photo-1594824406953-888aa6a5b2ce?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
      bio: 'Healthcare administrator focused on improving patient outcomes and healthcare accessibility.',
    },
  ]

  return (
    <div className="bg-white">
      {/* Hero section */}
      <div className="relative isolate px-6 pt-14 lg:px-8">
        <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
          <div
            className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
            style={{
              clipPath:
                'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
            }}
          />
        </div>
        <div className="mx-auto max-w-2xl py-32 sm:py-48 lg:py-56">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              Transforming Healthcare Through Technology
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              We're revolutionizing healthcare delivery by connecting patients and providers through 
              secure, innovative digital health solutions that prioritize accessibility, quality, and patient outcomes.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link href="/register">
                <Button size="lg">Get Started Today</Button>
              </Link>
              <Link href="/contact" className="text-sm font-semibold leading-6 text-gray-900">
                Contact Us <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Stats section */}
      <div className="bg-white py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <dl className="grid grid-cols-1 gap-x-8 gap-y-16 text-center lg:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.id} className="mx-auto flex max-w-xs flex-col gap-y-4">
                <dt className="text-base leading-7 text-gray-600">{stat.name}</dt>
                <dd className="order-first text-3xl font-semibold tracking-tight text-gray-900 sm:text-5xl">
                  {stat.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      {/* Mission section */}
      <div className="bg-gray-50 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center">
            <h2 className="text-base font-semibold leading-7 text-blue-600">Our Mission</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Making Quality Healthcare Accessible to Everyone
            </p>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              We believe that everyone deserves access to high-quality healthcare. Our platform connects 
              patients with healthcare providers, streamlines medical processes, and ensures secure, 
              efficient healthcare delivery for all.
            </p>
          </div>
        </div>
      </div>

      {/* Values section */}
      <div className="bg-white py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center">
            <h2 className="text-base font-semibold leading-7 text-blue-600">Our Values</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              What Drives Us Forward
            </p>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Our core values guide every decision we make and every feature we build.
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-4xl">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-2 lg:gap-y-16">
              {values.map((value) => (
                <div key={value.name} className="relative pl-16">
                  <dt className="text-base font-semibold leading-7 text-gray-900">
                    <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600">
                      <value.icon className="h-6 w-6 text-white" aria-hidden="true" />
                    </div>
                    {value.name}
                  </dt>
                  <dd className="mt-2 text-base leading-7 text-gray-600">{value.description}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>

      {/* Team section */}
      <div className="bg-gray-50 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:mx-0">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Our Leadership Team</h2>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Meet the experienced professionals leading our mission to transform healthcare.
            </p>
          </div>
          <ul
            role="list"
            className="mx-auto mt-20 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 sm:grid-cols-2 lg:mx-0 lg:max-w-none lg:grid-cols-3"
          >
            {team.map((person) => (
              <li key={person.name}>
                <img className="aspect-[3/2] w-full rounded-2xl object-cover" src={person.image} alt="" />
                <h3 className="mt-6 text-lg font-semibold leading-8 tracking-tight text-gray-900">
                  {person.name}
                </h3>
                <p className="text-base leading-7 text-blue-600">{person.role}</p>
                <p className="mt-4 text-base leading-7 text-gray-600">{person.bio}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* CTA section */}
      <div className="bg-blue-600">
        <div className="px-6 py-24 sm:px-6 sm:py-32 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Ready to Transform Your Healthcare Experience?
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-blue-100">
              Join thousands of patients and healthcare providers who trust our platform 
              for secure, efficient, and accessible healthcare solutions.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link href="/register">
                <Button variant="secondary" size="lg">
                  Start Your Journey
                </Button>
              </Link>
              <Link href="/contact" className="text-sm font-semibold leading-6 text-white">
                Contact Our Team <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
