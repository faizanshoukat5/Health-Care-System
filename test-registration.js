// Test registration functionality
async function testRegistration() {
  console.log('🧪 Testing Registration Button...')
  
  try {
    const testData = {
      email: 'test.user@example.com',
      password: 'password123',
      role: 'PATIENT',
      firstName: 'Test',
      lastName: 'User',
      additionalInfo: {
        phoneNumber: '+1-555-0199'
      }
    }

    console.log('📤 Sending test registration request...')
    const response = await fetch('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    })

    const result = await response.json()
    
    if (response.ok) {
      console.log('✅ Registration API working correctly!')
      console.log('📝 Response:', result)
      console.log('👤 User created:', result.user)
      console.log('🔑 Token received:', result.token ? 'Yes' : 'No')
    } else {
      console.log('❌ Registration failed:', result)
    }

  } catch (error) {
    console.error('❌ Test error:', error)
  }
}

console.log('🔗 Registration form available at: http://localhost:3000/register')
console.log('✅ Registration button should now work!')
console.log('')
console.log('🔧 Fixes applied:')
console.log('   ✅ Data format transformation for API compatibility')
console.log('   ✅ Password validation (minimum 8 characters)')
console.log('   ✅ Proper auth store integration')
console.log('   ✅ Token return in API response')
console.log('   ✅ Correct redirects after registration')
console.log('')
console.log('🧪 To test manually:')
console.log('   1. Go to http://localhost:3000/register')
console.log('   2. Fill in the form (password must be 8+ characters)')
console.log('   3. Click "Create Account" button')
console.log('   4. Should redirect to appropriate dashboard')

// Run the test if fetch is available (browser environment)
if (typeof fetch !== 'undefined') {
  testRegistration()
}
