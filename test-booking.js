// Test appointment booking
async function testBooking() {
  try {
    console.log('🧪 Testing appointment booking...')
    
    // Simulate login first
    const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'patient@healthcare.com',
        password: 'patient123'
      })
    })
    
    if (!loginResponse.ok) {
      throw new Error('Login failed')
    }
    
    const loginData = await loginResponse.json()
    console.log('✅ Login successful, token received')
    
    // Get doctors
    const doctorsResponse = await fetch('http://localhost:3000/api/doctors/available', {
      headers: {
        'Authorization': `Bearer ${loginData.token}`,
        'Content-Type': 'application/json'
      },
      credentials: 'include'
    })
    
    if (!doctorsResponse.ok) {
      throw new Error('Failed to fetch doctors')
    }
    
    const doctors = await doctorsResponse.json()
    console.log('✅ Doctors fetched:', doctors.length)
    
    if (doctors.length === 0) {
      throw new Error('No doctors available')
    }
    
    // Try to book appointment for tomorrow at 10 AM
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(10, 0, 0, 0) // 10:00 AM
    
    const appointmentData = {
      doctorId: doctors[0].id,
      dateTime: tomorrow.toISOString(),
      type: 'IN_PERSON',
      reason: 'Test appointment booking from script - this is a detailed reason with more than 10 characters',
      duration: 30
    }
    
    console.log('📅 Booking appointment with data:', appointmentData)
    console.log('🔍 DateTime format check:', appointmentData.dateTime)
    console.log('🔍 Reason length:', appointmentData.reason.length)
    
    const bookingResponse = await fetch('http://localhost:3000/api/appointments/book', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${loginData.token}`,
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify(appointmentData)
    })
    
    console.log('📋 Booking response status:', bookingResponse.status)
    const bookingResult = await bookingResponse.json()
    console.log('📋 Booking response:', bookingResult)
    
    if (bookingResponse.ok) {
      console.log('✅ Appointment booked successfully!')
    } else {
      console.log('❌ Booking failed:', bookingResult.error)
    }
    
  } catch (error) {
    console.error('💥 Test failed:', error.message)
  }
}

testBooking()
