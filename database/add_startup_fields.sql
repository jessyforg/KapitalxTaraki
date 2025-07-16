-- Add new columns for additional startup information
ALTER TABLE startups
ADD COLUMN full_address VARCHAR(255),
ADD COLUMN telephone_number VARCHAR(20),
ADD COLUMN facebook_url VARCHAR(255),
ADD COLUMN twitter_url VARCHAR(255),
ADD COLUMN linkedin_url VARCHAR(255),
ADD COLUMN instagram_url VARCHAR(255),
-- Add columns for verification documents
ADD COLUMN business_permit_url VARCHAR(255),
ADD COLUMN sec_registration_url VARCHAR(255),
ADD COLUMN is_verified BOOLEAN DEFAULT FALSE;

-- Add indexes for better query performance
CREATE INDEX idx_startup_verification ON startups(is_verified);
CREATE INDEX idx_startup_contact ON startups(telephone_number);

-- Add comments for documentation
COMMENT ON COLUMN startups.full_address IS 'Complete address of the startup';
COMMENT ON COLUMN startups.telephone_number IS 'Contact number of the startup';
COMMENT ON COLUMN startups.facebook_url IS 'Facebook page URL';
COMMENT ON COLUMN startups.twitter_url IS 'Twitter profile URL';
COMMENT ON COLUMN startups.linkedin_url IS 'LinkedIn company page URL';
COMMENT ON COLUMN startups.instagram_url IS 'Instagram profile URL';
COMMENT ON COLUMN startups.business_permit_url IS 'URL to uploaded business permit document';
COMMENT ON COLUMN startups.sec_registration_url IS 'URL to uploaded SEC registration document';
COMMENT ON COLUMN startups.is_verified IS 'Flag indicating if startup documents have been verified'; 

-- Migrate location data from user_preferences to users
UPDATE users u
JOIN user_preferences up ON u.id = up.user_id
SET u.preferred_location = JSON_OBJECT(
  'region', up.preferred_location,
  'regionCode', '',
  'province', '',
  'provinceCode', '',
  'city', '',
  'cityCode', '',
  'barangay', '',
  'barangayCode', '',
  'street_address', ''
)
WHERE up.preferred_location IS NOT NULL;

-- Mark the preferred_location column in user_preferences as deprecated
ALTER TABLE user_preferences
MODIFY COLUMN preferred_location varchar(255) COMMENT 'DEPRECATED: Use preferred_location in users table instead'; 

-- Convert preferred_location to JSON type
ALTER TABLE user_preferences
MODIFY COLUMN preferred_location JSON;

-- Update any existing location data to JSON format
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
WHERE preferred_location IS NOT NULL; 