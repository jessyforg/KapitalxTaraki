-- Fix user_preferences table structure (handling foreign key constraints)

-- First, let's check the current constraints
SHOW CREATE TABLE user_preferences;

-- Add the skills column if it doesn't exist
ALTER TABLE user_preferences ADD COLUMN IF NOT EXISTS skills JSON AFTER preferred_location;

-- Convert longtext columns to JSON (this will preserve existing data)
-- Note: MySQL will automatically convert valid JSON strings to JSON type
ALTER TABLE user_preferences MODIFY COLUMN preferred_industries JSON;
ALTER TABLE user_preferences MODIFY COLUMN preferred_location JSON;
ALTER TABLE user_preferences MODIFY COLUMN skills JSON;

-- Ensure position_desired can hold longer values
ALTER TABLE user_preferences MODIFY COLUMN position_desired VARCHAR(255);

-- Show the updated structure
DESCRIBE user_preferences;

-- Check if there are any existing records that might cause issues
SELECT COUNT(*) as total_records FROM user_preferences;

-- Show a sample of existing data to understand the current format
SELECT user_id, position_desired, preferred_industries, preferred_location, skills 
FROM user_preferences 
LIMIT 3; 