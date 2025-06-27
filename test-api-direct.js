// Direct API test for registration
const fetch = require('node-fetch')

async function testRegistrationAPI() {
  console.log('🧪 Testing Registration API directly...')
  
  const testData = {
    email: 'directtest@example.com',
    password: 'password123',
    role: 'PATIENT',
    firstName: 'Direct',
    lastName: 'Test',
    additionalInfo: {
      phoneNumber: '+1-555-0199'
    }
  }

  try {
    console.log('📤 Sending registration request...')
    const response = await fetch('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    })

    console.log('📥 Response status:', response.status)
    console.log('📥 Response headers:', Object.fromEntries(response.headers.entries()))

    const result = await response.text()
    console.log('📥 Raw response:', result)

    try {
      const jsonResult = JSON.parse(result)
      console.log('📥 Parsed response:', jsonResult)
    } catch (e) {
      console.log('❌ Could not parse as JSON')
    }

  } catch (error) {
    console.error('❌ API test error:', error)
  }
}

testRegistrationAPI()
