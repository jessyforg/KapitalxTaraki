-- Final comprehensive fix for user_preferences table

-- Check current structure
DESCRIBE user_preferences;

-- Add skills column if it doesn't exist
ALTER TABLE user_preferences ADD COLUMN IF NOT EXISTS skills JSON;

-- Update column types to JSON
ALTER TABLE user_preferences MODIFY COLUMN preferred_industries JSON;
ALTER TABLE user_preferences MODIFY COLUMN preferred_location JSON; 
ALTER TABLE user_preferences MODIFY COLUMN skills JSON;

-- Expand position_desired column
ALTER TABLE user_preferences MODIFY COLUMN position_desired VARCHAR(255);

-- Show updated structure
DESCRIBE user_preferences;

-- Test if we can insert/update data
-- (Remove this section after testing)
-- INSERT INTO user_preferences (user_id, position_desired, preferred_industries, preferred_startup_stage, preferred_location, skills) 
-- VALUES (999, 'test', '["Technology"]', 'mvp', '{"region": "test"}', '["JavaScript"]')
-- ON DUPLICATE KEY UPDATE position_desired = VALUES(position_desired); 