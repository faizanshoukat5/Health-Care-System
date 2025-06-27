console.log('🧪 Testing basic database connection...');

const { PrismaClient } = require('@prisma/client');

async function simpleTest() {
  const prisma = new PrismaClient();
  
  try {
    const users = await prisma.user.findMany({ take: 1 });
    console.log('✅ Database connection successful');
    console.log('User count:', await prisma.user.count());
  } catch (error) {
    console.error('❌ Database error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

simpleTest();
