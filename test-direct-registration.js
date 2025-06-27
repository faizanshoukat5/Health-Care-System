const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

async function testRegistrationDirect() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🧪 Testing registration directly with Prisma...');
    
    // Test data
    const testEmail = `test.direct.${Date.now()}@example.com`;
    const testPassword = 'password123';
    const hashedPassword = await bcrypt.hash(testPassword, 12);
    
    console.log(`📧 Creating user: ${testEmail}`);
    
    // Create user
    const user = await prisma.user.create({
      data: {
        email: testEmail,
        password: hashedPassword,
        role: 'PATIENT',
      },
    });
    
    console.log(`✅ User created with ID: ${user.id}`);
    
    // Create patient profile
    const patient = await prisma.patient.create({
      data: {
        userId: user.id,
        firstName: 'Test',
        lastName: 'DirectUser',
        dateOfBirth: new Date('1990-01-01'),
        gender: 'OTHER',
        phoneNumber: '+1-555-0199',
        address: JSON.stringify({}),
        emergencyContact: JSON.stringify({}),
        insuranceInfo: JSON.stringify({}),
      },
    });
    
    console.log(`✅ Patient profile created with ID: ${patient.id}`);
    console.log('🎉 Direct registration test successful!');
    
    // Cleanup
    await prisma.patient.delete({ where: { id: patient.id } });
    await prisma.user.delete({ where: { id: user.id } });
    console.log('🧹 Test data cleaned up');
    
  } catch (error) {
    console.error('❌ Direct registration test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testRegistrationDirect();
