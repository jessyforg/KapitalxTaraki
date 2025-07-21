-- Fix employment table structure to match backend expectations

-- Add the missing is_current column that the backend expects
ALTER TABLE employment ADD COLUMN IF NOT EXISTS is_current BOOLEAN DEFAULT FALSE;

-- Add missing timestamp columns for consistency
ALTER TABLE employment ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE employment ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- Ensure column sizes match the backend expectations
ALTER TABLE employment MODIFY COLUMN company VARCHAR(255);
ALTER TABLE employment MODIFY COLUMN title VARCHAR(255);  
ALTER TABLE employment MODIFY COLUMN industry VARCHAR(255);

-- Add helpful indexes
CREATE INDEX IF NOT EXISTS idx_employment_user_id ON employment(user_id);
CREATE INDEX IF NOT EXISTS idx_employment_current ON employment(is_current);

-- Show the updated structure
SELECT 'Updated employment table structure:' as info;
DESCRIBE employment;

-- Verify the is_current column exists
SELECT 'Checking for is_current column:' as info;
SHOW COLUMNS FROM employment LIKE 'is_current'; 