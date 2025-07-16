-- Fix user_preferences table structure

-- First, remove the UNIQUE constraint from user_id if it exists
ALTER TABLE user_preferences DROP INDEX user_id;

-- Add the skills column if it doesn't exist
ALTER TABLE user_preferences ADD COLUMN IF NOT EXISTS skills JSON AFTER preferred_location;

-- Convert longtext columns to JSON (this will preserve existing data)
-- Note: MySQL will automatically convert valid JSON strings to JSON type
ALTER TABLE user_preferences MODIFY COLUMN preferred_industries JSON;
ALTER TABLE user_preferences MODIFY COLUMN preferred_location JSON;
ALTER TABLE user_preferences MODIFY COLUMN skills JSON;

-- Ensure position_desired can hold longer values
ALTER TABLE user_preferences MODIFY COLUMN position_desired VARCHAR(255);

-- Add back a proper index on user_id (non-unique since a user can have multiple preference records)
ALTER TABLE user_preferences ADD INDEX idx_user_id (user_id);

-- Show the updated structure
DESCRIBE user_preferences; 