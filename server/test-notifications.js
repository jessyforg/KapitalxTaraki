/**
 * Test script for the notification system
 */

const {
  createNotification,
  createMessageNotification,
  createProfileViewNotification,
  createEventReminderNotification,
  createDocumentVerificationNotification,
  createConnectionRequestNotification,
  createWelcomeNotification,
  createStartupApplicationNotification
} = require('./utils/notificationHelper');

const mysql = require('mysql2/promise');

// Load environment variables if .env exists
if (require('fs').existsSync('.env')) {
  require('dotenv').config();
}

// Database configuration - uses environment variables for production, defaults for local dev
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'kapital_system',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

async function testNotifications() {
  console.log('🧪 Starting Notification System Tests...\n');

  try {
    // Test 1: Welcome Notification
    console.log('1️⃣ Testing Welcome Notification...');
    await createWelcomeNotification(pool, {
      user_id: 1,
      user_name: 'Test User',
      user_role: 'entrepreneur'
    });
    console.log('✅ Welcome notification created\n');

    // Test 2: Message Notification
    console.log('2️⃣ Testing Message Notification...');
    await createMessageNotification(pool, {
      receiver_id: 1,
      sender_id: 2,
      sender_name: 'John Doe',
      message_preview: 'Hey, I\'m interested in your startup!'
    });
    console.log('✅ Message notification created\n');

    // Test 3: Profile View Notification
    console.log('3️⃣ Testing Profile View Notification...');
    await createProfileViewNotification(pool, {
      profile_owner_id: 1,
      viewer_id: 2,
      viewer_name: 'Jane Smith',
      viewer_role: 'investor'
    });
    console.log('✅ Profile view notification created\n');

    // Test 4: Event Reminder Notification
    console.log('4️⃣ Testing Event Reminder Notification...');
    await createEventReminderNotification(pool, {
      user_id: 1,
      event_id: 1,
      event_title: 'Startup Pitch Competition',
      event_date: new Date(),
      reminder_type: '1_day'
    });
    console.log('✅ Event reminder notification created\n');

    // Test 5: Document Verification Notification
    console.log('5️⃣ Testing Document Verification Notification...');
    await createDocumentVerificationNotification(pool, {
      user_id: 1,
      document_type: 'Business License',
      verification_status: 'approved'
    });
    console.log('✅ Document verification notification created\n');

    // Test 6: Connection Request Notification
    console.log('6️⃣ Testing Connection Request Notification...');
    await createConnectionRequestNotification(pool, {
      target_user_id: 1,
      requester_id: 2,
      requester_name: 'Alice Johnson',
      requester_role: 'investor'
    });
    console.log('✅ Connection request notification created\n');

    // Test 7: Startup Application Notification
    console.log('7️⃣ Testing Startup Application Notification...');
    await createStartupApplicationNotification(pool, {
      entrepreneur_id: 1,
      startup_name: 'TechCorp Solutions',
      application_status: 'approved'
    });
    console.log('✅ Startup application notification created\n');

    // Test 8: Custom Notification
    console.log('8️⃣ Testing Custom Notification...');
    await createNotification(pool, {
      user_id: 1,
      sender_id: null,
      type: 'system_update',
      message: 'System maintenance scheduled for tomorrow at 2 AM',
      priority: 'high',
      url: '/system-status'
    });
    console.log('✅ Custom notification created\n');

    // Verify notifications were created
    console.log('🔍 Verifying notifications in database...');
    const [notifications] = await pool.query(
      'SELECT type, message, priority, created_at FROM notifications WHERE user_id = 1 ORDER BY created_at DESC LIMIT 8'
    );
    
    console.log(`📊 Found ${notifications.length} notifications:`);
    notifications.forEach((notif, index) => {
      console.log(`   ${index + 1}. ${notif.type}: ${notif.message.substring(0, 50)}...`);
    });

    console.log('\n🎉 All notification tests completed successfully!');
    console.log('\n📋 Summary of tested notification types:');
    console.log('   ✅ Welcome notifications');
    console.log('   ✅ Message notifications');
    console.log('   ✅ Profile view notifications');
    console.log('   ✅ Event reminder notifications');
    console.log('   ✅ Document verification notifications');
    console.log('   ✅ Connection request notifications');
    console.log('   ✅ Startup application notifications');
    console.log('   ✅ Custom notifications');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await pool.end();
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  testNotifications();
}

module.exports = { testNotifications }; 