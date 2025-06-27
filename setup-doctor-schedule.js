// Setup schedule for new doctor - Run this in browser console
// This will help configure the schedule for Dr. Choudhary, Faizan

async function setupDoctorSchedule() {
  console.log('🏥 SETTING UP DOCTOR SCHEDULE')
  console.log('=============================')
  
  try {
    // Get auth data
    const authData = JSON.parse(localStorage.getItem('auth-storage') || '{}')
    const token = authData?.state?.token
    
    if (!token) {
      console.error('❌ No auth token found. Please login first.')
      return
    }
    
    console.log('✅ Auth token found')
    
    // First, let's find the doctor named Choudhary, Faizan
    console.log('\n🔍 Step 1: Finding doctor "Choudhary, Faizan"...')
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
    
    const targetDoctor = doctors.find(doc => 
      doc.firstName === 'Faizan' && doc.lastName === 'Choudhary' ||
      doc.firstName === 'Choudhary' && doc.lastName === 'Faizan' ||
      (doc.firstName + ' ' + doc.lastName).includes('Faizan') ||
      (doc.firstName + ' ' + doc.lastName).includes('Choudhary')
    )
    
    if (!targetDoctor) {
      console.error('❌ Could not find doctor with name containing "Choudhary" or "Faizan"')
      console.log('Available doctors:')
      doctors.forEach(doc => {
        console.log(`- ${doc.firstName} ${doc.lastName} (ID: ${doc.id})`)
      })
      return
    }
    
    console.log('✅ Found target doctor:', `${targetDoctor.firstName} ${targetDoctor.lastName} (ID: ${targetDoctor.id})`)
    
    // Check current schedule
    console.log('\n📅 Step 2: Checking current schedule...')
    const scheduleResponse = await fetch(`/api/doctor/${targetDoctor.id}/schedule`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    })
    
    if (scheduleResponse.ok) {
      const currentSchedule = await scheduleResponse.json()
      console.log('✅ Current schedule:', currentSchedule.availability)
      
      // Check if any days are active
      const activeDays = Object.values(currentSchedule.availability || {}).filter((day) => day.isActive)
      if (activeDays.length > 0) {
        console.log('✅ Doctor already has an active schedule!')
        console.log('Active days:', activeDays.length)
        return
      }
    }
    
    console.log('⚠️ Doctor has no active schedule. Setting up default schedule...')
    
    // Set up a default schedule
    console.log('\n💾 Step 3: Creating default schedule...')
    const defaultSchedule = {
      MONDAY: {
        dayOfWeek: 'MONDAY',
        startTime: '09:00',
        endTime: '17:00',
        isActive: true,
        breakStart: '12:00',
        breakEnd: '13:00'
      },
      TUESDAY: {
        dayOfWeek: 'TUESDAY',
        startTime: '09:00',
        endTime: '17:00',
        isActive: true,
        breakStart: '12:00',
        breakEnd: '13:00'
      },
      WEDNESDAY: {
        dayOfWeek: 'WEDNESDAY',
        startTime: '09:00',
        endTime: '17:00',
        isActive: true,
        breakStart: '12:00',
        breakEnd: '13:00'
      },
      THURSDAY: {
        dayOfWeek: 'THURSDAY',
        startTime: '09:00',
        endTime: '17:00',
        isActive: true,
        breakStart: '12:00',
        breakEnd: '13:00'
      },
      FRIDAY: {
        dayOfWeek: 'FRIDAY',
        startTime: '09:00',
        endTime: '15:00',
        isActive: true,
        breakStart: '12:00',
        breakEnd: '13:00'
      },
      SATURDAY: {
        dayOfWeek: 'SATURDAY',
        startTime: '10:00',
        endTime: '14:00',
        isActive: false
      },
      SUNDAY: {
        dayOfWeek: 'SUNDAY',
        startTime: '10:00',
        endTime: '14:00',
        isActive: false
      }
    }
    
    const saveResponse = await fetch(`/api/doctor/${targetDoctor.id}/schedule`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ availability: defaultSchedule })
    })
    
    if (!saveResponse.ok) {
      console.error('❌ Failed to save schedule:', saveResponse.status)
      const errorText = await saveResponse.text()
      console.error('Error details:', errorText)
      return
    }
    
    const saveResult = await saveResponse.json()
    console.log('✅ Schedule saved successfully!')
    console.log('Schedule details:', saveResult)
    
    // Verify the save
    console.log('\n🔍 Step 4: Verifying schedule...')
    const verifyResponse = await fetch(`/api/doctor/${targetDoctor.id}/schedule`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    })
    
    if (verifyResponse.ok) {
      const verifyData = await verifyResponse.json()
      console.log('✅ Schedule verification successful!')
      
      const activeDays = Object.entries(verifyData.availability || {})
        .filter(([_, day]) => day.isActive)
        .map(([dayName, _]) => dayName)
      
      console.log('Active days:', activeDays)
      console.log(`✅ Doctor ${targetDoctor.firstName} ${targetDoctor.lastName} now has ${activeDays.length} active days`)
    }
    
    console.log('\n🎉 SETUP COMPLETE!')
    console.log('==================')
    console.log('The doctor should now be available for patient bookings.')
    console.log('Patients can now see available time slots when booking appointments.')
    
  } catch (error) {
    console.error('💥 Setup failed:', error)
  }
}

// Auto-run the setup
setupDoctorSchedule()

// Make it available globally for manual execution
window.setupDoctorSchedule = setupDoctorSchedule
