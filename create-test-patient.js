import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function createTestPatient() {
  try {
    console.log('Creating test patient...')
    
    // Check if patient exists
    const existingUser = await prisma.user.findUnique({
      where: { email: 'patient@healthcare.com' }
    })
    
    if (existingUser) {
      console.log('✅ Test patient already exists')
      return
    }
    
    // Create test patient
    const patientUser = await prisma.user.create({
      data: {
        email: 'patient@healthcare.com',
        password: await bcrypt.hash('patient123', 12),
        role: 'PATIENT',
      },
    })

    const patient = await prisma.patient.create({
      data: {
        userId: patientUser.id,
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: new Date('1990-01-15'),
        gender: 'MALE',
        phoneNumber: '+1-555-0123',
        address: {
          street: '123 Main St',
          city: 'Springfield',
          state: 'IL',
          zipCode: '62701',
          country: 'USA'
        },
        emergencyContact: {
          name: 'Jane Doe',
          relationship: 'Spouse',
          phoneNumber: '+1-555-0124'
        },
        insuranceInfo: {
          provider: 'HealthFirst Insurance',
          policyNumber: 'HF123456789',
          groupNumber: 'GRP001'
        }
      },
    })

    console.log(`✅ Test patient created: ${patient.firstName} ${patient.lastName}`)
    console.log(`   Patient ID: ${patient.id}`)
    console.log(`   User ID: ${patientUser.id}`)
    
  } catch (error) {
    console.error('Error creating test patient:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createTestPatient()
