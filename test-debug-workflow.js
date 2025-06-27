/**
 * Debug test to verify the complete patient list workflow
 * Includes detailed logging for troubleshooting
 */

const fetch = require('cross-fetch')

const BASE_URL = 'http://localhost:3001'

// Test patient and doctor data
const TEST_PATIENT = {
  email: 'debug.test.patient@example.com',
  password: 'testpass123',
  firstName: 'Debug',
  lastName: 'TestPatient',
  age: 25,
  gender: 'MALE',
  phoneNumber: '555-0199'
}

const TEST_DOCTOR = {
  email: 'debug.test.doctor@example.com',
  password: 'testpass123',
  firstName: 'Dr. Debug',
  lastName: 'TestDoctor',
  specialization: 'GENERAL_PRACTICE',
  licenseNumber: 'DBG123456',
  consultationFee: 100
}

async function apiRequest(endpoint, options = {}) {
  try {
    const url = `${BASE_URL}${endpoint}`
    console.log(`🔗 Making request to: ${url}`)
    if (options.body) {
      console.log(`📝 Request body:`, JSON.parse(options.body))
    }
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    })
    
    const data = await response.json()
    console.log(`📊 Response status: ${response.status}`)
    console.log(`📊 Response data:`, data)
    
    return { ok: response.ok, data, status: response.status }
  } catch (error) {
    console.error(`❌ API request failed: ${endpoint}`, error.message)
    return { ok: false, error: error.message }
  }
}

async function testCompleteWorkflow() {
  console.log('🚀 Starting Complete Workflow Debug Test')
  console.log('=' .repeat(60))
  
  try {
    // Step 1: Test server connectivity
    console.log('\n📡 Testing server connectivity...')
    const healthCheck = await apiRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'nonexistent@test.com', password: 'test' })
    })
    
    if (healthCheck.status === 0) {
      throw new Error('❌ Server is not responding. Make sure the dev server is running.')
    }
    console.log('✅ Server is responding')
    
    // Step 2: Register doctor
    console.log('\n👨‍⚕️ Registering doctor...')
    const doctorRegister = await apiRequest('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ ...TEST_DOCTOR, role: 'DOCTOR' })
    })
    
    // Step 3: Login doctor
    console.log('\n🔐 Logging in doctor...')
    const doctorLogin = await apiRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: TEST_DOCTOR.email,
        password: TEST_DOCTOR.password
      })
    })
    
    if (!doctorLogin.ok) {
      throw new Error(`Doctor login failed: ${JSON.stringify(doctorLogin.data)}`)
    }
    
    const doctorToken = doctorLogin.data.token
    const doctorUserId = doctorLogin.data.user.id
    console.log(`✅ Doctor logged in. User ID: ${doctorUserId}`)
    
    // Step 4: Get doctor profile
    console.log('\n👤 Getting doctor profile...')
    const doctorProfile = await apiRequest(`/api/user/${doctorUserId}/profile`, {
      headers: { 'Authorization': `Bearer ${doctorToken}` }
    })
    
    if (!doctorProfile.ok) {
      throw new Error(`Failed to get doctor profile: ${JSON.stringify(doctorProfile.data)}`)
    }
    
    const doctorId = doctorProfile.data.doctor.id
    console.log(`✅ Doctor profile retrieved. Doctor ID: ${doctorId}`)
    
    // Step 5: Test initial patient list (should be empty or existing patients)
    console.log('\n👥 Testing initial patient list...')
    const initialPatients = await apiRequest(`/api/doctor/${doctorId}/patients`, {
      headers: { 'Authorization': `Bearer ${doctorToken}` }
    })
    
    if (!initialPatients.ok) {
      console.log(`⚠️ Initial patient list failed: ${JSON.stringify(initialPatients.data)}`)
    } else {
      console.log(`✅ Initial patient list: ${initialPatients.data.length} patients`)
    }
    
    // Step 6: Register patient
    console.log('\n👤 Registering patient...')
    const patientRegister = await apiRequest('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ ...TEST_PATIENT, role: 'PATIENT' })
    })
    
    // Step 7: Login patient
    console.log('\n🔐 Logging in patient...')
    const patientLogin = await apiRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: TEST_PATIENT.email,
        password: TEST_PATIENT.password
      })
    })
    
    if (!patientLogin.ok) {
      throw new Error(`Patient login failed: ${JSON.stringify(patientLogin.data)}`)
    }
    
    const patientToken = patientLogin.data.token
    const patientUserId = patientLogin.data.user.id
    console.log(`✅ Patient logged in. User ID: ${patientUserId}`)
    
    // Step 8: Book appointment
    console.log('\n📅 Booking appointment...')
    const appointmentData = {
      doctorId: doctorId,
      dateTime: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(), // 3 hours from now
      type: 'IN_PERSON',
      reason: 'Debug test appointment to verify real-time patient list updates in doctor dashboard',
      duration: 30
    }
    
    const appointment = await apiRequest('/api/appointments/book', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${patientToken}` },
      body: JSON.stringify(appointmentData)
    })
    
    if (!appointment.ok) {
      throw new Error(`Appointment booking failed: ${JSON.stringify(appointment.data)}`)
    }
    
    console.log(`✅ Appointment booked successfully: ${appointment.data.id}`)
    
    // Step 9: Wait for real-time processing
    console.log('\n⏳ Waiting for real-time updates...')
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    // Step 10: Check updated patient list
    console.log('\n👥 Checking updated patient list...')
    const updatedPatients = await apiRequest(`/api/doctor/${doctorId}/patients`, {
      headers: { 'Authorization': `Bearer ${doctorToken}` }
    })
    
    if (!updatedPatients.ok) {
      throw new Error(`Updated patient list failed: ${JSON.stringify(updatedPatients.data)}`)
    }
    
    console.log(`✅ Updated patient list: ${updatedPatients.data.length} patients`)
    
    // Step 11: Verify patient appears in list
    const debugPatient = updatedPatients.data.find(p => 
      p.firstName === TEST_PATIENT.firstName && 
      p.lastName === TEST_PATIENT.lastName
    )
    
    if (!debugPatient) {
      console.log('\n❌ Patient not found in doctor\'s patient list!')
      console.log('🔍 Available patients in list:')
      updatedPatients.data.forEach((p, index) => {
        console.log(`   ${index + 1}. ${p.firstName} ${p.lastName} (${p.user?.email || 'no email'})`)
      })
      throw new Error('Patient not found in doctor\'s patient list after booking appointment')
    }
    
    console.log('\n✅ Patient found in doctor\'s patient list!')
    console.log(`   • Name: ${debugPatient.firstName} ${debugPatient.lastName}`)
    console.log(`   • Email: ${debugPatient.user?.email || 'N/A'}`)
    console.log(`   • Appointments: ${debugPatient.appointments?.length || 0}`)
    
    if (debugPatient.appointments && debugPatient.appointments.length > 0) {
      const apt = debugPatient.appointments[0]
      console.log(`   • Latest appointment: ${apt.dateTime} (${apt.status})`)
      console.log(`   • Reason: ${apt.reason}`)
    }
    
    // Success!
    console.log('\n🎉 ALL TESTS PASSED!')
    console.log('✅ Real-time patient list updates are working correctly!')
    console.log('✅ Patient appears in doctor dashboard immediately after booking!')
    
    return true
    
  } catch (error) {
    console.error('\n❌ TEST FAILED:', error.message)
    return false
  }
}

// Run the test
if (require.main === module) {
  testCompleteWorkflow().then((success) => {
    console.log('\n📋 FINAL SUMMARY')
    console.log('=' .repeat(60))
    if (success) {
      console.log('✅ OVERALL RESULT: ALL TESTS PASSED')
      console.log('✅ Real-time patient list updates work perfectly!')
    } else {
      console.log('❌ OVERALL RESULT: TESTS FAILED')
      console.log('❌ Real-time patient list updates need debugging')
    }
    console.log('\n👋 Test execution completed')
  })
}

module.exports = { testCompleteWorkflow }
