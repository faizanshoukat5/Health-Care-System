import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkDoctors() {
  try {
    console.log('👨‍⚕️ Checking doctors...')
    
    const doctors = await prisma.doctor.findMany({
      include: {
        user: true
      }
    })
    
    console.log(`Found ${doctors.length} doctors:`)
    
    doctors.forEach(doctor => {
      console.log(`- ${doctor.firstName} ${doctor.lastName}`)
      console.log(`  ID: ${doctor.id}`)
      console.log(`  Specialization: ${doctor.specialization}`)
      console.log(`  Active: ${doctor.isActive}`)
      console.log(`  Availability:`, doctor.availability)
      console.log()
    })
    
  } catch (error) {
    console.error('Error checking doctors:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkDoctors()
