// Using built-in fetch (Node.js 18+)

async function testLoginRestriction() {
  console.log('🧪 Testing Super Admin/Super Moderator login restriction...\n');

  const baseURL = 'http://localhost:5000/api/auth';

  // Test cases
  const testCases = [
    {
      name: 'Super Admin login via normal endpoint (should fail)',
      endpoint: '/login',
      credentials: {
        email: 'superadmin@app.com',
        password: 'password'
      },
      expectedStatus: 403,
      expectedMessage: 'Super Admin and Super Moderator accounts must use the dedicated admin login portal.'
    },
    {
      name: 'Super Moderator login via normal endpoint (should fail)',
      endpoint: '/login',
      credentials: {
        email: 'supermod@app.com',
        password: 'password'
      },
      expectedStatus: 403,
      expectedMessage: 'Super Admin and Super Moderator accounts must use the dedicated admin login portal.'
    },
    {
      name: 'Regular user login via normal endpoint (should succeed)',
      endpoint: '/login',
      credentials: {
        email: 'demo@example.com',
        password: 'password'
      },
      expectedStatus: 200,
      expectedMessage: null // Success case
    },
    {
      name: 'Super Admin login via super admin endpoint (should succeed)',
      endpoint: '/super-admin-login',
      credentials: {
        email: 'superadmin@app.com',
        password: 'secret123',
        role: 'Super Admin'
      },
      expectedStatus: 200,
      expectedMessage: null // Success case
    },
    {
      name: 'Super Moderator login via super admin endpoint (should succeed)',
      endpoint: '/super-admin-login',
      credentials: {
        email: 'supermod@app.com',
        password: 'secret123',
        role: 'Super Moderator'
      },
      expectedStatus: 200,
      expectedMessage: null // Success case
    }
  ];

  let passedTests = 0;
  let totalTests = testCases.length;

  for (const testCase of testCases) {
    console.log(`🔍 Testing: ${testCase.name}`);
    
    try {
      const response = await fetch(`${baseURL}${testCase.endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testCase.credentials)
      });

      const responseData = await response.json();
      
      console.log(`   Status: ${response.status} (expected: ${testCase.expectedStatus})`);
      
      if (response.status === testCase.expectedStatus) {
        if (testCase.expectedMessage) {
          // Check error message for failed cases
          if (responseData.message === testCase.expectedMessage) {
            console.log(`   ✅ PASS: Correct error message received`);
            passedTests++;
          } else {
            console.log(`   ❌ FAIL: Expected message "${testCase.expectedMessage}", got "${responseData.message}"`);
          }
        } else {
          // Success case - check for successful login
          if (responseData.token || responseData.requires2FA) {
            console.log(`   ✅ PASS: Login successful`);
            passedTests++;
          } else {
            console.log(`   ❌ FAIL: Expected successful login but got: ${JSON.stringify(responseData)}`);
          }
        }
      } else {
        console.log(`   ❌ FAIL: Expected status ${testCase.expectedStatus}, got ${response.status}`);
        console.log(`   Response: ${JSON.stringify(responseData)}`);
      }
      
    } catch (error) {
      console.log(`   ❌ ERROR: ${error.message}`);
    }
    
    console.log(''); // Empty line for readability
  }

  console.log(`\n📊 Test Results: ${passedTests}/${totalTests} tests passed`);
  
  if (passedTests === totalTests) {
    console.log('🎉 All tests passed! Super Admin/Super Moderator login restriction is working correctly.');
  } else {
    console.log('⚠️  Some tests failed. Please check the implementation.');
  }
}

// Instructions
console.log('⚠️  To run this test:');
console.log('1. Make sure your backend server is running on http://localhost:5000');
console.log('2. Uncomment the line below to run the test');
console.log('3. Run: node test-login-restriction.js\n');

// Uncomment the line below to run the test
testLoginRestriction();
