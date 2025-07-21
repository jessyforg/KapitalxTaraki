-- Add funding_status column to startups table
ALTER TABLE startups
ADD COLUMN funding_status ENUM('not_funded', 'funded') DEFAULT 'not_funded';

-- Add index for better query performance
CREATE INDEX idx_startup_funding ON startups(funding_status);

-- Add comment for documentation
COMMENT ON COLUMN startups.funding_status IS 'Status indicating if the startup has received funding'; 