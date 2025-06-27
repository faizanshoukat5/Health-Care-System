'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { 
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  ClockIcon,
  ChatBubbleLeftRightIcon,
  HeartIcon
} from '@heroicons/react/24/outline'
import { Button } from '@/components/ui/button'

const contactSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  subject: z.string().min(1, 'Subject is required'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
  inquiryType: z.enum(['general', 'support', 'billing', 'partnership', 'press'])
})

type ContactFormData = z.infer<typeof contactSchema>

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  })

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      console.log('Contact form submitted:', data)
      setSubmitted(true)
      reset()
    } catch (error) {
      console.error('Error submitting form:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const contactInfo = [
    {
      name: 'General Inquiries',
      description: 'Get answers to general questions about our platform and services.',
      icon: EnvelopeIcon,
      contact: 'hello@healthcare.com',
      type: 'email'
    },
    {
      name: 'Technical Support',
      description: '24/7 technical support for all platform-related issues.',
      icon: ChatBubbleLeftRightIcon,
      contact: 'support@healthcare.com',
      type: 'email'
    },
    {
      name: 'Emergency Line',
      description: 'For urgent medical emergencies, call our 24/7 emergency line.',
      icon: PhoneIcon,
      contact: '+1 (555) 911-HELP',
      type: 'phone'
    },
    {
      name: 'Business Hours',
      description: 'Our customer service team is available during these hours.',
      icon: ClockIcon,
      contact: 'Mon-Fri: 8AM-8PM EST',
      type: 'hours'
    }
  ]

  const offices = [
    {
      name: 'Headquarters',
      address: '123 Healthcare Ave, Suite 500',
      city: 'New York, NY 10001',
      phone: '+1 (555) 123-4567',
      email: 'ny@healthcare.com'
    },
    {
      name: 'West Coast Office',
      address: '456 Innovation Blvd, Floor 12',
      city: 'San Francisco, CA 94102',
      phone: '+1 (555) 987-6543',
      email: 'sf@healthcare.com'
    },
    {
      name: 'European Office',
      address: '789 Health Street, Building A',
      city: 'London, UK EC1A 1BB',
      phone: '+44 20 7123 4567',
      email: 'london@healthcare.com'
    }
  ]

  const faqs = [
    {
      question: 'How do I schedule an appointment?',
      answer: 'You can schedule appointments through our online booking system, available 24/7. Simply log in to your account, select your preferred provider, and choose an available time slot.'
    },
    {
      question: 'Is my medical data secure?',
      answer: 'Yes, we use industry-leading encryption and are fully HIPAA compliant. Your medical data is protected with the highest security standards and is never shared without your explicit consent.'
    },
    {
      question: 'What insurance plans do you accept?',
      answer: 'We accept most major insurance plans. You can verify your coverage during the registration process or contact our billing team for specific questions about your plan.'
    },
    {
      question: 'Can I access the platform on mobile devices?',
      answer: 'Absolutely! Our platform is fully responsive and we also offer dedicated mobile apps for iOS and Android with all the features of the web platform.'
    }
  ]

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="mx-auto h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
            <HeartIcon className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Thank You!</h2>
          <p className="text-gray-600 mb-6">
            Your message has been sent successfully. We'll get back to you within 24 hours.
          </p>
          <Button onClick={() => setSubmitted(false)} className="w-full">
            Send Another Message
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white">
      {/* Hero section */}
      <div className="relative isolate px-6 pt-14 lg:px-8">
        <div className="mx-auto max-w-2xl py-32 sm:py-48 lg:py-56">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              Get in Touch
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Have questions about our platform? Need technical support? Our team is here to help. 
              Reach out to us and we'll respond as quickly as possible.
            </p>
          </div>
        </div>
      </div>

      {/* Contact info cards */}
      <div className="py-24 sm:py-32 bg-gray-50">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center">
            <h2 className="text-base font-semibold leading-7 text-blue-600">Contact Information</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Multiple Ways to Reach Us
            </p>
          </div>
          <div className="mx-auto mt-16 grid grid-cols-1 gap-8 sm:mt-20 lg:grid-cols-2 lg:gap-x-8 lg:gap-y-16">
            {contactInfo.map((item) => (
              <div key={item.name} className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600">
                      <item.icon className="h-6 w-6 text-white" aria-hidden="true" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
                    <p className="mt-2 text-gray-600">{item.description}</p>
                    <p className="mt-3 text-blue-600 font-medium">{item.contact}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Contact form */}
      <div className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center">
            <h2 className="text-base font-semibold leading-7 text-blue-600">Send Us a Message</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              We'd Love to Hear From You
            </p>
          </div>
          
          <form onSubmit={handleSubmit(onSubmit)} className="mx-auto mt-16 max-w-xl">
            <div className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
              <div>
                <label htmlFor="firstName" className="block text-sm font-semibold leading-6 text-gray-900">
                  First name
                </label>
                <div className="mt-2.5">
                  <input
                    {...register('firstName')}
                    type="text"
                    className="block w-full rounded-md border-0 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                  />
                  {errors.firstName && (
                    <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>
                  )}
                </div>
              </div>
              
              <div>
                <label htmlFor="lastName" className="block text-sm font-semibold leading-6 text-gray-900">
                  Last name
                </label>
                <div className="mt-2.5">
                  <input
                    {...register('lastName')}
                    type="text"
                    className="block w-full rounded-md border-0 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                  />
                  {errors.lastName && (
                    <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>
                  )}
                </div>
              </div>
              
              <div className="sm:col-span-2">
                <label htmlFor="email" className="block text-sm font-semibold leading-6 text-gray-900">
                  Email
                </label>
                <div className="mt-2.5">
                  <input
                    {...register('email')}
                    type="email"
                    className="block w-full rounded-md border-0 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                  )}
                </div>
              </div>
              
              <div className="sm:col-span-2">
                <label htmlFor="phone" className="block text-sm font-semibold leading-6 text-gray-900">
                  Phone number (optional)
                </label>
                <div className="mt-2.5">
                  <input
                    {...register('phone')}
                    type="tel"
                    className="block w-full rounded-md border-0 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                  />
                </div>
              </div>
              
              <div className="sm:col-span-2">
                <label htmlFor="inquiryType" className="block text-sm font-semibold leading-6 text-gray-900">
                  Inquiry Type
                </label>
                <div className="mt-2.5">
                  <select
                    {...register('inquiryType')}
                    className="block w-full rounded-md border-0 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                  >
                    <option value="">Select an inquiry type</option>
                    <option value="general">General Question</option>
                    <option value="support">Technical Support</option>
                    <option value="billing">Billing & Payment</option>
                    <option value="partnership">Partnership Opportunity</option>
                    <option value="press">Press & Media</option>
                  </select>
                  {errors.inquiryType && (
                    <p className="mt-1 text-sm text-red-600">{errors.inquiryType.message}</p>
                  )}
                </div>
              </div>
              
              <div className="sm:col-span-2">
                <label htmlFor="subject" className="block text-sm font-semibold leading-6 text-gray-900">
                  Subject
                </label>
                <div className="mt-2.5">
                  <input
                    {...register('subject')}
                    type="text"
                    className="block w-full rounded-md border-0 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                  />
                  {errors.subject && (
                    <p className="mt-1 text-sm text-red-600">{errors.subject.message}</p>
                  )}
                </div>
              </div>
              
              <div className="sm:col-span-2">
                <label htmlFor="message" className="block text-sm font-semibold leading-6 text-gray-900">
                  Message
                </label>
                <div className="mt-2.5">
                  <textarea
                    {...register('message')}
                    rows={4}
                    className="block w-full rounded-md border-0 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                  />
                  {errors.message && (
                    <p className="mt-1 text-sm text-red-600">{errors.message.message}</p>
                  )}
                </div>
              </div>
            </div>
            
            <div className="mt-10">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full"
              >
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Office locations */}
      <div className="bg-gray-50 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center">
            <h2 className="text-base font-semibold leading-7 text-blue-600">Our Locations</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Visit Us Worldwide
            </p>
          </div>
          <div className="mx-auto mt-16 grid grid-cols-1 gap-8 lg:grid-cols-3">
            {offices.map((office) => (
              <div key={office.name} className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">{office.name}</h3>
                <div className="space-y-3">
                  <div className="flex items-start">
                    <MapPinIcon className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                    <div>
                      <p className="text-gray-900">{office.address}</p>
                      <p className="text-gray-600">{office.city}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <PhoneIcon className="h-5 w-5 text-gray-400 mr-3" />
                    <p className="text-gray-900">{office.phone}</p>
                  </div>
                  <div className="flex items-center">
                    <EnvelopeIcon className="h-5 w-5 text-gray-400 mr-3" />
                    <p className="text-blue-600">{office.email}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FAQ section */}
      <div className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center">
            <h2 className="text-base font-semibold leading-7 text-blue-600">FAQ</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Frequently Asked Questions
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-3xl">
            <div className="space-y-8">
              {faqs.map((faq, index) => (
                <div key={index} className="border-b border-gray-200 pb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">{faq.question}</h3>
                  <p className="text-gray-600">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
