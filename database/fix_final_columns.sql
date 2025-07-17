-- Final fixes for the database structure

-- Fix user_preferences table column types
ALTER TABLE user_preferences MODIFY COLUMN preferred_industries JSON;
ALTER TABLE user_preferences MODIFY COLUMN skills JSON;

-- Add missing columns to employment table
ALTER TABLE employment ADD COLUMN IF NOT EXISTS is_current BOOLEAN DEFAULT FALSE;
ALTER TABLE employment ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE employment ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- Update employment table column sizes to match our endpoint
ALTER TABLE employment MODIFY COLUMN company VARCHAR(255);
ALTER TABLE employment MODIFY COLUMN title VARCHAR(255);
ALTER TABLE employment MODIFY COLUMN industry VARCHAR(255);

-- Show the updated structures
SELECT 'Updated user_preferences:' as info;
DESCRIBE user_preferences;

SELECT 'Updated employment:' as info;
DESCRIBE employment; 