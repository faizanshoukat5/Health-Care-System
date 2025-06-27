'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  BellIcon,
  PaperAirplaneIcon,
  EyeIcon,
  EyeSlashIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import { useAuth } from '@/stores/auth-store'
import { format } from 'date-fns'

interface Notification {
  id: string
  userId: string
  type: string
  title: string
  message: string
  isRead: boolean
  data?: any
  createdAt: string
}

const notificationTypeIcons = {
  APPOINTMENT_REMINDER: BellIcon,
  APPOINTMENT_CONFIRMED: CheckCircleIcon,
  APPOINTMENT_CANCELLED: ExclamationTriangleIcon,
  PRESCRIPTION_READY: InformationCircleIcon,
  LAB_RESULTS_AVAILABLE: InformationCircleIcon,
  SYSTEM_ALERT: ExclamationCircleIcon,
}

const notificationTypeColors = {
  APPOINTMENT_REMINDER: 'text-blue-600 bg-blue-50',
  APPOINTMENT_CONFIRMED: 'text-green-600 bg-green-50',
  APPOINTMENT_CANCELLED: 'text-red-600 bg-red-50',
  PRESCRIPTION_READY: 'text-purple-600 bg-purple-50',
  LAB_RESULTS_AVAILABLE: 'text-indigo-600 bg-indigo-50',
  SYSTEM_ALERT: 'text-orange-600 bg-orange-50',
}

export default function AdminNotificationsPage() {
  const { token } = useAuth()
  const queryClient = useQueryClient()
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [showReadFilter, setShowReadFilter] = useState<'all' | 'unread' | 'read'>('all')
  const [showSendModal, setShowSendModal] = useState(false)
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([])

  // Fetch all notifications for admin view
  const { data: notifications, isLoading } = useQuery({
    queryKey: ['admin-notifications', typeFilter, showReadFilter],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (showReadFilter === 'unread') params.append('unreadOnly', 'true')
      if (showReadFilter === 'read') params.append('readOnly', 'true')
      params.append('limit', '200')
      
      const response = await fetch(`/api/admin/notifications?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      if (!response.ok) {
        throw new Error('Failed to fetch notifications')
      }
      return response.json()
    },
    enabled: !!token,
  })

  // Bulk update notifications
  const updateNotificationsMutation = useMutation({
    mutationFn: async ({ notificationIds, markAsRead }: { notificationIds: string[], markAsRead: boolean }) => {
      const response = await fetch('/api/admin/notifications/bulk', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ notificationIds, markAsRead }),
      })
      if (!response.ok) {
        throw new Error('Failed to update notifications')
      }
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-notifications'] })
      setSelectedNotifications([])
    },
  })

  // Send notification mutation
  const sendNotificationMutation = useMutation({
    mutationFn: async (notificationData: any) => {
      const response = await fetch('/api/admin/notifications/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(notificationData),
      })
      if (!response.ok) {
        throw new Error('Failed to send notification')
      }
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-notifications'] })
      setShowSendModal(false)
    },
  })

  // Filter notifications
  const filteredNotifications = notifications?.filter((notification: Notification) => {
    const matchesSearch = notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.message.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesType = typeFilter === 'all' || notification.type === typeFilter
    
    return matchesSearch && matchesType
  }) || []

  const handleSelectAll = () => {
    if (selectedNotifications.length === filteredNotifications.length) {
      setSelectedNotifications([])
    } else {
      setSelectedNotifications(filteredNotifications.map((n: Notification) => n.id))
    }
  }

  const handleSelectNotification = (id: string) => {
    setSelectedNotifications(prev => 
      prev.includes(id) 
        ? prev.filter(nId => nId !== id)
        : [...prev, id]
    )
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-6"></div>
          <div className="space-y-3">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
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
          <h1 className="text-2xl font-bold text-gray-900">Notification Management</h1>
          <p className="text-gray-600">Manage system notifications and send announcements</p>
        </div>
        <button
          onClick={() => setShowSendModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <PaperAirplaneIcon className="h-5 w-5" />
          Send Notification
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BellIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Total Notifications</p>
              <p className="text-2xl font-bold text-gray-900">{notifications?.length || 0}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <EyeSlashIcon className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Unread</p>
              <p className="text-2xl font-bold text-gray-900">
                {notifications?.filter((n: Notification) => !n.isRead).length || 0}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <EyeIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Read</p>
              <p className="text-2xl font-bold text-gray-900">
                {notifications?.filter((n: Notification) => n.isRead).length || 0}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <CheckCircleIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">This Week</p>
              <p className="text-2xl font-bold text-gray-900">
                {notifications?.filter((n: Notification) => {
                  const created = new Date(n.createdAt)
                  const weekAgo = new Date()
                  weekAgo.setDate(weekAgo.getDate() - 7)
                  return created > weekAgo
                }).length || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Actions */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex flex-col md:flex-row gap-4 flex-1">
            <div className="relative flex-1">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search notifications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="APPOINTMENT_REMINDER">Appointment Reminders</option>
              <option value="APPOINTMENT_CONFIRMED">Confirmations</option>
              <option value="APPOINTMENT_CANCELLED">Cancellations</option>
              <option value="PRESCRIPTION_READY">Prescriptions</option>
              <option value="LAB_RESULTS_AVAILABLE">Lab Results</option>
              <option value="SYSTEM_ALERT">System Alerts</option>
            </select>
            
            <select
              value={showReadFilter}
              onChange={(e) => setShowReadFilter(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="unread">Unread Only</option>
              <option value="read">Read Only</option>
            </select>
          </div>
          
          {selectedNotifications.length > 0 && (
            <div className="flex gap-2">
              <button
                onClick={() => updateNotificationsMutation.mutate({ 
                  notificationIds: selectedNotifications, 
                  markAsRead: true 
                })}
                className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
              >
                Mark Read
              </button>
              <button
                onClick={() => updateNotificationsMutation.mutate({ 
                  notificationIds: selectedNotifications, 
                  markAsRead: false 
                })}
                className="px-3 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 text-sm"
              >
                Mark Unread
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-lg shadow-sm border">
        {/* Header with select all */}
        <div className="px-6 py-3 border-b border-gray-200 flex items-center">
          <input
            type="checkbox"
            checked={selectedNotifications.length === filteredNotifications.length && filteredNotifications.length > 0}
            onChange={handleSelectAll}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <span className="ml-3 text-sm font-medium text-gray-900">
            {selectedNotifications.length > 0 
              ? `${selectedNotifications.length} selected`
              : 'Select all'
            }
          </span>
        </div>
        
        {/* Notifications */}
        <div className="divide-y divide-gray-200">
          {filteredNotifications.map((notification: Notification) => {
            const IconComponent = notificationTypeIcons[notification.type as keyof typeof notificationTypeIcons] || BellIcon
            const colorClass = notificationTypeColors[notification.type as keyof typeof notificationTypeColors] || 'text-gray-600 bg-gray-50'
            
            return (
              <div 
                key={notification.id} 
                className={`p-4 hover:bg-gray-50 ${!notification.isRead ? 'bg-blue-50' : ''}`}
              >
                <div className="flex items-center space-x-4">
                  <input
                    type="checkbox"
                    checked={selectedNotifications.includes(notification.id)}
                    onChange={() => handleSelectNotification(notification.id)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  
                  <div className={`p-2 rounded-lg ${colorClass}`}>
                    <IconComponent className="h-5 w-5" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className={`text-sm font-medium ${!notification.isRead ? 'text-gray-900' : 'text-gray-600'}`}>
                        {notification.title}
                      </p>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-500">
                          {format(new Date(notification.createdAt), 'MMM dd, HH:mm')}
                        </span>
                        {!notification.isRead && (
                          <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                    <div className="flex items-center mt-2 space-x-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {notification.type.replace(/_/g, ' ').toLowerCase()}
                      </span>
                      <span className="text-xs text-gray-500">User ID: {notification.userId}</span>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
        
        {filteredNotifications.length === 0 && (
          <div className="text-center py-12">
            <BellIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No notifications found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm ? 'Try adjusting your search criteria.' : 'No notifications match the current filters.'}
            </p>
          </div>
        )}
      </div>

      {/* Send Notification Modal */}
      {showSendModal && (
        <SendNotificationModal
          onClose={() => setShowSendModal(false)}
          onSend={(data) => sendNotificationMutation.mutate(data)}
          isLoading={sendNotificationMutation.isPending}
        />
      )}
    </div>
  )
}

// Send Notification Modal Component
function SendNotificationModal({ 
  onClose, 
  onSend, 
  isLoading 
}: { 
  onClose: () => void
  onSend: (data: any) => void
  isLoading: boolean 
}) {
  const [formData, setFormData] = useState({
    type: 'SYSTEM_ALERT',
    title: '',
    message: '',
    targetType: 'all', // all, doctors, patients, specific
    targetUserId: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSend(formData)
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Send Notification</h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="SYSTEM_ALERT">System Alert</option>
                <option value="APPOINTMENT_REMINDER">Appointment Reminder</option>
                <option value="APPOINTMENT_CONFIRMED">Appointment Confirmed</option>
                <option value="PRESCRIPTION_READY">Prescription Ready</option>
                <option value="LAB_RESULTS_AVAILABLE">Lab Results Available</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                required
                placeholder="Notification title"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Message</label>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                rows={3}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                required
                placeholder="Notification message"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Target</label>
              <select
                value={formData.targetType}
                onChange={(e) => setFormData({ ...formData, targetType: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Users</option>
                <option value="doctors">All Doctors</option>
                <option value="patients">All Patients</option>
                <option value="specific">Specific User</option>
              </select>
            </div>
            
            {formData.targetType === 'specific' && (
              <div>
                <label className="block text-sm font-medium text-gray-700">User ID</label>
                <input
                  type="text"
                  value={formData.targetUserId}
                  onChange={(e) => setFormData({ ...formData, targetUserId: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter user ID"
                  required
                />
              </div>
            )}
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50"
                disabled={isLoading}
              >
                {isLoading ? 'Sending...' : 'Send Notification'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
