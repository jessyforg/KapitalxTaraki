const pool = require('../config/database');

async function testDatabase() {
  try {
    // Test database connection
    console.log('Testing database connection...');
    const connection = await pool.getConnection();
    console.log('Database connection successful!');

    // Test creating a user
    console.log('\nTesting user creation...');
    const [userResult] = await connection.execute(
      'INSERT INTO users (email, password, full_name) VALUES (?, ?, ?)',
      ['test@example.com', 'hashed_password', 'Test User']
    );
    console.log('User created successfully!');

    // Test creating an event
    console.log('\nTesting event creation...');
    const [eventResult] = await connection.execute(
      'INSERT INTO events (title, description, event_date, location, organizer_id) VALUES (?, ?, ?, ?, ?)',
      ['Test Event', 'Test Description', new Date(), 'Test Location', userResult.insertId]
    );
    console.log('Event created successfully!');

    // Test retrieving events
    console.log('\nTesting event retrieval...');
    const [events] = await connection.execute(`
      SELECT e.*, u.full_name as organizer_name 
      FROM events e 
      JOIN users u ON e.organizer_id = u.id 
      ORDER BY e.event_date DESC
    `);
    console.log('Events retrieved successfully!');
    console.log('Number of events:', events.length);

    // Clean up test data
    console.log('\nCleaning up test data...');
    await connection.execute('DELETE FROM events WHERE title = ?', ['Test Event']);
    await connection.execute('DELETE FROM users WHERE email = ?', ['test@example.com']);
    console.log('Test data cleaned up successfully!');

    connection.release();
    console.log('\nAll database tests completed successfully!');
  } catch (error) {
    console.error('Database test failed:', error);
  } finally {
    process.exit();
  }
}

testDatabase(); 