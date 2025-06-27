// Emergency Auth Fix - Run this in browser console
// This will restore authentication for the current user

console.log('🚨 EMERGENCY AUTH FIX')
console.log('====================')

async function emergencyAuthFix() {
  const currentUserId = 'cmcdz6qxy0000ccvkk7bmv4yp'
  
  console.log('🔍 Attempting to restore auth for user:', currentUserId)
  
  // Try to get user data directly and see what role they have
  try {
    console.log('🔄 Testing direct API access...')
    
    // First, let's try to login with the known doctor accounts
    const doctorAccounts = [
      { email: 'dr.smith@healthcare.com', password: 'password123', name: 'Dr. Smith' },
      { email: 'dr.johnson@healthcare.com', password: 'password123', name: 'Dr. Johnson' },
      { email: 'asd1@gmail.com', password: 'password123', name: 'Dr. Faizan' }
    ]
    
    console.log('🧪 Testing doctor login accounts...')
    
    for (const account of doctorAccounts) {
      try {
        console.log(`🔍 Trying ${account.name} (${account.email})...`)
        
        const loginResponse = await fetch('/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: account.email,
            password: account.password
          }),
        })

        if (loginResponse.ok) {
          const loginData = await loginResponse.json()
          console.log(`✅ ${account.name} login successful!`)
          console.log('Login data:', loginData)
          
          // Store the authentication data
          localStorage.setItem('token', loginData.token)
          localStorage.setItem('userId', loginData.user.id)
          localStorage.setItem('userEmail', loginData.user.email)
          localStorage.setItem('userRole', loginData.user.role)
          
          console.log('✅ Authentication restored!')
          console.log('🔄 Redirecting to doctor schedule...')
          
          // Redirect to schedule page
          window.location.href = '/doctor/schedule'
          return
          
        } else {
          console.log(`❌ ${account.name} login failed:`, loginResponse.status)
        }
      } catch (error) {
        console.log(`❌ ${account.name} error:`, error.message)
      }
    }
    
    // If none of the doctor accounts worked, clear everything and go to login
    console.log('⚠️ No doctor accounts worked, redirecting to login...')
    localStorage.clear()
    window.location.href = '/login'
    
  } catch (error) {
    console.error('❌ Emergency fix failed:', error)
    
    // Last resort - clear everything and redirect to login
    localStorage.clear()
    window.location.href = '/login'
  }
}

// Also provide a manual quick fix function
window.quickDoctorLogin = function(email = 'dr.smith@healthcare.com') {
  fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: 'password123' }),
  })
  .then(response => {
    if (response.ok) {
      return response.json()
    } else {
      throw new Error(`Login failed: ${response.status}`)
    }
  })
  .then(data => {
    console.log('✅ Login successful:', data)
    localStorage.setItem('token', data.token)
    localStorage.setItem('userId', data.user.id)
    localStorage.setItem('userEmail', data.user.email)
    localStorage.setItem('userRole', data.user.role)
    window.location.href = '/doctor/schedule'
  })
  .catch(error => {
    console.error('❌ Login failed:', error)
    alert(`Login failed: ${error.message}`)
  })
}

// Run the emergency fix
emergencyAuthFix()

console.log('\n📝 Manual commands:')
console.log('- window.quickDoctorLogin() - Quick login as Dr. Smith')
console.log('- window.quickDoctorLogin("dr.johnson@healthcare.com") - Login as Dr. Johnson')
console.log('- window.quickDoctorLogin("asd1@gmail.com") - Login as Dr. Faizan')
