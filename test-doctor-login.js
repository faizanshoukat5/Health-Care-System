// Test login for doctor account
// Run this in browser console on login page

console.log('🔐 TESTING DOCTOR LOGIN')
console.log('======================')

async function testDoctorLogin() {
  try {
    console.log('🔄 Attempting login for Dr. Smith...')
    
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'dr.smith@healthcare.com',
        password: 'password123'
      }),
    })

    console.log('Login response status:', response.status)
    
    if (response.ok) {
      const data = await response.json()
      console.log('✅ Login successful:', data)
      
      // Store auth data
      localStorage.setItem('token', data.token)
      localStorage.setItem('userId', data.user.id)
      localStorage.setItem('userEmail', data.user.email)
      localStorage.setItem('userRole', data.user.role)
      
      console.log('🔄 Redirecting to doctor schedule...')
      window.location.href = '/doctor/schedule'
      
    } else {
      const errorData = await response.text()
      console.log('❌ Login failed:', errorData)
    }
    
  } catch (error) {
    console.error('❌ Login error:', error)
  }
}

// Also test with other doctor accounts
window.testDoctorLogins = async function() {
  const doctors = [
    { email: 'dr.smith@healthcare.com', password: 'password123', name: 'Dr. Smith' },
    { email: 'dr.johnson@healthcare.com', password: 'password123', name: 'Dr. Johnson' },
    { email: 'asd1@gmail.com', password: 'password123', name: 'Dr. Faizan' }
  ]
  
  console.log('🧪 Testing all doctor accounts...')
  
  for (const doctor of doctors) {
    console.log(`\n🔍 Testing ${doctor.name} (${doctor.email})...`)
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: doctor.email, password: doctor.password }),
      })
      
      if (response.ok) {
        const data = await response.json()
        console.log(`✅ ${doctor.name} login works:`, data.user.role)
      } else {
        console.log(`❌ ${doctor.name} login failed:`, response.status)
      }
    } catch (error) {
      console.log(`❌ ${doctor.name} error:`, error.message)
    }
  }
}

// Run the main test
testDoctorLogin()

console.log('\n📝 Available commands:')
console.log('- window.testDoctorLogins() - Test all doctor accounts')
console.log('- localStorage.clear() - Clear auth data')
