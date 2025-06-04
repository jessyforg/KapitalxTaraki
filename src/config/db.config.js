const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '', // Default XAMPP password is empty
  database: 'taraki_db'
};

const pool = mysql.createPool(dbConfig);

module.exports = pool; 