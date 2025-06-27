// Quick diagnostic script for doctor profile issues
// Run this in browser console after login

async function diagnoseDoctorProfile() {
  console.log('🔍 DOCTOR PROFILE DIAGNOSTIC')
  console.log('============================')
  
  // Get auth info
  const authStorage = localStorage.getItem('auth-storage')
  const token = localStorage.getItem('token')
  
  console.log('📋 Auth Storage:', authStorage ? JSON.parse(authStorage) : 'Not found')
  console.log('🔑 Token:', token ? token.substring(0, 30) + '...' : 'Not found')
  
  if (!token) {
    console.error('❌ No auth token found')
    return
  }
  
  const auth = authStorage ? JSON.parse(authStorage) : null
  const userId = auth?.state?.user?.id
  
  if (!userId) {
    console.error('❌ No user ID in auth storage')
    return
  }
  
  console.log('👤 User ID from auth:', userId)
  
  try {
    // Test User API
    console.log('\n🧪 Testing User API...')
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
      console.log('✅ User API Success:', userData)
      
      if (userData.user?.doctor?.id) {
        const doctorId = userData.user.doctor.id
        console.log('👨‍⚕️ Doctor ID found:', doctorId)
        
        // Test Doctor Dashboard API
        console.log('\n🧪 Testing Doctor Dashboard API...')
        const dashboardResponse = await fetch(`/api/doctor/${doctorId}/dashboard`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        })
        
        console.log('Status:', dashboardResponse.status)
        
        if (dashboardResponse.ok) {
          const dashboardData = await dashboardResponse.json()
          console.log('✅ Dashboard API Success:', dashboardData)
          
          if (dashboardData.doctor) {
            console.log('✅ Doctor data found in response!')
            console.log('🎉 All APIs working correctly!')
          } else {
            console.error('❌ No doctor property in dashboard response')
            console.log('Available properties:', Object.keys(dashboardData))
          }
        } else {
          const errorText = await dashboardResponse.text()
          console.error('❌ Dashboard API Error:', errorText)
        }
        
      } else {
        console.error('❌ No doctor relationship found')
        console.log('User structure:', userData.user)
        console.log('Available properties:', Object.keys(userData.user || {}))
      }
    } else {
      const errorText = await userResponse.text()
      console.error('❌ User API Error:', errorText)
    }
    
  } catch (error) {
    console.error('💥 Diagnostic failed:', error)
  }
}

// Run diagnostic
diagnoseDoctorProfile()
