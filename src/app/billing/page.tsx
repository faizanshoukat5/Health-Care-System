'use client'

import React, { useState } from 'react'
import { useAuth } from '@/stores/auth-store'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import {
  CurrencyDollarIcon,
  CreditCardIcon,
  DocumentTextIcon,
  ChartBarIcon,
  ArrowDownTrayIcon,
  EyeIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  CalendarDaysIcon,
  BanknotesIcon,
  ReceiptPercentIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'
import { format } from 'date-fns'

// API functions
const fetchBilling = async (token: string, type: 'patient' | 'admin', userId?: string) => {
  const url = type === 'admin' 
    ? '/api/admin/billing' 
    : `/api/patient/billing${userId ? `?userId=${userId}` : ''}`
  
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  })
  if (!response.ok) throw new Error('Failed to fetch billing data')
  return response.json()
}

const processPayment = async (invoiceId: string, paymentData: any, token: string) => {
  const response = await fetch(`/api/billing/invoice/${invoiceId}/pay`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(paymentData)
  })
  if (!response.ok) throw new Error('Failed to process payment')
  return response.json()
}

const downloadInvoice = async (invoiceId: string, token: string) => {
  const response = await fetch(`/api/billing/invoice/${invoiceId}/download`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    credentials: 'include',
  })
  if (!response.ok) throw new Error('Failed to download invoice')
  return response.blob()
}

export default function BillingPage() {
  const { user, token } = useAuth()
  const queryClient = useQueryClient()
  const [selectedPeriod, setSelectedPeriod] = useState('month')
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null)
  const [paymentData, setPaymentData] = useState({
    paymentMethod: 'card',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    billingAddress: ''
  })

  const isAdmin = user?.role === 'ADMIN'
  
  // Data query
  const { data: billingData, isLoading } = useQuery({
    queryKey: ['billing-data', selectedPeriod, user?.id],
    queryFn: () => fetchBilling(token!, isAdmin ? 'admin' : 'patient', user?.id),
    enabled: !!token && !!user,
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  })

  // Payment mutation
  const paymentMutation = useMutation({
    mutationFn: ({ invoiceId, data }: { invoiceId: string, data: any }) => 
      processPayment(invoiceId, data, token!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['billing-data'] })
      setShowPaymentModal(false)
      setSelectedInvoice(null)
      setPaymentData({
        paymentMethod: 'card',
        cardNumber: '',
        expiryDate: '',
        cvv: '',
        billingAddress: ''
      })
    },
  })

  // Download mutation
  const downloadMutation = useMutation({
    mutationFn: (invoiceId: string) => downloadInvoice(invoiceId, token!),
    onSuccess: (blob, invoiceId) => {
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `invoice-${invoiceId}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    },
  })

  if (!user) {
    return <div>Please log in to view billing information</div>
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID': return 'bg-green-100 text-green-800'
      case 'PENDING': return 'bg-yellow-100 text-yellow-800'
      case 'OVERDUE': return 'bg-red-100 text-red-800'
      case 'CANCELLED': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PAID': return <CheckCircleIcon className="h-4 w-4" />
      case 'PENDING': return <ClockIcon className="h-4 w-4" />
      case 'OVERDUE': return <ExclamationTriangleIcon className="h-4 w-4" />
      default: return <DocumentTextIcon className="h-4 w-4" />
    }
  }

  const handlePaymentClick = (invoice: any) => {
    setSelectedInvoice(invoice)
    setShowPaymentModal(true)
  }

  const handlePaymentSubmit = () => {
    if (selectedInvoice && paymentData.cardNumber && paymentData.expiryDate && paymentData.cvv) {
      paymentMutation.mutate({
        invoiceId: selectedInvoice.id,
        data: paymentData
      })
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <Link href={isAdmin ? "/admin/dashboard" : "/patient/dashboard"}>
                <Button variant="ghost">← Back</Button>
              </Link>
              <CurrencyDollarIcon className="h-8 w-8 text-green-600" />
              <h1 className="text-2xl font-bold text-gray-900">
                {isAdmin ? 'Revenue Management' : 'Billing & Payments'}
              </h1>
            </div>
            <div className="flex space-x-3">
              {isAdmin && (
                <Link href="/admin/billing/reports">
                  <Button variant="outline">
                    <ChartBarIcon className="h-4 w-4 mr-2" />
                    Financial Reports
                  </Button>
                </Link>
              )}
              <Button variant="outline">
                <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                Export Data
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">
                  {isAdmin ? 'Total Revenue' : 'Total Spent'}
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  ${billingData?.totalAmount || '0.00'}
                </p>
              </div>
              <CurrencyDollarIcon className="h-8 w-8 text-green-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">
                  {isAdmin ? 'This Month' : 'Outstanding'}
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  ${billingData?.thisMonth || billingData?.outstanding || '0.00'}
                </p>
              </div>
              <BanknotesIcon className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">
                  {isAdmin ? 'Pending Payments' : 'Paid This Year'}
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  ${billingData?.pending || billingData?.yearTotal || '0.00'}
                </p>
              </div>
              <ClockIcon className="h-8 w-8 text-orange-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">
                  {isAdmin ? 'Avg Per Patient' : 'Last Payment'}
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  ${billingData?.avgPerPatient || billingData?.lastPayment || '0.00'}
                </p>
              </div>
              <ReceiptPercentIcon className="h-8 w-8 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Period Filter */}
        <div className="bg-white rounded-lg shadow-sm border mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              {[
                { key: 'week', label: 'This Week' },
                { key: 'month', label: 'This Month' },
                { key: 'quarter', label: 'This Quarter' },
                { key: 'year', label: 'This Year' },
                { key: 'all', label: 'All Time' }
              ].map((period) => (
                <button
                  key={period.key}
                  onClick={() => setSelectedPeriod(period.key)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    selectedPeriod === period.key
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {period.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Invoices/Transactions List */}
        <div className="bg-white rounded-lg shadow-sm border">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading billing data...</p>
            </div>
          ) : billingData?.invoices?.length === 0 ? (
            <div className="p-8 text-center">
              <DocumentTextIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No invoices found</h3>
              <p className="text-gray-500">
                {isAdmin 
                  ? 'No billing data available for the selected period.' 
                  : 'You have no invoices or transactions yet.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Invoice
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {isAdmin ? 'Patient' : 'Service'}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {billingData?.invoices?.map((invoice: any) => (
                    <tr key={invoice.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          #{invoice.invoiceNumber || invoice.id.substring(0, 8)}
                        </div>
                        <div className="text-sm text-gray-500">
                          {invoice.description || 'Medical Services'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {isAdmin ? (
                          invoice.patient ? 
                            `${invoice.patient.firstName} ${invoice.patient.lastName}` : 
                            'Unknown Patient'
                        ) : (
                          invoice.service || 'Consultation'
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        ${invoice.amount?.toFixed(2) || '0.00'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {format(new Date(invoice.createdAt), 'MMM dd, yyyy')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(invoice.status)}`}>
                          {getStatusIcon(invoice.status)}
                          <span className="ml-1">{invoice.status}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <Link href={`/billing/invoice/${invoice.id}`}>
                            <Button size="sm" variant="outline">
                              <EyeIcon className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => downloadMutation.mutate(invoice.id)}
                            disabled={downloadMutation.isPending}
                          >
                            <ArrowDownTrayIcon className="h-4 w-4" />
                          </Button>
                          {!isAdmin && ['PENDING', 'OVERDUE'].includes(invoice.status) && (
                            <Button
                              size="sm"
                              onClick={() => handlePaymentClick(invoice)}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CreditCardIcon className="h-4 w-4 mr-1" />
                              Pay
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Payment Modal */}
      {showPaymentModal && selectedInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Pay Invoice</h3>
            <div className="mb-4">
              <p className="text-sm text-gray-600">Invoice: #{selectedInvoice.invoiceNumber || selectedInvoice.id.substring(0, 8)}</p>
              <p className="text-lg font-semibold">Amount: ${selectedInvoice.amount?.toFixed(2)}</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  value={paymentData.paymentMethod}
                  onChange={(e) => setPaymentData({...paymentData, paymentMethod: e.target.value})}
                >
                  <option value="card">Credit/Debit Card</option>
                  <option value="bank">Bank Transfer</option>
                  <option value="insurance">Insurance</option>
                </select>
              </div>

              {paymentData.paymentMethod === 'card' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Card Number</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="1234 5678 9012 3456"
                      value={paymentData.cardNumber}
                      onChange={(e) => setPaymentData({...paymentData, cardNumber: e.target.value})}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Expiry Date</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        placeholder="MM/YY"
                        value={paymentData.expiryDate}
                        onChange={(e) => setPaymentData({...paymentData, expiryDate: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">CVV</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        placeholder="123"
                        value={paymentData.cvv}
                        onChange={(e) => setPaymentData({...paymentData, cvv: e.target.value})}
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
            
            <div className="flex space-x-3 mt-6">
              <Button
                variant="outline"
                onClick={() => {
                  setShowPaymentModal(false)
                  setSelectedInvoice(null)
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handlePaymentSubmit}
                disabled={paymentMutation.isPending}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                {paymentMutation.isPending ? 'Processing...' : 'Pay Now'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
