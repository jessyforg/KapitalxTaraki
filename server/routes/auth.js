const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../database/db').pool;
const { createWelcomeNotification } = require('../utils/notificationHelper');

// Registration endpoint
router.post('/register', async (req, res) => {
  try {
    const { first_name, last_name, email, password, role } = req.body;

    // Check if email already exists
    const [existingUser] = await pool.query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUser.length > 0) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate verification token
    const verificationToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

    // Insert new user
    const [result] = await pool.query(
      `INSERT INTO users (first_name, last_name, email, password, role, verification_token, full_name) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [first_name, last_name, email, hashedPassword, role, verificationToken, `${first_name} ${last_name}`]
    );

    // Create JWT token
    const token = jwt.sign(
      { id: result.insertId, role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    // Get the created user
    const [user] = await pool.query(
      'SELECT id, first_name, last_name, email, role FROM users WHERE id = ?',
      [result.insertId]
    );

    // Create welcome notification for new user
    try {
      await createWelcomeNotification(pool, {
        user_id: result.insertId,
        user_name: `${first_name} ${last_name}`,
        user_role: role
      });
    } catch (notificationError) {
      console.error('Error creating welcome notification:', notificationError);
      // Don't fail registration if notification fails
    }

    res.status(201).json({
      message: 'Registration successful',
      token,
      user: user[0]
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Get user by email
    const [users] = await pool.query(
      'SELECT id, first_name, last_name, email, password, role FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = users[0];

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Create JWT token
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    // Remove password from user object
    delete user.password;

    res.json({
      message: 'Login successful',
      token,
      user
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

module.exports = router; 