const { PrismaClient } = require('@prisma/client');

async function checkDatabase() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 Checking database state...');
    
    const userCount = await prisma.user.count();
    console.log(`👥 Total users: ${userCount}`);
    
    const patientCount = await prisma.patient.count();
    console.log(`🏥 Total patients: ${patientCount}`);
    
    const doctorCount = await prisma.doctor.count();
    console.log(`👨‍⚕️ Total doctors: ${doctorCount}`);
    
    // Show some recent users
    const recentUsers = await prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        patient: true,
        doctor: true
      }
    });
    
    console.log('\n📋 Recent users:');
    recentUsers.forEach(user => {
      console.log(`- ${user.email} (${user.role}) - Created: ${user.createdAt.toISOString()}`);
    });
    
  } catch (error) {
    console.error('❌ Database error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase();
