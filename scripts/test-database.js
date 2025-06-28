#!/usr/bin/env node

const { Client } = require('pg');

// Database configuration from your .env.local
const DB_CONFIG = {
  user: 'postgres',
  host: 'localhost',
  database: 'healthcare_platform',
  password: '56545654ffF',
  port: 5432,
};

async function testConnection() {
  console.log('🔍 Testing Healthcare Platform Database Connection...\n');

  const client = new Client(DB_CONFIG);

  try {
    await client.connect();
    console.log('✅ Successfully connected to PostgreSQL!');

    // Test database queries
    const result = await client.query('SELECT version()');
    console.log('📊 PostgreSQL Version:', result.rows[0].version);

    // Check tables
    const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    console.log('\n📋 Available Tables:');
    tables.rows.forEach(row => {
      console.log(`  • ${row.table_name}`);
    });

    // Check users count
    const usersCount = await client.query('SELECT COUNT(*) FROM users');
    console.log(`\n👥 Total Users: ${usersCount.rows[0].count}`);

    // Check doctors count
    const doctorsCount = await client.query('SELECT COUNT(*) FROM doctors');
    console.log(`👨‍⚕️ Total Doctors: ${doctorsCount.rows[0].count}`);

    // List all users
    const users = await client.query('SELECT id, email, name, role FROM users');
    console.log('\n👤 Users in database:');
    users.rows.forEach(user => {
      console.log(`  • ${user.name} (${user.email}) - ${user.role}`);
    });

    await client.end();
    console.log('\n🎉 Database connection test completed successfully!');
    console.log('\n🚀 Your Healthcare Platform is ready to run!');
    console.log('   Run: npm run dev');

  } catch (error) {
    console.error('❌ Database connection failed:', error);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Make sure PostgreSQL is running');
    console.log('2. Check your password in .env.local');
    console.log('3. Verify database exists: healthcare_platform');
  }
}

testConnection();
