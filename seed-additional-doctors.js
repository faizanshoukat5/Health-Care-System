const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

const additionalDoctors = [
  {
    firstName: 'Sarah',
    lastName: 'Johnson',
    email: 'dr.sarah.johnson@healthcare.com',
    specialization: 'Dermatology',
    licenseNumber: 'MD789012789',
    phoneNumber: '+1-555-0201',
    experience: 12,
    consultationFee: 250,
    qualifications: {
      degree: 'MD',
      university: 'Stanford University School of Medicine',
      residency: 'Stanford University Medical Center',
      fellowship: 'Mohs Surgery Fellowship',
      boardCertifications: [
        'American Board of Dermatology',
        'American Board of Dermatopathology'
      ]
    }
  },
  {
    firstName: 'Michael',
    lastName: 'Chen',
    email: 'dr.michael.chen@healthcare.com',
    specialization: 'Pediatrics',
    licenseNumber: 'MD345678901',
    phoneNumber: '+1-555-0202',
    experience: 8,
    consultationFee: 180,
    qualifications: {
      degree: 'MD',
      university: 'UCLA David Geffen School of Medicine',
      residency: 'Children\'s Hospital Los Angeles',
      boardCertifications: [
        'American Board of Pediatrics'
      ]
    }
  },
  {
    firstName: 'Emily',
    lastName: 'Rodriguez',
    email: 'dr.emily.rodriguez@healthcare.com',
    specialization: 'Psychiatry',
    licenseNumber: 'MD901234567',
    phoneNumber: '+1-555-0203',
    experience: 15,
    consultationFee: 300,
    qualifications: {
      degree: 'MD',
      university: 'Yale School of Medicine',
      residency: 'Yale-New Haven Hospital',
      fellowship: 'Child and Adolescent Psychiatry',
      boardCertifications: [
        'American Board of Psychiatry and Neurology'
      ]
    }
  },
  {
    firstName: 'David',
    lastName: 'Thompson',
    email: 'dr.david.thompson@healthcare.com',
    specialization: 'Orthopedics',
    licenseNumber: 'MD567890123',
    phoneNumber: '+1-555-0204',
    experience: 20,
    consultationFee: 350,
    qualifications: {
      degree: 'MD',
      university: 'Johns Hopkins School of Medicine',
      residency: 'Johns Hopkins Hospital',
      fellowship: 'Sports Medicine Fellowship',
      boardCertifications: [
        'American Board of Orthopedic Surgery'
      ]
    }
  },
  {
    firstName: 'Lisa',
    lastName: 'Wang',
    email: 'dr.lisa.wang@healthcare.com',
    specialization: 'Neurology',
    licenseNumber: 'MD234567890',
    phoneNumber: '+1-555-0205',
    experience: 14,
    consultationFee: 280,
    qualifications: {
      degree: 'MD',
      university: 'University of Pennsylvania School of Medicine',
      residency: 'Hospital of the University of Pennsylvania',
      fellowship: 'Stroke and Cerebrovascular Disease',
      boardCertifications: [
        'American Board of Psychiatry and Neurology'
      ]
    }
  },
  {
    firstName: 'Robert',
    lastName: 'Garcia',
    email: 'dr.robert.garcia@healthcare.com',
    specialization: 'General Medicine',
    licenseNumber: 'MD678901234',
    phoneNumber: '+1-555-0206',
    experience: 10,
    consultationFee: 150,
    qualifications: {
      degree: 'MD',
      university: 'University of California, San Francisco',
      residency: 'UCSF Medical Center',
      boardCertifications: [
        'American Board of Family Medicine'
      ]
    }
  },
  {
    firstName: 'Jennifer',
    lastName: 'Lee',
    email: 'dr.jennifer.lee@healthcare.com',
    specialization: 'Endocrinology',
    licenseNumber: 'MD890123456',
    phoneNumber: '+1-555-0207',
    experience: 11,
    consultationFee: 220,
    qualifications: {
      degree: 'MD',
      university: 'Northwestern University Feinberg School of Medicine',
      residency: 'Northwestern Memorial Hospital',
      fellowship: 'Diabetes and Metabolism Fellowship',
      boardCertifications: [
        'American Board of Internal Medicine',
        'American Board of Endocrinology'
      ]
    }
  },
  {
    firstName: 'Christopher',
    lastName: 'Brown',
    email: 'dr.christopher.brown@healthcare.com',
    specialization: 'Pulmonology',
    licenseNumber: 'MD012345678',
    phoneNumber: '+1-555-0208',
    experience: 16,
    consultationFee: 260,
    qualifications: {
      degree: 'MD',
      university: 'University of Michigan Medical School',
      residency: 'University of Michigan Hospital',
      fellowship: 'Pulmonary and Critical Care Medicine',
      boardCertifications: [
        'American Board of Internal Medicine',
        'American Board of Pulmonary Disease'
      ]
    }
  },
  {
    firstName: 'Amanda',
    lastName: 'Wilson',
    email: 'dr.amanda.wilson@healthcare.com',
    specialization: 'Gastroenterology',
    licenseNumber: 'MD456789012',
    phoneNumber: '+1-555-0209',
    experience: 13,
    consultationFee: 240,
    qualifications: {
      degree: 'MD',
      university: 'Mayo Clinic College of Medicine',
      residency: 'Mayo Clinic',
      fellowship: 'Gastroenterology and Hepatology',
      boardCertifications: [
        'American Board of Internal Medicine',
        'American Board of Gastroenterology'
      ]
    }
  },
  {
    firstName: 'Thomas',
    lastName: 'Davis',
    email: 'dr.thomas.davis@healthcare.com',
    specialization: 'Urology',
    licenseNumber: 'MD789123456',
    phoneNumber: '+1-555-0210',
    experience: 18,
    consultationFee: 320,
    qualifications: {
      degree: 'MD',
      university: 'Duke University School of Medicine',
      residency: 'Duke University Hospital',
      fellowship: 'Urologic Oncology',
      boardCertifications: [
        'American Board of Urology'
      ]
    }
  }
]

async function seedAdditionalDoctors() {
  try {
    console.log('Starting to seed additional doctors...')

    for (const doctorData of additionalDoctors) {
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
        monday: { isAvailable: true, startTime: '09:00', endTime: '17:00' },
        tuesday: { isAvailable: true, startTime: '09:00', endTime: '17:00' },
        wednesday: { isAvailable: true, startTime: '09:00', endTime: '17:00' },
        thursday: { isAvailable: true, startTime: '09:00', endTime: '17:00' },
        friday: { isAvailable: true, startTime: '09:00', endTime: '15:00' },
        saturday: { isAvailable: Math.random() > 0.5 },
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

    console.log('✅ Additional doctors seeded successfully!')
    
    // Show total count
    const totalDoctors = await prisma.doctor.count()
    console.log(`Total doctors in database: ${totalDoctors}`)

  } catch (error) {
    console.error('❌ Error seeding additional doctors:', error)
  } finally {
    await prisma.$disconnect()
  }
}

seedAdditionalDoctors()
