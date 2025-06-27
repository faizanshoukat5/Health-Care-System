// Test schedule save functionality
// Run this in the browser console after logging in as a doctor

async function testScheduleSave() {
  console.log('🧪 TESTING SCHEDULE SAVE')
  console.log('========================')
  
  try {
    // Get auth data
    const authData = JSON.parse(localStorage.getItem('auth-storage') || '{}')
    const token = authData?.state?.token
    const user = authData?.state?.user
    
    if (!token || !user) {
      console.error('❌ No auth data found. Please login first.')
      console.log('Available localStorage keys:', Object.keys(localStorage))
      return
    }
    
    console.log('✅ Auth data found')
    console.log('👤 User:', user.email, 'Role:', user.role)
    
    // Step 1: Get user profile with doctor relationship
    console.log('\n📋 Step 1: Getting user profile...')
    const userResponse = await fetch(`/api/user/${user.id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    })
    
    if (!userResponse.ok) {
      console.error('❌ User profile fetch failed:', userResponse.status)
      const errorText = await userResponse.text()
      console.error('Error:', errorText)
      return
    }
    
    const userData = await userResponse.json()
    console.log('✅ User profile:', userData)
    
    const doctorId = userData.user?.doctor?.id
    if (!doctorId) {
      console.error('❌ No doctor ID found in user profile')
      return
    }
    
    console.log('👨‍⚕️ Doctor ID:', doctorId)
    
    // Step 2: Get current schedule
    console.log('\n📅 Step 2: Getting current schedule...')
    const scheduleResponse = await fetch(`/api/doctor/${doctorId}/schedule`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    })
    
    let currentSchedule = {}
    if (scheduleResponse.ok) {
      const scheduleData = await scheduleResponse.json()
      currentSchedule = scheduleData.availability || {}
      console.log('✅ Current schedule:', currentSchedule)
    } else {
      console.log('⚠️ No existing schedule found, will use test data')
    }
    
    // Step 3: Test schedule save with sample data
    console.log('\n💾 Step 3: Testing schedule save...')
    
    const testSchedule = {
      MONDAY: {
        id: '1',
        dayOfWeek: 'MONDAY',
        startTime: '09:00',
        endTime: '17:00',
        isActive: true,
        breakStart: '12:00',
        breakEnd: '13:00'
      },
      TUESDAY: {
        id: '2',
        dayOfWeek: 'TUESDAY',
        startTime: '09:00',
        endTime: '17:00',
        isActive: true,
        breakStart: '12:00',
        breakEnd: '13:00'
      },
      WEDNESDAY: {
        id: '3',
        dayOfWeek: 'WEDNESDAY',
        startTime: '09:00',
        endTime: '17:00',
        isActive: false
      },
      THURSDAY: {
        id: '4',
        dayOfWeek: 'THURSDAY',
        startTime: '09:00',
        endTime: '17:00',
        isActive: true,
        breakStart: null,
        breakEnd: null
      },
      FRIDAY: {
        id: '5',
        dayOfWeek: 'FRIDAY',
        startTime: '09:00',
        endTime: '15:00',
        isActive: true,
        breakStart: '12:00',
        breakEnd: '13:00'
      },
      SATURDAY: {
        id: '6',
        dayOfWeek: 'SATURDAY',
        startTime: '10:00',
        endTime: '14:00',
        isActive: false
      },
      SUNDAY: {
        id: '7',
        dayOfWeek: 'SUNDAY',
        startTime: '10:00',
        endTime: '14:00',
        isActive: false
      }
    }
    
    console.log('Test schedule to save:', testSchedule)
    
    const saveResponse = await fetch(`/api/doctor/${doctorId}/schedule`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ availability: testSchedule })
    })
    
    console.log('Save response status:', saveResponse.status)
    
    if (!saveResponse.ok) {
      const errorText = await saveResponse.text()
      console.error('❌ Schedule save failed:', errorText)
      
      // Try to parse as JSON for more details
      try {
        const errorJson = JSON.parse(errorText)
        console.error('Error details:', errorJson)
      } catch (e) {
        console.error('Raw error text:', errorText)
      }
      return
    }
    
    const saveResult = await saveResponse.json()
    console.log('✅ Schedule saved successfully:', saveResult)
    
    // Step 4: Verify the save by fetching again
    console.log('\n🔍 Step 4: Verifying save...')
    const verifyResponse = await fetch(`/api/doctor/${doctorId}/schedule`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    })
    
    if (verifyResponse.ok) {
      const verifyData = await verifyResponse.json()
      console.log('✅ Verified schedule after save:', verifyData.availability)
    } else {
      console.error('❌ Failed to verify schedule save')
    }
    
    console.log('\n✅ Schedule save test completed successfully!')
    
  } catch (error) {
    console.error('💥 Test failed with error:', error)
  }
}

// Auto-run the test
testScheduleSave()

// Also make it available as a global function
window.testScheduleSave = testScheduleSave
