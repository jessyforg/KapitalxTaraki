// Load environment variables (only if .env file exists - Railway uses direct env vars)
// In Railway, environment variables are provided directly, so dotenv is optional
if (require('fs').existsSync('.env')) {
	require('dotenv').config();
}

const mysql = require('mysql2/promise');

// Database configuration - uses environment variables
// In production (Railway), all these must be set via environment variables
// In development, defaults to localhost for local MySQL
const dbConfig = {
  host: process.env.DB_HOST || (process.env.NODE_ENV === 'production' ? null : 'localhost'),
  user: process.env.DB_USER || (process.env.NODE_ENV === 'production' ? null : 'root'),
  password: process.env.DB_PASSWORD || (process.env.NODE_ENV === 'production' ? null : ''),
  database: process.env.DB_NAME || (process.env.NODE_ENV === 'production' ? null : 'taraki_db')
};

// Validate required environment variables in production
if (process.env.NODE_ENV === 'production') {
  const required = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'];
  const missing = required.filter(key => !process.env[key]);
  if (missing.length > 0) {
    console.error('❌ Missing required database environment variables:', missing.join(', '));
    console.error('   Please set these in Railway Dashboard → Variables');
    process.exit(1);
  }
}

// Debug: Log database configuration (without password)
console.log('🔍 Database Configuration:');
console.log('  Environment Variables Check:');
console.log('    process.env.DB_HOST:', process.env.DB_HOST || 'NOT SET');
console.log('    process.env.DB_USER:', process.env.DB_USER || 'NOT SET');
console.log('    process.env.DB_NAME:', process.env.DB_NAME || 'NOT SET');
console.log('    process.env.DB_PASSWORD:', process.env.DB_PASSWORD ? '***SET***' : 'NOT SET');
console.log('  Using Configuration:');
console.log('    DB_HOST:', dbConfig.host);
console.log('    DB_USER:', dbConfig.user);
console.log('    DB_NAME:', dbConfig.database);
console.log('    DB_PASSWORD:', dbConfig.password ? '***SET***' : 'NOT SET');

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Test the connection
pool.getConnection()
  .then(connection => {
    console.log('Database connected successfully');
    connection.release();
  })
  .catch(err => {
    console.error('Error connecting to the database:', err);
  });

module.exports = { pool }; 