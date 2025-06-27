'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  CogIcon,
  BellIcon,
  ShieldCheckIcon,
  ClockIcon,
  EnvelopeIcon,
  PhoneIcon,
  GlobeAltIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'
import { useAuth } from '@/stores/auth-store'

interface SystemSettings {
  general: {
    platformName: string
    supportEmail: string
    supportPhone: string
    maintenanceMode: boolean
    allowRegistration: boolean
    maxAppointmentsPerDay: number
    appointmentDuration: number
    advanceBookingDays: number
  }
  notifications: {
    emailEnabled: boolean
    smsEnabled: boolean
    pushEnabled: boolean
    appointmentReminders: boolean
    reminderHours: number
    systemNotifications: boolean
  }
  security: {
    passwordMinLength: number
    requireUppercase: boolean
    requireNumbers: boolean
    requireSpecialChars: boolean
    sessionTimeout: number
    maxLoginAttempts: number
    enableTwoFactor: boolean
  }
  integrations: {
    twilioEnabled: boolean
    twilioAccountSid: string
    twilioAuthToken: string
    sendgridEnabled: boolean
    sendgridApiKey: string
    googleMapsApiKey: string
  }
}

export default function AdminSettingsPage() {
  const { token } = useAuth()
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState<'general' | 'notifications' | 'security' | 'integrations'>('general')
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle')

  // Fetch system settings
  const { data: settings, isLoading, error } = useQuery({
    queryKey: ['admin-settings'],
    queryFn: async () => {
      const response = await fetch('/api/admin/settings', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      if (!response.ok) {
        throw new Error('Failed to fetch settings')
      }
      return response.json()
    },
    enabled: !!token,
  })

  // Update settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: async (updates: Partial<SystemSettings>) => {
      const response = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      })
      if (!response.ok) {
        throw new Error('Failed to update settings')
      }
      return response.json()
    },
    onMutate: () => {
      setSaveStatus('saving')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-settings'] })
      setSaveStatus('success')
      setTimeout(() => setSaveStatus('idle'), 3000)
    },
    onError: () => {
      setSaveStatus('error')
      setTimeout(() => setSaveStatus('idle'), 3000)
    }
  })

  const handleSave = (sectionData: any, section: keyof SystemSettings) => {
    updateSettingsMutation.mutate({ [section]: sectionData })
  }

  const tabs = [
    { id: 'general', name: 'General', icon: CogIcon },
    { id: 'notifications', name: 'Notifications', icon: BellIcon },
    { id: 'security', name: 'Security', icon: ShieldCheckIcon },
    { id: 'integrations', name: 'Integrations', icon: GlobeAltIcon },
  ]

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-6"></div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error Loading Settings</h3>
              <div className="mt-2 text-sm text-red-700">
                Failed to load system settings. Please try again.
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
          <p className="text-gray-600">Configure platform settings and integrations</p>
        </div>
        
        {/* Save Status */}
        {saveStatus !== 'idle' && (
          <div className={`flex items-center px-4 py-2 rounded-lg ${
            saveStatus === 'saving' ? 'bg-blue-50 text-blue-700' :
            saveStatus === 'success' ? 'bg-green-50 text-green-700' :
            'bg-red-50 text-red-700'
          }`}>
            {saveStatus === 'saving' && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2" />}
            {saveStatus === 'success' && <CheckCircleIcon className="h-4 w-4 mr-2" />}
            {saveStatus === 'error' && <ExclamationTriangleIcon className="h-4 w-4 mr-2" />}
            <span className="text-sm font-medium">
              {saveStatus === 'saving' ? 'Saving...' :
               saveStatus === 'success' ? 'Settings saved!' :
               'Save failed'}
            </span>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="h-5 w-5 mr-2" />
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        {activeTab === 'general' && (
          <GeneralSettings 
            settings={settings?.general || {}} 
            onSave={(data) => handleSave(data, 'general')}
          />
        )}
        
        {activeTab === 'notifications' && (
          <NotificationSettings 
            settings={settings?.notifications || {}} 
            onSave={(data) => handleSave(data, 'notifications')}
          />
        )}
        
        {activeTab === 'security' && (
          <SecuritySettings 
            settings={settings?.security || {}} 
            onSave={(data) => handleSave(data, 'security')}
          />
        )}
        
        {activeTab === 'integrations' && (
          <IntegrationSettings 
            settings={settings?.integrations || {}} 
            onSave={(data) => handleSave(data, 'integrations')}
          />
        )}
      </div>
    </div>
  )
}

// General Settings Component
function GeneralSettings({ settings, onSave }: { settings: any, onSave: (data: any) => void }) {
  const [formData, setFormData] = useState({
    platformName: settings.platformName || 'Healthcare Management Platform',
    supportEmail: settings.supportEmail || 'support@healthcare.com',
    supportPhone: settings.supportPhone || '+1-555-0123',
    maintenanceMode: settings.maintenanceMode || false,
    allowRegistration: settings.allowRegistration || true,
    maxAppointmentsPerDay: settings.maxAppointmentsPerDay || 50,
    appointmentDuration: settings.appointmentDuration || 30,
    advanceBookingDays: settings.advanceBookingDays || 30,
  })

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900">General Settings</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Platform Name</label>
          <input
            type="text"
            value={formData.platformName}
            onChange={(e) => setFormData({ ...formData, platformName: e.target.value })}
            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Support Email</label>
          <input
            type="email"
            value={formData.supportEmail}
            onChange={(e) => setFormData({ ...formData, supportEmail: e.target.value })}
            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Support Phone</label>
          <input
            type="tel"
            value={formData.supportPhone}
            onChange={(e) => setFormData({ ...formData, supportPhone: e.target.value })}
            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Appointment Duration (minutes)</label>
          <input
            type="number"
            value={formData.appointmentDuration}
            onChange={(e) => setFormData({ ...formData, appointmentDuration: parseInt(e.target.value) })}
            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Max Appointments Per Day</label>
          <input
            type="number"
            value={formData.maxAppointmentsPerDay}
            onChange={(e) => setFormData({ ...formData, maxAppointmentsPerDay: parseInt(e.target.value) })}
            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Advance Booking Days</label>
          <input
            type="number"
            value={formData.advanceBookingDays}
            onChange={(e) => setFormData({ ...formData, advanceBookingDays: parseInt(e.target.value) })}
            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>
      
      <div className="space-y-4">
        <div className="flex items-center">
          <input
            type="checkbox"
            checked={formData.maintenanceMode}
            onChange={(e) => setFormData({ ...formData, maintenanceMode: e.target.checked })}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label className="ml-2 block text-sm text-gray-900">
            Maintenance Mode
            <p className="text-xs text-gray-500">Temporarily disable the platform for maintenance</p>
          </label>
        </div>
        
        <div className="flex items-center">
          <input
            type="checkbox"
            checked={formData.allowRegistration}
            onChange={(e) => setFormData({ ...formData, allowRegistration: e.target.checked })}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label className="ml-2 block text-sm text-gray-900">
            Allow New Registrations
            <p className="text-xs text-gray-500">Allow new users to register for accounts</p>
          </label>
        </div>
      </div>
      
      <div className="flex justify-end">
        <button
          onClick={() => onSave(formData)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Save General Settings
        </button>
      </div>
    </div>
  )
}

// Notification Settings Component
function NotificationSettings({ settings, onSave }: { settings: any, onSave: (data: any) => void }) {
  const [formData, setFormData] = useState({
    emailEnabled: settings.emailEnabled || true,
    smsEnabled: settings.smsEnabled || false,
    pushEnabled: settings.pushEnabled || true,
    appointmentReminders: settings.appointmentReminders || true,
    reminderHours: settings.reminderHours || 24,
    systemNotifications: settings.systemNotifications || true,
  })

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900">Notification Settings</h3>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-medium text-gray-900">Email Notifications</h4>
            <p className="text-sm text-gray-500">Send notifications via email</p>
          </div>
          <input
            type="checkbox"
            checked={formData.emailEnabled}
            onChange={(e) => setFormData({ ...formData, emailEnabled: e.target.checked })}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-medium text-gray-900">SMS Notifications</h4>
            <p className="text-sm text-gray-500">Send notifications via SMS (requires Twilio)</p>
          </div>
          <input
            type="checkbox"
            checked={formData.smsEnabled}
            onChange={(e) => setFormData({ ...formData, smsEnabled: e.target.checked })}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-medium text-gray-900">Push Notifications</h4>
            <p className="text-sm text-gray-500">Send browser push notifications</p>
          </div>
          <input
            type="checkbox"
            checked={formData.pushEnabled}
            onChange={(e) => setFormData({ ...formData, pushEnabled: e.target.checked })}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-medium text-gray-900">Appointment Reminders</h4>
            <p className="text-sm text-gray-500">Automatically send appointment reminders</p>
          </div>
          <input
            type="checkbox"
            checked={formData.appointmentReminders}
            onChange={(e) => setFormData({ ...formData, appointmentReminders: e.target.checked })}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700">Reminder Hours Before Appointment</label>
        <input
          type="number"
          value={formData.reminderHours}
          onChange={(e) => setFormData({ ...formData, reminderHours: parseInt(e.target.value) })}
          className="mt-1 block w-32 border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
          min="1"
          max="168"
        />
        <p className="text-xs text-gray-500 mt-1">How many hours before the appointment to send reminders</p>
      </div>
      
      <div className="flex justify-end">
        <button
          onClick={() => onSave(formData)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Save Notification Settings
        </button>
      </div>
    </div>
  )
}

// Security Settings Component  
function SecuritySettings({ settings, onSave }: { settings: any, onSave: (data: any) => void }) {
  const [formData, setFormData] = useState({
    passwordMinLength: settings.passwordMinLength || 8,
    requireUppercase: settings.requireUppercase || true,
    requireNumbers: settings.requireNumbers || true,
    requireSpecialChars: settings.requireSpecialChars || false,
    sessionTimeout: settings.sessionTimeout || 480,
    maxLoginAttempts: settings.maxLoginAttempts || 5,
    enableTwoFactor: settings.enableTwoFactor || false,
  })

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900">Security Settings</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Minimum Password Length</label>
          <input
            type="number"
            value={formData.passwordMinLength}
            onChange={(e) => setFormData({ ...formData, passwordMinLength: parseInt(e.target.value) })}
            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
            min="6"
            max="32"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Session Timeout (minutes)</label>
          <input
            type="number"
            value={formData.sessionTimeout}
            onChange={(e) => setFormData({ ...formData, sessionTimeout: parseInt(e.target.value) })}
            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
            min="15"
            max="1440"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Max Login Attempts</label>
          <input
            type="number"
            value={formData.maxLoginAttempts}
            onChange={(e) => setFormData({ ...formData, maxLoginAttempts: parseInt(e.target.value) })}
            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
            min="3"
            max="10"
          />
        </div>
      </div>
      
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-gray-900">Password Requirements</h4>
        
        <div className="flex items-center">
          <input
            type="checkbox"
            checked={formData.requireUppercase}
            onChange={(e) => setFormData({ ...formData, requireUppercase: e.target.checked })}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label className="ml-2 block text-sm text-gray-900">Require uppercase letters</label>
        </div>
        
        <div className="flex items-center">
          <input
            type="checkbox"
            checked={formData.requireNumbers}
            onChange={(e) => setFormData({ ...formData, requireNumbers: e.target.checked })}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label className="ml-2 block text-sm text-gray-900">Require numbers</label>
        </div>
        
        <div className="flex items-center">
          <input
            type="checkbox"
            checked={formData.requireSpecialChars}
            onChange={(e) => setFormData({ ...formData, requireSpecialChars: e.target.checked })}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label className="ml-2 block text-sm text-gray-900">Require special characters</label>
        </div>
        
        <div className="flex items-center">
          <input
            type="checkbox"
            checked={formData.enableTwoFactor}
            onChange={(e) => setFormData({ ...formData, enableTwoFactor: e.target.checked })}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label className="ml-2 block text-sm text-gray-900">
            Enable Two-Factor Authentication
            <p className="text-xs text-gray-500">Require 2FA for all admin accounts</p>
          </label>
        </div>
      </div>
      
      <div className="flex justify-end">
        <button
          onClick={() => onSave(formData)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Save Security Settings
        </button>
      </div>
    </div>
  )
}

// Integration Settings Component
function IntegrationSettings({ settings, onSave }: { settings: any, onSave: (data: any) => void }) {
  const [formData, setFormData] = useState({
    twilioEnabled: settings.twilioEnabled || false,
    twilioAccountSid: settings.twilioAccountSid || '',
    twilioAuthToken: settings.twilioAuthToken || '',
    sendgridEnabled: settings.sendgridEnabled || false,
    sendgridApiKey: settings.sendgridApiKey || '',
    googleMapsApiKey: settings.googleMapsApiKey || '',
  })

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900">Integration Settings</h3>
      
      {/* Twilio Integration */}
      <div className="border rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="text-sm font-medium text-gray-900">Twilio SMS Integration</h4>
            <p className="text-sm text-gray-500">Enable SMS notifications and reminders</p>
          </div>
          <input
            type="checkbox"
            checked={formData.twilioEnabled}
            onChange={(e) => setFormData({ ...formData, twilioEnabled: e.target.checked })}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
        </div>
        
        {formData.twilioEnabled && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Account SID</label>
              <input
                type="text"
                value={formData.twilioAccountSid}
                onChange={(e) => setFormData({ ...formData, twilioAccountSid: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Auth Token</label>
              <input
                type="password"
                value={formData.twilioAuthToken}
                onChange={(e) => setFormData({ ...formData, twilioAuthToken: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="••••••••••••••••••••••••••••••••"
              />
            </div>
          </div>
        )}
      </div>
      
      {/* SendGrid Integration */}
      <div className="border rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="text-sm font-medium text-gray-900">SendGrid Email Integration</h4>
            <p className="text-sm text-gray-500">Enable email notifications and reminders</p>
          </div>
          <input
            type="checkbox"
            checked={formData.sendgridEnabled}
            onChange={(e) => setFormData({ ...formData, sendgridEnabled: e.target.checked })}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
        </div>
        
        {formData.sendgridEnabled && (
          <div>
            <label className="block text-sm font-medium text-gray-700">API Key</label>
            <input
              type="password"
              value={formData.sendgridApiKey}
              onChange={(e) => setFormData({ ...formData, sendgridApiKey: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="SG.••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••"
            />
          </div>
        )}
      </div>
      
      {/* Google Maps Integration */}
      <div className="border rounded-lg p-4">
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-900">Google Maps Integration</h4>
          <p className="text-sm text-gray-500">Enable location services and maps</p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Google Maps API Key</label>
          <input
            type="password"
            value={formData.googleMapsApiKey}
            onChange={(e) => setFormData({ ...formData, googleMapsApiKey: e.target.value })}
            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="AIza••••••••••••••••••••••••••••••••••••••••"
          />
          <p className="text-xs text-gray-500 mt-1">Used for displaying hospital locations and maps</p>
        </div>
      </div>
      
      <div className="flex justify-end">
        <button
          onClick={() => onSave(formData)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Save Integration Settings
        </button>
      </div>
    </div>
  )
}
