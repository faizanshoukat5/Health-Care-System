// Comprehensive schedule save test with detailed diagnostics
// Run this in the browser console after logging in as a doctor

async function comprehensiveScheduleTest() {
  console.log('🧪 COMPREHENSIVE SCHEDULE SAVE TEST')
  console.log('===================================')
  
  try {
    // Step 1: Get authentication data
    console.log('\n🔐 Step 1: Checking authentication...')
    const authData = JSON.parse(localStorage.getItem('auth-storage') || '{}')
    const token = authData?.state?.token
    const user = authData?.state?.user
    
    if (!token || !user) {
      console.error('❌ No auth data found')
      console.log('Available localStorage items:', Object.keys(localStorage))
      return
    }
    
    console.log('✅ User:', user.email, 'Role:', user.role, 'ID:', user.id)
    console.log('✅ Token length:', token.length)
    
    // Step 2: Get doctor profile
    console.log('\n👨‍⚕️ Step 2: Getting doctor profile...')
    const userResponse = await fetch(`/api/user/${user.id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    })
    
    if (!userResponse.ok) {
      console.error('❌ User profile request failed:', userResponse.status)
      const errorText = await userResponse.text()
      console.error('Error:', errorText)
      return
    }
    
    const userData = await userResponse.json()
    const doctorId = userData.user?.doctor?.id
    
    if (!doctorId) {
      console.error('❌ No doctor ID found')
      console.log('User data structure:', userData)
      return
    }
    
    console.log('✅ Doctor ID:', doctorId)
    
    // Step 3: Test various schedule data formats
    console.log('\n📅 Step 3: Testing different schedule formats...')
    
    const testCases = [
      {
        name: 'Complete schedule with all breaks',
        schedule: {
          MONDAY: { id: '1', dayOfWeek: 'MONDAY', startTime: '09:00', endTime: '17:00', isActive: true, breakStart: '12:00', breakEnd: '13:00' },
          TUESDAY: { id: '2', dayOfWeek: 'TUESDAY', startTime: '09:00', endTime: '17:00', isActive: true, breakStart: '12:00', breakEnd: '13:00' },
          WEDNESDAY: { id: '3', dayOfWeek: 'WEDNESDAY', startTime: '09:00', endTime: '17:00', isActive: true, breakStart: '12:00', breakEnd: '13:00' },
          THURSDAY: { id: '4', dayOfWeek: 'THURSDAY', startTime: '09:00', endTime: '17:00', isActive: true, breakStart: '12:00', breakEnd: '13:00' },
          FRIDAY: { id: '5', dayOfWeek: 'FRIDAY', startTime: '09:00', endTime: '15:00', isActive: true, breakStart: '12:00', breakEnd: '13:00' },
          SATURDAY: { id: '6', dayOfWeek: 'SATURDAY', startTime: '10:00', endTime: '14:00', isActive: false, breakStart: null, breakEnd: null },
          SUNDAY: { id: '7', dayOfWeek: 'SUNDAY', startTime: '10:00', endTime: '14:00', isActive: false, breakStart: null, breakEnd: null }
        }
      },
      {
        name: 'Schedule with undefined breaks',
        schedule: {
          MONDAY: { id: '1', dayOfWeek: 'MONDAY', startTime: '09:00', endTime: '17:00', isActive: true, breakStart: undefined, breakEnd: undefined },
          TUESDAY: { id: '2', dayOfWeek: 'TUESDAY', startTime: '09:00', endTime: '17:00', isActive: true, breakStart: '12:00', breakEnd: '13:00' },
          WEDNESDAY: { id: '3', dayOfWeek: 'WEDNESDAY', startTime: '09:00', endTime: '17:00', isActive: false },
          THURSDAY: { id: '4', dayOfWeek: 'THURSDAY', startTime: '09:00', endTime: '17:00', isActive: true, breakStart: '', breakEnd: '' },
          FRIDAY: { id: '5', dayOfWeek: 'FRIDAY', startTime: '09:00', endTime: '15:00', isActive: true, breakStart: '12:00', breakEnd: '13:00' },
          SATURDAY: { id: '6', dayOfWeek: 'SATURDAY', startTime: '10:00', endTime: '14:00', isActive: false },
          SUNDAY: { id: '7', dayOfWeek: 'SUNDAY', startTime: '10:00', endTime: '14:00', isActive: false }
        }
      }
    ]
    
    for (const testCase of testCases) {
      console.log(`\n🧪 Testing: ${testCase.name}`)
      
      try {
        const response = await fetch(`/api/doctor/${doctorId}/schedule`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ availability: testCase.schedule })
        })
        
        if (response.ok) {
          const result = await response.json()
          console.log(`✅ ${testCase.name} - SUCCESS:`, result.message)
        } else {
          const errorText = await response.text()
          console.error(`❌ ${testCase.name} - FAILED:`, response.status, errorText)
          
          try {
            const errorJson = JSON.parse(errorText)
            if (errorJson.details) {
              console.error('Error details:', errorJson.details)
            }
          } catch (e) {
            // Error text is not JSON
          }
        }
      } catch (error) {
        console.error(`💥 ${testCase.name} - ERROR:`, error)
      }
      
      // Wait a bit between tests
      await new Promise(resolve => setTimeout(resolve, 500))
    }
    
    // Step 4: Check final schedule state
    console.log('\n🔍 Step 4: Checking final schedule state...')
    const finalResponse = await fetch(`/api/doctor/${doctorId}/schedule`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    })
    
    if (finalResponse.ok) {
      const finalData = await finalResponse.json()
      console.log('✅ Final schedule state:', finalData.availability)
    } else {
      console.error('❌ Could not fetch final schedule state')
    }
    
    console.log('\n✅ Comprehensive test completed!')
    
  } catch (error) {
    console.error('💥 Test failed with error:', error)
  }
}

// Auto-run the test
comprehensiveScheduleTest()

// Make it available globally
window.comprehensiveScheduleTest = comprehensiveScheduleTest
