// Auto-setup schedule for ALL doctors without schedules
// This ensures all doctors show available time slots for patient booking

async function setupAllDoctorsSchedule() {
  console.log('🏥 AUTO-SETUP SCHEDULES FOR ALL DOCTORS')
  console.log('======================================')
  
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
    console.log('\n🔍 Step 1: Fetching all doctors...')
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
    console.log(`✅ Found ${doctors.length} doctors`)
    
    // Default schedule template
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
    
    console.log('\n📅 Step 2: Checking and setting up schedules...')
    
    let setupCount = 0
    let alreadyConfigured = 0
    let errors = 0
    
    for (const doctor of doctors) {
      console.log(`\n👨‍⚕️ Processing: ${doctor.firstName} ${doctor.lastName} (ID: ${doctor.id})`)
      
      try {
        // Check current schedule
        const scheduleResponse = await fetch(`/api/doctor/${doctor.id}/schedule`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        })
        
        let needsSetup = true
        
        if (scheduleResponse.ok) {
          const currentSchedule = await scheduleResponse.json()
          const activeDays = Object.values(currentSchedule.availability || {})
            .filter((day) => day.isActive)
          
          if (activeDays.length > 0) {
            console.log(`   ✅ Already configured (${activeDays.length} active days)`)
            alreadyConfigured++
            needsSetup = false
          }
        }
        
        if (needsSetup) {
          console.log('   ⚠️ No active schedule found. Setting up default schedule...')
          
          const saveResponse = await fetch(`/api/doctor/${doctor.id}/schedule`, {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ availability: defaultSchedule })
          })
          
          if (saveResponse.ok) {
            console.log('   ✅ Schedule setup successful!')
            setupCount++
          } else {
            const errorText = await saveResponse.text()
            console.error(`   ❌ Failed to setup schedule: ${errorText}`)
            errors++
          }
        }
        
        // Small delay to avoid overwhelming the server
        await new Promise(resolve => setTimeout(resolve, 100))
        
      } catch (error) {
        console.error(`   💥 Error processing doctor: ${error.message}`)
        errors++
      }
    }
    
    console.log('\n📊 SETUP SUMMARY')
    console.log('================')
    console.log(`📈 Total doctors: ${doctors.length}`)
    console.log(`✅ Already configured: ${alreadyConfigured}`)
    console.log(`🆕 Newly setup: ${setupCount}`)
    console.log(`❌ Errors: ${errors}`)
    
    if (setupCount > 0) {
      console.log('\n🎉 SUCCESS!')
      console.log(`${setupCount} doctors now have default schedules configured.`)
      console.log('Patients should now see available time slots for these doctors.')
    }
    
    if (errors > 0) {
      console.log('\n⚠️ Some errors occurred. You may need to manually configure those doctors.')
    }
    
    console.log('\n💡 Next Steps:')
    console.log('1. Test patient booking to verify time slots appear')
    console.log('2. Doctors can customize their schedules in Doctor → Schedule')
    console.log('3. Run testAllDoctorsAvailability() to verify setup')
    
  } catch (error) {
    console.error('💥 Setup failed:', error)
  }
}

// Test availability for ALL doctors
async function testAllDoctorsAvailability() {
  console.log('🧪 TESTING ALL DOCTORS AVAILABILITY')
  console.log('===================================')
  
  try {
    const authData = JSON.parse(localStorage.getItem('auth-storage') || '{}')
    const token = authData?.state?.token
    
    if (!token) {
      console.error('❌ No auth token found. Please login first.')
      return
    }
    
    const doctorsResponse = await fetch('/api/doctors/available', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    })
    
    if (!doctorsResponse.ok) {
      console.error('❌ Failed to fetch doctors')
      return
    }
    
    const doctors = await doctorsResponse.json()
    console.log(`\n🔍 Testing availability for ${doctors.length} doctors...`)
    
    // Test for tomorrow (more likely to have slots)
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const testDate = tomorrow.toISOString().split('T')[0]
    
    console.log(`📅 Test date: ${testDate}`)
    
    let availableDoctors = 0
    let unavailableDoctors = 0
    
    for (const doctor of doctors) {
      try {
        const availabilityResponse = await fetch(`/api/doctors/${doctor.id}/availability?date=${testDate}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        })
        
        if (availabilityResponse.ok) {
          const slots = await availabilityResponse.json()
          const availableSlots = slots.filter(slot => slot.available)
          
          if (availableSlots.length > 0) {
            console.log(`✅ ${doctor.firstName} ${doctor.lastName}: ${availableSlots.length} slots`)
            availableDoctors++
          } else {
            console.log(`⚠️ ${doctor.firstName} ${doctor.lastName}: No available slots`)
            unavailableDoctors++
          }
        } else {
          console.log(`❌ ${doctor.firstName} ${doctor.lastName}: API error`)
          unavailableDoctors++
        }
        
        // Small delay
        await new Promise(resolve => setTimeout(resolve, 50))
        
      } catch (error) {
        console.error(`💥 Error testing ${doctor.firstName} ${doctor.lastName}:`, error.message)
        unavailableDoctors++
      }
    }
    
    console.log('\n📊 AVAILABILITY SUMMARY')
    console.log('======================')
    console.log(`✅ Doctors with available slots: ${availableDoctors}`)
    console.log(`⚠️ Doctors without slots: ${unavailableDoctors}`)
    console.log(`📈 Availability rate: ${Math.round((availableDoctors / doctors.length) * 100)}%`)
    
    if (availableDoctors === doctors.length) {
      console.log('\n🎉 PERFECT! All doctors have available time slots.')
    } else if (availableDoctors > 0) {
      console.log('\n✅ GOOD! Most doctors have available time slots.')
      if (unavailableDoctors > 0) {
        console.log('💡 Some doctors may need schedule configuration.')
      }
    } else {
      console.log('\n❌ ISSUE! No doctors have available slots.')
      console.log('💡 Run setupAllDoctorsSchedule() to fix this.')
    }
    
  } catch (error) {
    console.error('💥 Test failed:', error)
  }
}

// Auto-run setup
console.log('🚀 Starting automatic setup for all doctors...')
setupAllDoctorsSchedule()

// Make functions available globally
window.setupAllDoctorsSchedule = setupAllDoctorsSchedule
window.testAllDoctorsAvailability = testAllDoctorsAvailability

console.log('\n💡 Available functions:')
console.log('- setupAllDoctorsSchedule() - Setup schedules for all doctors')
console.log('- testAllDoctorsAvailability() - Test availability for all doctors')
