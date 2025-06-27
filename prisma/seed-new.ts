import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')

  // Clear existing data
  await prisma.notification.deleteMany()
  await prisma.vitalSigns.deleteMany()
  await prisma.prescription.deleteMany()
  await prisma.medicalRecord.deleteMany()
  await prisma.appointment.deleteMany()
  await prisma.patient.deleteMany()
  await prisma.doctor.deleteMany()
  await prisma.admin.deleteMany()
  await prisma.user.deleteMany()

  // Create Admin User
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@healthcare.com',
      password: await bcrypt.hash('admin123', 12),
      role: 'ADMIN',
    },
  })

  await prisma.admin.create({
    data: {
      userId: adminUser.id,
      firstName: 'Admin',
      lastName: 'User',
    },
  })

  // Create Doctor Users
  const doctorUser1 = await prisma.user.create({
    data: {
      email: 'dr.smith@healthcare.com',
      password: await bcrypt.hash('doctor123', 12),
      role: 'DOCTOR',
    },
  })

  const doctor1 = await prisma.doctor.create({
    data: {
      userId: doctorUser1.id,
      firstName: 'John',
      lastName: 'Smith',
      specialization: 'Cardiology',
      licenseNumber: 'MD123456',
      phoneNumber: '+1-555-0101',
      qualifications: {
        degree: 'MD',
        university: 'Harvard Medical School',
        residency: 'Massachusetts General Hospital',
        boardCertifications: ['American Board of Internal Medicine', 'American Board of Cardiovascular Disease']
      },
      experience: 15,
      consultationFee: 200.00,
      availability: {
        monday: { isAvailable: true, startTime: '09:00', endTime: '17:00' },
        tuesday: { isAvailable: true, startTime: '09:00', endTime: '17:00' },
        wednesday: { isAvailable: true, startTime: '09:00', endTime: '17:00' },
        thursday: { isAvailable: true, startTime: '09:00', endTime: '17:00' },
        friday: { isAvailable: true, startTime: '09:00', endTime: '15:00' },
        saturday: { isAvailable: false },
        sunday: { isAvailable: false }
      },
    },
  })

  const doctorUser2 = await prisma.user.create({
    data: {
      email: 'dr.johnson@healthcare.com',
      password: await bcrypt.hash('doctor123', 12),
      role: 'DOCTOR',
    },
  })

  const doctor2 = await prisma.doctor.create({
    data: {
      userId: doctorUser2.id,
      firstName: 'Sarah',
      lastName: 'Johnson',
      specialization: 'Family Medicine',
      licenseNumber: 'MD789012',
      phoneNumber: '+1-555-0102',
      qualifications: {
        degree: 'MD',
        university: 'Johns Hopkins University',
        residency: 'Johns Hopkins Hospital',
        boardCertifications: ['American Board of Family Medicine']
      },
      experience: 10,
      consultationFee: 150.00,
      availability: {
        monday: { isAvailable: true, startTime: '08:00', endTime: '16:00' },
        tuesday: { isAvailable: true, startTime: '08:00', endTime: '16:00' },
        wednesday: { isAvailable: true, startTime: '08:00', endTime: '16:00' },
        thursday: { isAvailable: true, startTime: '08:00', endTime: '16:00' },
        friday: { isAvailable: true, startTime: '08:00', endTime: '16:00' },
        saturday: { isAvailable: true, startTime: '09:00', endTime: '13:00' },
        sunday: { isAvailable: false }
      },
    },
  })

  // Create Patient Users
  const patientUser1 = await prisma.user.create({
    data: {
      email: 'patient@example.com',
      password: await bcrypt.hash('patient123', 12),
      role: 'PATIENT',
    },
  })

  const patient1 = await prisma.patient.create({
    data: {
      userId: patientUser1.id,
      firstName: 'John',
      lastName: 'Doe',
      dateOfBirth: new Date('1980-05-15'),
      gender: 'MALE',
      phoneNumber: '+1-555-1001',
      address: {
        street: '123 Main St',
        city: 'Anytown',
        state: 'CA',
        zipCode: '12345',
        country: 'USA'
      },
      emergencyContact: {
        name: 'Jane Doe',
        relationship: 'Spouse',
        phoneNumber: '+1-555-1002'
      },
      insuranceInfo: {
        provider: 'Blue Cross Blue Shield',
        policyNumber: 'BC123456789',
        groupNumber: 'GRP001'
      },
      medicalHistory: {
        chronicConditions: ['Hypertension', 'Type 2 Diabetes'],
        surgeries: ['Appendectomy (2010)'],
        familyHistory: ['Heart Disease (Father)', 'Diabetes (Mother)']
      },
      allergies: JSON.stringify(['Penicillin', 'Shellfish']),
      medications: JSON.stringify(['Metformin 500mg', 'Lisinopril 10mg']),
    },
  })

  // Create sample appointments
  const now = new Date()
  const futureDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
  futureDate.setHours(14, 0, 0, 0) // 2:00 PM

  const appointment1 = await prisma.appointment.create({
    data: {
      patientId: patient1.id,
      doctorId: doctor1.id,
      dateTime: futureDate,
      duration: 30,
      type: 'IN_PERSON',
      status: 'CONFIRMED',
      reason: 'Regular cardiology checkup and blood pressure monitoring',
      notes: 'Follow-up on hypertension management',
    },
  })

  // Create sample medical record
  const pastDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) // 30 days ago

  await prisma.medicalRecord.create({
    data: {
      patientId: patient1.id,
      doctorId: doctor1.id,
      appointmentDate: pastDate,
      diagnosis: 'Hypertension (Stage 1)',
      symptoms: JSON.stringify(['Headache', 'Dizziness', 'Fatigue']),
      treatment: 'Increased Lisinopril dosage to 10mg daily. Recommended low-sodium diet and regular exercise.',
      vitals: {
        bloodPressure: { systolic: 145, diastolic: 92 },
        heartRate: 78,
        temperature: 36.5,
        weight: 85.5
      },
      notes: 'Patient reports good medication compliance. Discussed lifestyle modifications.',
    },
  })

  // Create sample prescription
  await prisma.prescription.create({
    data: {
      patientId: patient1.id,
      doctorId: doctor1.id,
      medications: JSON.stringify([
        { name: 'Lisinopril', strength: '10mg', form: 'Tablet' },
        { name: 'Metformin', strength: '500mg', form: 'Tablet' }
      ]),
      dosage: 'Lisinopril 10mg once daily, Metformin 500mg twice daily',
      frequency: 'Lisinopril: Once daily in the morning, Metformin: Twice daily with meals',
      duration: '90 days',
      instructions: 'Take Lisinopril in the morning with or without food. Take Metformin with meals to reduce stomach upset.',
      status: 'ACTIVE',
    },
  })

  // Create sample vital signs
  await prisma.vitalSigns.create({
    data: {
      patientId: patient1.id,
      bloodPressure: { systolic: 135, diastolic: 85 },
      heartRate: 72,
      temperature: 36.4,
      weight: 85.5,
      oxygenSaturation: 98,
      recordedAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      recordedBy: patient1.id,
    },
  })

  // Create sample notifications
  await prisma.notification.create({
    data: {
      userId: patientUser1.id,
      type: 'APPOINTMENT_REMINDER',
      title: 'Upcoming Appointment Reminder',
      message: `You have an appointment with Dr. ${doctor1.firstName} ${doctor1.lastName} tomorrow at 2:00 PM.`,
      data: {
        appointmentId: appointment1.id,
        doctorName: `${doctor1.firstName} ${doctor1.lastName}`,
        dateTime: futureDate.toISOString()
      }
    },
  })

  console.log('✅ Seed completed successfully!')
  console.log('\n📊 Created:')
  console.log('   • 1 Admin user (admin@healthcare.com / admin123)')
  console.log('   • 2 Doctors (dr.smith@healthcare.com, dr.johnson@healthcare.com / doctor123)')
  console.log('   • 1 Patient (patient@example.com / patient123)')
  console.log('   • 1 Appointment')
  console.log('   • 1 Medical record')
  console.log('   • 1 Prescription')
  console.log('   • 1 Vital signs record')
  console.log('   • 1 Notification')
  console.log('\n🎯 You can now log in with any of the test accounts!')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
