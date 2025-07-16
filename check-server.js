const axios = require('axios');

async function checkServer() {
  console.log('🔍 Checking backend server status...\n');
  
  const tests = [
    { url: 'http://localhost:5000', name: 'Backend server (basic)' },
    { url: 'http://localhost:5000/api', name: 'API endpoint' },
    { url: 'http://localhost:5000/api/users/cofounders', name: 'Co-founders endpoint', needsAuth: true }
  ];
  
  for (const test of tests) {
    try {
      const config = {};
      if (test.needsAuth) {
        // Skip auth test for now, just check if endpoint exists
        console.log(`❓ ${test.name}: Requires authentication (test manually)`);
        continue;
      }
      
      const response = await axios.get(test.url, { timeout: 5000 });
      console.log(`✅ ${test.name}: OK (${response.status})`);
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        console.log(`❌ ${test.name}: Server not running`);
      } else if (error.response) {
        console.log(`⚠️  ${test.name}: Server responded with ${error.response.status}`);
      } else {
        console.log(`❌ ${test.name}: ${error.message}`);
      }
    }
  }
  
  console.log('\n📋 Next steps:');
  console.log('1. If server is not running, start it with: cd server && npm start');
  console.log('2. If server is running but endpoints fail, restart with: cd server && npm start');
  console.log('3. Check server logs for any error messages');
}

checkServer(); 