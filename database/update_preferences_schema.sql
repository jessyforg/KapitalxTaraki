-- Create a backup of the user_preferences table
CREATE TABLE user_preferences_backup AS SELECT * FROM user_preferences;

-- Update existing location data to JSON format
UPDATE user_preferences
SET preferred_location = JSON_OBJECT(
  'region', preferred_location,
  'regionCode', '',
  'province', '',
  'provinceCode', '',
  'city', '',
  'cityCode', '',
  'barangay', '',
  'barangayCode', '',
  'street_address', ''
)
WHERE preferred_location IS NOT NULL AND preferred_location != '';

-- Modify the column to JSON type
ALTER TABLE user_preferences
MODIFY COLUMN preferred_location JSON;

-- Add a comment to document the change
ALTER TABLE user_preferences
MODIFY COLUMN preferred_location JSON 
COMMENT 'Stores location preferences in JSON format with region, province, city, and barangay details';

-- Add skills column if it doesn't exist
ALTER TABLE user_preferences
ADD COLUMN IF NOT EXISTS skills JSON NULL
COMMENT 'Stores user skills as a JSON array';

-- Ensure preferred_industries is JSON
ALTER TABLE user_preferences
MODIFY COLUMN preferred_industries JSON NULL
COMMENT 'Stores preferred industries as a JSON array'; 