import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Hash passwords
  const hashedPassword = await bcrypt.hash('password123', 12)

  // Create admin user
  const admin = await prisma.user.create({
    data: {
      email: 'admin@healthcare.com',
      password: hashedPassword,
      role: 'ADMIN',
      admin: {
        create: {
          firstName: 'Admin',
          lastName: 'User',
        },
      },
    },
  })

  // Create sample doctors
  const doctor1 = await prisma.user.create({
    data: {
      email: 'dr.smith@healthcare.com',
      password: hashedPassword,
      role: 'DOCTOR',
      doctor: {
        create: {
          firstName: 'John',
          lastName: 'Smith',
          specialization: 'Cardiology',
          licenseNumber: 'MD123456',
          phoneNumber: '+1234567890',
          qualifications: {
            degree: 'MD',
            university: 'Harvard Medical School',
            certifications: ['Board Certified Cardiologist'],
          },
          experience: 15,
          consultationFee: 150.00,
          availability: {
            monday: [
              { start: '09:00', end: '17:00', slots: ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'] }
            ],
            tuesday: [
              { start: '09:00', end: '17:00', slots: ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'] }
            ],
            wednesday: [
              { start: '09:00', end: '17:00', slots: ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'] }
            ],
            thursday: [
              { start: '09:00', end: '17:00', slots: ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'] }
            ],
            friday: [
              { start: '09:00', end: '15:00', slots: ['09:00', '10:00', '11:00', '14:00'] }
            ],
          },
        },
      },
    },
    include: { doctor: true },
  })

  const doctor2 = await prisma.user.create({
    data: {
      email: 'dr.johnson@healthcare.com',
      password: hashedPassword,
      role: 'DOCTOR',
      doctor: {
        create: {
          firstName: 'Emily',
          lastName: 'Johnson',
          specialization: 'Pediatrics',
          licenseNumber: 'MD789012',
          phoneNumber: '+1234567891',
          qualifications: {
            degree: 'MD',
            university: 'Stanford Medical School',
            certifications: ['Board Certified Pediatrician'],
          },
          experience: 8,
          consultationFee: 120.00,
          availability: {
            monday: [
              { start: '08:00', end: '16:00', slots: ['08:00', '09:00', '10:00', '11:00', '13:00', '14:00', '15:00'] }
            ],
            wednesday: [
              { start: '08:00', end: '16:00', slots: ['08:00', '09:00', '10:00', '11:00', '13:00', '14:00', '15:00'] }
            ],
            friday: [
              { start: '08:00', end: '16:00', slots: ['08:00', '09:00', '10:00', '11:00', '13:00', '14:00', '15:00'] }
            ],
          },
        },
      },
    },
    include: { doctor: true },
  })

  // Create sample patients
  const patient1 = await prisma.user.create({
    data: {
      email: 'patient1@example.com',
      password: hashedPassword,
      role: 'PATIENT',
      patient: {
        create: {
          firstName: 'Alice',
          lastName: 'Wilson',
          dateOfBirth: new Date('1985-06-15'),
          gender: 'FEMALE',
          phoneNumber: '+1234567892',
          address: {
            street: '123 Main St',
            city: 'New York',
            state: 'NY',
            zipCode: '10001',
          },
          emergencyContact: {
            name: 'Bob Wilson',
            relationship: 'Husband',
            phoneNumber: '+1234567893',
          },
          insuranceInfo: {
            provider: 'Blue Cross Blue Shield',
            policyNumber: 'BC123456789',
            groupNumber: 'GRP001',
          },
          allergies: JSON.stringify(['Penicillin', 'Shellfish']),
          medications: JSON.stringify(['Lisinopril 10mg daily']),
        },
      },
    },
    include: { patient: true },
  })

  const patient2 = await prisma.user.create({
    data: {
      email: 'patient2@example.com',
      password: hashedPassword,
      role: 'PATIENT',
      patient: {
        create: {
          firstName: 'Michael',
          lastName: 'Brown',
          dateOfBirth: new Date('1978-03-22'),
          gender: 'MALE',
          phoneNumber: '+1234567894',
          address: {
            street: '456 Oak Ave',
            city: 'Los Angeles',
            state: 'CA',
            zipCode: '90210',
          },
          emergencyContact: {
            name: 'Sarah Brown',
            relationship: 'Wife',
            phoneNumber: '+1234567895',
          },
          allergies: JSON.stringify(['Latex']),
          medications: JSON.stringify(['Metformin 500mg twice daily']),
        },
      },
    },
    include: { patient: true },
  })

  // Create sample appointments
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  tomorrow.setHours(14, 0, 0, 0)

  const nextWeek = new Date()
  nextWeek.setDate(nextWeek.getDate() + 7)
  nextWeek.setHours(10, 0, 0, 0)

  await prisma.appointment.create({
    data: {
      patientId: patient1.patient!.id,
      doctorId: doctor1.doctor!.id,
      dateTime: tomorrow,
      type: 'IN_PERSON',
      status: 'CONFIRMED',
      reason: 'Annual checkup and blood pressure monitoring',
      notes: 'Patient reports feeling well. Regular follow-up for hypertension.',
    },
  })

  await prisma.appointment.create({
    data: {
      patientId: patient2.patient!.id,
      doctorId: doctor2.doctor!.id,
      dateTime: nextWeek,
      type: 'TELEMEDICINE',
      status: 'SCHEDULED',
      reason: 'Follow-up for diabetes management',
      meetingLink: 'https://healthcare.com/video-call/abc123',
    },
  })

  // Create sample vital signs
  const vitalsDate = new Date()
  vitalsDate.setDate(vitalsDate.getDate() - 1)

  await prisma.vitalSigns.create({
    data: {
      patientId: patient1.patient!.id,
      bloodPressure: { systolic: 120, diastolic: 80 },
      heartRate: 72,
      temperature: 98.6,
      weight: 140,
      height: 165,
      oxygenSaturation: 98,
      recordedAt: vitalsDate,
    },
  })

  await prisma.vitalSigns.create({
    data: {
      patientId: patient2.patient!.id,
      bloodPressure: { systolic: 130, diastolic: 85 },
      heartRate: 75,
      temperature: 98.4,
      weight: 180,
      height: 175,
      oxygenSaturation: 97,
      bloodSugar: 110,
      recordedAt: vitalsDate,
    },
  })

  // Create sample medical records
  const recordDate = new Date()
  recordDate.setDate(recordDate.getDate() - 30)

  await prisma.medicalRecord.create({
    data: {
      patientId: patient1.patient!.id,
      doctorId: doctor1.doctor!.id,
      appointmentDate: recordDate,
      diagnosis: 'Essential hypertension',
      symptoms: JSON.stringify(['Mild headaches', 'Fatigue']),
      treatment: 'Continue Lisinopril 10mg daily. Lifestyle modifications recommended.',
      vitals: {
        bloodPressure: { systolic: 125, diastolic: 82 },
        heartRate: 74,
        temperature: 98.6,
        weight: 142,
      },
      notes: 'Patient responded well to medication. Blood pressure under control. Recommend annual follow-up.',
      attachments: JSON.stringify([]),
    },
  })

  // Create sample prescriptions
  await prisma.prescription.create({
    data: {
      patientId: patient1.patient!.id,
      doctorId: doctor1.doctor!.id,
      medications: [
        {
          name: 'Lisinopril',
          dosage: '10mg',
          frequency: 'Once daily',
          instructions: 'Take with or without food',
        },
      ],
      dosage: '10mg',
      frequency: 'Once daily',
      duration: '90 days',
      instructions: 'Take at the same time each day. Monitor blood pressure regularly.',
      status: 'ACTIVE',
    },
  })

  await prisma.prescription.create({
    data: {
      patientId: patient2.patient!.id,
      doctorId: doctor2.doctor!.id,
      medications: [
        {
          name: 'Metformin',
          dosage: '500mg',
          frequency: 'Twice daily',
          instructions: 'Take with meals',
        },
      ],
      dosage: '500mg',
      frequency: 'Twice daily',
      duration: '90 days',
      instructions: 'Take with breakfast and dinner. Monitor blood sugar levels.',
      status: 'ACTIVE',
    },
  })

  // Create sample notifications
  await prisma.notification.create({
    data: {
      userId: patient1.id,
      type: 'APPOINTMENT_REMINDER',
      title: 'Appointment Reminder',
      message: 'You have an appointment with Dr. Smith tomorrow at 2:00 PM',
      data: {
        appointmentId: 'appointment-id-1',
        doctorName: 'Dr. John Smith',
        appointmentTime: tomorrow.toISOString(),
      },
    },
  })

  await prisma.notification.create({
    data: {
      userId: patient2.id,
      type: 'LAB_RESULTS_AVAILABLE',
      title: 'Lab Results Available',
      message: 'Your recent blood work results are now available',
      data: {
        testType: 'Comprehensive Metabolic Panel',
        completedDate: new Date().toISOString(),
      },
    },
  })

  console.log('✅ Database seeded successfully!')
  console.log('📧 Sample accounts created:')
  console.log('   Admin: admin@healthcare.com (password: password123)')
  console.log('   Doctor 1: dr.smith@healthcare.com (password: password123)')
  console.log('   Doctor 2: dr.johnson@healthcare.com (password: password123)')
  console.log('   Patient 1: patient1@example.com (password: password123)')
  console.log('   Patient 2: patient2@example.com (password: password123)')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
