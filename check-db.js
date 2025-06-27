import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkDatabase() {
  try {
    console.log('🔍 Checking database...')
    
    const userCount = await prisma.user.count()
    console.log(`👥 Users: ${userCount}`)
    
    const patientCount = await prisma.patient.count()
    console.log(`🏥 Patients: ${patientCount}`)
    
    const doctorCount = await prisma.doctor.count()
    console.log(`👨‍⚕️ Doctors: ${doctorCount}`)
    
    const appointmentCount = await prisma.appointment.count()
    console.log(`📅 Appointments: ${appointmentCount}`)
    
    // Check if test user exists
    const testPatient = await prisma.user.findFirst({
      where: { email: 'patient@healthcare.com' },
      include: { patient: true }
    })
    
    if (testPatient) {
      console.log(`✅ Test patient found: ${testPatient.patient?.firstName} ${testPatient.patient?.lastName}`)
      console.log(`   Patient ID: ${testPatient.patient?.id}`)
    } else {
      console.log('❌ Test patient not found')
    }
    
  } catch (error) {
    console.error('Error checking database:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkDatabase()
