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

// Get all co-founders (exclude logged-in user) - MUST BE BEFORE /:id route
router.get('/cofounders', auth, async (req, res) => {
  try {
    console.log('Fetching cofounders for user:', req.user.id);
    
    // Only return entrepreneurs with verification_status = 'verified'
    // Use COALESCE and IFNULL to handle NULL values gracefully
    const [rows] = await pool.query(
      `
      SELECT u.id, u.first_name, u.last_name, u.email, u.introduction, u.profile_image, 
             u.industry, u.location, u.role, u.verification_status,
             up.preferred_location, up.preferred_industries, up.preferred_startup_stage
      FROM users u
      LEFT JOIN user_preferences up ON u.id = up.user_id
      WHERE u.role = 'entrepreneur' 
      AND u.id != ? 
      AND u.verification_status = 'verified'
      AND u.show_in_search = 1
    `,
      [req.user.id]
    );
    
    console.log('Found cofounders count:', rows.length);
    console.log('Cofounders data:', rows.map(r => ({ 
      id: r.id, 
      name: `${r.first_name || ''} ${r.last_name || ''}`.trim(), 
      role: r.role, 
      verified: r.verification_status,
      preferences: !!r.preferred_industries 
    })));

    // Fetch skills for each user (gracefully handle if user_skills table doesn't exist)
    const userIds = rows.map(u => u.id);
    let skillsMap = {};
    if (userIds.length > 0) {
      try {
        const [skillsRows] = await pool.query(
          `SELECT user_id, skill_name, skill_level FROM user_skills WHERE user_id IN (${userIds.map(() => '?').join(',')})`,
          userIds
        );
        skillsMap = skillsRows.reduce((acc, skill) => {
          if (!acc[skill.user_id]) acc[skill.user_id] = [];
          acc[skill.user_id].push(skill.skill_name);
          return acc;
        }, {});
        console.log('Skills map created:', Object.keys(skillsMap).length, 'users have skills');
      } catch (skillsError) {
        console.warn('user_skills table error, skipping skills:', skillsError.message);
        skillsMap = {};
      }
    }

    const cofounders = rows.map((u) => {
      // Handle double-encoded JSON for preferred_industries with more robust error handling
      let preferredIndustries = [];
      if (u.preferred_industries) {
        try {
          // Handle both single and double-encoded JSON
          let parsed = u.preferred_industries;
          if (typeof parsed === 'string') {
            parsed = JSON.parse(parsed);
            // If it's still a string after first parse, parse again (double-encoded)
            if (typeof parsed === 'string') {
              parsed = JSON.parse(parsed);
            }
          }
          preferredIndustries = Array.isArray(parsed) ? parsed : (parsed ? [parsed] : []);
        } catch (e) {
          console.warn(`Error parsing preferred_industries for user ${u.id}:`, e.message, 'Raw value:', u.preferred_industries);
          preferredIndustries = [];
        }
      }

      // Handle JSON parsing for preferred_location
      let preferredLocation = null;
      if (u.preferred_location) {
        try {
          if (typeof u.preferred_location === 'string') {
            preferredLocation = JSON.parse(u.preferred_location);
          } else {
            preferredLocation = u.preferred_location;
          }
        } catch (e) {
          console.warn(`Error parsing preferred_location for user ${u.id}:`, e.message, 'Raw value:', u.preferred_location);
          preferredLocation = null;
        }
      }

      // Keep original database enum values - let frontend handle display mapping
      let mappedStartupStage = u.preferred_startup_stage;

      const result = {
        id: u.id,
        name: `${u.first_name || ''} ${u.last_name || ''}`.trim() || 'Anonymous User',
        email: u.email || '',
        bio: u.introduction || "",
        profile_image: u.profile_image || null,
        industry: u.industry || null,
        location: u.location || null,
        preferred_location: preferredLocation,
        preferred_industries: preferredIndustries,
        preferred_startup_stage: mappedStartupStage || null,
        skills: skillsMap[u.id] || [],
        role: u.role || 'entrepreneur'
      };

      console.log(`Cofounder ${u.id} processed:`, {
        name: result.name,
        industry: result.industry,
        preferred_industries: result.preferred_industries,
        skills_count: result.skills.length
      });

      return result;
    });

    console.log('Successfully processed', cofounders.length, 'cofounders');
    res.json(cofounders);
  } catch (error) {
    console.error("Error fetching co-founders:", error);
    console.error("Error details:", error.message);
    console.error("Error stack:", error.stack);
    res.status(500).json({ error: "Internal server error", details: error.message });
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

    // Parse location JSON if it's a string
    if (userData.location && typeof userData.location === 'string') {
      try {
        userData.location = JSON.parse(userData.location);
      } catch (e) {
        // Keep as string if not valid JSON
        console.log('Location is not valid JSON, keeping as string:', userData.location);
      }
    }

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

    // Get employment data
    const [employment] = await pool.query(
      'SELECT company, title, industry, hire_date, is_current FROM employment WHERE user_id = ? ORDER BY hire_date DESC',
      [userId]
    );
    userData.employment = employment || [];

    // Get academic profile data
    const [academicProfile] = await pool.query(
      'SELECT level, course, institution, address, graduation_date FROM academic_profile WHERE user_id = ? ORDER BY graduation_date DESC',
      [userId]
    );
    userData.academic_profile = academicProfile || [];

    // Get social links data
    const [socialLinks] = await pool.query(
      'SELECT facebook_url, twitter_url, instagram_url, linkedin_url, microsoft_url, whatsapp_url, telegram_url FROM user_social_links WHERE user_id = ?',
      [userId]
    );
    userData.social_links = socialLinks[0] || {};

    // Get skills from user_skills table (prioritize over JSON skills in preferences)
    const [userSkills] = await pool.query(
      'SELECT skill_name FROM user_skills WHERE user_id = ? ORDER BY created_at ASC',
      [userId]
    );
    
    // If we have skills in user_skills table, use those; otherwise use JSON skills from preferences
    if (userSkills && userSkills.length > 0) {
      userData.skills = userSkills.map(skill => skill.skill_name);
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

    // Check if user exists
    const [userCheck] = await pool.query('SELECT id FROM users WHERE id = ?', [userId]);
    if (userCheck.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get social links from user_social_links table
    const [socialLinksData] = await pool.query(
      'SELECT facebook_url, twitter_url, instagram_url, linkedin_url, microsoft_url, whatsapp_url, telegram_url FROM user_social_links WHERE user_id = ?',
      [userId]
    );

    // Return social links or empty strings as defaults
    const socialLinks = {
      facebook_url: socialLinksData[0]?.facebook_url || '',
      twitter_url: socialLinksData[0]?.twitter_url || '',
      instagram_url: socialLinksData[0]?.instagram_url || '',
      linkedin_url: socialLinksData[0]?.linkedin_url || '',
      microsoft_url: socialLinksData[0]?.microsoft_url || '',
      whatsapp_url: socialLinksData[0]?.whatsapp_url || '',
      telegram_url: socialLinksData[0]?.telegram_url || ''
    };

    res.json(socialLinks);
  } catch (error) {
    console.error('Error fetching social links:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update user social links
router.put('/:id/social-links', auth, async (req, res) => {
  try {
    const userId = req.params.id;
    const {
      facebook_url,
      twitter_url,
      instagram_url,
      linkedin_url,
      microsoft_url,
      whatsapp_url,
      telegram_url
    } = req.body;

    // Validate URLs if provided
    const urlPattern = /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/;
    
    const socialUrls = { facebook_url, twitter_url, instagram_url, linkedin_url, microsoft_url, whatsapp_url, telegram_url };
    
    for (const [key, url] of Object.entries(socialUrls)) {
      if (url && url.trim() !== '' && !urlPattern.test(url)) {
        return res.status(400).json({ 
          message: `Invalid URL format for ${key.replace('_url', '')}`,
          field: key 
        });
      }
    }

    // Check if user exists
    const [userCheck] = await pool.query('SELECT id FROM users WHERE id = ?', [userId]);
    if (userCheck.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update social links in user_social_links table
    await pool.query(
      `INSERT INTO user_social_links 
       (user_id, facebook_url, twitter_url, instagram_url, linkedin_url, microsoft_url, whatsapp_url, telegram_url)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
       facebook_url = VALUES(facebook_url),
       twitter_url = VALUES(twitter_url),
       instagram_url = VALUES(instagram_url),
       linkedin_url = VALUES(linkedin_url),
       microsoft_url = VALUES(microsoft_url),
       whatsapp_url = VALUES(whatsapp_url),
       telegram_url = VALUES(telegram_url)`,
      [
        userId,
        facebook_url || null,
        twitter_url || null,
        instagram_url || null,
        linkedin_url || null,
        microsoft_url || null,
        whatsapp_url || null,
        telegram_url || null
      ]
    );

    // Get updated social links to return
    const [updatedLinks] = await pool.query(
      'SELECT facebook_url, twitter_url, instagram_url, linkedin_url, microsoft_url, whatsapp_url, telegram_url FROM user_social_links WHERE user_id = ?',
      [userId]
    );

    const socialLinks = {
      facebook_url: updatedLinks[0]?.facebook_url || '',
      twitter_url: updatedLinks[0]?.twitter_url || '',
      instagram_url: updatedLinks[0]?.instagram_url || '',
      linkedin_url: updatedLinks[0]?.linkedin_url || '',
      microsoft_url: updatedLinks[0]?.microsoft_url || '',
      whatsapp_url: updatedLinks[0]?.whatsapp_url || '',
      telegram_url: updatedLinks[0]?.telegram_url || ''
    };

    res.json({
      message: 'Social links updated successfully',
      socialLinks
    });
  } catch (error) {
    console.error('Error updating social links:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete a specific social link
router.delete('/:id/social-links/:platform', auth, async (req, res) => {
  try {
    const userId = req.params.id;
    const platform = req.params.platform;
    
    const validPlatforms = ['facebook', 'twitter', 'instagram', 'linkedin', 'microsoft', 'whatsapp', 'telegram'];
    if (!validPlatforms.includes(platform)) {
      return res.status(400).json({ message: 'Invalid platform' });
    }

    const fieldName = `${platform}_url`;
    
    // Update specific platform URL to null
    await pool.query(
      `UPDATE user_social_links SET ${fieldName} = NULL WHERE user_id = ?`,
      [userId]
    );

    res.json({ message: `${platform} link removed successfully` });
  } catch (error) {
    console.error('Error deleting social link:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Comprehensive profile update endpoint
router.put('/:id', auth, async (req, res) => {
  try {
    const userId = req.params.id;
    console.log('Updating comprehensive profile for user:', userId);
    console.log('Request body:', req.body);
    
    const {
      // Basic profile data
      gender,
      birthdate,
      location,
      contact_number,
      industry,
      introduction,
      
      // Complex profile data
      employment,
      academic_profile,
      accomplishments,
      
      // Social links
      facebook_url,
      instagram_url,
      linkedin_url,
      
      // Matchmaking preferences
      skills,
      position_desired,
      preferred_industries,
      preferred_startup_stage,
      preferred_location,
      
      // Privacy settings
      show_in_search,
      show_in_messages,
      show_in_pages
    } = req.body;

    // Start transaction
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // 1. Update basic profile data and privacy settings in users table
      let updateFields = [];
      let updateValues = [];
      
      if (gender !== undefined) {
        updateFields.push('gender = ?');
        updateValues.push(gender);
      }
      if (birthdate !== undefined) {
        updateFields.push('birthdate = ?');
        updateValues.push(birthdate);
      }
      if (location !== undefined) {
        updateFields.push('location = ?');
        // Serialize location object to JSON string for storage
        const locationData = location && typeof location === 'object' ? JSON.stringify(location) : location;
        updateValues.push(locationData);
      }
      if (contact_number !== undefined) {
        updateFields.push('contact_number = ?');
        updateValues.push(contact_number);
      }
      if (industry !== undefined) {
        updateFields.push('industry = ?');
        updateValues.push(industry);
      }
      if (introduction !== undefined) {
        updateFields.push('introduction = ?');
        updateValues.push(introduction);
      }
      if (show_in_search !== undefined) {
        updateFields.push('show_in_search = ?');
        updateValues.push(show_in_search);
      }
      if (show_in_messages !== undefined) {
        updateFields.push('show_in_messages = ?');
        updateValues.push(show_in_messages);
      }
      if (show_in_pages !== undefined) {
        updateFields.push('show_in_pages = ?');
        updateValues.push(show_in_pages);
      }

      if (updateFields.length > 0) {
        updateValues.push(userId);
        await connection.query(
          `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`,
          updateValues
        );
        console.log('Updated users table successfully');
      }

      // 2. Handle employment data using the employment table (with error handling)
      if (employment && Array.isArray(employment)) {
        try {
          // Check if employment table exists and has the right columns
          const [empTableCheck] = await connection.query(
            'SHOW COLUMNS FROM employment LIKE ?',
            ['is_current']
          );
          
          if (empTableCheck.length > 0) {
            // Delete existing employment records
            await connection.query(
              'DELETE FROM employment WHERE user_id = ?',
              [userId]
            );
            
            // Insert new employment records
            for (const emp of employment) {
              if (emp.company || emp.title) {
                await connection.query(
                  `INSERT INTO employment (user_id, company, title, industry, hire_date, is_current) 
                   VALUES (?, ?, ?, ?, ?, ?)`,
                  [userId, emp.company || '', emp.title || '', emp.industry || '', emp.hire_date || null, emp.is_current || false]
                );
              }
            }
            console.log('Updated employment data successfully');
          } else {
            console.log('Employment table missing is_current column, skipping employment update');
          }
        } catch (empError) {
          console.log('Employment table error:', empError.message);
          // Continue without failing the entire request
        }
      }

      // 3. Handle academic profile data using the academic_profile table (with error handling)
      if (academic_profile && Array.isArray(academic_profile)) {
        try {
          // Delete existing academic records
          await connection.query(
            'DELETE FROM academic_profile WHERE user_id = ?',
            [userId]
          );
          
          // Insert new academic records
          for (const edu of academic_profile) {
            if (edu.level || edu.course || edu.institution) {
              await connection.query(
                `INSERT INTO academic_profile (user_id, level, course, institution, address, graduation_date) 
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [userId, edu.level || '', edu.course || '', edu.institution || '', edu.address || '', edu.graduation_date || null]
              );
            }
          }
          console.log('Updated academic profile successfully');
        } catch (acadError) {
          console.log('Academic profile error:', acadError.message);
          // Continue without failing the entire request
        }
      }

      // 4. Handle accomplishments (stored in users table)
      if (accomplishments !== undefined) {
        try {
          await connection.query(
            'UPDATE users SET accomplishments = ? WHERE id = ?',
            [Array.isArray(accomplishments) ? JSON.stringify(accomplishments) : accomplishments, userId]
          );
          console.log('Updated accomplishments successfully');
        } catch (accError) {
          console.log('Accomplishments error:', accError.message);
        }
      }

      // 5. Update or insert preferences (with error handling)
      if (skills !== undefined || position_desired !== undefined || preferred_industries !== undefined || 
          preferred_startup_stage !== undefined || preferred_location !== undefined) {
        
        try {
          // Handle JSON data properly - check if columns support JSON
          let skillsJson = null;
          let preferredIndustriesJson = null;
          
          if (skills) {
            skillsJson = JSON.stringify(skills);
          }
          if (preferred_industries) {
            preferredIndustriesJson = JSON.stringify(preferred_industries);
          }
          
          // Check if preferences exist
          const [existingPrefs] = await connection.query(
            'SELECT id FROM user_preferences WHERE user_id = ?',
            [userId]
          );

          if (existingPrefs.length === 0) {
            // Insert new preferences
            // Serialize preferred_location object to JSON string for storage
            const preferredLocationData = preferred_location && typeof preferred_location === 'object' ? JSON.stringify(preferred_location) : preferred_location;
            
            await connection.query(
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
                preferredLocationData,
                skillsJson
              ]
            );
          } else {
            // Update existing preferences
            let prefUpdateFields = [];
            let prefUpdateValues = [];
            
            if (position_desired !== undefined) {
              prefUpdateFields.push('position_desired = ?');
              prefUpdateValues.push(position_desired);
            }
            if (preferred_industries !== undefined) {
              prefUpdateFields.push('preferred_industries = ?');
              prefUpdateValues.push(preferredIndustriesJson);
            }
            if (preferred_startup_stage !== undefined) {
              prefUpdateFields.push('preferred_startup_stage = ?');
              prefUpdateValues.push(preferred_startup_stage);
            }
            if (preferred_location !== undefined) {
              prefUpdateFields.push('preferred_location = ?');
              // Serialize preferred_location object to JSON string for storage
              const preferredLocationData = preferred_location && typeof preferred_location === 'object' ? JSON.stringify(preferred_location) : preferred_location;
              prefUpdateValues.push(preferredLocationData);
            }
            if (skills !== undefined) {
              prefUpdateFields.push('skills = ?');
              prefUpdateValues.push(skillsJson);
            }

            if (prefUpdateFields.length > 0) {
              prefUpdateValues.push(userId);
              await connection.query(
                `UPDATE user_preferences SET ${prefUpdateFields.join(', ')} WHERE user_id = ?`,
                prefUpdateValues
              );
            }
          }
          console.log('Updated preferences successfully');
        } catch (prefError) {
          console.log('Preferences error:', prefError.message);
        }
      }

      // 6. Handle user_skills table (store skills as individual records)
      if (skills !== undefined && Array.isArray(skills)) {
        try {
          // Delete existing user skills
          await connection.query(
            'DELETE FROM user_skills WHERE user_id = ?',
            [userId]
          );
          
          // Insert new skills as individual records
          for (const skill of skills) {
            if (skill && skill.trim() !== '') {
              await connection.query(
                'INSERT INTO user_skills (user_id, skill_name, skill_level) VALUES (?, ?, ?)',
                [userId, skill.trim(), 'intermediate']
              );
            }
          }
          console.log('Updated user_skills table successfully');
        } catch (skillsError) {
          console.log('User skills table error:', skillsError.message);
        }
      }

      // 7. Handle social links (with error handling)
      if (facebook_url !== undefined || instagram_url !== undefined || linkedin_url !== undefined) {
        try {
          // Check if social links exist
          const [existingSocial] = await connection.query(
            'SELECT user_id FROM user_social_links WHERE user_id = ?',
            [userId]
          );

          if (existingSocial.length === 0 && (facebook_url || instagram_url || linkedin_url)) {
            // Insert new social links
            await connection.query(
              `INSERT INTO user_social_links (user_id, facebook_url, instagram_url, linkedin_url) 
               VALUES (?, ?, ?, ?)`,
              [userId, facebook_url, instagram_url, linkedin_url]
            );
          } else if (existingSocial.length > 0) {
            // Update existing social links
            let socialUpdateFields = [];
            let socialUpdateValues = [];
            
            if (facebook_url !== undefined) {
              socialUpdateFields.push('facebook_url = ?');
              socialUpdateValues.push(facebook_url);
            }
            if (instagram_url !== undefined) {
              socialUpdateFields.push('instagram_url = ?');
              socialUpdateValues.push(instagram_url);
            }
            if (linkedin_url !== undefined) {
              socialUpdateFields.push('linkedin_url = ?');
              socialUpdateValues.push(linkedin_url);
            }

            if (socialUpdateFields.length > 0) {
              socialUpdateValues.push(userId);
              await connection.query(
                `UPDATE user_social_links SET ${socialUpdateFields.join(', ')} WHERE user_id = ?`,
                socialUpdateValues
              );
            }
          }
          console.log('Updated social links successfully');
        } catch (socialError) {
          console.log('Social links error:', socialError.message);
        }
      }

      // Commit transaction
      await connection.commit();
      console.log('Transaction committed successfully');

      // Get updated user data
      const [users] = await connection.query(
        `SELECT u.*, 
                up.position_desired, up.preferred_industries, up.preferred_startup_stage, 
                up.preferred_location, up.skills,
                usl.facebook_url, usl.instagram_url, usl.linkedin_url
         FROM users u
         LEFT JOIN user_preferences up ON u.id = up.user_id
         LEFT JOIN user_social_links usl ON u.id = usl.user_id
         WHERE u.id = ?`,
        [userId]
      );

      if (users.length === 0) {
        return res.status(404).json({ message: 'User not found' });
      }

      const userData = users[0];
      
      // Get employment data (with error handling)
      try {
        const [employmentData] = await connection.query(
          'SELECT * FROM employment WHERE user_id = ? ORDER BY hire_date DESC',
          [userId]
        );
        userData.employment = employmentData || [];
      } catch (empError) {
        console.log('Error fetching employment data:', empError.message);
        userData.employment = [];
      }

      // Get academic profile data (with error handling)
      try {
        const [academicData] = await connection.query(
          'SELECT * FROM academic_profile WHERE user_id = ? ORDER BY graduation_date DESC',
          [userId]
        );
        userData.academic_profile = academicData || [];
      } catch (acadError) {
        console.log('Error fetching academic data:', acadError.message);
        userData.academic_profile = [];
      }

      // Parse JSON fields safely
      if (userData.preferred_industries) {
        try {
          userData.preferred_industries = typeof userData.preferred_industries === 'string' 
            ? JSON.parse(userData.preferred_industries) 
            : userData.preferred_industries;
        } catch (e) {
          console.log('Error parsing preferred_industries:', e.message);
          userData.preferred_industries = [];
        }
      } else {
        userData.preferred_industries = [];
      }
      
      if (userData.skills) {
        try {
          userData.skills = typeof userData.skills === 'string' 
            ? JSON.parse(userData.skills) 
            : userData.skills;
        } catch (e) {
          console.log('Error parsing skills:', e.message);
          userData.skills = [];
        }
      } else {
        userData.skills = [];
      }

      if (userData.accomplishments) {
        try {
          userData.accomplishments = typeof userData.accomplishments === 'string' 
            ? JSON.parse(userData.accomplishments) 
            : userData.accomplishments;
        } catch (e) {
          console.log('Error parsing accomplishments:', e.message);
          userData.accomplishments = [];
        }
      } else {
        userData.accomplishments = [];
      }

      console.log('Profile update completed successfully for user:', userId);
      res.json(userData);

    } catch (error) {
      console.error('Transaction error:', error);
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }

  } catch (error) {
    console.error('Error updating comprehensive profile:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router; 