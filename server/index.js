const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

// Add JSON parsing middleware
app.use(express.json());

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// JWT Secret
const JWT_SECRET = 'your-secret-key'; // In production, use environment variable

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
      return res.status(401).json({ error: 'No authorization header' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) {
        console.error('Token verification error:', err);
        if (err.name === 'TokenExpiredError') {
          return res.status(401).json({ error: 'Token expired' });
        }
        return res.status(403).json({ error: 'Invalid token' });
      }

      // Add user info to request
      req.user = decoded;
      next();
    });
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({ error: 'Authentication error' });
  }
};

// Database configuration
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '', // Default XAMPP password is empty
  database: 'taraki_db'
};

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Now import and use the messages router
const messagesRouter = require('./routes/messages')(pool);
app.use('/api/messages', messagesRouter);

// Add search route
const searchRouter = require('./routes/search')(pool);
app.use('/api/search', searchRouter);

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname.replace(/\s+/g, '_'));
  }
});
const upload = multer({ storage });

// Logo upload endpoint
app.post('/api/upload-logo', authenticateToken, upload.single('logo'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  // Return the file URL (assuming server runs at localhost:5000)
  const fileUrl = `/uploads/${req.file.filename}`;
  res.json({ url: fileUrl });
});

// Serve uploaded files statically
app.use('/uploads', express.static(uploadsDir));

// Authentication Routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { first_name, last_name, email, password, role } = req.body;
    const allowedRoles = ['entrepreneur', 'investor', 'admin'];

    // Validate input
    if (!first_name || !last_name || !email || !password || !role) {
      return res.status(400).json({ 
        error: 'All fields are required',
        details: {
          first_name: !first_name ? 'First name is required' : null,
          last_name: !last_name ? 'Last name is required' : null,
          email: !email ? 'Email is required' : null,
          password: !password ? 'Password is required' : null,
          role: !role ? 'Role is required' : null
        }
      });
    }
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Validate password length
    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters long' });
    }

    // Check if user already exists
    const [existingUsers] = await pool.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate verification token
    const verificationToken = Math.random().toString(36).substring(2, 15);

    // Insert new user
    const [result] = await pool.query(
      'INSERT INTO users (first_name, last_name, email, password, verification_token, role, is_verified) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [first_name, last_name, email, hashedPassword, verificationToken, role, false]
    );

    // Insert into role-specific table
    if (role === 'entrepreneur') {
      await pool.query(
        'INSERT INTO entrepreneurs (entrepreneur_id) VALUES (?)',
        [result.insertId]
      );
    } else if (role === 'investor') {
      await pool.query(
        'INSERT INTO investors (investor_id, investment_range_min, investment_range_max) VALUES (?, 0, 0)',
        [result.insertId]
      );
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: result.insertId, email, role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Return success response
    res.status(201).json({
      token,
      user: {
        id: result.insertId,
        first_name,
        last_name,
        email,
        role,
        is_verified: false
      }
    });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message
    });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const [users] = await pool.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = users[0];

    // Verify password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
        is_verified: user.is_verified
      }
    });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Verify email endpoint
app.post('/api/auth/verify-email', async (req, res) => {
  try {
    const { token } = req.body;
    
    const [result] = await pool.query(
      'UPDATE users SET is_verified = 1, verification_token = NULL WHERE verification_token = ?',
      [token]
    );

    if (result.affectedRows === 0) {
      return res.status(400).json({ error: 'Invalid verification token' });
    }

    res.json({ message: 'Email verified successfully' });
  } catch (error) {
    console.error('Error verifying email:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET user profile with new structure
app.get('/api/user/:id', authenticateToken, async (req, res) => {
  try {
    const [userRows] = await pool.query(
      `SELECT id, first_name, last_name, email, role, is_verified, verification_status, 
              profile_image, profile_picture_url, location, introduction, 
              gender, birthdate, contact_number, public_email, industry, 
              show_in_search, show_in_messages, show_in_pages, created_at, updated_at
       FROM users WHERE id = ?`,
      [req.params.id]
    );
    if (!userRows[0]) {
      return res.status(404).json({ error: 'User not found' });
    }
    // Get employment info (return all as array)
    const [employmentRows] = await pool.query(
      'SELECT company, title, industry, hire_date, employment_type FROM employment WHERE user_id = ?',
      [req.params.id]
    );
    // Get academic profile
    const [academicRows] = await pool.query(
      'SELECT level, course, institution, address, graduation_date FROM academic_profile WHERE user_id = ?',
      [req.params.id]
    );
    // Get social links
    const [socialRows] = await pool.query(
      'SELECT facebook_url, twitter_url, instagram_url, linkedin_url, microsoft_url, whatsapp_url, telegram_url FROM user_social_links WHERE user_id = ?',
      [req.params.id]
    );
    // Combine all data
    const userData = {
      ...userRows[0],
      employment: employmentRows || [],
      academic_profile: academicRows || [],
      social_links: socialRows[0] || {}
    };
    res.json(userData);
  } catch (error) {
    console.error('Error getting user profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT user profile with new structure
app.put('/api/user/:id', authenticateToken, async (req, res) => {
  try {
    const {
      first_name,
      last_name,
      email,
      profile_image,
      birthdate,
      gender,
      contact_number,
      location,
      introduction,
      industry,
      employment,
      academic_profile,
      social_links,
      show_in_search,
      show_in_messages,
      show_in_pages,
      skills,
      position_desired,
      preferred_industries,
      preferred_startup_stage,
      preferred_location
    } = req.body;
    await pool.query('START TRANSACTION');
    try {
      // Update user basic info
      await pool.query(
        `UPDATE users SET 
          first_name = ?, last_name = ?, email = ?, profile_image = ?,
          birthdate = ?, gender = ?, contact_number = ?, location = ?,
          introduction = ?, industry = ?, show_in_search = ?,
          show_in_messages = ?, show_in_pages = ?, updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [
          first_name, last_name, email, profile_image,
          birthdate, gender, contact_number, location,
          introduction, industry, show_in_search,
          show_in_messages, show_in_pages, req.params.id
        ]
      );
      // Update employment (support array)
      if (employment && Array.isArray(employment)) {
        await pool.query('DELETE FROM employment WHERE user_id = ?', [req.params.id]);
        for (const emp of employment) {
          await pool.query(
            `INSERT INTO employment (user_id, company, title, industry, hire_date, employment_type)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [
              req.params.id,
              emp.company,
              emp.title,
              emp.industry,
              emp.hire_date,
              emp.employment_type
            ]
          );
        }
      } else if (employment) {
        // Fallback for single object
        await pool.query(
          `INSERT INTO employment (user_id, company, title, industry, hire_date, employment_type)
           VALUES (?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE
           company = VALUES(company),
           title = VALUES(title),
           industry = VALUES(industry),
           hire_date = VALUES(hire_date),
           employment_type = VALUES(employment_type)`,
          [
            req.params.id,
            employment.company,
            employment.title,
            employment.industry,
            employment.hire_date,
            employment.employment_type
          ]
        );
      }
      // Update academic profile
      if (academic_profile && academic_profile.length > 0) {
        await pool.query('DELETE FROM academic_profile WHERE user_id = ?', [req.params.id]);
        for (const profile of academic_profile) {
          await pool.query(
            `INSERT INTO academic_profile 
             (user_id, level, course, institution, address, graduation_date)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [
              req.params.id,
              profile.level,
              profile.course,
              profile.institution,
              profile.address,
              profile.graduation_date
            ]
          );
        }
      }
      // Update social links
      if (social_links) {
        await pool.query(
          `INSERT INTO user_social_links 
           (user_id, facebook_url, twitter_url, instagram_url, linkedin_url, 
            microsoft_url, whatsapp_url, telegram_url)
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
            req.params.id,
            social_links.facebook_url,
            social_links.twitter_url,
            social_links.instagram_url,
            social_links.linkedin_url,
            social_links.microsoft_url,
            social_links.whatsapp_url,
            social_links.telegram_url
          ]
        );
      }
      // Update user skills
      if (Array.isArray(skills)) {
        await pool.query('DELETE FROM user_skills WHERE user_id = ?', [req.params.id]);
        for (const skill of skills) {
          await pool.query(
            'INSERT INTO user_skills (user_id, skill_name, skill_level) VALUES (?, ?, ?)',
            [req.params.id, skill, 'intermediate']
          );
        }
      }
      // Update user preferences
      if (
        position_desired !== undefined ||
        preferred_industries !== undefined ||
        preferred_startup_stage !== undefined ||
        preferred_location !== undefined
      ) {
        await pool.query(
          `INSERT INTO user_preferences (user_id, position_desired, preferred_industries, preferred_startup_stage, preferred_location)
           VALUES (?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE
             position_desired = VALUES(position_desired),
             preferred_industries = VALUES(preferred_industries),
             preferred_startup_stage = VALUES(preferred_startup_stage),
             preferred_location = VALUES(preferred_location)`,
          [
            req.params.id,
            position_desired || null,
            preferred_industries ? JSON.stringify(preferred_industries) : null,
            preferred_startup_stage || null,
            preferred_location || null
          ]
        );
      }
      await pool.query('COMMIT');
      // Fetch and return the latest profile
      const [userRows] = await pool.query(
        `SELECT id, first_name, last_name, email, role, is_verified, verification_status, 
                profile_image, profile_picture_url, location, introduction, 
                gender, birthdate, contact_number, public_email, industry, 
                show_in_search, show_in_messages, show_in_pages, created_at, updated_at
         FROM users WHERE id = ?`,
        [req.params.id]
      );
      const [employmentRows] = await pool.query(
        'SELECT company, title, industry, hire_date, employment_type FROM employment WHERE user_id = ?',
        [req.params.id]
      );
      const [academicRows] = await pool.query(
        'SELECT level, course, institution, address, graduation_date FROM academic_profile WHERE user_id = ?',
        [req.params.id]
      );
      const [socialRows] = await pool.query(
        'SELECT facebook_url, twitter_url, instagram_url, linkedin_url, microsoft_url, whatsapp_url, telegram_url FROM user_social_links WHERE user_id = ?',
        [req.params.id]
      );
      const userData = {
        ...userRows[0],
        employment: employmentRows[0] || null,
        academic_profile: academicRows || [],
        social_links: socialRows[0] || {}
      };
      res.json(userData);
    } catch (error) {
      await pool.query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Password update endpoint
app.put('/api/user/:id/password', authenticateToken, async (req, res) => {
  try {
    const { current_password, new_password } = req.body;
    const userId = req.params.id;

    // Validate input
    if (!current_password || !new_password) {
      return res.status(400).json({ error: 'Current password and new password are required' });
    }

    // Get user's current password
    const [users] = await pool.query(
      'SELECT * FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = users[0];

    // Verify current password
    const validPassword = await bcrypt.compare(current_password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    // Validate new password
    if (new_password.length < 8 || new_password.length > 20) {
      return res.status(400).json({ error: 'Password must be between 8 and 20 characters' });
    }

    if (!/[a-z]/.test(new_password)) {
      return res.status(400).json({ error: 'Password must contain at least one lowercase character' });
    }

    if (!/[A-Z]/.test(new_password)) {
      return res.status(400).json({ error: 'Password must contain at least one uppercase character' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(new_password, 10);

    // Update password
    const [result] = await pool.query(
      'UPDATE users SET password = ? WHERE id = ?',
      [hashedPassword, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(500).json({ error: 'Failed to update password' });
    }

    res.json({ 
      success: true, 
      message: 'Password updated successfully',
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name
      }
    });
  } catch (error) {
    console.error('Error updating password:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add profile image endpoint
app.put('/api/user/:id/profile-image', authenticateToken, async (req, res) => {
  try {
    const { profileImage } = req.body;
    const userId = req.params.id;

    if (!profileImage) {
      console.error('[Profile Image Update] No profileImage provided in request body:', req.body);
      return res.status(400).json({ error: 'Profile image data is required' });
    }

    // Update both profile_image and profile_picture_url columns
    const [result] = await pool.query(
      'UPDATE users SET profile_image = ?, profile_picture_url = ? WHERE id = ?',
      [profileImage, profileImage, userId]
    );

    if (result.affectedRows === 0) {
      console.error(`[Profile Image Update] No user found with id: ${userId}`);
      return res.status(404).json({ error: 'User not found' });
    }

    // Get updated user data
    const [user] = await pool.query(
      'SELECT id, full_name, email, profile_image, profile_picture_url FROM users WHERE id = ?',
      [userId]
    );
    
    res.json({ 
      message: 'Profile image updated successfully',
      user: user[0]
    });
  } catch (error) {
    console.error('[Profile Image Update] Error updating profile image:', error, '\nRequest body:', req.body);
    res.status(500).json({ error: 'Failed to update profile image', details: error.message });
  }
});

// Add social links endpoint
app.get('/api/user/:id/social-links', authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT facebook_url, twitter_url, instagram_url, linkedin_url 
       FROM users WHERE id = ?`,
      [req.params.id]
    );
    res.json(rows[0] || {});
  } catch (error) {
    console.error('Error getting social links:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Temporary endpoint to hash password
app.post('/api/hash-password', async (req, res) => {
  try {
    const { password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    res.json({ 
      original: password,
      hashed: hashedPassword
    });
  } catch (error) {
    console.error('Error hashing password:', error);
    res.status(500).json({ error: 'Failed to hash password' });
  }
});

// Create Startup endpoint
app.post('/api/startups', authenticateToken, async (req, res) => {
  try {
    const {
      name,
      industry,
      description,
      location,
      funding_needed,
      pitch_deck_url,
      business_plan_url,
      logo_url,
      video_url,
      funding_stage,
      website,
      startup_stage
    } = req.body;

    // Validate required fields
    if (!name || !industry) {
      return res.status(400).json({ error: 'Name and industry are required' });
    }

    // Insert into startups table with explicit pending status
    const [result] = await pool.query(
      `INSERT INTO startups 
        (entrepreneur_id, name, industry, description, location, funding_needed, 
         pitch_deck_url, business_plan_url, logo_url, video_url, funding_stage, 
         website, startup_stage, approval_status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', NOW(), NOW())`,
      [
        req.user.id, name, industry, description, location, funding_needed,
        pitch_deck_url, business_plan_url, logo_url, video_url, funding_stage,
        website, startup_stage
      ]
    );

    res.status(201).json({ 
      message: 'Startup created successfully', 
      startup_id: result.insertId 
    });
  } catch (error) {
    console.error('Error creating startup:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get startups with visibility control
app.get('/api/startups', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    let query = `
      SELECT s.*, 
             CONCAT(u.first_name, ' ', u.last_name) as entrepreneur_name,
             u.email as entrepreneur_email
      FROM startups s
      JOIN users u ON s.entrepreneur_id = u.id
      WHERE 1=1
    `;
    const params = [];

    // If not admin, only show approved startups or user's own startups
    if (userRole !== 'admin') {
      query += ` AND (s.approval_status = 'approved' OR s.entrepreneur_id = ?)`;
      params.push(userId);
    }

    // Add filters if provided
    if (req.query.industry) {
      query += ` AND s.industry LIKE ?`;
      params.push(`%${req.query.industry}%`);
    }
    if (req.query.location) {
      query += ` AND s.location LIKE ?`;
      params.push(`%${req.query.location}%`);
    }
    if (req.query.funding_stage) {
      query += ` AND s.funding_stage = ?`;
      params.push(req.query.funding_stage);
    }

    query += ` ORDER BY s.created_at DESC`;

    console.log('DEBUG: /api/startups SQL:', query);
    console.log('DEBUG: /api/startups params:', params);

    const [rows] = await pool.query(query, params);
    console.log('DEBUG: /api/startups result:', rows);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching startups:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all co-founders (exclude logged-in user)
app.get('/api/users/cofounders', authenticateToken, async (req, res) => {
  try {
    // Only return entrepreneurs with verification_status = 'verified'
    const [rows] = await pool.query(`
      SELECT u.*, up.preferred_location, up.preferred_industries, up.preferred_startup_stage
      FROM users u
      LEFT JOIN user_preferences up ON u.id = up.user_id
      WHERE u.role = 'entrepreneur' 
      AND u.id != ? 
      AND u.verification_status = 'verified'
      AND u.show_in_search = 1
    `, [req.user.id]);

    const cofounders = rows.map(u => ({
      id: u.id,
      name: `${u.first_name} ${u.last_name}`,
      email: u.email,
      bio: u.introduction || '',
      profile_image: u.profile_image || null,
      industry: u.industry,
      location: u.location,
      preferred_location: u.preferred_location,
      preferred_industries: u.preferred_industries ? JSON.parse(u.preferred_industries) : [],
      preferred_startup_stage: u.preferred_startup_stage
    }));

    res.json(cofounders);
  } catch (error) {
    console.error('Error fetching co-founders:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all investors
app.get('/api/users/role/investor', authenticateToken, async (req, res) => {
  try {
    // Only return investors with verification_status = 'verified'
    const [rows] = await pool.query(`
      SELECT u.*, i.preferred_industries, i.preferred_locations, i.funding_stage_preferences,
             up.preferred_location
      FROM users u
      LEFT JOIN investors i ON u.id = i.investor_id
      LEFT JOIN user_preferences up ON u.id = up.user_id
      WHERE u.role = 'investor' 
      AND u.verification_status = 'verified'
      AND u.show_in_search = 1
    `);

    const investors = rows.map(u => ({
      id: u.id,
      name: `${u.first_name} ${u.last_name}`,
      email: u.email,
      bio: u.introduction || '',
      profile_image: u.profile_image || null,
      industry: u.industry,
      location: u.location,
      preferred_location: u.preferred_location,
      preferred_industries: u.preferred_industries ? JSON.parse(u.preferred_industries) : [],
      preferred_locations: u.preferred_locations ? JSON.parse(u.preferred_locations) : [],
      funding_stage_preferences: u.funding_stage_preferences ? JSON.parse(u.funding_stage_preferences) : []
    }));

    res.json(investors);
  } catch (error) {
    console.error('Error fetching investors:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create a match between investor and startup
app.post('/api/investor/match', authenticateToken, async (req, res) => {
  try {
    const investor_id = req.user.id;
    const { startup_id, match_score } = req.body;
    // Prevent duplicate matches
    const [existing] = await pool.query(
      'SELECT * FROM matches WHERE investor_id = ? AND startup_id = ?',
      [investor_id, startup_id]
    );
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Already matched' });
    }
    // Insert match
    const [result] = await pool.query(
      'INSERT INTO matches (startup_id, investor_id, match_score) VALUES (?, ?, ?)',
      [startup_id, investor_id, match_score || 0]
    );
    // Get entrepreneur_id and names for notification
    const [[startup]] = await pool.query(
      'SELECT entrepreneur_id, name FROM startups WHERE startup_id = ?',
      [startup_id]
    );
    const [[investor]] = await pool.query(
      'SELECT full_name FROM users WHERE id = ?',
      [investor_id]
    );
    // Notify entrepreneur
    await pool.query(
      `INSERT INTO notifications (user_id, sender_id, type, message, status, created_at)
       VALUES (?, ?, 'investor_match', ?, 'unread', NOW())`,
      [
        startup.entrepreneur_id,
        investor_id,
        `Investor ${investor.full_name} matched with your startup "${startup.name}".`
      ]
    );
    // Notify investor
    await pool.query(
      `INSERT INTO notifications (user_id, sender_id, type, message, status, created_at)
       VALUES (?, ?, 'startup_match', ?, 'unread', NOW())`,
      [
        investor_id,
        startup.entrepreneur_id,
        `You matched with the startup "${startup.name}".`
      ]
    );
    res.status(201).json({ message: 'Match created and notifications sent', match_id: result.insertId });
  } catch (error) {
    console.error('Error creating match:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all matches for the logged-in investor
app.get('/api/matches', authenticateToken, async (req, res) => {
  try {
    const investor_id = req.user.id;
    const [rows] = await pool.query(
      'SELECT * FROM matches WHERE investor_id = ?',
      [investor_id]
    );
    res.json(rows);
  } catch (error) {
    console.error('Error fetching matches:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all matched startups for the logged-in investor (with startup details)
app.get('/api/investor/matches', authenticateToken, async (req, res) => {
  try {
    const investor_id = req.user.id;
    const [rows] = await pool.query(
      `SELECT s.*, m.match_score, m.created_at as matched_at, m.match_id
       FROM matches m
       JOIN startups s ON m.startup_id = s.startup_id
       WHERE m.investor_id = ? /*AND s.approval_status = 'approved'*/
       ORDER BY m.created_at DESC`,
      [investor_id]
    );
    res.json(rows);
  } catch (error) {
    console.error('Error fetching matched startups:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get startups available for matching (not already matched, only approved, with filters)
app.get('/api/investor/available-startups', authenticateToken, async (req, res) => {
  try {
    const investor_id = req.user.id;
    const { industry, location, funding_stage } = req.query;
    // let filter = "WHERE s.approval_status = 'approved' AND s.startup_id NOT IN (SELECT startup_id FROM matches WHERE investor_id = ?)";
    let filter = "WHERE s.startup_id NOT IN (SELECT startup_id FROM matches WHERE investor_id = ?)";
    let params = [investor_id];
    if (industry) {
      filter += " AND s.industry LIKE ?";
      params.push(`%${industry}%`);
    }
    if (location) {
      filter += " AND s.location LIKE ?";
      params.push(`%${location}%`);
    }
    if (funding_stage) {
      filter += " AND s.funding_stage = ?";
      params.push(funding_stage);
    }
    const [rows] = await pool.query(
      `SELECT s.* FROM startups s ${filter} ORDER BY s.created_at DESC`,
      params
    );
    res.json(rows);
  } catch (error) {
    console.error('Error fetching available startups:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Unmatch a startup
app.delete('/api/investor/unmatch/:startup_id', authenticateToken, async (req, res) => {
  try {
    const investor_id = req.user.id;
    const { startup_id } = req.params;
    await pool.query(
      'DELETE FROM matches WHERE investor_id = ? AND startup_id = ?',
      [investor_id, startup_id]
    );
    res.json({ message: 'Unmatched successfully' });
  } catch (error) {
    console.error('Error unmatching:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all entrepreneurs (exclude logged-in user)
app.get('/api/entrepreneurs', authenticateToken, async (req, res) => {
  try {
    // Only return verified entrepreneurs
    const [rows] = await pool.query(
      'SELECT id, first_name, last_name, email, introduction, profile_image, industry FROM users WHERE role = ? AND id != ? AND verification_status = "verified"',
      ['entrepreneur', req.user.id]
    );
    const entrepreneurs = rows.map(u => ({
      id: u.id,
      name: `${u.first_name} ${u.last_name}`,
      email: u.email,
      bio: u.introduction || '',
      profile_image: u.profile_image || null,
      industry: u.industry || ''
    }));
    res.json(entrepreneurs);
  } catch (error) {
    console.error('Error fetching entrepreneurs:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single startup details
app.get('/api/startups/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM startups WHERE startup_id = ?', [req.params.id]);
    if (!rows[0]) return res.status(404).json({ error: 'Startup not found' });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update startup (only creator)
app.put('/api/startups/:id', authenticateToken, upload.single('logo'), async (req, res) => {
  try {
    const { name, industry, description, location, website, pitch_deck_url, business_plan_url, funding_stage, startup_stage } = req.body;
    // Check ownership
    const [rows] = await pool.query('SELECT * FROM startups WHERE startup_id = ?', [req.params.id]);
    if (!rows[0]) return res.status(404).json({ error: 'Startup not found' });
    if (rows[0].entrepreneur_id !== req.user.id) return res.status(403).json({ error: 'Not authorized' });

    let logo_url = rows[0].logo_url;
    if (req.file) {
      logo_url = `/uploads/${req.file.filename}`;
      // Optionally: delete old logo file here
    }

    await pool.query(
      `UPDATE startups SET name=?, industry=?, description=?, location=?, website=?, pitch_deck_url=?, business_plan_url=?, logo_url=?, funding_stage=?, startup_stage=? WHERE startup_id=?`,
      [name, industry, description, location, website, pitch_deck_url, business_plan_url, logo_url, funding_stage, startup_stage, req.params.id]
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add this route after authentication middleware is set up
app.get('/api/users/:id/preferences', authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM user_preferences WHERE user_id = ?',
      [req.params.id]
    );
    if (!rows[0]) {
      return res.json({}); // Fallback: return empty object if not found
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching user preferences:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all users endpoint
app.get('/api/users', authenticateToken, async (req, res) => {
  try {
    const [users] = await pool.query(`
      SELECT id, first_name, last_name, email, role, is_verified, created_at, updated_at
      FROM users
      ORDER BY created_at DESC
    `);
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Set up multer for file uploads
const verificationUpload = multer({
  dest: 'uploads/verification_documents/',
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowed = ['application/pdf', 'image/jpeg', 'image/png'];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Invalid file type.'));
  }
});

// GET verification status and documents
app.get('/api/verification/status', authenticateToken, async (req, res) => {
  try {
    const user_id = req.user.id;
    // Get user status
    const [[user]] = await pool.query('SELECT verification_status FROM users WHERE id = ?', [user_id]);
    // Get all documents
    const [documents] = await pool.query('SELECT * FROM Verification_Documents WHERE user_id = ? ORDER BY uploaded_at DESC', [user_id]);
    res.json({ verification_status: user?.verification_status || 'pending', documents });
  } catch (error) {
    console.error('Error fetching verification status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST upload verification document
app.post('/api/verification/upload', authenticateToken, verificationUpload.single('document'), async (req, res) => {
  try {
    const user_id = req.user.id;
    const { document_type, document_number, issue_date, expiry_date, issuing_authority } = req.body;
    const file = req.file;
    if (!file) return res.status(400).json({ error: 'No file uploaded' });
    // Move file to permanent location with unique name
    const ext = path.extname(file.originalname);
    const newFileName = `${Date.now()}_${user_id}${ext}`;
    const newPath = path.join('uploads/verification_documents/', newFileName);
    fs.renameSync(file.path, newPath);
    // Insert document record
    await pool.query(
      `INSERT INTO Verification_Documents (user_id, document_type, document_number, issue_date, expiry_date, issuing_authority, file_name, file_path, file_type, file_size, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [user_id, document_type, document_number, issue_date || null, expiry_date || null, issuing_authority, newFileName, newPath, file.mimetype, file.size]
    );
    // Update user verification status
    const [[counts]] = await pool.query(
      `SELECT 
        COUNT(CASE WHEN status = 'not approved' THEN 1 END) as not_approved_count,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_count,
        COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved_count
      FROM Verification_Documents WHERE user_id = ?`, [user_id]
    );
    let new_status = 'pending';
    if (counts.not_approved_count > 0) new_status = 'not approved';
    else if (counts.pending_count > 0) new_status = 'pending';
    else if (counts.approved_count > 0 && counts.approved_count === (counts.not_approved_count + counts.pending_count + counts.approved_count)) new_status = 'verified';
    await pool.query('UPDATE users SET verification_status = ? WHERE id = ?', [new_status, user_id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Error uploading verification document:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT update verification document
app.put('/api/verification/document/:id', authenticateToken, verificationUpload.single('document'), async (req, res) => {
  try {
    const user_id = req.user.id;
    const doc_id = req.params.id;
    // Get the document
    const [[doc]] = await pool.query('SELECT * FROM Verification_Documents WHERE document_id = ?', [doc_id]);
    if (!doc) return res.status(404).json({ error: 'Document not found' });
    if (doc.user_id !== user_id) return res.status(403).json({ error: 'Not authorized' });

    // Prepare update fields
    const { document_type, document_number, issue_date, expiry_date, issuing_authority } = req.body;
    let file_name = doc.file_name;
    let file_path = doc.file_path;
    let file_type = doc.file_type;
    let file_size = doc.file_size;
    // If new file uploaded, replace old file
    if (req.file) {
      // Delete old file
      if (fs.existsSync(doc.file_path)) {
        fs.unlinkSync(doc.file_path);
      }
      const ext = path.extname(req.file.originalname);
      const newFileName = `${Date.now()}_${user_id}${ext}`;
      const newPath = path.join('uploads/verification_documents/', newFileName);
      fs.renameSync(req.file.path, newPath);
      file_name = newFileName;
      file_path = newPath;
      file_type = req.file.mimetype;
      file_size = req.file.size;
    }
    // Update document
    await pool.query(
      `UPDATE Verification_Documents SET document_type=?, document_number=?, issue_date=?, expiry_date=?, issuing_authority=?, file_name=?, file_path=?, file_type=?, file_size=?, status='pending', rejection_reason=NULL WHERE document_id=?`,
      [document_type, document_number, issue_date || null, expiry_date || null, issuing_authority, file_name, file_path, file_type, file_size, doc_id]
    );
    // Update user verification status
    const [[counts]] = await pool.query(
      `SELECT 
        COUNT(CASE WHEN status = 'not approved' THEN 1 END) as not_approved_count,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_count,
        COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved_count
      FROM Verification_Documents WHERE user_id = ?`, [user_id]
    );
    let new_status = 'pending';
    if (counts.not_approved_count > 0) new_status = 'not approved';
    else if (counts.pending_count > 0) new_status = 'pending';
    else if (counts.approved_count > 0 && counts.approved_count === (counts.not_approved_count + counts.pending_count + counts.approved_count)) new_status = 'verified';
    await pool.query('UPDATE users SET verification_status = ? WHERE id = ?', [new_status, user_id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating verification document:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE verification document
app.delete('/api/verification/document/:id', authenticateToken, async (req, res) => {
  try {
    const user_id = req.user.id;
    const doc_id = req.params.id;
    // Get the document
    const [[doc]] = await pool.query('SELECT * FROM Verification_Documents WHERE document_id = ?', [doc_id]);
    if (!doc) return res.status(404).json({ error: 'Document not found' });
    if (doc.user_id !== user_id) return res.status(403).json({ error: 'Not authorized' });
    // Delete file from disk
    if (fs.existsSync(doc.file_path)) {
      fs.unlinkSync(doc.file_path);
    }
    // Delete from database
    await pool.query('DELETE FROM Verification_Documents WHERE document_id = ?', [doc_id]);
    // Update user verification status
    const [[counts]] = await pool.query(
      `SELECT 
        COUNT(CASE WHEN status = 'not approved' THEN 1 END) as not_approved_count,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_count,
        COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved_count
      FROM Verification_Documents WHERE user_id = ?`, [user_id]
    );
    let new_status = 'pending';
    if (counts.not_approved_count > 0) new_status = 'not approved';
    else if (counts.pending_count > 0) new_status = 'pending';
    else if (counts.approved_count > 0 && counts.approved_count === (counts.not_approved_count + counts.pending_count + counts.approved_count)) new_status = 'verified';
    await pool.query('UPDATE users SET verification_status = ? WHERE id = ?', [new_status, user_id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting verification document:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin: Get all pending verification documents with user info
app.get('/api/admin/verification/pending', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
    const [docs] = await pool.query(`
      SELECT vd.*, u.first_name, u.last_name, u.email, u.role, u.is_verified
      FROM Verification_Documents vd
      JOIN users u ON vd.user_id = u.id
      WHERE vd.status = 'pending'
      ORDER BY vd.uploaded_at ASC
    `);
    res.json(docs);
  } catch (error) {
    console.error('Error fetching pending verification documents:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin: Get details of a specific verification document
app.get('/api/admin/verification/document/:id', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
    const doc_id = req.params.id;
    const [[doc]] = await pool.query(`
      SELECT vd.*, u.first_name, u.last_name, u.email, u.role, u.is_verified
      FROM Verification_Documents vd
      JOIN users u ON vd.user_id = u.id
      WHERE vd.document_id = ?
    `, [doc_id]);
    if (!doc) return res.status(404).json({ error: 'Document not found' });
    res.json(doc);
  } catch (error) {
    console.error('Error fetching verification document details:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin: Approve a verification document
app.post('/api/admin/verification/document/:id/approve', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
    const doc_id = req.params.id;
    const admin_id = req.user.id;
    // Update document status
    await pool.query(
      `UPDATE Verification_Documents SET status='approved', reviewed_by=?, reviewed_at=NOW(), rejection_reason=NULL WHERE document_id=?`,
      [admin_id, doc_id]
    );
    // Get user_id
    const [[doc]] = await pool.query('SELECT user_id FROM Verification_Documents WHERE document_id = ?', [doc_id]);
    if (doc) {
      // Recalculate user verification status
      const user_id = doc.user_id;
      const [[counts]] = await pool.query(
        `SELECT 
          COUNT(CASE WHEN status = 'not approved' THEN 1 END) as not_approved_count,
          COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_count,
          COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved_count
        FROM Verification_Documents WHERE user_id = ?`, [user_id]
      );
      let new_status = 'pending';
      if (counts.not_approved_count > 0) new_status = 'not approved';
      else if (counts.pending_count > 0) new_status = 'pending';
      else if (counts.approved_count > 0 && counts.approved_count === (counts.not_approved_count + counts.pending_count + counts.approved_count)) new_status = 'verified';
      await pool.query('UPDATE users SET verification_status = ? WHERE id = ?', [new_status, user_id]);
    }
    res.json({ success: true });
  } catch (error) {
    console.error('Error approving verification document:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin: Reject a verification document
app.post('/api/admin/verification/document/:id/reject', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
    const doc_id = req.params.id;
    const admin_id = req.user.id;
    const { rejection_reason } = req.body;
    if (!rejection_reason) return res.status(400).json({ error: 'Rejection reason is required' });
    // Update document status
    await pool.query(
      `UPDATE Verification_Documents SET status='not approved', reviewed_by=?, reviewed_at=NOW(), rejection_reason=? WHERE document_id=?`,
      [admin_id, rejection_reason, doc_id]
    );
    // Get user_id
    const [[doc]] = await pool.query('SELECT user_id FROM Verification_Documents WHERE document_id = ?', [doc_id]);
    if (doc) {
      // Recalculate user verification status
      const user_id = doc.user_id;
      const [[counts]] = await pool.query(
        `SELECT 
          COUNT(CASE WHEN status = 'not approved' THEN 1 END) as not_approved_count,
          COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_count,
          COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved_count
        FROM Verification_Documents WHERE user_id = ?`, [user_id]
      );
      let new_status = 'pending';
      if (counts.not_approved_count > 0) new_status = 'not approved';
      else if (counts.pending_count > 0) new_status = 'pending';
      else if (counts.approved_count > 0 && counts.approved_count === (counts.not_approved_count + counts.pending_count + counts.approved_count)) new_status = 'verified';
      await pool.query('UPDATE users SET verification_status = ? WHERE id = ?', [new_status, user_id]);
    }
    res.json({ success: true });
  } catch (error) {
    console.error('Error rejecting verification document:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Approve startup (admin only)
app.post('/api/admin/startups/:id/approve', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can approve startups' });
    }

    const { id } = req.params;
    const { approval_comment } = req.body;

    // Update startup status
    await pool.query(
      `UPDATE startups 
       SET approval_status = 'approved', 
           approved_by = ?, 
           approval_comment = ?,
           updated_at = NOW()
       WHERE startup_id = ?`,
      [req.user.id, approval_comment, id]
    );

    res.json({ message: 'Startup approved successfully' });
  } catch (error) {
    console.error('Error approving startup:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Reject startup (admin only)
app.post('/api/admin/startups/:id/reject', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can reject startups' });
    }

    const { id } = req.params;
    const { approval_comment } = req.body;

    if (!approval_comment) {
      return res.status(400).json({ error: 'Rejection reason is required' });
    }

    // Update startup status
    await pool.query(
      `UPDATE startups 
       SET approval_status = 'rejected', 
           approved_by = ?, 
           approval_comment = ?,
           updated_at = NOW()
       WHERE startup_id = ?`,
      [req.user.id, approval_comment, id]
    );

    res.json({ message: 'Startup rejected successfully' });
  } catch (error) {
    console.error('Error rejecting startup:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create Event endpoint
app.post('/api/events', authenticateToken, async (req, res) => {
  try {
    const { title, description, event_date, location, status, rsvp_link, time, tags } = req.body;
    if (!title || !event_date) {
      return res.status(400).json({ error: 'Title and event_date are required' });
    }
    const [result] = await pool.query(
      `INSERT INTO events (title, description, event_date, location, organizer_id, status, rsvp_link, time, tags, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [title, description, event_date, location, req.user.id, status || 'upcoming', rsvp_link, time, tags]
    );
    const [rows] = await pool.query('SELECT * FROM events WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

const eventsRouter = require('../taraki-backend/src/routes/events');
app.use('/api/events', eventsRouter);

// Get all startups matched with the logged-in investor
app.get('/api/startups/matched', authenticateToken, async (req, res) => {
  console.log('DEBUG: /api/startups/matched endpoint hit by user', req.user);
  try {
    const investor_id = req.user.id;
    const [rows] = await pool.query(
      `SELECT s.*
       FROM startups s
       INNER JOIN matches m ON s.startup_id = m.startup_id
       WHERE m.investor_id = ?`,
      [investor_id]
    );
    console.log('DEBUG: Matched startups SQL result:', rows);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching matched startups:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all entrepreneurs
app.get('/api/users/role/entrepreneur', authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT u.*, up.preferred_location, up.preferred_industries, up.preferred_startup_stage
      FROM users u
      LEFT JOIN user_preferences up ON u.id = up.user_id
      WHERE u.role = 'entrepreneur'
      AND u.verification_status = 'verified'
      AND u.show_in_search = 1
    `);

    const entrepreneurs = rows.map(u => ({
      id: u.id,
      name: `${u.first_name} ${u.last_name}`,
      email: u.email,
      bio: u.introduction || '',
      profile_image: u.profile_image || null,
      industry: u.industry,
      location: u.location,
      preferred_location: u.preferred_location,
      preferred_industries: u.preferred_industries ? JSON.parse(u.preferred_industries) : [],
      preferred_startup_stage: u.preferred_startup_stage
    }));

    res.json(entrepreneurs);
  } catch (error) {
    console.error('Error fetching entrepreneurs:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

const ticketsRouter = require('./routes/tickets')(pool);
app.use('/api/tickets', ticketsRouter);

const notificationsRouter = require('./routes/notifications')(pool);
app.use('/api/notifications', notificationsRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 