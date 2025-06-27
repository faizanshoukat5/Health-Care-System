const http = require('http');

function testRegistration() {
  const testData = {
    email: 'test.newuser@example.com',
    password: 'password123',
    role: 'PATIENT',
    firstName: 'Test',
    lastName: 'NewUser',
    additionalInfo: {
      phoneNumber: '+1-555-0199'
    }
  };

  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/auth/register',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const req = http.request(options, (res) => {
    console.log(`Status: ${res.statusCode}`);
    console.log(`Headers:`, res.headers);

    res.setEncoding('utf8');
    let body = '';
    res.on('data', (chunk) => {
      body += chunk;
    });
    res.on('end', () => {
      console.log('Response body:', body);
      try {
        const parsed = JSON.parse(body);
        console.log('Parsed JSON:', parsed);
      } catch (e) {
        console.log('Could not parse as JSON');
      }
    });
  });

  req.on('error', (e) => {
    console.error(`Request error: ${e.message}`);
  });

  req.write(JSON.stringify(testData));
  req.end();
}

testRegistration();
