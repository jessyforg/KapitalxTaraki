const mysql = require('mysql2/promise');
const axios = require('axios');

// Database connection config (adjust as needed)
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '', // adjust if needed
  database: 'taraki_db'
};

async function testDatabaseData() {
  let connection;
  try {
    console.log('🔍 Testing database connection and matchmaking data...\n');
    
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Database connected successfully!\n');

    // Test 1: Check if test users exist
    console.log('📊 Test 1: Checking test users (ID 101-205)');
    const [users] = await connection.execute(`
      SELECT id, CONCAT(first_name, ' ', last_name) as name, role, location, industry, verification_status 
      FROM users 
      WHERE id BETWEEN 101 AND 205 
      ORDER BY role, id
    `);
    
    if (users.length === 0) {
      console.log('❌ No test users found. Run the test_matchmaking_data.sql script first!\n');
      return;
    }
    
    console.log(`✅ Found ${users.length} test users:`);
    users.forEach(user => {
      console.log(`   - ${user.name} (${user.role}) - ${user.location}, ${user.industry}`);
    });
    console.log('');

    // Test 2: Check entrepreneurs
    console.log('👨‍💼 Test 2: Checking entrepreneurs');
    const [entrepreneurs] = await connection.execute(`
      SELECT u.id, CONCAT(u.first_name, ' ', u.last_name) as name, u.location, u.industry
      FROM users u
      WHERE u.role = 'entrepreneur' AND u.id BETWEEN 101 AND 205
    `);
    console.log(`✅ Found ${entrepreneurs.length} entrepreneurs:`);
    entrepreneurs.forEach(e => {
      console.log(`   - ${e.name} - ${e.location}, ${e.industry}`);
    });
    console.log('');

    // Test 3: Check investors
    console.log('💰 Test 3: Checking investors');
    const [investors] = await connection.execute(`
      SELECT u.id, CONCAT(u.first_name, ' ', u.last_name) as name, u.location, u.industry,
             i.investment_range_min, i.investment_range_max
      FROM users u
      JOIN investors i ON u.id = i.investor_id
      WHERE u.role = 'investor' AND u.id BETWEEN 201 AND 205
    `);
    console.log(`✅ Found ${investors.length} investors:`);
    investors.forEach(inv => {
      console.log(`   - ${inv.name} - $${inv.investment_range_min}-$${inv.investment_range_max}`);
    });
    console.log('');

    // Test 4: Check user preferences
    console.log('⚙️ Test 4: Checking user preferences');
    const [preferences] = await connection.execute(`
      SELECT u.first_name, u.last_name, u.role, up.position_desired, up.preferred_industries, up.preferred_startup_stage
      FROM users u
      JOIN user_preferences up ON u.id = up.user_id
      WHERE u.id BETWEEN 101 AND 205
      ORDER BY u.role, u.id
    `);
    console.log(`✅ Found ${preferences.length} user preferences:`);
    preferences.forEach(pref => {
      console.log(`   - ${pref.first_name} ${pref.last_name} (${pref.role}): ${pref.position_desired || 'N/A'}`);
    });
    console.log('');

    // Test 5: Check user skills
    console.log('🛠️ Test 5: Checking user skills');
    const [skills] = await connection.execute(`
      SELECT u.first_name, u.last_name, COUNT(us.skill_name) as skill_count
      FROM users u
      LEFT JOIN user_skills us ON u.id = us.user_id
      WHERE u.id BETWEEN 101 AND 205
      GROUP BY u.id, u.first_name, u.last_name
      ORDER BY skill_count DESC
    `);
    console.log(`✅ Skills data summary:`);
    skills.forEach(s => {
      console.log(`   - ${s.first_name} ${s.last_name}: ${s.skill_count} skills`);
    });
    console.log('');

    console.log('🎉 Database test completed successfully!');
    console.log('📝 Next steps:');
    console.log('   1. Start your server (npm start in server directory)');
    console.log('   2. Start your React app (npm start in root directory)');
    console.log('   3. Login and navigate to EntrepreneurDashboard or InvestorDashboard');
    console.log('   4. Check if real data appears instead of mock data');
    console.log('   5. Verify match scores are calculated properly');

  } catch (error) {
    console.error('❌ Database test failed:', error.message);
    if (error.code === 'ER_NO_SUCH_TABLE') {
      console.log('💡 Tip: Make sure to run the database schema and test data scripts first.');
    }
    if (error.code === 'ECONNREFUSED') {
      console.log('💡 Tip: Make sure MySQL/XAMPP is running.');
    }
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run the test
if (require.main === module) {
  testDatabaseData();
}

module.exports = { testDatabaseData }; 