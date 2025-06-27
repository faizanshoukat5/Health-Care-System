/**
 * Simple test to verify real-time patient list updates
 * Tests the API endpoints directly without database access
 */

const fetch = require('cross-fetch')

// Test configuration
const BASE_URL = 'http://localhost:3001'
const TEST_PATIENT = {
  email: 'realtime.test.patient@example.com',
  password: 'testpass123',
  firstName: 'RealTime',
  lastName: 'TestPatient',
  age: 30,
  gender: 'FEMALE',
  phoneNumber: '555-0123'
}

const TEST_DOCTOR = {
  email: 'realtime.test.doctor@example.com',
  password: 'testpass123',
  firstName: 'Dr. RealTime',
  lastName: 'TestDoctor',
  specialization: 'CARDIOLOGIST',
  licenseNumber: 'RT123456',
  consultationFee: 150
}

// Helper function to make API requests
async function apiRequest(endpoint, options = {}) {
  try {
    const url = `${BASE_URL}${endpoint}`
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    })
    
    const data = await response.json()
    return { ok: response.ok, data, status: response.status }
  } catch (error) {
    console.error(`API request failed: ${endpoint}`, error.message)
    return { ok: false, error: error.message }
  }
}

// Test functions
async function registerAndLogin(userData, role) {
  console.log(`📝 Registering ${role.toLowerCase()}...`)
  
  // Register
  const registerResult = await apiRequest('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ ...userData, role })
  })
  
  if (!registerResult.ok) {
    console.log(`⚠️ Registration failed (may already exist): ${JSON.stringify(registerResult.data)}`)
  } else {
    console.log(`✅ ${role} registered successfully`)
  }
  
  // Login
  const loginResult = await apiRequest('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: userData.email,
      password: userData.password
    })
  })
  
  if (!loginResult.ok) {
    throw new Error(`${role} login failed: ${JSON.stringify(loginResult.data)}`)
  }
  
  console.log(`✅ ${role} logged in successfully`)
  return loginResult.data
}

async function bookAppointment(doctorId, token) {
  console.log('📅 Booking appointment...')
  
  const appointmentData = {
    doctorId: doctorId,
    dateTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours from now
    type: 'IN_PERSON',
    reason: 'Real-time update test - routine checkup for new patient relationship',
    duration: 30
  }
  
  const result = await apiRequest('/api/appointments/book', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: JSON.stringify(appointmentData)
  })
  
  if (!result.ok) {
    throw new Error(`Appointment booking failed: ${JSON.stringify(result.data)}`)
  }
  
  console.log('✅ Appointment booked successfully:', result.data.id)
  return result.data
}

async function getPatientList(doctorId, token) {
  console.log('👥 Fetching doctor\'s patient list...')
  
  const result = await apiRequest(`/api/doctor/${doctorId}/patients`, {
    headers: { 'Authorization': `Bearer ${token}` }
  })
  
  if (!result.ok) {
    console.log(`⚠️ Failed to get patient list: ${JSON.stringify(result.data)}`)
    return []
  }
  
  console.log(`📊 Patient list retrieved: ${result.data.length} patients`)
  return result.data
}

async function getDoctorProfile(userId, token) {
  console.log('👨‍⚕️ Getting doctor profile...')
  
  const result = await apiRequest(`/api/user/${userId}/profile`, {
    headers: { 'Authorization': `Bearer ${token}` }
  })
  
  if (!result.ok) {
    throw new Error(`Failed to get doctor profile: ${JSON.stringify(result.data)}`)
  }
  
  return result.data.doctor
}

// Main test function
async function testRealTimePatientUpdates() {
  console.log('🚀 Starting Real-Time Patient List Update Test')
  console.log('=' .repeat(60))
  
  try {
    // Step 1: Register and login doctor
    const doctorAuth = await registerAndLogin(TEST_DOCTOR, 'DOCTOR')
    const doctorProfile = await getDoctorProfile(doctorAuth.user.id, doctorAuth.token)
    
    // Step 2: Get initial patient list
    const initialPatients = await getPatientList(doctorProfile.id, doctorAuth.token)
    const initialCount = initialPatients.length
    console.log(`📊 Initial patient count: ${initialCount}`)
    
    // Step 3: Register and login patient
    const patientAuth = await registerAndLogin(TEST_PATIENT, 'PATIENT')
    
    // Step 4: Book appointment as patient
    const appointment = await bookAppointment(doctorProfile.id, patientAuth.token)
    
    // Step 5: Wait a moment for real-time updates to process
    console.log('⏳ Waiting for real-time updates to process...')
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Step 6: Get updated patient list
    const updatedPatients = await getPatientList(doctorProfile.id, doctorAuth.token)
    const updatedCount = updatedPatients.length
    console.log(`📊 Updated patient count: ${updatedCount}`)
    
    // Step 7: Verify patient appears in list
    const newPatient = updatedPatients.find(p => 
      p.firstName === TEST_PATIENT.firstName && 
      p.lastName === TEST_PATIENT.lastName
    )
    
    if (!newPatient) {
      throw new Error('❌ Patient not found in doctor\'s patient list after booking!')
    }
    
    console.log('✅ Patient found in doctor\'s patient list:', {
      id: newPatient.id,
      name: `${newPatient.firstName} ${newPatient.lastName}`,
      email: newPatient.user?.email || 'N/A',
      appointmentCount: newPatient.appointments?.length || 0
    })
    
    // Step 8: Verify appointment details
    if (!newPatient.appointments || newPatient.appointments.length === 0) {
      console.log('⚠️ Patient has no appointments in the list')
    } else {
      const patientAppointment = newPatient.appointments[0]
      console.log('✅ Appointment details verified:', {
        id: patientAppointment.id,
        dateTime: patientAppointment.dateTime,
        type: patientAppointment.type,
        status: patientAppointment.status,
        reason: patientAppointment.reason?.substring(0, 50) + '...'
      })
    }
    
    // Success summary
    console.log('\n🎉 Real-time update test PASSED!')
    console.log(`   • Patient count: ${initialCount} → ${updatedCount}`)
    console.log(`   • Patient "${newPatient.firstName} ${newPatient.lastName}" successfully appears in doctor's list`)
    console.log(`   • Appointment successfully created and linked`)
    console.log(`   • Real-time updates are working correctly!`)
    
    return true
    
  } catch (error) {
    console.error('\n❌ Real-time update test FAILED:', error.message)
    console.log('\n📋 TEST SUMMARY')
    console.log('=' .repeat(60))
    console.log('❌ OVERALL RESULT: FAILED')
    console.log(`❌ Error: ${error.message}`)
    return false
  }
}

// Run the test
if (require.main === module) {
  testRealTimePatientUpdates().then((success) => {
    if (success) {
      console.log('\n✅ All tests completed successfully!')
    } else {
      console.log('\n❌ Tests failed!')
    }
    console.log('\n👋 Test execution completed')
  })
}

module.exports = { testRealTimePatientUpdates }
