const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function checkAndCreateAdmin() {
  try {
    console.log('Checking for admin users...')
    
    const adminUsers = await prisma.user.findMany({
      where: { role: 'ADMIN' },
      include: { admin: true }
    })
    
    console.log(`Admin users found: ${adminUsers.length}`)
    
    if (adminUsers.length > 0) {
      console.log('Sample admin user:')
      adminUsers.forEach(admin => {
        console.log(`- ${admin.email} (${admin.admin?.firstName} ${admin.admin?.lastName})`)
      })
    } else {
      console.log('No admin users found. Creating default admin...')
      
      const hashedPassword = await bcrypt.hash('admin123', 12)
      
      const user = await prisma.user.create({
        data: {
          email: 'admin@healthcare.com',
          password: hashedPassword,
          role: 'ADMIN'
        }
      })
      
      const admin = await prisma.admin.create({
        data: {
          userId: user.id,
          firstName: 'System',
          lastName: 'Administrator'
        }
      })
      
      console.log('✅ Created admin user:')
      console.log(`Email: ${user.email}`)
      console.log(`Password: admin123`)
      console.log(`Name: ${admin.firstName} ${admin.lastName}`)
    }
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkAndCreateAdmin()
