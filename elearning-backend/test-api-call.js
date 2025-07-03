const fetch = require('node-fetch');

async function testAPICall() {
  try {
    console.log('🧪 Testing Super Admin API call...');
    
    // You'll need to replace this with a valid Super Admin token
    // Get this from localStorage in your browser: localStorage.getItem('appAdminToken')
    const token = 'YOUR_SUPER_ADMIN_TOKEN_HERE';
    
    console.log('🌐 Making API call to: http://localhost:5000/api/super-admin/stats');
    
    const response = await fetch('http://localhost:5000/api/super-admin/stats', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    console.log('📡 Response status:', response.status);
    console.log('📡 Response ok:', response.ok);

    if (!response.ok) {
      const errorText = await response.text();
      console.log('❌ Error response:', errorText);
      return;
    }

    const data = await response.json();
    console.log('✅ API Response received');
    console.log('📊 Stats:', data.stats);
    console.log('🏛️ Total Institutions from API:', data.stats.totalInstitutions);
    
  } catch (error) {
    console.error('❌ Error calling API:', error);
  }
}

console.log('⚠️  To test this script:');
console.log('1. Open your browser and go to Super Admin Dashboard');
console.log('2. Open Developer Tools (F12) and go to Console');
console.log('3. Run: localStorage.getItem("appAdminToken")');
console.log('4. Copy the token and replace YOUR_SUPER_ADMIN_TOKEN_HERE in this script');
console.log('5. Run this script again');
console.log('');

// Uncomment the line below and add your token to test
// testAPICall();
