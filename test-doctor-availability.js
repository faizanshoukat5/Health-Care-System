// Test doctor availability API - Run this in browser console after setting up the schedule

async function testDoctorAvailability() {
  console.log('🧪 TESTING DOCTOR AVAILABILITY API')
  console.log('==================================')
  
  try {
    // Get auth data
    const authData = JSON.parse(localStorage.getItem('auth-storage') || '{}')
    const token = authData?.state?.token
    
    if (!token) {
      console.error('❌ No auth token found. Please login first.')
      return
    }
    
    console.log('✅ Auth token found')
    
    // Get all doctors
    console.log('\n🔍 Step 1: Getting all doctors...')
    const doctorsResponse = await fetch('/api/doctors/available', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    })
    
    if (!doctorsResponse.ok) {
      console.error('❌ Failed to fetch doctors:', doctorsResponse.status)
      return
    }
    
    const doctors = await doctorsResponse.json()
    console.log('✅ Found doctors:', doctors.length)
    
    // Find our target doctor
    const targetDoctor = doctors.find(doc => 
      doc.firstName === 'Faizan' && doc.lastName === 'Choudhary' ||
      doc.firstName === 'Choudhary' && doc.lastName === 'Faizan' ||
      (doc.firstName + ' ' + doc.lastName).includes('Faizan') ||
      (doc.firstName + ' ' + doc.lastName).includes('Choudhary')
    )
    
    if (!targetDoctor) {
      console.error('❌ Could not find target doctor')
      console.log('Available doctors:')
      doctors.forEach(doc => {
        console.log(`- ${doc.firstName} ${doc.lastName} (ID: ${doc.id})`)
      })
      return
    }
    
    console.log('✅ Target doctor found:', `${targetDoctor.firstName} ${targetDoctor.lastName}`)
    console.log('Doctor ID:', targetDoctor.id)
    
    // Test availability for today and next few days
    const testDates = []
    for (let i = 0; i < 7; i++) {
      const date = new Date()
      date.setDate(date.getDate() + i)
      testDates.push(date.toISOString().split('T')[0])
    }
    
    console.log('\n📅 Step 2: Testing availability for next 7 days...')
    
    for (const dateStr of testDates) {
      console.log(`\n🗓️ Testing date: ${dateStr}`)
      
      const availabilityResponse = await fetch(`/api/doctors/${targetDoctor.id}/availability?date=${dateStr}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      })
      
      console.log(`Response status: ${availabilityResponse.status}`)
      
      if (availabilityResponse.ok) {
        const slots = await availabilityResponse.json()
        console.log(`✅ Available slots: ${slots.length}`)
        
        if (slots.length > 0) {
          const availableSlots = slots.filter(slot => slot.available)
          console.log(`🟢 Available: ${availableSlots.length}`)
          console.log(`🔴 Unavailable: ${slots.length - availableSlots.length}`)
          
          // Show first few available slots
          if (availableSlots.length > 0) {
            console.log('First 3 available slots:', availableSlots.slice(0, 3).map(slot => slot.time))
          }
        } else {
          console.log('⚠️ No slots available for this date')
        }
      } else {
        const errorText = await availabilityResponse.text()
        console.error(`❌ Failed to get availability: ${errorText}`)
      }
    }
    
    console.log('\n🎯 SUMMARY')
    console.log('==========')
    console.log('If you see available slots above, the doctor is properly configured!')
    console.log('If no slots are available, check:')
    console.log('1. Doctor schedule is set up (run setupDoctorSchedule())')
    console.log('2. Days are marked as active (isActive: true)')
    console.log('3. API is using correct day name format (UPPERCASE)')
    
  } catch (error) {
    console.error('💥 Test failed:', error)
  }
}

// Auto-run the test
testDoctorAvailability()

// Make it available globally
window.testDoctorAvailability = testDoctorAvailability
