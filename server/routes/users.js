const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const auth = require('../middleware/auth');

// Get pool from server/index.js
const pool = require('../database/db').pool;

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '..', 'uploads', 'profile_photos');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

// Update user profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { first_name, last_name, email, contact_number, introduction } = req.body;
    const userId = req.user.id;

    // Update user profile in database
    const [result] = await pool.query(
      `UPDATE users 
       SET first_name = ?, last_name = ?, email = ?, contact_number = ?, introduction = ?
       WHERE id = ?`,
      [first_name, last_name, email, contact_number, introduction, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get updated user data
    const [user] = await pool.query(
      'SELECT id, first_name, last_name, email, contact_number, introduction, profile_image, profile_picture_url FROM users WHERE id = ?',
      [userId]
    );

    res.json(user[0]);
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Change password
router.put('/password', auth, async (req, res) => {
  try {
    const { current, new: newPassword } = req.body;
    const userId = req.user.id;

    // Get current user
    const [user] = await pool.query(
      'SELECT password FROM users WHERE id = ?',
      [userId]
    );

    if (user.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(current, user[0].password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    await pool.query(
      'UPDATE users SET password = ? WHERE id = ?',
      [hashedPassword, userId]
    );

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update notification preferences
router.put('/notifications', auth, async (req, res) => {
  try {
    const { notification_type, email_enabled, push_enabled, in_app_enabled, frequency } = req.body;
    const userId = req.user.id;

    // Check if preference exists
    const [existing] = await pool.query(
      'SELECT id FROM notification_preferences WHERE user_id = ? AND notification_type = ?',
      [userId, notification_type]
    );

    if (existing.length > 0) {
      // Update existing preference
      await pool.query(
        `UPDATE notification_preferences 
         SET email_enabled = ?, push_enabled = ?, in_app_enabled = ?, frequency = ?
         WHERE user_id = ? AND notification_type = ?`,
        [email_enabled, push_enabled, in_app_enabled, frequency, userId, notification_type]
      );
    } else {
      // Create new preference
      await pool.query(
        `INSERT INTO notification_preferences 
         (user_id, notification_type, email_enabled, push_enabled, in_app_enabled, frequency)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [userId, notification_type, email_enabled, push_enabled, in_app_enabled, frequency]
      );
    }

    // Get updated preferences
    const [preferences] = await pool.query(
      'SELECT * FROM notification_preferences WHERE user_id = ?',
      [userId]
    );

    res.json(preferences);
  } catch (error) {
    console.error('Error updating notification preferences:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add profile photo upload route
router.post('/profile/photo', auth, upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const userId = req.user.id;
    const photoPath = `/uploads/profile_photos/${req.file.filename}`; // Store relative path

    // Update user's profile photo in database
    const [result] = await pool.execute(
      'UPDATE users SET profile_image = ? WHERE id = ?',
      [photoPath, userId]
    );

    if (result.affectedRows === 0) {
      // Clean up uploaded file if user not found
      fs.unlinkSync(req.file.path);
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: 'Profile photo updated successfully',
      profile_image: photoPath
    });
  } catch (error) {
    // Clean up uploaded file if there's an error
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    console.error('Error updating profile photo:', error);
    res.status(500).json({ 
      message: 'Error updating profile photo',
      error: error.message 
    });
  }
});

// Get notification preferences
router.get('/notifications', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get notification preferences
    const [preferences] = await pool.query(
      'SELECT * FROM notification_preferences WHERE user_id = ?',
      [userId]
    );

    res.json(preferences);
  } catch (error) {
    console.error('Error fetching notification preferences:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get message settings
router.get('/message-settings', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get message settings from users table
    const [settings] = await pool.query(
      'SELECT allow_messages, message_notifications FROM users WHERE id = ?',
      [userId]
    );

    if (settings.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(settings[0]);
  } catch (error) {
    console.error('Error fetching message settings:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update message settings
router.put('/message-settings', auth, async (req, res) => {
  try {
    const { allow_messages, message_notifications } = req.body;
    const userId = req.user.id;

    // Update message settings in users table
    const [result] = await pool.query(
      'UPDATE users SET allow_messages = ?, message_notifications = ? WHERE id = ?',
      [allow_messages, message_notifications, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'Message settings updated successfully' });
  } catch (error) {
    console.error('Error updating message settings:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update 2FA status
router.put('/2fa', auth, async (req, res) => {
  try {
    const { enabled } = req.body;
    const userId = req.user.id;

    // Update 2FA status in database
    const [result] = await pool.query(
      'UPDATE users SET two_factor_enabled = ? WHERE id = ?',
      [enabled, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: `Two-factor authentication ${enabled ? 'enabled' : 'disabled'} successfully` });
  } catch (error) {
    console.error('Error updating 2FA status:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 