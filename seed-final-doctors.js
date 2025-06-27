const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

const finalDoctors = [
  {
    firstName: 'Rachel',
    lastName: 'Kim',
    email: 'dr.rachel.kim@healthcare.com',
    specialization: 'Oncology',
    licenseNumber: 'MD111222333',
    phoneNumber: '+1-555-0211',
    experience: 17,
    consultationFee: 400,
    qualifications: {
      degree: 'MD',
      university: 'Memorial Sloan Kettering Cancer Center',
      residency: 'Memorial Sloan Kettering',
      fellowship: 'Medical Oncology Fellowship',
      boardCertifications: [
        'American Board of Internal Medicine',
        'American Board of Medical Oncology'
      ]
    }
  },
  {
    firstName: 'Mark',
    lastName: 'Anderson',
    email: 'dr.mark.anderson@healthcare.com',
    specialization: 'Radiology',
    licenseNumber: 'MD444555666',
    phoneNumber: '+1-555-0212',
    experience: 14,
    consultationFee: 280,
    qualifications: {
      degree: 'MD',
      university: 'University of California, Los Angeles',
      residency: 'UCLA Medical Center',
      fellowship: 'Interventional Radiology',
      boardCertifications: [
        'American Board of Radiology'
      ]
    }
  },
  {
    firstName: 'Victoria',
    lastName: 'Martinez',
    email: 'dr.victoria.martinez@healthcare.com',
    specialization: 'Surgery',
    licenseNumber: 'MD777888999',
    phoneNumber: '+1-555-0213',
    experience: 22,
    consultationFee: 450,
    qualifications: {
      degree: 'MD',
      university: 'Cleveland Clinic Lerner College of Medicine',
      residency: 'Cleveland Clinic',
      fellowship: 'Cardiothoracic Surgery',
      boardCertifications: [
        'American Board of Surgery',
        'American Board of Thoracic Surgery'
      ]
    }
  }
]

async function seedFinalDoctors() {
  try {
    console.log('Starting to seed final doctors...')

    for (const doctorData of finalDoctors) {
      // Check if doctor already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: doctorData.email }
      })

      if (existingUser) {
        console.log(`Doctor ${doctorData.firstName} ${doctorData.lastName} already exists, skipping...`)
        continue
      }

      // Create user
      const hashedPassword = await bcrypt.hash('password123', 12)
      const user = await prisma.user.create({
        data: {
          email: doctorData.email,
          password: hashedPassword,
          role: 'DOCTOR'
        }
      })

      // Create availability schedule
      const availability = {
        monday: { isAvailable: true, startTime: '08:00', endTime: '17:00' },
        tuesday: { isAvailable: true, startTime: '08:00', endTime: '17:00' },
        wednesday: { isAvailable: true, startTime: '08:00', endTime: '17:00' },
        thursday: { isAvailable: true, startTime: '08:00', endTime: '17:00' },
        friday: { isAvailable: true, startTime: '08:00', endTime: '16:00' },
        saturday: { isAvailable: Math.random() > 0.7 },
        sunday: { isAvailable: false }
      }

      // Add weekend hours for some doctors
      if (availability.saturday.isAvailable) {
        availability.saturday = { isAvailable: true, startTime: '09:00', endTime: '13:00' }
      }

      // Create doctor
      await prisma.doctor.create({
        data: {
          userId: user.id,
          firstName: doctorData.firstName,
          lastName: doctorData.lastName,
          specialization: doctorData.specialization,
          licenseNumber: doctorData.licenseNumber,
          phoneNumber: doctorData.phoneNumber,
          qualifications: doctorData.qualifications,
          experience: doctorData.experience,
          consultationFee: doctorData.consultationFee,
          availability: availability,
          isActive: true
        }
      })

      console.log(`Created doctor: Dr. ${doctorData.firstName} ${doctorData.lastName} (${doctorData.specialization})`)
    }

    console.log('✅ Final doctors seeded successfully!')
    
    // Show total count and specializations
    const totalDoctors = await prisma.doctor.count()
    const specializations = await prisma.doctor.groupBy({
      by: ['specialization'],
      _count: {
        specialization: true
      }
    })
    
    console.log(`Total doctors in database: ${totalDoctors}`)
    console.log('Specializations available:')
    specializations.forEach(spec => {
      console.log(`  - ${spec.specialization}: ${spec._count.specialization} doctors`)
    })

  } catch (error) {
    console.error('❌ Error seeding final doctors:', error)
  } finally {
    await prisma.$disconnect()
  }
}

seedFinalDoctors()
