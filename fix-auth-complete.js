// Complete authentication test and fix
// Run this in browser console to test and fix auth issues

console.log('🔧 COMPREHENSIVE AUTH FIX')
console.log('========================')

async function fixAuthIssues() {
  try {
    // 1. Clear any existing auth data
    console.log('🧹 Clearing existing auth data...')
    localStorage.removeItem('token')
    localStorage.removeItem('userId')
    localStorage.removeItem('userEmail')
    localStorage.removeItem('userRole')
    
    // 2. Test login with Dr. Smith
    console.log('🔐 Logging in as Dr. Smith...')
    const loginResponse = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'dr.smith@healthcare.com',
        password: 'password123'
      }),
    })

    if (!loginResponse.ok) {
      console.log('❌ Login failed:', loginResponse.status)
      const errorText = await loginResponse.text()
      console.log('Error:', errorText)
      
      // Try alternative doctor accounts
      console.log('🔄 Trying alternative accounts...')
      
      const altAccounts = [
        { email: 'dr.johnson@healthcare.com', password: 'password123' },
        { email: 'asd1@gmail.com', password: 'password123' }
      ]
      
      for (const account of altAccounts) {
        console.log(`🔍 Trying ${account.email}...`)
        const altResponse = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(account),
        })
        
        if (altResponse.ok) {
          const data = await altResponse.json()
          console.log(`✅ Successfully logged in as ${account.email}`)
          
          // Store the working credentials
          localStorage.setItem('token', data.token)
          localStorage.setItem('userId', data.user.id)
          localStorage.setItem('userEmail', data.user.email)
          localStorage.setItem('userRole', data.user.role)
          
          break
        }
      }
    } else {
      const data = await loginResponse.json()
      console.log('✅ Login successful:', data)
      
      // Store auth data
      localStorage.setItem('token', data.token)
      localStorage.setItem('userId', data.user.id)
      localStorage.setItem('userEmail', data.user.email)
      localStorage.setItem('userRole', data.user.role)
    }
    
    // 3. Test user endpoint with token
    const token = localStorage.getItem('token')
    const userId = localStorage.getItem('userId')
    
    if (token && userId) {
      console.log('🔍 Testing user endpoint with auth...')
      
      const userResponse = await fetch(`/api/user/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (userResponse.ok) {
        const userData = await userResponse.json()
        console.log('✅ User data retrieved:', userData)
        
        if (userData.user?.doctor) {
          console.log('✅ Doctor profile found!')
          console.log('Doctor:', userData.user.doctor)
          
          // Test schedule endpoint
          console.log('🔍 Testing schedule endpoint...')
          const scheduleResponse = await fetch(`/api/doctor/${userData.user.doctor.id}/schedule`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          })
          
          if (scheduleResponse.ok) {
            const scheduleData = await scheduleResponse.json()
            console.log('✅ Schedule data retrieved:', scheduleData)
          } else {
            console.log('⚠️ Schedule endpoint issue:', scheduleResponse.status)
          }
          
        } else {
          console.log('❌ No doctor profile found for this user')
          console.log('User role:', userData.user?.role)
        }
      } else {
        console.log('❌ User endpoint failed:', userResponse.status)
      }
    }
    
    // 4. Refresh the page to apply changes
    console.log('🔄 Refreshing page to apply changes...')
    setTimeout(() => {
      window.location.reload()
    }, 2000)
    
  } catch (error) {
    console.error('❌ Auth fix failed:', error)
  }
}

// Manual functions for testing
window.testDoctorAuth = async function(email = 'dr.smith@healthcare.com') {
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: 'password123' }),
    })
    
    if (response.ok) {
      const data = await response.json()
      console.log('Login successful:', data)
      
      localStorage.setItem('token', data.token)
      localStorage.setItem('userId', data.user.id)
      localStorage.setItem('userEmail', data.user.email)
      localStorage.setItem('userRole', data.user.role)
      
      window.location.reload()
    } else {
      console.log('Login failed:', response.status)
    }
  } catch (error) {
    console.error('Login error:', error)
  }
}

// Run the fix
fixAuthIssues()

console.log('\n📝 Manual commands available:')
console.log('- window.testDoctorAuth("dr.smith@healthcare.com") - Test specific doctor')
console.log('- window.testDoctorAuth("dr.johnson@healthcare.com") - Test Dr. Johnson')
console.log('- window.testDoctorAuth("asd1@gmail.com") - Test Dr. Faizan')
