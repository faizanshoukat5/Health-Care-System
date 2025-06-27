// Comprehensive test for doctor availability system
// This tests that ALL doctors show available time slots

async function comprehensiveDoctorAvailabilityTest() {
  console.log('🏥 COMPREHENSIVE DOCTOR AVAILABILITY TEST')
  console.log('=========================================')
  
  try {
    // Get auth data
    const authData = JSON.parse(localStorage.getItem('auth-storage') || '{}')
    const token = authData?.state?.token
    
    if (!token) {
      console.error('❌ No auth token found. Please login first.')
      return
    }
    
    console.log('✅ Auth token found')
    
    // Test 1: Get all doctors
    console.log('\n📋 Test 1: Fetching all doctors...')
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
    
    if (doctors.length === 0) {
      console.error('❌ No doctors found in system!')
      return
    }
    
    // Show all doctors
    console.log('\n👨‍⚕️ Available Doctors:')
    doctors.forEach((doctor, index) => {
      console.log(`   ${index + 1}. ${doctor.firstName} ${doctor.lastName}`)
      console.log(`      - ID: ${doctor.id}`)
      console.log(`      - Specialization: ${doctor.specialization}`)
      console.log(`      - Fee: $${doctor.consultationFee}`)
    })
    
    // Test 2: Check schedules for all doctors
    console.log('\n📅 Test 2: Checking schedules for all doctors...')
    
    let doctorsWithSchedule = 0
    let doctorsWithoutSchedule = 0
    const scheduleProblems = []
    
    for (const doctor of doctors) {
      try {
        const scheduleResponse = await fetch(`/api/doctor/${doctor.id}/schedule`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        })
        
        if (scheduleResponse.ok) {
          const scheduleData = await scheduleResponse.json()
          const availability = scheduleData.availability || {}
          const activeDays = Object.values(availability).filter((day) => day.isActive)
          
          if (activeDays.length > 0) {
            console.log(`   ✅ ${doctor.firstName} ${doctor.lastName}: ${activeDays.length} active days`)
            doctorsWithSchedule++
          } else {
            console.log(`   ⚠️ ${doctor.firstName} ${doctor.lastName}: No active days`)
            doctorsWithoutSchedule++
            scheduleProblems.push({
              doctor: `${doctor.firstName} ${doctor.lastName}`,
              issue: 'No active days in schedule'
            })
          }
        } else {
          console.log(`   ❌ ${doctor.firstName} ${doctor.lastName}: No schedule found`)
          doctorsWithoutSchedule++
          scheduleProblems.push({
            doctor: `${doctor.firstName} ${doctor.lastName}`,
            issue: 'No schedule configuration'
          })
        }
        
        // Small delay to avoid overwhelming the server
        await new Promise(resolve => setTimeout(resolve, 100))
        
      } catch (error) {
        console.error(`   💥 ${doctor.firstName} ${doctor.lastName}: Error checking schedule`, error.message)
        scheduleProblems.push({
          doctor: `${doctor.firstName} ${doctor.lastName}`,
          issue: `Error: ${error.message}`
        })
      }
    }
    
    // Test 3: Check availability for next 3 days
    console.log('\n🗓️ Test 3: Checking availability for next 3 days...')
    
    const testDates = []
    for (let i = 1; i <= 3; i++) {
      const date = new Date()
      date.setDate(date.getDate() + i)
      testDates.push({
        date: date.toISOString().split('T')[0],
        dayName: date.toLocaleDateString('en-US', { weekday: 'long' })
      })
    }
    
    const availabilityResults = {}
    
    for (const testDate of testDates) {
      console.log(`\n📅 Testing ${testDate.dayName} (${testDate.date}):`)
      availabilityResults[testDate.date] = {
        available: 0,
        unavailable: 0,
        errors: 0
      }
      
      for (const doctor of doctors) {
        try {
          const availabilityResponse = await fetch(`/api/doctors/${doctor.id}/availability?date=${testDate.date}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            }
          })
          
          if (availabilityResponse.ok) {
            const slots = await availabilityResponse.json()
            const availableSlots = slots.filter(slot => slot.available)
            
            if (availableSlots.length > 0) {
              console.log(`   ✅ ${doctor.firstName} ${doctor.lastName}: ${availableSlots.length} slots`)
              availabilityResults[testDate.date].available++
            } else {
              console.log(`   ⚠️ ${doctor.firstName} ${doctor.lastName}: No slots`)
              availabilityResults[testDate.date].unavailable++
            }
          } else {
            console.log(`   ❌ ${doctor.firstName} ${doctor.lastName}: API error`)
            availabilityResults[testDate.date].errors++
          }
          
          // Small delay
          await new Promise(resolve => setTimeout(resolve, 50))
          
        } catch (error) {
          console.error(`   💥 ${doctor.firstName} ${doctor.lastName}: ${error.message}`)
          availabilityResults[testDate.date].errors++
        }
      }
    }
    
    // Test Summary
    console.log('\n📊 TEST SUMMARY')
    console.log('===============')
    console.log(`👨‍⚕️ Total doctors: ${doctors.length}`)
    console.log(`✅ With schedules: ${doctorsWithSchedule}`)
    console.log(`❌ Without schedules: ${doctorsWithoutSchedule}`)
    
    if (scheduleProblems.length > 0) {
      console.log('\n⚠️ Schedule Problems:')
      scheduleProblems.forEach(problem => {
        console.log(`   - ${problem.doctor}: ${problem.issue}`)
      })
    }
    
    console.log('\n📅 Availability Summary:')
    testDates.forEach(testDate => {
      const result = availabilityResults[testDate.date]
      console.log(`   ${testDate.dayName}: ${result.available} available, ${result.unavailable} unavailable, ${result.errors} errors`)
    })
    
    // Overall Status
    const overallAvailability = Math.round((doctorsWithSchedule / doctors.length) * 100)
    console.log(`\n📈 Overall Availability: ${overallAvailability}%`)
    
    if (overallAvailability === 100) {
      console.log('\n🎉 EXCELLENT! All doctors have working schedules.')
      console.log('Patients should be able to book appointments with any doctor.')
    } else if (overallAvailability >= 75) {
      console.log('\n✅ GOOD! Most doctors have working schedules.')
      if (doctorsWithoutSchedule > 0) {
        console.log('💡 Consider running setupAllDoctorsSchedule() to fix remaining doctors.')
      }
    } else {
      console.log('\n❌ ISSUE! Many doctors lack proper schedules.')
      console.log('💡 Run setupAllDoctorsSchedule() to fix this.')
    }
    
    // Recommendations
    console.log('\n💡 RECOMMENDATIONS:')
    if (doctorsWithoutSchedule > 0) {
      console.log('1. Run setupAllDoctorsSchedule() to create default schedules')
    }
    console.log('2. Doctors can customize schedules in Doctor → Schedule page')
    console.log('3. Test patient booking to ensure slots appear correctly')
    console.log('4. Monitor appointment booking success rates')
    
  } catch (error) {
    console.error('💥 Comprehensive test failed:', error)
  }
}

// Quick fix function
async function quickFixAllDoctors() {
  console.log('🚀 QUICK FIX: Setup schedules for all doctors')
  console.log('==============================================')
  
  try {
    const authData = JSON.parse(localStorage.getItem('auth-storage') || '{}')
    const token = authData?.state?.token
    
    if (!token) {
      console.error('❌ Please login first.')
      return
    }
    
    // Use the setup script
    const scriptContent = await fetch('/setup-all-doctors-schedule.js').then(r => r.text()).catch(() => null)
    
    if (scriptContent) {
      eval(scriptContent)
    } else {
      console.log('⚠️ Setup script not found. Using manual setup...')
      
      // Manual setup for all doctors
      const doctorsResponse = await fetch('/api/doctors/available', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      if (!doctorsResponse.ok) {
        console.error('❌ Failed to fetch doctors')
        return
      }
      
      const doctors = await doctorsResponse.json()
      console.log(`Found ${doctors.length} doctors to check`)
      
      // This would run the setup logic here...
      console.log('💡 Run setupAllDoctorsSchedule() for complete setup')
    }
    
  } catch (error) {
    console.error('💥 Quick fix failed:', error)
  }
}

// Auto-run the comprehensive test
comprehensiveDoctorAvailabilityTest()

// Make functions available globally
window.comprehensiveDoctorAvailabilityTest = comprehensiveDoctorAvailabilityTest
window.quickFixAllDoctors = quickFixAllDoctors

console.log('\n💡 Available test functions:')
console.log('- comprehensiveDoctorAvailabilityTest() - Full system test')
console.log('- quickFixAllDoctors() - Quick setup for all doctors')
