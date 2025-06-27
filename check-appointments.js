import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkAppointments() {
  try {
    console.log('📅 Checking existing appointments...')
    
    const appointments = await prisma.appointment.findMany({
      include: {
        doctor: {
          select: {
            firstName: true,
            lastName: true
          }
        },
        patient: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      }
    })
    
    console.log(`Found ${appointments.length} appointments:`)
    
    appointments.forEach(apt => {
      console.log(`- ${apt.patient.firstName} ${apt.patient.lastName} with Dr. ${apt.doctor.firstName} ${apt.doctor.lastName}`)
      console.log(`  Date: ${apt.dateTime}`)
      console.log(`  Status: ${apt.status}`)
      console.log(`  ID: ${apt.id}`)
      console.log()
    })
    
    // Clear test appointments
    if (appointments.length > 0) {
      console.log('🗑️ Clearing test appointments...')
      await prisma.appointment.deleteMany({})
      console.log('✅ Test appointments cleared')
    }
    
  } catch (error) {
    console.error('Error checking appointments:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkAppointments()
