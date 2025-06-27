const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

// Comprehensive doctor data
const doctorData = [
  // Cardiology
  {
    email: 'dr.smith.cardio@hospital.com',
    firstName: 'John',
    lastName: 'Smith',
    specialization: 'Cardiology',
    licenseNumber: 'MD-CARD-001',
    phoneNumber: '+1-555-0101',
    experience: 15,
    consultationFee: 250,
    qualifications: {
      education: 'Harvard Medical School, Cardiology Fellowship at Mayo Clinic',
      certifications: ['Board Certified Cardiologist', 'Interventional Cardiology'],
      awards: ['Top Doctor 2023', 'Excellence in Patient Care']
    }
  },
  {
    email: 'dr.johnson.cardio@hospital.com',
    firstName: 'Sarah',
    lastName: 'Johnson',
    specialization: 'Cardiology',
    licenseNumber: 'MD-CARD-002',
    phoneNumber: '+1-555-0102',
    experience: 12,
    consultationFee: 225,
    qualifications: {
      education: 'Johns Hopkins Medical School, Cardiothoracic Surgery Fellowship',
      certifications: ['Board Certified Cardiologist', 'Cardiac Surgery'],
      awards: ['Rising Star Award 2022']
    }
  },
  
  // General Medicine
  {
    email: 'dr.brown.general@hospital.com',
    firstName: 'Michael',
    lastName: 'Brown',
    specialization: 'General Medicine',
    licenseNumber: 'MD-GEN-001',
    phoneNumber: '+1-555-0103',
    experience: 8,
    consultationFee: 150,
    qualifications: {
      education: 'Stanford Medical School, Internal Medicine Residency',
      certifications: ['Board Certified Internal Medicine', 'Primary Care'],
      awards: ['Patient Choice Award 2023']
    }
  },
  {
    email: 'dr.davis.general@hospital.com',
    firstName: 'Emily',
    lastName: 'Davis',
    specialization: 'General Medicine',
    licenseNumber: 'MD-GEN-002',
    phoneNumber: '+1-555-0104',
    experience: 10,
    consultationFee: 175,
    qualifications: {
      education: 'UCLA Medical School, Family Medicine Residency',
      certifications: ['Board Certified Family Medicine', 'Preventive Care'],
      awards: ['Excellence in Primary Care 2022']
    }
  },
  
  // Dermatology
  {
    email: 'dr.wilson.derm@hospital.com',
    firstName: 'Robert',
    lastName: 'Wilson',
    specialization: 'Dermatology',
    licenseNumber: 'MD-DERM-001',
    phoneNumber: '+1-555-0105',
    experience: 18,
    consultationFee: 200,
    qualifications: {
      education: 'NYU Medical School, Dermatology Residency at Mount Sinai',
      certifications: ['Board Certified Dermatologist', 'Mohs Surgery'],
      awards: ['Dermatology Excellence Award 2023']
    }
  },
  {
    email: 'dr.anderson.derm@hospital.com',
    firstName: 'Lisa',
    lastName: 'Anderson',
    specialization: 'Dermatology',
    licenseNumber: 'MD-DERM-002',
    phoneNumber: '+1-555-0106',
    experience: 14,
    consultationFee: 185,
    qualifications: {
      education: 'University of Pennsylvania, Pediatric Dermatology Fellowship',
      certifications: ['Board Certified Dermatologist', 'Pediatric Dermatology'],
      awards: ['Young Physician Award 2021']
    }
  },
  
  // Neurology
  {
    email: 'dr.martinez.neuro@hospital.com',
    firstName: 'Carlos',
    lastName: 'Martinez',
    specialization: 'Neurology',
    licenseNumber: 'MD-NEURO-001',
    phoneNumber: '+1-555-0107',
    experience: 16,
    consultationFee: 275,
    qualifications: {
      education: 'Yale Medical School, Neurology Residency at UCSF',
      certifications: ['Board Certified Neurologist', 'Epilepsy Specialist'],
      awards: ['Neurology Research Excellence 2023']
    }
  },
  
  // Pediatrics
  {
    email: 'dr.taylor.peds@hospital.com',
    firstName: 'Jennifer',
    lastName: 'Taylor',
    specialization: 'Pediatrics',
    licenseNumber: 'MD-PEDS-001',
    phoneNumber: '+1-555-0108',
    experience: 11,
    consultationFee: 160,
    qualifications: {
      education: 'University of Chicago, Pediatrics Residency at Children\'s Hospital',
      certifications: ['Board Certified Pediatrician', 'Child Development'],
      awards: ['Pediatric Care Excellence 2022']
    }
  },
  {
    email: 'dr.white.peds@hospital.com',
    firstName: 'David',
    lastName: 'White',
    specialization: 'Pediatrics',
    licenseNumber: 'MD-PEDS-002',
    phoneNumber: '+1-555-0109',
    experience: 9,
    consultationFee: 145,
    qualifications: {
      education: 'Emory Medical School, Pediatric Emergency Medicine Fellowship',
      certifications: ['Board Certified Pediatrician', 'Emergency Medicine'],
      awards: ['Outstanding Service Award 2023']
    }
  },
  
  // Orthopedics
  {
    email: 'dr.garcia.ortho@hospital.com',
    firstName: 'Maria',
    lastName: 'Garcia',
    specialization: 'Orthopedics',
    licenseNumber: 'MD-ORTHO-001',
    phoneNumber: '+1-555-0110',
    experience: 13,
    consultationFee: 220,
    qualifications: {
      education: 'University of Miami, Orthopedic Surgery Residency',
      certifications: ['Board Certified Orthopedic Surgeon', 'Sports Medicine'],
      awards: ['Surgical Excellence Award 2023']
    }
  },
  
  // Psychiatry
  {
    email: 'dr.thompson.psych@hospital.com',
    firstName: 'James',
    lastName: 'Thompson',
    specialization: 'Psychiatry',
    licenseNumber: 'MD-PSYCH-001',
    phoneNumber: '+1-555-0111',
    experience: 20,
    consultationFee: 190,
    qualifications: {
      education: 'Columbia Medical School, Psychiatry Residency at McLean Hospital',
      certifications: ['Board Certified Psychiatrist', 'Addiction Medicine'],
      awards: ['Mental Health Advocacy Award 2023']
    }
  },
  
  // Oncology
  {
    email: 'dr.lee.onco@hospital.com',
    firstName: 'Steven',
    lastName: 'Lee',
    specialization: 'Oncology',
    licenseNumber: 'MD-ONCO-001',
    phoneNumber: '+1-555-0112',
    experience: 17,
    consultationFee: 300,
    qualifications: {
      education: 'Duke Medical School, Medical Oncology Fellowship at MD Anderson',
      certifications: ['Board Certified Medical Oncologist', 'Hematology'],
      awards: ['Cancer Research Excellence 2023']
    }
  },
  
  // Endocrinology
  {
    email: 'dr.clark.endo@hospital.com',
    firstName: 'Rachel',
    lastName: 'Clark',
    specialization: 'Endocrinology',
    licenseNumber: 'MD-ENDO-001',
    phoneNumber: '+1-555-0113',
    experience: 14,
    consultationFee: 210,
    qualifications: {
      education: 'Northwestern Medical School, Endocrinology Fellowship',
      certifications: ['Board Certified Endocrinologist', 'Diabetes Specialist'],
      awards: ['Diabetes Care Excellence 2022']
    }
  },
  
  // Gastroenterology
  {
    email: 'dr.rodriguez.gastro@hospital.com',
    firstName: 'Antonio',
    lastName: 'Rodriguez',
    specialization: 'Gastroenterology',
    licenseNumber: 'MD-GASTRO-001',
    phoneNumber: '+1-555-0114',
    experience: 12,
    consultationFee: 240,
    qualifications: {
      education: 'Baylor Medical School, Gastroenterology Fellowship',
      certifications: ['Board Certified Gastroenterologist', 'Advanced Endoscopy'],
      awards: ['GI Excellence Award 2023']
    }
  },
  
  // Pulmonology
  {
    email: 'dr.hall.pulmo@hospital.com',
    firstName: 'Patricia',
    lastName: 'Hall',
    specialization: 'Pulmonology',
    licenseNumber: 'MD-PULMO-001',
    phoneNumber: '+1-555-0115',
    experience: 15,
    consultationFee: 230,
    qualifications: {
      education: 'University of Washington, Pulmonology Fellowship',
      certifications: ['Board Certified Pulmonologist', 'Critical Care'],
      awards: ['Respiratory Care Excellence 2023']
    }
  },
  
  // Urology
  {
    email: 'dr.young.uro@hospital.com',
    firstName: 'Kevin',
    lastName: 'Young',
    specialization: 'Urology',
    licenseNumber: 'MD-URO-001',
    phoneNumber: '+1-555-0116',
    experience: 11,
    consultationFee: 195,
    qualifications: {
      education: 'University of Texas, Urology Residency',
      certifications: ['Board Certified Urologist', 'Robotic Surgery'],
      awards: ['Innovative Surgery Award 2022']
    }
  }
]

async function main() {
  console.log('🏥 Starting comprehensive doctor seeding...')
  
  // Generate weekly availability schedule
  const generateAvailability = () => {
    const schedule = {}
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    
    days.forEach(day => {
      const isWeekend = day === 'saturday' || day === 'sunday'
      const worksProbability = isWeekend ? 0.3 : 0.9 // 30% work weekends, 90% work weekdays
      
      if (Math.random() < worksProbability) {
        const startHour = isWeekend ? 9 + Math.floor(Math.random() * 2) : 8 + Math.floor(Math.random() * 2)
        const endHour = isWeekend ? 15 + Math.floor(Math.random() * 3) : 16 + Math.floor(Math.random() * 3)
        
        schedule[day] = {
          start: `${startHour.toString().padStart(2, '0')}:00`,
          end: `${endHour.toString().padStart(2, '0')}:00`,
          available: true
        }
      } else {
        schedule[day] = { available: false }
      }
    })
    
    return schedule
  }

  let createdCount = 0
  
  for (const doctor of doctorData) {
    try {
      // Hash password
      const hashedPassword = await bcrypt.hash('doctor123', 10)
      
      // Create user first
      const user = await prisma.user.create({
        data: {
          email: doctor.email,
          password: hashedPassword,
          role: 'DOCTOR'
        }
      })
      
      // Create doctor profile
      await prisma.doctor.create({
        data: {
          userId: user.id,
          firstName: doctor.firstName,
          lastName: doctor.lastName,
          specialization: doctor.specialization,
          licenseNumber: doctor.licenseNumber,
          phoneNumber: doctor.phoneNumber,
          qualifications: doctor.qualifications,
          experience: doctor.experience,
          consultationFee: doctor.consultationFee,
          availability: generateAvailability(),
          isActive: true
        }
      })
      
      createdCount++
      console.log(`✅ Created doctor: Dr. ${doctor.firstName} ${doctor.lastName} (${doctor.specialization})`)
      
    } catch (error) {
      console.error(`❌ Error creating doctor ${doctor.firstName} ${doctor.lastName}:`, error.message)
    }
  }
  
  console.log(`\n🎉 Successfully created ${createdCount} doctors!`)
  console.log('\n📊 Summary by Specialization:')
  
  const specializations = {}
  doctorData.forEach(doctor => {
    specializations[doctor.specialization] = (specializations[doctor.specialization] || 0) + 1
  })
  
  Object.entries(specializations).forEach(([spec, count]) => {
    console.log(`   ${spec}: ${count} doctor(s)`)
  })
  
  console.log('\n🔐 All doctors can login with password: doctor123')
  console.log('\n📋 Doctor data includes:')
  console.log('   • Comprehensive qualifications and education')
  console.log('   • Realistic experience levels (8-20 years)')
  console.log('   • Variable consultation fees ($145-$300)')
  console.log('   • Dynamic weekly availability schedules')
  console.log('   • Multiple specializations covered')
  console.log('   • Professional awards and certifications')
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
