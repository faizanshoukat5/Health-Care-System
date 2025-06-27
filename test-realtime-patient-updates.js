/**
 * Test script to verify real-time patient list updates
 * Tests that when a patient books an appointment, they immediately appear in the doctor's patient list
 */

const sqlite3 = require('sqlite3').verbose()
const fetch = require('cross-fetch')
const path = require('path')

// Database connection
const dbPath = path.join(__dirname, 'prisma', 'dev.db')
const db = new sqlite3.Database(dbPath)

// Test configuration
const TEST_CONFIG = {
  testPatient: {
    email: 'realtime.patient@test.com',
    password: 'testpassword123',
    firstName: 'RealTime',
    lastName: 'TestPatient',
    age: 28,
    gender: 'FEMALE',
    phoneNumber: '555-0199'
  },
  testDoctor: {
    email: 'realtime.doctor@test.com',
    password: 'testpassword123',
    firstName: 'Dr. RealTime',
    lastName: 'TestDoctor',
    specialization: 'CARDIOLOGIST',
    licenseNumber: 'RT123456',
    consultationFee: 150
  },
  appointmentData: {
    type: 'IN_PERSON',
    reason: 'Real-time update testing - routine checkup for new patient',
    duration: 30
  }
}

// Helper functions
function runQuery(query, params = []) {
  return new Promise((resolve, reject) => {
    db.all(query, params, (err, rows) => {
      if (err) reject(err)
      else resolve(rows)
    })
  })
}

function runSingleQuery(query, params = []) {
  return new Promise((resolve, reject) => {
    db.get(query, params, (err, row) => {
      if (err) reject(err)
      else resolve(row)
    })
  })
}

// API simulation functions
async function makeAPIRequest(url, options = {}) {
  try {
    const response = await fetch(`http://localhost:3001${url}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    })
    
    const data = await response.json()
    return { ok: response.ok, data, status: response.status }
  } catch (error) {
    console.error(`API request failed: ${url}`, error.message)
    return { ok: false, error: error.message, status: 500 }
  }
}

async function registerUser(userData, role) {
  return await makeAPIRequest('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ ...userData, role })
  })
}

async function loginUser(email, password) {
  return await makeAPIRequest('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  })
}

async function bookAppointment(appointmentData, token) {
  return await makeAPIRequest('/api/appointments/book', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: JSON.stringify(appointmentData)
  })
}

async function getDoctorPatients(doctorId, token) {
  return await makeAPIRequest(`/api/doctor/${doctorId}/patients`, {
    headers: { 'Authorization': `Bearer ${token}` }
  })
}

// Main test functions
async function setupTestData() {
  console.log('\n📋 Setting up test data...')
  
  try {
    // Clean up existing test data
    await runQuery(`DELETE FROM Appointment WHERE id IN (
      SELECT a.id FROM Appointment a
      JOIN Patient p ON a.patientId = p.id
      JOIN User u ON p.userId = u.id
      WHERE u.email = ?
    )`, [TEST_CONFIG.testPatient.email])
    
    await runQuery(`DELETE FROM Patient WHERE userId IN (
      SELECT id FROM User WHERE email = ?
    )`, [TEST_CONFIG.testPatient.email])
    
    await runQuery(`DELETE FROM Doctor WHERE userId IN (
      SELECT id FROM User WHERE email = ?
    )`, [TEST_CONFIG.testDoctor.email])
    
    await runQuery(`DELETE FROM User WHERE email IN (?, ?)`, [
      TEST_CONFIG.testPatient.email,
      TEST_CONFIG.testDoctor.email
    ])
    
    console.log('✅ Cleaned up existing test data')
    
    // Register test patient
    const patientRegistration = await registerUser(TEST_CONFIG.testPatient, 'PATIENT')
    if (!patientRegistration.ok) {
      throw new Error(`Failed to register patient: ${JSON.stringify(patientRegistration.data)}`)
    }
    console.log('✅ Test patient registered')
    
    // Register test doctor
    const doctorRegistration = await registerUser(TEST_CONFIG.testDoctor, 'DOCTOR')
    if (!doctorRegistration.ok) {
      throw new Error(`Failed to register doctor: ${JSON.stringify(doctorRegistration.data)}`)
    }
    console.log('✅ Test doctor registered')
    
    return {
      patient: patientRegistration.data,
      doctor: doctorRegistration.data
    }
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message)
    throw error
  }
}

async function testRealTimeUpdates() {
  console.log('\n🔄 Testing real-time patient list updates...')
  
  try {
    // Step 1: Login as doctor and get initial patient list
    const doctorLogin = await loginUser(TEST_CONFIG.testDoctor.email, TEST_CONFIG.testDoctor.password)
    if (!doctorLogin.ok) {
      throw new Error(`Doctor login failed: ${JSON.stringify(doctorLogin.data)}`)
    }
    
    const doctorToken = doctorLogin.data.token
    console.log('✅ Doctor logged in successfully')
    
    // Get doctor ID from database
    const doctorRecord = await runSingleQuery(`
      SELECT d.id, d.userId FROM Doctor d
      JOIN User u ON d.userId = u.id
      WHERE u.email = ?
    `, [TEST_CONFIG.testDoctor.email])
    
    if (!doctorRecord) {
      throw new Error('Doctor record not found in database')
    }
    
    // Get initial patient list (should be empty)
    const initialPatients = await getDoctorPatients(doctorRecord.id, doctorToken)
    if (!initialPatients.ok) {
      console.log('⚠️ Initial patient list request failed (expected for new doctor):', initialPatients.data)
    }
    
    const initialPatientCount = initialPatients.ok ? initialPatients.data.length : 0
    console.log(`📊 Initial patient count: ${initialPatientCount}`)
    
    // Step 2: Login as patient
    const patientLogin = await loginUser(TEST_CONFIG.testPatient.email, TEST_CONFIG.testPatient.password)
    if (!patientLogin.ok) {
      throw new Error(`Patient login failed: ${JSON.stringify(patientLogin.data)}`)
    }
    
    const patientToken = patientLogin.data.token
    console.log('✅ Patient logged in successfully')
    
    // Step 3: Book appointment as patient
    const appointmentDateTime = new Date()
    appointmentDateTime.setHours(appointmentDateTime.getHours() + 2) // 2 hours from now
    
    const appointmentData = {
      doctorId: doctorRecord.id,
      dateTime: appointmentDateTime.toISOString(),
      ...TEST_CONFIG.appointmentData
    }
    
    console.log('📅 Booking appointment:', {
      doctorId: doctorRecord.id,
      dateTime: appointmentDateTime.toISOString(),
      type: appointmentData.type,
      reason: appointmentData.reason
    })
    
    const bookingResult = await bookAppointment(appointmentData, patientToken)
    if (!bookingResult.ok) {
      throw new Error(`Appointment booking failed: ${JSON.stringify(bookingResult.data)}`)
    }
    
    console.log('✅ Appointment booked successfully:', bookingResult.data.id)
    
    // Step 4: Check updated patient list (with small delay to ensure DB consistency)
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const updatedPatients = await getDoctorPatients(doctorRecord.id, doctorToken)
    if (!updatedPatients.ok) {
      throw new Error(`Failed to get updated patient list: ${JSON.stringify(updatedPatients.data)}`)
    }
    
    const updatedPatientCount = updatedPatients.data.length
    console.log(`📊 Updated patient count: ${updatedPatientCount}`)
    
    // Step 5: Verify patient appears in list
    const newPatient = updatedPatients.data.find(p => 
      p.firstName === TEST_CONFIG.testPatient.firstName && 
      p.lastName === TEST_CONFIG.testPatient.lastName
    )
    
    if (!newPatient) {
      throw new Error('Patient not found in doctor\'s patient list after booking appointment!')
    }
    
    console.log('✅ Patient found in doctor\'s patient list:', {
      id: newPatient.id,
      name: `${newPatient.firstName} ${newPatient.lastName}`,
      email: newPatient.user.email,
      appointmentCount: newPatient.appointments.length
    })
    
    // Step 6: Verify appointment details
    if (newPatient.appointments.length === 0) {
      throw new Error('Patient has no appointments in the list!')
    }
    
    const appointment = newPatient.appointments[0]
    console.log('✅ Appointment details verified:', {
      id: appointment.id,
      dateTime: appointment.dateTime,
      type: appointment.type,
      status: appointment.status,
      reason: appointment.reason
    })
    
    // Success
    console.log('\n🎉 Real-time update test PASSED!')
    console.log(`   • Patient count increased from ${initialPatientCount} to ${updatedPatientCount}`)
    console.log(`   • Patient "${newPatient.firstName} ${newPatient.lastName}" appears in doctor's list`)
    console.log(`   • Appointment successfully linked and visible`)
    
    return {
      success: true,
      initialCount: initialPatientCount,
      finalCount: updatedPatientCount,
      patient: newPatient,
      appointment: appointment
    }
    
  } catch (error) {
    console.error('❌ Real-time update test FAILED:', error.message)
    return { success: false, error: error.message }
  }
}

async function verifyDatabaseState() {
  console.log('\n🔍 Verifying database state...')
  
  try {
    // Check if patient-doctor relationship exists
    const relationship = await runSingleQuery(`
      SELECT 
        p.firstName || ' ' || p.lastName as patientName,
        d.firstName || ' ' || d.lastName as doctorName,
        a.dateTime,
        a.type,
        a.status
      FROM Appointment a
      JOIN Patient p ON a.patientId = p.id
      JOIN Doctor d ON a.doctorId = d.id
      JOIN User pu ON p.userId = pu.id
      JOIN User du ON d.userId = du.id
      WHERE pu.email = ? AND du.email = ?
      ORDER BY a.dateTime DESC
      LIMIT 1
    `, [TEST_CONFIG.testPatient.email, TEST_CONFIG.testDoctor.email])
    
    if (relationship) {
      console.log('✅ Patient-Doctor relationship confirmed in database:')
      console.log(`   • Patient: ${relationship.patientName}`)
      console.log(`   • Doctor: ${relationship.doctorName}`)
      console.log(`   • Appointment: ${relationship.dateTime} (${relationship.type})`)
      console.log(`   • Status: ${relationship.status}`)
    } else {
      console.log('❌ No patient-doctor relationship found in database')
    }
    
    return relationship
    
  } catch (error) {
    console.error('❌ Database verification failed:', error.message)
    return null
  }
}

async function cleanup() {
  console.log('\n🧹 Cleaning up test data...')
  
  try {
    // Remove test appointments
    await runQuery(`DELETE FROM Appointment WHERE id IN (
      SELECT a.id FROM Appointment a
      JOIN Patient p ON a.patientId = p.id
      JOIN User u ON p.userId = u.id
      WHERE u.email = ?
    )`, [TEST_CONFIG.testPatient.email])
    
    // Remove test notifications
    await runQuery(`DELETE FROM Notification WHERE userId IN (
      SELECT id FROM User WHERE email IN (?, ?)
    )`, [TEST_CONFIG.testPatient.email, TEST_CONFIG.testDoctor.email])
    
    // Remove test patient and doctor profiles
    await runQuery(`DELETE FROM Patient WHERE userId IN (
      SELECT id FROM User WHERE email = ?
    )`, [TEST_CONFIG.testPatient.email])
    
    await runQuery(`DELETE FROM Doctor WHERE userId IN (
      SELECT id FROM User WHERE email = ?
    )`, [TEST_CONFIG.testDoctor.email])
    
    // Remove test users
    await runQuery(`DELETE FROM User WHERE email IN (?, ?)`, [
      TEST_CONFIG.testPatient.email,
      TEST_CONFIG.testDoctor.email
    ])
    
    console.log('✅ Test data cleaned up successfully')
    
  } catch (error) {
    console.error('❌ Cleanup failed:', error.message)
  }
}

// Main test execution
async function runRealTimeTest() {
  console.log('🚀 Starting Real-Time Patient List Update Test')
  console.log('=' .repeat(60))
  
  try {
    // Setup
    await setupTestData()
    
    // Test real-time updates
    const testResult = await testRealTimeUpdates()
    
    // Verify database state
    await verifyDatabaseState()
    
    // Summary
    console.log('\n📋 TEST SUMMARY')
    console.log('=' .repeat(60))
    if (testResult.success) {
      console.log('✅ OVERALL RESULT: PASSED')
      console.log('✅ Real-time patient list updates work correctly')
      console.log('✅ Patient appears in doctor dashboard immediately after booking')
    } else {
      console.log('❌ OVERALL RESULT: FAILED')
      console.log(`❌ Error: ${testResult.error}`)
    }
    
  } catch (error) {
    console.error('💥 Test execution failed:', error.message)
  } finally {
    // Cleanup
    await cleanup()
    
    // Close database connection
    db.close()
    console.log('\n👋 Test completed')
  }
}

// Run the test
if (require.main === module) {
  runRealTimeTest()
}

module.exports = { runRealTimeTest }
