-- Add missing columns for comprehensive profile update

-- Ensure user_preferences table has skills column
ALTER TABLE user_preferences ADD COLUMN IF NOT EXISTS skills JSON;

-- Ensure user_preferences table columns have the correct types
ALTER TABLE user_preferences MODIFY COLUMN preferred_industries JSON;
ALTER TABLE user_preferences MODIFY COLUMN skills JSON;

-- Ensure users table has all the required columns for the UserDetailsModal
-- (Most of these should already exist based on the schema, but adding them just in case)
ALTER TABLE users ADD COLUMN IF NOT EXISTS gender VARCHAR(50);
ALTER TABLE users ADD COLUMN IF NOT EXISTS birthdate DATE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS contact_number VARCHAR(50);
ALTER TABLE users ADD COLUMN IF NOT EXISTS industry VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS show_in_search BOOLEAN DEFAULT TRUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS show_in_messages BOOLEAN DEFAULT TRUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS show_in_pages BOOLEAN DEFAULT TRUE;

-- Ensure employment table exists and has the correct structure
CREATE TABLE IF NOT EXISTS employment (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  company VARCHAR(255),
  title VARCHAR(255),
  industry VARCHAR(255),
  hire_date DATE,
  is_current BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Ensure academic_profile table exists and has the correct structure
CREATE TABLE IF NOT EXISTS academic_profile (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  level VARCHAR(50),
  course VARCHAR(100),
  institution VARCHAR(100),
  address VARCHAR(255),
  graduation_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Ensure user_social_links table exists and has the correct structure
CREATE TABLE IF NOT EXISTS user_social_links (
  user_id INT PRIMARY KEY,
  facebook_url VARCHAR(255),
  instagram_url VARCHAR(255),
  linkedin_url VARCHAR(255),
  twitter_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Show table structures to verify
SELECT 'user_preferences structure:' as info;
DESCRIBE user_preferences;

SELECT 'users columns related to profile:' as info;
SHOW COLUMNS FROM users LIKE '%gender%';
SHOW COLUMNS FROM users LIKE '%birthdate%';
SHOW COLUMNS FROM users LIKE '%contact%';
SHOW COLUMNS FROM users LIKE '%industry%';
SHOW COLUMNS FROM users LIKE '%show_%';

SELECT 'employment table structure:' as info;
DESCRIBE employment;

SELECT 'academic_profile table structure:' as info;
DESCRIBE academic_profile;

SELECT 'user_social_links table structure:' as info;
DESCRIBE user_social_links; 