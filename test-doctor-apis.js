// Simple API test for doctor profile loading
// Run this in the browser console after logging in as a doctor

async function testDoctorAPIs() {
  console.log('🧪 TESTING DOCTOR APIS')
  console.log('======================')
  
  // Get auth token from localStorage
  const token = localStorage.getItem('token')
  if (!token) {
    console.error('❌ No auth token found. Please login first.')
    return
  }
  
  console.log('✅ Token found:', token.substring(0, 20) + '...')
  
  // Get user ID from auth store or token payload
  const user = JSON.parse(localStorage.getItem('auth-storage') || '{}')
  const userId = user?.state?.user?.id
  
  if (!userId) {
    console.error('❌ No user ID found in auth storage')
    return
  }
  
  console.log('✅ User ID found:', userId)
  
  try {
    // Test 1: User API
    console.log('\n🧪 Test 1: User API')
    const userResponse = await fetch(`/api/user/${userId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    })
    
    console.log('Status:', userResponse.status)
    if (userResponse.ok) {
      const userData = await userResponse.json()
      console.log('✅ User data:', userData)
      
      if (userData.user?.doctor?.id) {
        const doctorId = userData.user.doctor.id
        console.log('✅ Doctor ID found:', doctorId)
        
        // Test 2: Doctor Dashboard API
        console.log('\n🧪 Test 2: Doctor Dashboard API')
        const doctorResponse = await fetch(`/api/doctor/${doctorId}/dashboard`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        })
        
        console.log('Status:', doctorResponse.status)
        if (doctorResponse.ok) {
          const doctorData = await doctorResponse.json()
          console.log('✅ Doctor data:', doctorData)
        } else {
          const errorText = await doctorResponse.text()
          console.error('❌ Doctor API error:', errorText)
        }
        
        // Test 3: Schedule API
        console.log('\n🧪 Test 3: Schedule API')
        const scheduleResponse = await fetch(`/api/doctor/${doctorId}/schedule`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        })
        
        console.log('Status:', scheduleResponse.status)
        if (scheduleResponse.ok) {
          const scheduleData = await scheduleResponse.json()
          console.log('✅ Schedule data:', scheduleData)
        } else {
          const errorText = await scheduleResponse.text()
          console.log('ℹ️ Schedule API response:', errorText)
          console.log('(404 is normal if no schedule exists yet)')
        }
        
      } else {
        console.error('❌ No doctor profile linked to this user')
      }
    } else {
      const errorText = await userResponse.text()
      console.error('❌ User API error:', errorText)
    }
    
  } catch (error) {
    console.error('💥 API test failed:', error)
  }
  
  console.log('\n🎯 Test complete!')
}

// Auto-run the test
testDoctorAPIs()
