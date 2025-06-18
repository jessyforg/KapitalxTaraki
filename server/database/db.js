const mysql = require('mysql2/promise');

// Database configuration
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '', // Default XAMPP password is empty
  database: 'taraki_db'
};

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