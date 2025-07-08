-- Add remaining missing columns to users table for enhanced admin functionality
-- Run these queries in your MySQL database
-- Note: is_suspended column already exists, so we only add the verification tracking columns

USE taraki_db;

-- Add verification tracking columns (these are the ones missing from your current schema)
ALTER TABLE users 
ADD COLUMN verification_comment TEXT DEFAULT NULL AFTER verification_status,
ADD COLUMN verified_by INT DEFAULT NULL AFTER verification_comment,
ADD COLUMN verified_at TIMESTAMP NULL DEFAULT NULL AFTER verified_by;

-- Add foreign key constraint for verified_by (references admin who verified)
ALTER TABLE users 
ADD CONSTRAINT fk_verified_by 
FOREIGN KEY (verified_by) REFERENCES users(id) ON DELETE SET NULL;

-- Optional: Add index for better performance on verification queries
CREATE INDEX idx_users_verification_status ON users(verification_status);

-- Create Verification_Documents table if it doesn't exist
CREATE TABLE IF NOT EXISTS Verification_Documents (
    document_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    document_type VARCHAR(100) NOT NULL,
    document_number VARCHAR(100),
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    file_type VARCHAR(100),
    file_size INT,
    issue_date DATE,
    expiry_date DATE,
    issuing_authority VARCHAR(255),
    status ENUM('pending', 'approved', 'not approved') DEFAULT 'pending',
    rejection_reason TEXT,
    reviewed_by INT,
    reviewed_at TIMESTAMP NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Create index for better performance
CREATE INDEX idx_verification_docs_user ON Verification_Documents(user_id);
CREATE INDEX idx_verification_docs_status ON Verification_Documents(status);

-- Verify all tables and columns were added
DESCRIBE users;
DESCRIBE Verification_Documents; 