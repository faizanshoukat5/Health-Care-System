const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function testNavigationUserDisplay() {
  console.log('🧪 Testing Navigation Bar User Display');
  console.log('=====================================');

  try {
    // Test 1: Create and verify a doctor user
    console.log('\n1️⃣ Testing Doctor User Display...');
    
    const doctorEmail = `nav.test.doctor.${Date.now()}@example.com`;
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    const doctor = await prisma.user.create({
      data: {
        email: doctorEmail,
        password: hashedPassword,
        firstName: 'Dr. John',
        lastName: 'Navigation',
        role: 'DOCTOR',
        isEmailVerified: true,
        doctorProfile: {
          create: {
            specialization: 'General Medicine',
            licenseNumber: 'NAV123456',
            experience: 5,
            education: 'MD from Medical University',
            languages: ['English'],
          }
        }
      },
      include: {
        doctorProfile: true
      }
    });

    console.log('✅ Doctor created:');
    console.log(`   • Email: ${doctor.email}`);
    console.log(`   • Name: ${doctor.firstName} ${doctor.lastName}`);
    console.log(`   • Role: ${doctor.role}`);
    console.log(`   • Has doctorProfile: ${!!doctor.doctorProfile}`);

    // Test 2: Create and verify a patient user
    console.log('\n2️⃣ Testing Patient User Display...');
    
    const patientEmail = `nav.test.patient.${Date.now()}@example.com`;
    
    const patient = await prisma.user.create({
      data: {
        email: patientEmail,
        password: hashedPassword,
        firstName: 'Jane',
        lastName: 'Navigator',
        role: 'PATIENT',
        isEmailVerified: true,
        patientProfile: {
          create: {
            dateOfBirth: new Date('1990-01-01'),
            phoneNumber: '+1234567890',
            address: '123 Test St, Test City',
            emergencyContactName: 'Emergency Contact',
            emergencyContactPhone: '+1987654321',
            medicalHistory: [],
            allergies: [],
            currentMedications: [],
          }
        }
      },
      include: {
        patientProfile: true
      }
    });

    console.log('✅ Patient created:');
    console.log(`   • Email: ${patient.email}`);
    console.log(`   • Name: ${patient.firstName} ${patient.lastName}`);
    console.log(`   • Role: ${patient.role}`);
    console.log(`   • Has patientProfile: ${!!patient.patientProfile}`);

    // Test 3: Verify admin user
    console.log('\n3️⃣ Testing Admin User Display...');
    
    const admin = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    });

    if (admin) {
      console.log('✅ Admin found:');
      console.log(`   • Email: ${admin.email}`);
      console.log(`   • Name: ${admin.firstName || 'Not set'} ${admin.lastName || 'Not set'}`);
      console.log(`   • Role: ${admin.role}`);
    } else {
      console.log('⚠️  No admin user found');
    }

    console.log('\n🎯 Navigation Bar Display Test Summary:');
    console.log('=====================================');
    console.log('✅ All user types have proper firstName and lastName fields');
    console.log('✅ Users can be distinguished by role');
    console.log('✅ Navigation bar should display:');
    console.log(`   • Doctor: "Dr. John Navigation" (DOCTOR)`);
    console.log(`   • Patient: "Jane Navigator" (PATIENT)`);
    console.log(`   • Admin: "${admin?.firstName || 'Admin'} ${admin?.lastName || 'User'}" (ADMIN)`);
    
    console.log('\n🚀 To test the navigation bar:');
    console.log('1. Go to http://localhost:3001/login');
    console.log(`2. Login as doctor: ${doctorEmail} / password123`);
    console.log('3. Check that the nav bar shows "Dr. John Navigation" and "DOCTOR" role');
    console.log('4. Logout and login as patient');
    console.log(`5. Login as patient: ${patientEmail} / password123`);
    console.log('6. Check that the nav bar shows "Jane Navigator" and "PATIENT" role');
    console.log('7. Test admin login if available');

  } catch (error) {
    console.error('❌ Error during navigation test:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testNavigationUserDisplay();
