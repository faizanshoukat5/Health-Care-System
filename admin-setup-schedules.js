// Admin utility to setup schedules for all doctors via API
// Run this in browser console when logged in as admin

async function adminSetupAllSchedules() {
  console.log('🔧 ADMIN: SETUP ALL DOCTOR SCHEDULES')
  console.log('====================================')
  
  try {
    // Get auth data
    const authData = JSON.parse(localStorage.getItem('auth-storage') || '{}')
    const token = authData?.state?.token
    const user = authData?.state?.user
    
    if (!token || !user) {
      console.error('❌ No auth token found. Please login first.')
      return
    }
    
    if (user.role !== 'ADMIN') {
      console.error('❌ Admin access required. Current role:', user.role)
      return
    }
    
    console.log('✅ Admin authenticated:', user.email)
    
    // First, check current status
    console.log('\n🔍 Step 1: Checking current doctor status...')
    const statusResponse = await fetch('/api/admin/setup-schedules', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    })
    
    if (!statusResponse.ok) {
      console.error('❌ Failed to check status:', statusResponse.status)
      return
    }
    
    const status = await statusResponse.json()
    console.log('📊 Current Status:')
    console.log(`   Total doctors: ${status.total}`)
    console.log(`   With schedules: ${status.withSchedule}`)
    console.log(`   Need setup: ${status.needsSetup}`)
    console.log(`   Inactive: ${status.inactive}`)
    
    if (status.needsSetup === 0) {
      console.log('\n✅ All active doctors already have schedules!')
      console.log('🎉 No setup needed.')
      return
    }
    
    console.log('\n📋 Doctors needing setup:')
    status.doctors
      .filter(d => !d.hasSchedule && d.isActive)
      .forEach(d => console.log(`   - ${d.name}`))
    
    // Proceed with setup
    console.log('\n⚙️ Step 2: Setting up schedules...')
    const setupResponse = await fetch('/api/admin/setup-schedules', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    })
    
    if (!setupResponse.ok) {
      const errorText = await setupResponse.text()
      console.error('❌ Setup failed:', errorText)
      return
    }
    
    const result = await setupResponse.json()
    console.log('\n✅ Setup completed!')
    console.log('📊 Results:')
    console.log(`   Newly configured: ${result.setupCount}`)
    console.log(`   Already had schedules: ${result.alreadyConfigured}`)
    console.log(`   Errors: ${result.errors}`)
    
    if (result.setupCount > 0) {
      console.log('\n🎉 SUCCESS!')
      console.log(`${result.setupCount} doctors now have default schedules.`)
      console.log('Patients can now book appointments with these doctors.')
    }
    
    // Verify the setup
    console.log('\n🔍 Step 3: Verifying setup...')
    const verifyResponse = await fetch('/api/admin/setup-schedules', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    })
    
    if (verifyResponse.ok) {
      const verifyStatus = await verifyResponse.json()
      console.log('📊 Updated Status:')
      console.log(`   Total doctors: ${verifyStatus.total}`)
      console.log(`   With schedules: ${verifyStatus.withSchedule}`)
      console.log(`   Still need setup: ${verifyStatus.needsSetup}`)
      
      if (verifyStatus.needsSetup === 0) {
        console.log('\n🎉 PERFECT! All active doctors now have schedules.')
      }
    }
    
    console.log('\n💡 What happens next:')
    console.log('1. All doctors now have Mon-Fri 9AM-5PM availability')
    console.log('2. Doctors can customize their schedules in Doctor → Schedule')
    console.log('3. Patients will see time slots when booking appointments')
    console.log('4. Weekend availability is disabled by default')
    
  } catch (error) {
    console.error('💥 Admin setup failed:', error)
  }
}

// Quick check function
async function checkDoctorScheduleStatus() {
  console.log('🔍 CHECKING DOCTOR SCHEDULE STATUS')
  console.log('==================================')
  
  try {
    const authData = JSON.parse(localStorage.getItem('auth-storage') || '{}')
    const token = authData?.state?.token
    
    if (!token) {
      console.error('❌ No auth token found.')
      return
    }
    
    const response = await fetch('/api/admin/setup-schedules', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    })
    
    if (!response.ok) {
      console.error('❌ Failed to check status')
      return
    }
    
    const status = await response.json()
    
    console.log('📊 Schedule Status Summary:')
    console.log(`   📈 Total doctors: ${status.total}`)
    console.log(`   ✅ With schedules: ${status.withSchedule}`)
    console.log(`   ⚠️ Need setup: ${status.needsSetup}`)
    console.log(`   💤 Inactive: ${status.inactive}`)
    
    const availability = Math.round((status.withSchedule / status.total) * 100)
    console.log(`   📊 Availability rate: ${availability}%`)
    
    if (status.needsSetup > 0) {
      console.log('\n⚠️ Doctors without schedules:')
      status.doctors
        .filter(d => !d.hasSchedule && d.isActive)
        .forEach(d => console.log(`   - ${d.name}`))
      console.log('\n💡 Run adminSetupAllSchedules() to fix this.')
    } else {
      console.log('\n🎉 All active doctors have schedules!')
    }
    
  } catch (error) {
    console.error('💥 Check failed:', error)
  }
}

// Auto-run check first
checkDoctorScheduleStatus()

// Make functions available globally
window.adminSetupAllSchedules = adminSetupAllSchedules
window.checkDoctorScheduleStatus = checkDoctorScheduleStatus

console.log('\n💡 Available admin functions:')
console.log('- checkDoctorScheduleStatus() - Check which doctors need schedules')
console.log('- adminSetupAllSchedules() - Setup schedules for all doctors')
console.log('\nNote: Admin access required for setup function.')
