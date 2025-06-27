import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { 
  HeartIcon, 
  UserGroupIcon, 
  VideoCameraIcon, 
  CalendarDaysIcon,
  ClipboardDocumentListIcon,
  ShieldCheckIcon 
} from '@heroicons/react/24/outline'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl">
            Complete Healthcare
            <span className="text-blue-600"> Management Platform</span>
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-xl text-gray-600">
            Streamline your healthcare experience with our comprehensive platform featuring 
            patient portals, telemedicine, appointment booking, and secure medical records.
          </p>
          <div className="mt-10 flex justify-center space-x-4">
            <Link href="/register?role=patient">
              <Button size="lg" className="px-8 py-3">
                I'm a Patient
              </Button>
            </Link>
            <Link href="/register?role=doctor">
              <Button variant="outline" size="lg" className="px-8 py-3">
                I'm a Doctor
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900">
            Everything you need for modern healthcare
          </h2>
          <p className="mt-4 text-xl text-gray-600">
            Our platform provides comprehensive tools for patients and healthcare providers
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <VideoCameraIcon className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Telemedicine</h3>
            <p className="text-gray-600">
              Connect with healthcare providers through secure video consultations from anywhere.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <CalendarDaysIcon className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Smart Scheduling</h3>
            <p className="text-gray-600">
              Book appointments easily with real-time availability and automated reminders.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <ClipboardDocumentListIcon className="h-12 w-12 text-purple-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Medical Records</h3>
            <p className="text-gray-600">
              Secure, comprehensive electronic health records accessible to you and your providers.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <UserGroupIcon className="h-12 w-12 text-red-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Patient Portal</h3>
            <p className="text-gray-600">
              Access your health information, test results, and communicate with your care team.
            </p>
          </div>

          {/* Feature 5 */}
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <HeartIcon className="h-12 w-12 text-pink-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Health Monitoring</h3>
            <p className="text-gray-600">
              Track vital signs, medications, and health metrics with intelligent insights.
            </p>
          </div>

          {/* Feature 6 */}
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <ShieldCheckIcon className="h-12 w-12 text-indigo-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">HIPAA Compliant</h3>
            <p className="text-gray-600">
              Enterprise-grade security ensuring your health data is protected and private.
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white">
              Ready to transform your healthcare experience?
            </h2>
            <p className="mt-4 text-xl text-blue-100">
              Join thousands of patients and healthcare providers using our platform
            </p>
            <div className="mt-8">
              <Link href="/register">
                <Button variant="secondary" size="lg" className="px-8 py-3">
                  Start Free Trial
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center">
                <HeartIcon className="h-8 w-8 text-blue-400" />
                <span className="ml-2 text-xl font-bold">HealthCare Platform</span>
              </div>
              <p className="mt-4 text-gray-300">
                Connecting patients and healthcare providers through innovative technology.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Platform</h3>
              <ul className="space-y-2 text-gray-300">
                <li><a href="#" className="hover:text-white">For Patients</a></li>
                <li><a href="#" className="hover:text-white">For Doctors</a></li>
                <li><a href="#" className="hover:text-white">For Hospitals</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-300">
                <li><a href="#" className="hover:text-white">Help Center</a></li>
                <li><a href="#" className="hover:text-white">Contact Us</a></li>
                <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-300">
                <li><a href="#" className="hover:text-white">About Us</a></li>
                <li><a href="#" className="hover:text-white">Careers</a></li>
                <li><a href="#" className="hover:text-white">Blog</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Healthcare Platform. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
