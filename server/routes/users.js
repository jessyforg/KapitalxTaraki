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

// Get user profile
router.get('/:id', auth, async (req, res) => {
  try {
    const userId = req.params.id;

    // Get user data (without preferences fields)
    const [user] = await pool.query(
      `SELECT id, first_name, last_name, email, profile_image, birthdate, 
              gender, contact_number, location, introduction, industry,
              show_in_search, show_in_messages, show_in_pages
       FROM users WHERE id = ?`,
      [userId]
    );

    if (user.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const userData = user[0];

    // Get preferences from user_preferences table
    const [preferences] = await pool.query(
      'SELECT position_desired, preferred_industries, preferred_startup_stage, preferred_location, skills FROM user_preferences WHERE user_id = ?',
      [userId]
    );

    // Add preferences to user data
    if (preferences.length > 0) {
      const prefs = preferences[0];
      try {
        userData.position_desired = prefs.position_desired;
        userData.preferred_industries = prefs.preferred_industries ? 
          (typeof prefs.preferred_industries === 'string' ? JSON.parse(prefs.preferred_industries) : prefs.preferred_industries) : [];
        userData.preferred_startup_stage = prefs.preferred_startup_stage;
        userData.preferred_location = prefs.preferred_location ? 
          (typeof prefs.preferred_location === 'string' ? JSON.parse(prefs.preferred_location) : prefs.preferred_location) : null;
        userData.skills = prefs.skills ? 
          (typeof prefs.skills === 'string' ? JSON.parse(prefs.skills) : prefs.skills) : [];
      } catch (e) {
        console.error('Error parsing preferences JSON fields:', e);
        // Set defaults if parsing fails
        userData.position_desired = null;
        userData.preferred_industries = [];
        userData.preferred_startup_stage = null;
        userData.preferred_location = null;
        userData.skills = [];
      }
    } else {
      // Set defaults if no preferences found
      userData.position_desired = null;
      userData.preferred_industries = [];
      userData.preferred_startup_stage = null;
      userData.preferred_location = null;
      userData.skills = [];
    }

    res.json(userData);
  } catch (error) {
    console.error('Error getting user profile:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update user preferences
router.put('/:id/preferences', auth, async (req, res) => {
  try {
    const userId = req.params.id;
    console.log('Updating preferences for user:', userId);
    console.log('Request body:', req.body);
    
    const {
      position_desired,
      preferred_industries,
      preferred_startup_stage,
      preferred_location,
      skills
    } = req.body;

    // Ensure the table has the correct structure (no-op if already correct)
    try {
      await pool.query(`
        ALTER TABLE user_preferences 
        ADD COLUMN IF NOT EXISTS skills JSON AFTER preferred_location
      `);
      await pool.query(`
        ALTER TABLE user_preferences 
        MODIFY COLUMN preferred_industries JSON
      `);
      await pool.query(`
        ALTER TABLE user_preferences 
        MODIFY COLUMN preferred_location JSON
      `);
    } catch (alterError) {
      console.log('Table structure already correct or alter failed:', alterError.message);
    }

    // Handle JSON data properly - check if it's already a string or needs stringifying
    let preferredIndustriesJson = null;
    if (preferred_industries) {
      if (typeof preferred_industries === 'string') {
        // If it's already a JSON string, parse and re-stringify to ensure it's valid
        try {
          const parsed = JSON.parse(preferred_industries);
          preferredIndustriesJson = JSON.stringify(parsed);
        } catch (e) {
          preferredIndustriesJson = JSON.stringify([preferred_industries]);
        }
      } else {
        preferredIndustriesJson = JSON.stringify(preferred_industries);
      }
    }

    let preferredLocationJson = null;
    if (preferred_location) {
      if (typeof preferred_location === 'string') {
        preferredLocationJson = preferred_location;
      } else {
        preferredLocationJson = JSON.stringify(preferred_location);
      }
    }

    let skillsJson = null;
    if (skills) {
      if (typeof skills === 'string') {
        skillsJson = skills;
      } else {
        skillsJson = JSON.stringify(skills);
      }
    }

    console.log('Converted JSON data:', {
      preferredIndustriesJson,
      preferredLocationJson,
      skillsJson,
      originalData: { preferred_industries, preferred_location, skills }
    });

    // Check if preferences exist for this user (due to UNIQUE constraint on user_id)
    const [existingPrefs] = await pool.query(
      'SELECT id FROM user_preferences WHERE user_id = ?',
      [userId]
    );

    if (existingPrefs.length === 0) {
      console.log('Inserting new preferences');
      // Insert new preferences
      await pool.query(
        `INSERT INTO user_preferences (
          user_id,
          position_desired,
          preferred_industries,
          preferred_startup_stage,
          preferred_location,
          skills
        ) VALUES (?, ?, ?, ?, ?, ?)`,
        [
          userId,
          position_desired,
          preferredIndustriesJson,
          preferred_startup_stage,
          preferredLocationJson,
          skillsJson
        ]
      );
    } else {
      console.log('Updating existing preferences');
      // Update existing preferences
      await pool.query(
        `UPDATE user_preferences SET
          position_desired = ?,
          preferred_industries = ?,
          preferred_startup_stage = ?,
          preferred_location = ?,
          skills = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE user_id = ?`,
        [
          position_desired,
          preferredIndustriesJson,
          preferred_startup_stage,
          preferredLocationJson,
          skillsJson,
          userId
        ]
      );
    }

    // Get updated preferences
    const [updatedPrefs] = await pool.query(
      'SELECT * FROM user_preferences WHERE user_id = ?',
      [userId]
    );

    if (updatedPrefs.length === 0) {
      throw new Error('Failed to retrieve updated preferences');
    }

    // Parse JSON fields safely
    const response = {
      ...updatedPrefs[0],
      preferred_industries: updatedPrefs[0]?.preferred_industries ? 
        (typeof updatedPrefs[0].preferred_industries === 'string' ? 
          JSON.parse(updatedPrefs[0].preferred_industries) : 
          updatedPrefs[0].preferred_industries) : [],
      preferred_location: updatedPrefs[0]?.preferred_location ? 
        (typeof updatedPrefs[0].preferred_location === 'string' ? 
          JSON.parse(updatedPrefs[0].preferred_location) : 
          updatedPrefs[0].preferred_location) : null,
      skills: updatedPrefs[0]?.skills ? 
        (typeof updatedPrefs[0].skills === 'string' ? 
          JSON.parse(updatedPrefs[0].skills) : 
          updatedPrefs[0].skills) : []
    };

    console.log('Sending response:', response);
    res.status(200).json({
      success: true,
      message: 'Preferences updated successfully',
      data: response
    });
  } catch (err) {
    console.error('Error updating preferences:', err);
    console.error('Error stack:', err.stack);
    res.status(500).json({ 
      error: 'Failed to update preferences', 
      message: err.message 
    });
  }
});

// Get user preferences
router.get('/:id/preferences', auth, async (req, res) => {
  try {
    const userId = req.params.id;

    // Get preferences from user_preferences table
    const [prefs] = await pool.query(
      'SELECT * FROM user_preferences WHERE user_id = ?',
      [userId]
    );

    if (prefs.length === 0) {
      return res.json({
        position_desired: null,
        preferred_industries: [],
        preferred_startup_stage: null,
        preferred_location: null,
        skills: []
      });
    }

    // Parse JSON fields
    const response = {
      ...prefs[0],
      preferred_industries: prefs[0]?.preferred_industries ? JSON.parse(prefs[0].preferred_industries) : [],
      preferred_location: prefs[0]?.preferred_location ? JSON.parse(prefs[0].preferred_location) : null,
      skills: prefs[0]?.skills ? JSON.parse(prefs[0].skills) : []
    };

    res.json(response);
  } catch (err) {
    console.error('Error fetching preferences:', err);
    res.status(500).json({ error: 'Failed to fetch preferences' });
  }
});

// Update profile image
router.put('/:id/profile-image', auth, async (req, res) => {
  try {
    const userId = req.params.id;
    const { profileImage } = req.body;

    // Update profile image in users table
    const [result] = await pool.query(
      'UPDATE users SET profile_image = ? WHERE id = ?',
      [profileImage, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ 
      message: 'Profile image updated successfully',
      profile_image: profileImage 
    });
  } catch (error) {
    console.error('Error updating profile image:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get user social links
router.get('/:id/social-links', auth, async (req, res) => {
  try {
    const userId = req.params.id;

    // Get social links from users table or return defaults
    const [user] = await pool.query(
      'SELECT facebook_url, twitter_url, instagram_url, linkedin_url, microsoft_url, whatsapp_url, telegram_url FROM users WHERE id = ?',
      [userId]
    );

    if (user.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Return social links or empty strings as defaults
    const socialLinks = {
      facebook_url: user[0].facebook_url || '',
      twitter_url: user[0].twitter_url || '',
      instagram_url: user[0].instagram_url || '',
      linkedin_url: user[0].linkedin_url || '',
      microsoft_url: user[0].microsoft_url || '',
      whatsapp_url: user[0].whatsapp_url || '',
      telegram_url: user[0].telegram_url || ''
    };

    res.json(socialLinks);
  } catch (error) {
    console.error('Error fetching social links:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});


module.exports = router; 