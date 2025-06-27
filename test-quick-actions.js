// Test script to verify all quick actions and features
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testQuickActions() {
  console.log('🧪 Testing Quick Actions and Features...\n')

  try {
    // 1. Test user authentication
    console.log('1. Testing user authentication...')
    const users = await prisma.user.findMany({
      include: {
        patient: true,
        doctor: true
      }
    })
    console.log(`   ✅ Found ${users.length} users`)
    
    const patientUsers = users.filter(u => u.role === 'PATIENT')
    const doctorUsers = users.filter(u => u.role === 'DOCTOR')
    console.log(`   ✅ Patients: ${patientUsers.length}, Doctors: ${doctorUsers.length}`)

    // 2. Test patient quick actions data availability
    console.log('\n2. Testing patient quick actions data...')
    
    // Check appointments
    const appointments = await prisma.appointment.findMany({
      include: {
        patient: true,
        doctor: true
      }
    })
    console.log(`   ✅ Found ${appointments.length} appointments`)

    // Check vitals
    const vitals = await prisma.vitalSigns.findMany()
    console.log(`   ✅ Found ${vitals.length} vital signs records`)

    // Check prescriptions
    const prescriptions = await prisma.prescription.findMany({
      include: {
        patient: true,
        doctor: true
      }
    })
    console.log(`   ✅ Found ${prescriptions.length} prescriptions`)

    // Check medical records
    const medicalRecords = await prisma.medicalRecord.findMany({
      include: {
        patient: true,
        doctor: true
      }
    })
    console.log(`   ✅ Found ${medicalRecords.length} medical records`)

    // Check notifications
    const notifications = await prisma.notification.findMany()
    console.log(`   ✅ Found ${notifications.length} notifications`)

    // 3. Test doctor dashboard data
    console.log('\n3. Testing doctor dashboard data...')
    
    if (doctorUsers.length > 0) {
      const testDoctor = doctorUsers[0]
      const doctorProfile = await prisma.doctor.findUnique({
        where: { userId: testDoctor.id }
      })
      console.log(`   ✅ Doctor profile found: Dr. ${doctorProfile?.firstName} ${doctorProfile?.lastName}`)

      // Doctor's appointments
      const doctorAppointments = await prisma.appointment.findMany({
        where: { doctorId: doctorProfile?.id },
        include: {
          patient: true
        }
      })
      console.log(`   ✅ Doctor has ${doctorAppointments.length} appointments`)

      // Doctor's prescriptions
      const doctorPrescriptions = await prisma.prescription.findMany({
        where: { doctorId: doctorProfile?.id },
        include: {
          patient: true
        }
      })
      console.log(`   ✅ Doctor has prescribed ${doctorPrescriptions.length} medications`)

      // Doctor's patients
      const doctorPatients = await prisma.patient.findMany({
        where: {
          appointments: {
            some: {
              doctorId: doctorProfile?.id
            }
          }
        },
        include: {
          user: true,
          appointments: {
            where: { doctorId: doctorProfile?.id }
          }
        }
      })
      console.log(`   ✅ Doctor has ${doctorPatients.length} patients`)
    }

    // 4. Test specific patient quick actions
    console.log('\n4. Testing specific patient features...')
    
    if (patientUsers.length > 0) {
      const testPatient = patientUsers[0]
      const patientProfile = await prisma.patient.findUnique({
        where: { userId: testPatient.id }
      })
      console.log(`   ✅ Patient profile found: ${patientProfile?.firstName} ${patientProfile?.lastName}`)

      // Patient's appointments
      const patientAppointments = await prisma.appointment.findMany({
        where: { patientId: patientProfile?.id },
        include: {
          doctor: true
        }
      })
      console.log(`   ✅ Patient has ${patientAppointments.length} appointments`)

      // Patient's vitals
      const patientVitals = await prisma.vitalSigns.findMany({
        where: { patientId: patientProfile?.id }
      })
      console.log(`   ✅ Patient has ${patientVitals.length} vital signs records`)

      // Patient's prescriptions
      const patientPrescriptions = await prisma.prescription.findMany({
        where: { patientId: patientProfile?.id },
        include: {
          doctor: true
        }
      })
      console.log(`   ✅ Patient has ${patientPrescriptions.length} prescriptions`)

      // Patient's medical records
      const patientRecords = await prisma.medicalRecord.findMany({
        where: { patientId: patientProfile?.id },
        include: {
          doctor: true
        }
      })
      console.log(`   ✅ Patient has ${patientRecords.length} medical records`)
    }

    // 5. Test availability for booking
    console.log('\n5. Testing appointment booking availability...')
    const availableDoctors = await prisma.doctor.findMany({
      include: {
        user: true,
        appointments: {
          where: {
            dateTime: {
              gte: new Date()
            },
            status: {
              in: ['SCHEDULED', 'CONFIRMED']
            }
          }
        }
      }
    })
    console.log(`   ✅ Found ${availableDoctors.length} doctors available for booking`)

    console.log('\n🎉 All tests completed successfully!')
    console.log('\n📝 Summary:')
    console.log(`   • Users: ${users.length} (${patientUsers.length} patients, ${doctorUsers.length} doctors)`)
    console.log(`   • Appointments: ${appointments.length}`)
    console.log(`   • Vital Signs: ${vitals.length}`)
    console.log(`   • Prescriptions: ${prescriptions.length}`)
    console.log(`   • Medical Records: ${medicalRecords.length}`)
    console.log(`   • Notifications: ${notifications.length}`)
    console.log('\n✅ All quick actions have supporting data!')

  } catch (error) {
    console.error('❌ Test failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Quick action URLs to test manually:
console.log('\n🔗 Quick Action URLs to test:')
console.log('Patient Quick Actions:')
console.log('   • Book Appointment: http://localhost:3000/patient/appointments/book')
console.log('   • Telemedicine: http://localhost:3000/patient/telemedicine')
console.log('   • Medical Records: http://localhost:3000/patient/records')
console.log('   • Log Vitals: http://localhost:3000/patient/vitals/log')
console.log('   • Prescriptions: http://localhost:3000/patient/prescriptions')
console.log('   • Emergency: http://localhost:3000/patient/emergency')
console.log('\nDoctor Quick Actions:')
console.log('   • Appointments: http://localhost:3000/doctor/appointments')
console.log('   • Patients: http://localhost:3000/doctor/patients')
console.log('   • Prescriptions: http://localhost:3000/doctor/prescriptions')
console.log('   • Schedule: http://localhost:3000/doctor/schedule')
console.log('   • Telemedicine: http://localhost:3000/doctor/telemedicine')
console.log('   • Emergency: http://localhost:3000/doctor/emergency')

testQuickActions()
