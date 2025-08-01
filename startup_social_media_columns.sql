-- SQL Query to ensure startup social media columns exist
-- This query can be run to add social media columns if they don't already exist

-- Check if columns exist and add them if missing
SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE TABLE_NAME = 'startups' 
     AND COLUMN_NAME = 'facebook_url' 
     AND TABLE_SCHEMA = DATABASE()) > 0,
    'SELECT ''facebook_url column already exists'' as status;',
    'ALTER TABLE startups ADD COLUMN facebook_url VARCHAR(255);'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE TABLE_NAME = 'startups' 
     AND COLUMN_NAME = 'twitter_url' 
     AND TABLE_SCHEMA = DATABASE()) > 0,
    'SELECT ''twitter_url column already exists'' as status;',
    'ALTER TABLE startups ADD COLUMN twitter_url VARCHAR(255);'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE TABLE_NAME = 'startups' 
     AND COLUMN_NAME = 'linkedin_url' 
     AND TABLE_SCHEMA = DATABASE()) > 0,
    'SELECT ''linkedin_url column already exists'' as status;',
    'ALTER TABLE startups ADD COLUMN linkedin_url VARCHAR(255);'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE TABLE_NAME = 'startups' 
     AND COLUMN_NAME = 'instagram_url' 
     AND TABLE_SCHEMA = DATABASE()) > 0,
    'SELECT ''instagram_url column already exists'' as status;',
    'ALTER TABLE startups ADD COLUMN instagram_url VARCHAR(255);'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add indexes for better performance (if they don't exist)
CREATE INDEX IF NOT EXISTS idx_startup_social_media ON startups(facebook_url, twitter_url, linkedin_url, instagram_url);

-- Add comments for documentation
ALTER TABLE startups 
MODIFY COLUMN facebook_url VARCHAR(255) COMMENT 'Facebook page URL for the startup',
MODIFY COLUMN twitter_url VARCHAR(255) COMMENT 'Twitter/X profile URL for the startup',
MODIFY COLUMN linkedin_url VARCHAR(255) COMMENT 'LinkedIn company page URL for the startup',
MODIFY COLUMN instagram_url VARCHAR(255) COMMENT 'Instagram profile URL for the startup';

-- Verify the columns exist
SELECT 
    COLUMN_NAME,
    DATA_TYPE,
    IS_NULLABLE,
    COLUMN_DEFAULT,
    COLUMN_COMMENT
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'startups' 
AND COLUMN_NAME IN ('facebook_url', 'twitter_url', 'linkedin_url', 'instagram_url')
AND TABLE_SCHEMA = DATABASE()
ORDER BY COLUMN_NAME; 