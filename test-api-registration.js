const fetch = require('node-fetch');

async function testRegistrationAPI() {
  console.log('🧪 Testing Registration API...');
  
  const testData = {
    email: 'test.new.user@example.com',
    password: 'password123',
    role: 'PATIENT',
    firstName: 'Test',
    lastName: 'NewUser',
    additionalInfo: {
      phoneNumber: '+1-555-0199'
    }
  };

  try {
    console.log('📤 Sending registration request...');
    console.log('Data:', JSON.stringify(testData, null, 2));
    
    const response = await fetch('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers));
    
    const result = await response.text();
    console.log('Raw response:', result);
    
    try {
      const jsonResult = JSON.parse(result);
      console.log('Parsed JSON:', jsonResult);
    } catch (e) {
      console.log('Could not parse as JSON');
    }

  } catch (error) {
    console.error('❌ Request error:', error);
  }
}

testRegistrationAPI();
