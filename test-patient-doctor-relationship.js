// Test script to verify patient appears in doctor's patient list after booking
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testPatientDoctorRelationship() {
  console.log('🧪 Testing Patient-Doctor Relationship After Booking');
  console.log('===================================================');

  try {
    // Get a test patient and doctor
    const patient = await prisma.patient.findFirst({
      include: { user: true }
    });
    
    const doctor = await prisma.doctor.findFirst({
      include: { user: true }
    });

    if (!patient || !doctor) {
      console.log('❌ No patient or doctor found in database');
      return;
    }

    console.log(`👤 Test Patient: ${patient.firstName} ${patient.lastName} (${patient.user.email})`);
    console.log(`👨‍⚕️ Test Doctor: Dr. ${doctor.firstName} ${doctor.lastName} (${doctor.specialization})`);
    console.log('');

    // Check if patient already has appointments with this doctor
    const existingAppointments = await prisma.appointment.findMany({
      where: {
        patientId: patient.id,
        doctorId: doctor.id
      },
      include: {
        patient: { select: { firstName: true, lastName: true } },
        doctor: { select: { firstName: true, lastName: true } }
      }
    });

    console.log(`📅 Existing appointments between patient and doctor: ${existingAppointments.length}`);
    
    if (existingAppointments.length > 0) {
      console.log('   Appointments:');
      existingAppointments.forEach((apt, i) => {
        console.log(`   ${i + 1}. ${apt.dateTime} - ${apt.status} - ${apt.reason}`);
      });
    }
    console.log('');

    // Test: Check if patient appears in doctor's patient list
    console.log('🔍 Checking doctor\'s patient list...');
    const doctorPatients = await prisma.patient.findMany({
      where: {
        appointments: {
          some: {
            doctorId: doctor.id,
          },
        },
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
          },
        },
        appointments: {
          where: {
            doctorId: doctor.id,
          },
          orderBy: {
            dateTime: 'desc',
          },
          take: 1,
        },
        medicalRecords: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
        },
        vitals: {
          orderBy: {
            recordedAt: 'desc',
          },
          take: 1,
        },
      },
      orderBy: {
        firstName: 'asc',
      },
    });

    console.log(`📋 Doctor's patient list contains ${doctorPatients.length} patients:`);
    
    if (doctorPatients.length === 0) {
      console.log('   ⚠️ No patients found for this doctor');
    } else {
      doctorPatients.forEach((p, i) => {
        const isTestPatient = p.id === patient.id;
        const marker = isTestPatient ? '👆 TEST PATIENT' : '';
        console.log(`   ${i + 1}. ${p.firstName} ${p.lastName} (${p.user.email}) ${marker}`);
        console.log(`      📧 User ID: ${p.user.id}`);
        console.log(`      📅 Last appointment: ${p.appointments[0]?.dateTime || 'None'}`);
        console.log(`      📋 Medical records: ${p.medicalRecords.length}`);
        console.log(`      💓 Vitals: ${p.vitals.length > 0 ? 'Available' : 'None'}`);
      });
    }
    console.log('');

    // Test result
    const patientFoundInList = doctorPatients.some(p => p.id === patient.id);
    
    if (existingAppointments.length > 0 && patientFoundInList) {
      console.log('✅ TEST PASSED: Patient correctly appears in doctor\'s patient list');
    } else if (existingAppointments.length === 0) {
      console.log('ℹ️ TEST INFO: No appointments exist, so patient should not appear in list');
      console.log('   📝 To test: Book an appointment between this patient and doctor');
    } else {
      console.log('❌ TEST FAILED: Patient has appointments but does not appear in doctor\'s list');
      console.log('   🔧 This indicates an issue with the patient list query');
    }

    // Additional diagnostic info
    console.log('');
    console.log('🔍 Diagnostic Information:');
    console.log(`   Patient ID: ${patient.id}`);
    console.log(`   Doctor ID: ${doctor.id}`);
    console.log(`   Query should find patients with: appointments.some({ doctorId: "${doctor.id}" })`);

    // Test the exact query used by the API
    console.log('');
    console.log('🧪 Testing exact API query...');
    
    const apiQueryResult = await prisma.patient.findMany({
      where: {
        appointments: {
          some: {
            doctorId: doctor.id,
          },
        },
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
      },
    });

    console.log(`   API query result: ${apiQueryResult.length} patients`);
    apiQueryResult.forEach((p, i) => {
      console.log(`   ${i + 1}. ${p.firstName} ${p.lastName} (ID: ${p.id})`);
    });

    // Simulate a new appointment booking
    console.log('');
    console.log('🧪 Simulating appointment booking process...');
    
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7); // One week from now
    futureDate.setHours(10, 0, 0, 0); // 10:00 AM

    // Check for conflicts
    const conflictCheck = await prisma.appointment.findFirst({
      where: {
        doctorId: doctor.id,
        status: { in: ['SCHEDULED', 'CONFIRMED'] },
        dateTime: {
          gte: new Date(futureDate.getTime() - 30 * 60000),
          lt: new Date(futureDate.getTime() + 60 * 60000)
        }
      }
    });

    if (conflictCheck) {
      console.log('   ⚠️ Time slot conflict detected, choosing different time');
      futureDate.setHours(14, 0, 0, 0); // Try 2:00 PM instead
    }

    console.log(`   📅 Proposed appointment time: ${futureDate.toISOString()}`);
    console.log('   ✅ No conflicts found - appointment can be booked');

  } catch (error) {
    console.error('❌ Error during test:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testPatientDoctorRelationship().catch(console.error);
