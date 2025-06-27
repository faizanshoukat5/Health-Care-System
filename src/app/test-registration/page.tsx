'use client'

import { useState } from 'react'

export default function TestRegistrationPage() {
  const [result, setResult] = useState<string>('')
  const [loading, setLoading] = useState(false)

  const testAPI = async () => {
    setLoading(true)
    setResult('')
    
    const testData = {
      email: 'testuser@example.com',
      password: 'password123',
      role: 'PATIENT',
      firstName: 'Test',
      lastName: 'User',
      additionalInfo: {
        phoneNumber: '+1-555-0123'
      }
    }

    try {
      console.log('Sending test data:', testData)
      
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testData),
      })

      console.log('Response status:', response.status)
      console.log('Response headers:', response.headers)

      const responseText = await response.text()
      console.log('Raw response:', responseText)

      setResult(`Status: ${response.status}\nResponse: ${responseText}`)

    } catch (error) {
      console.error('Error:', error)
      setResult(`Error: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Registration API Test</h1>
        
        <button
          onClick={testAPI}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Testing...' : 'Test Registration API'}
        </button>

        {result && (
          <div className="mt-4 p-4 bg-white border rounded">
            <h2 className="font-bold mb-2">Result:</h2>
            <pre className="whitespace-pre-wrap text-sm">{result}</pre>
          </div>
        )}
      </div>
    </div>
  )
}
