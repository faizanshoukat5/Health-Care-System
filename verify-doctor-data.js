const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function checkDoctorData() {
  try {
    console.log('🔍 CHECKING DOCTOR DATA')
    console.log('========================')
    
    // Check all users
    const users = await prisma.user.findMany({
      include: {
        doctor: true,
        patient: true
      }
    })
    
    console.log(`\n📊 Found ${users.length} users:`)
    users.forEach(user => {
      console.log(`   User: ${user.email} (${user.role})`)
      if (user.doctor) {
        console.log(`      → Doctor: ${user.doctor.firstName} ${user.doctor.lastName} (ID: ${user.doctor.id})`)
      }
      if (user.patient) {
        console.log(`      → Patient: ${user.patient.firstName} ${user.patient.lastName} (ID: ${user.patient.id})`)
      }
    })
    
    // Check all doctors
    const doctors = await prisma.doctor.findMany({
      include: {
        user: true
      }
    })
    
    console.log(`\n👨‍⚕️ Found ${doctors.length} doctors:`)
    doctors.forEach(doctor => {
      console.log(`   Dr. ${doctor.firstName} ${doctor.lastName}`)
      console.log(`      → ID: ${doctor.id}`)
      console.log(`      → User ID: ${doctor.userId}`)
      console.log(`      → User Email: ${doctor.user?.email || 'NOT LINKED'}`)
      console.log(`      → Specialization: ${doctor.specialization}`)
    })
    
    console.log('\n✅ Database check complete!')
    
  } catch (error) {
    console.error('❌ Database check failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkDoctorData()
