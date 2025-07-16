CREATE TABLE IF NOT EXISTS team_members (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    position VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    image_url VARCHAR(512) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert some initial team members
INSERT INTO team_members (name, position, description, image_url) VALUES
('Agnes Cervantes', 'Executive Director', 'Agnes leads the strategic direction and overall operations of TARAKI.', '/uploads/team/tbi-team/Agnes.png'),
('Carl Macapanas', 'Technical Lead', 'Carl oversees the technical development and implementation of TARAKI projects.', '/uploads/team/tbi-team/Carl.png'),
('Colston Edralin', 'Business Development Manager', 'Colston drives business growth and partnership initiatives for TARAKI.', '/uploads/team/tbi-team/Colston.png'),
('Earl Cervantes', 'Innovation Lead', 'Earl spearheads innovation and research initiatives at TARAKI.', '/uploads/team/tbi-team/Earl.png'),
('Echo Vanguardia', 'Community Manager', 'Echo manages community engagement and stakeholder relations.', '/uploads/team/tbi-team/Echo.png'),
('Gabe Macapanas', 'Operations Manager', 'Gabe ensures smooth day-to-day operations and project execution.', '/uploads/team/tbi-team/Gabe.png'),
('Les Cervantes', 'Marketing Lead', 'Les drives marketing strategy and brand development.', '/uploads/team/tbi-team/Les.png'),
('Lhorexcel Cervantes', 'Finance Manager', 'Lhorexcel oversees financial planning and management.', '/uploads/team/tbi-team/Lhorexcel.png'),
('Ryzel Cervantes', 'Program Coordinator', 'Ryzel coordinates various programs and initiatives at TARAKI.', '/uploads/team/tbi-team/Ryzel.png');

-- Update existing image paths to use the correct format
UPDATE team_members 
SET image_url = CONCAT('/uploads/team/', SUBSTRING_INDEX(image_url, '/', -1))
WHERE image_url NOT LIKE '/uploads/team/%';

-- Add index on image_url for better query performance
ALTER TABLE team_members ADD INDEX idx_image_url (image_url);