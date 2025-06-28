#!/usr/bin/env node

const { Client } = require('pg');
const bcrypt = require('bcryptjs');

// Database configuration
const DB_CONFIG = {
  user: 'postgres',
  host: 'localhost',
  database: 'healthcare_platform',
  password: '56545654ffF', // Your password from the connection string
  port: 5432,
};

async function setupDatabase() {
  console.log('🏥 Setting up Healthcare Platform Database...\n');

  // First connect to default postgres database to create our database
  const defaultClient = new Client({
    ...DB_CONFIG,
    database: 'postgres' // Connect to default database first
  });

  try {
    await defaultClient.connect();
    console.log('✅ Connected to PostgreSQL server');

    // Create healthcare_platform database if it doesn't exist
    try {
      await defaultClient.query('CREATE DATABASE healthcare_platform');
      console.log('✅ Created healthcare_platform database');
    } catch (error) {
      if (error.code === '42P04') {
        console.log('ℹ️  Database healthcare_platform already exists');
      } else {
        throw error;
      }
    }

    await defaultClient.end();

    // Now connect to our healthcare database
    const client = new Client(DB_CONFIG);
    await client.connect();
    console.log('✅ Connected to healthcare_platform database\n');

    // Create tables for healthcare platform
    console.log('📋 Creating database tables...');

    // Users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL CHECK (role IN ('patient', 'doctor', 'admin')),
        phone_number VARCHAR(20),
        date_of_birth DATE,
        address JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        is_active BOOLEAN DEFAULT true
      )
    `);
    console.log('✅ Created users table');

    // Doctors table
    await client.query(`
      CREATE TABLE IF NOT EXISTS doctors (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        license_number VARCHAR(100) UNIQUE NOT NULL,
        specialization TEXT[] NOT NULL,
        department VARCHAR(100) NOT NULL,
        education JSONB,
        experience INTEGER NOT NULL,
        consultation_fee DECIMAL(10,2) NOT NULL,
        rating DECIMAL(3,2) DEFAULT 0,
        total_patients INTEGER DEFAULT 0,
        languages TEXT[],
        availability JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Created doctors table');

    // Patients table
    await client.query(`
      CREATE TABLE IF NOT EXISTS patients (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        medical_record_number VARCHAR(100) UNIQUE NOT NULL,
        emergency_contact JSONB NOT NULL,
        insurance_info JSONB,
        allergies TEXT[],
        medications TEXT[],
        medical_history TEXT[],
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Created patients table');

    // Appointments table
    await client.query(`
      CREATE TABLE IF NOT EXISTS appointments (
        id SERIAL PRIMARY KEY,
        patient_id INTEGER REFERENCES patients(id),
        doctor_id INTEGER REFERENCES doctors(id),
        appointment_date_time TIMESTAMP NOT NULL,
        duration INTEGER NOT NULL DEFAULT 30,
        type VARCHAR(50) NOT NULL CHECK (type IN ('in-person', 'video-call', 'phone-call')),
        status VARCHAR(50) NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'in-progress', 'completed', 'cancelled', 'no-show')),
        reason TEXT NOT NULL,
        notes TEXT,
        prescription JSONB,
        follow_up_required BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Created appointments table');

    // Medical records table
    await client.query(`
      CREATE TABLE IF NOT EXISTS medical_records (
        id SERIAL PRIMARY KEY,
        patient_id INTEGER REFERENCES patients(id),
        doctor_id INTEGER REFERENCES doctors(id),
        appointment_id INTEGER REFERENCES appointments(id),
        type VARCHAR(50) NOT NULL CHECK (type IN ('consultation', 'test-result', 'prescription', 'procedure', 'vaccination')),
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        diagnosis TEXT,
        treatment TEXT,
        attachments JSONB,
        vitals JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        is_confidential BOOLEAN DEFAULT false
      )
    `);
    console.log('✅ Created medical_records table');

    // Create admin user
    console.log('\n👤 Creating admin user...');
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    try {
      await client.query(`
        INSERT INTO users (email, password, name, role, is_active)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (email) DO NOTHING
      `, ['admin@healthcare.com', hashedPassword, 'Healthcare Admin', 'admin', true]);
      console.log('✅ Admin user created (admin@healthcare.com / admin123)');
    } catch (error) {
      console.log('ℹ️  Admin user already exists');
    }

    // Create sample doctors
    console.log('\n👨‍⚕️ Creating sample doctors...');
    
    const sampleDoctors = [
      {
        name: 'Dr. Sarah Johnson',
        email: 'sarah.johnson@healthcare.com',
        specialization: ['Cardiology'],
        department: 'Cardiology',
        experience: 15,
        consultationFee: 200,
        licenseNumber: 'MD-CARD-001'
      },
      {
        name: 'Dr. Michael Chen',
        email: 'michael.chen@healthcare.com',
        specialization: ['Pediatrics'],
        department: 'Pediatrics',
        experience: 12,
        consultationFee: 150,
        licenseNumber: 'MD-PED-002'
      },
      {
        name: 'Dr. Emily Davis',
        email: 'emily.davis@healthcare.com',
        specialization: ['Dermatology'],
        department: 'Dermatology',
        experience: 10,
        consultationFee: 180,
        licenseNumber: 'MD-DERM-003'
      }
    ];

    for (const doctor of sampleDoctors) {
      const doctorPassword = await bcrypt.hash('doctor123', 10);
      
      try {
        // Insert user
        const userResult = await client.query(`
          INSERT INTO users (email, password, name, role, is_active)
          VALUES ($1, $2, $3, $4, $5)
          ON CONFLICT (email) DO NOTHING
          RETURNING id
        `, [doctor.email, doctorPassword, doctor.name, 'doctor', true]);

        if (userResult.rows.length > 0) {
          const userId = userResult.rows[0].id;
          
          // Insert doctor details
          await client.query(`
            INSERT INTO doctors (user_id, license_number, specialization, department, experience, consultation_fee)
            VALUES ($1, $2, $3, $4, $5, $6)
            ON CONFLICT (license_number) DO NOTHING
          `, [userId, doctor.licenseNumber, doctor.specialization, doctor.department, doctor.experience, doctor.consultationFee]);
          
          console.log(`✅ Created doctor: ${doctor.name}`);
        }
      } catch (error) {
        console.log(`ℹ️  Doctor ${doctor.name} already exists`);
      }
    }

    await client.end();
    console.log('\n🎉 Database setup completed successfully!');
    console.log('\n📊 Summary:');
    console.log('• Database: healthcare_platform');
    console.log('• Admin user: admin@healthcare.com / admin123');
    console.log('• Sample doctors created with password: doctor123');
    console.log('• All tables created and configured');
    console.log('\n🔗 Connection string for .env.local:');
    console.log(`DATABASE_URL="postgresql://postgres:56545654ffF@localhost:5432/healthcare_platform"`);

  } catch (error) {
    console.error('❌ Database setup failed:', error);
  }
}

// Run the setup
setupDatabase();
