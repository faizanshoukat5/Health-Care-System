'use client';

import React from 'react';

export default function ReactRouterDemoPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">React Router Demo</h1>
          
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-blue-900 mb-4">
                Navigation Demo
              </h2>
              <p className="text-blue-800 mb-4">
                This Healthcare Management Platform uses Next.js App Router for navigation.
                All routing is handled by Next.js file-based routing system.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded border">
                  <h3 className="font-semibold text-gray-900 mb-2">Patient Routes</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• /patient/dashboard</li>
                    <li>• /patient/appointments</li>
                    <li>• /patient/vitals</li>
                    <li>• /patient/prescriptions</li>
                  </ul>
                </div>
                
                <div className="bg-white p-4 rounded border">
                  <h3 className="font-semibold text-gray-900 mb-2">Doctor Routes</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• /doctor/dashboard</li>
                    <li>• /doctor/schedule</li>
                    <li>• /doctor/patients</li>
                    <li>• /doctor/analytics</li>
                  </ul>
                </div>
                
                <div className="bg-white p-4 rounded border">
                  <h3 className="font-semibold text-gray-900 mb-2">Admin Routes</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• /admin/dashboard</li>
                    <li>• /admin/users</li>
                    <li>• /admin/analytics</li>
                    <li>• /admin/settings</li>
                  </ul>
                </div>
                
                <div className="bg-white p-4 rounded border">
                  <h3 className="font-semibold text-gray-900 mb-2">Public Routes</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• /doctors (Find Doctors)</li>
                    <li>• /services</li>
                    <li>• /about</li>
                    <li>• /contact</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-green-900 mb-4">
                Features Implemented
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <h4 className="font-medium text-green-800 mb-2">Authentication</h4>
                  <p className="text-sm text-green-700">JWT-based auth system</p>
                </div>
                <div>
                  <h4 className="font-medium text-green-800 mb-2">Role-based Access</h4>
                  <p className="text-sm text-green-700">Patient, Doctor, Admin roles</p>
                </div>
                <div>
                  <h4 className="font-medium text-green-800 mb-2">Real-time Updates</h4>
                  <p className="text-sm text-green-700">WebSocket integration</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
