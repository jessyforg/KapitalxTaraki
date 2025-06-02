const pool = require('../config/database');
const bcrypt = require('bcrypt');

class User {
  static async findByEmail(email) {
    const [rows] = await pool.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    return rows[0];
  }

  static async create(userData) {
    const { email, password, full_name } = userData;
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const [result] = await pool.execute(
      'INSERT INTO users (email, password, full_name) VALUES (?, ?, ?)',
      [email, hashedPassword, full_name]
    );
    return result.insertId;
  }

  static async findById(id) {
    const [rows] = await pool.execute(
      'SELECT id, email, full_name, role, is_verified FROM users WHERE id = ?',
      [id]
    );
    return rows[0];
  }
}

module.exports = User; 