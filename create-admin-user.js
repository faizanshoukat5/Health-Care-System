/**
 * Admin User Creation Script
 * 
 * This script creates an admin user for the healthcare platform.
 * Run this script when you need to create an admin account.
 */

const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function createAdminUser() {
  try {
    console.log('🔨 Creating admin user...')

    // Admin user details
    const adminData = {
      email: 'admin@healthcare.com',
      password: 'admin123456', // Change this password!
      firstName: 'System',
      lastName: 'Administrator',
      role: 'ADMIN'
    }

    // Check if admin already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminData.email }
    })

    if (existingAdmin) {
      console.log('⚠️  Admin user already exists with email:', adminData.email)
      console.log('✅ Admin ID:', existingAdmin.id)
      return existingAdmin
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(adminData.password, 12)

    // Create admin user
    const adminUser = await prisma.user.create({
      data: {
        email: adminData.email,
        password: hashedPassword,
        firstName: adminData.firstName,
        lastName: adminData.lastName,
        role: adminData.role,
        isVerified: true, // Admin is automatically verified
        isActive: true,
      }
    })

    console.log('✅ Admin user created successfully!')
    console.log('📧 Email:', adminData.email)
    console.log('🔑 Password:', adminData.password)
    console.log('🆔 User ID:', adminUser.id)
    console.log('')
    console.log('🚨 IMPORTANT: Change the admin password after first login!')
    console.log('🌐 Access admin panel at: http://localhost:3001/admin/dashboard')

    return adminUser

  } catch (error) {
    console.error('❌ Failed to create admin user:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Alternative admin user (in case you want multiple admins)
async function createAlternativeAdmin() {
  try {
    const altAdminData = {
      email: 'superadmin@healthcare.com',
      password: 'SuperAdmin2024!',
      firstName: 'Super',
      lastName: 'Admin',
      role: 'ADMIN'
    }

    const existingAdmin = await prisma.user.findUnique({
      where: { email: altAdminData.email }
    })

    if (existingAdmin) {
      console.log('⚠️  Alternative admin already exists')
      return existingAdmin
    }

    const hashedPassword = await bcrypt.hash(altAdminData.password, 12)

    const adminUser = await prisma.user.create({
      data: {
        email: altAdminData.email,
        password: hashedPassword,
        firstName: altAdminData.firstName,
        lastName: altAdminData.lastName,
        role: altAdminData.role,
        isVerified: true,
        isActive: true,
      }
    })

    console.log('✅ Alternative admin created!')
    console.log('📧 Email:', altAdminData.email)
    console.log('🔑 Password:', altAdminData.password)

    return adminUser

  } catch (error) {
    console.error('❌ Failed to create alternative admin:', error)
  }
}

// Run the script
if (require.main === module) {
  createAdminUser()
    .then(() => {
      console.log('')
      console.log('🎉 Admin setup complete!')
      console.log('')
      console.log('📋 Next steps:')
      console.log('1. Start the development server: npm run dev')
      console.log('2. Go to: http://localhost:3001/login')
      console.log('3. Log in with admin credentials')
      console.log('4. Navigate to: http://localhost:3001/admin/dashboard')
      console.log('5. Change the admin password in settings!')
    })
    .catch((error) => {
      console.error('💥 Setup failed:', error)
      process.exit(1)
    })
}

module.exports = { createAdminUser, createAlternativeAdmin }
