-- Update approval_status column to include 'suspended' status
ALTER TABLE startups 
MODIFY approval_status ENUM('pending', 'approved', 'rejected', 'suspended') 
DEFAULT 'pending'; 

-- Add missing columns to users table for admin management functionality
ALTER TABLE users 
ADD COLUMN is_suspended BOOLEAN DEFAULT FALSE AFTER is_verified,
ADD COLUMN industry VARCHAR(255) DEFAULT NULL AFTER location; 