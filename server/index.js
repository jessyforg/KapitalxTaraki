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
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
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
      show_in_pages
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

    // Insert into startups table
    const [result] = await pool.query(
      `INSERT INTO startups 
        (entrepreneur_id, name, industry, description, location, funding_needed, pitch_deck_url, business_plan_url, logo_url, video_url, funding_stage, website, startup_stage, approval_status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', NOW(), NOW())`,
      [
        req.user.id, name, industry, description, location, funding_needed, pitch_deck_url,
        business_plan_url, logo_url, video_url, funding_stage, website, startup_stage
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

// Get all startups
app.get('/api/startups', authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM startups');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching startups:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all co-founders (exclude logged-in user)
app.get('/api/cofounders', authenticateToken, async (req, res) => {
  try {
    // Use 'introduction' as bio, and select from users where role = 'entrepreneur' and not the logged-in user
    const [rows] = await pool.query('SELECT id, first_name, last_name, email, introduction, profile_image FROM users WHERE role = ? AND id != ?', ['entrepreneur', req.user.id]);
    const cofounders = rows.map(u => ({
      id: u.id,
      name: `${u.first_name} ${u.last_name}`,
      email: u.email,
      bio: u.introduction || '',
      profile_image: u.profile_image || null
    }));
    res.json(cofounders);
  } catch (error) {
    console.error('Error fetching co-founders:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all investors
app.get('/api/investors', authenticateToken, async (req, res) => {
  try {
    // Fetch from users table where role = 'investor'
    const [rows] = await pool.query('SELECT id, first_name, last_name, email, introduction, profile_image FROM users WHERE role = ?', ['investor']);
    const investors = rows.map(u => ({
      id: u.id,
      name: `${u.first_name} ${u.last_name}`,
      email: u.email,
      bio: u.introduction || '',
      profile_image: u.profile_image || null
    }));
    res.json(investors);
  } catch (error) {
    console.error('Error fetching investors:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 