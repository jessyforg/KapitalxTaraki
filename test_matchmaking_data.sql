-- Comprehensive Matchmaking Test Data
-- This script creates realistic test data for testing the enhanced matchmaking algorithm

-- Clear existing test data
-- DELETE FROM user_preferences WHERE user_id > 100;
-- DELETE FROM user_skills WHERE user_id > 100;
-- DELETE FROM users WHERE id > 100;

START TRANSACTION;

-- Create test users with complete profile data
-- Test Entrepreneurs (101-110)
INSERT INTO users (
  id, first_name, last_name, full_name, email, password, role, 
  is_verified, verification_status, location, industry, introduction,
  gender, birthdate, contact_number, created_at
) VALUES 
-- Technology Entrepreneurs in Baguio
(101, 'Juan Carlos', 'De Leon', 'Juan Carlos De Leon', 'juan.deleon@test.com', '$2b$10$encrypted_password', 'entrepreneur', 1, 'verified', 'Baguio City', 'Technology', 'Passionate tech entrepreneur focused on AI and machine learning solutions for local businesses.', 'male', '1992-03-15', '+639171234567', NOW()),
(102, 'Maria Sofia', 'Reyes', 'Maria Sofia Reyes', 'maria.reyes@test.com', '$2b$10$encrypted_password', 'entrepreneur', 1, 'verified', 'Baguio City', 'Technology', 'Full-stack developer turned entrepreneur, building EdTech solutions for rural communities.', 'female', '1990-07-22', '+639181234568', NOW()),
(103, 'Carlos Miguel', 'Santos', 'Carlos Miguel Santos', 'carlos.santos@test.com', '$2b$10$encrypted_password', 'entrepreneur', 1, 'verified', 'La Trinidad', 'Technology', 'Mobile app developer specializing in FinTech and agricultural technology solutions.', 'male', '1988-11-08', '+639191234569', NOW()),

-- Healthcare/AgTech Entrepreneurs
(104, 'Dr. Ana Marie', 'Villanueva', 'Dr. Ana Marie Villanueva', 'ana.villanueva@test.com', '$2b$10$encrypted_password', 'entrepreneur', 1, 'verified', 'Baguio City', 'Healthcare', 'Medical doctor developing telemedicine platforms for remote mountain communities.', 'female', '1985-05-12', '+639201234570', NOW()),
(105, 'Roberto Luis', 'Fernandez', 'Roberto Luis Fernandez', 'roberto.fernandez@test.com', '$2b$10$encrypted_password', 'entrepreneur', 1, 'verified', 'La Trinidad', 'Agriculture', 'Agricultural engineer creating smart farming solutions using IoT and data analytics.', 'male', '1991-09-03', '+639211234571', NOW()),

-- Test Investors (201-210)  
(201, 'Victoria Grace', 'Lim', 'Victoria Grace Lim', 'victoria.lim@investor.com', '$2b$10$encrypted_password', 'investor', 1, 'verified', 'Baguio City', 'Technology', 'Angel investor focused on early-stage tech startups in Northern Luzon.', 'female', '1978-12-10', '+639221234572', NOW()),
(202, 'Edmund James', 'Tan', 'Edmund James Tan', 'edmund.tan@investor.com', '$2b$10$encrypted_password', 'investor', 1, 'verified', 'Baguio City', 'Healthcare', 'Healthcare industry veteran investing in health-tech and medical device startups.', 'male', '1975-04-18', '+639231234573', NOW()),
(203, 'Patricia Ann', 'Cruz', 'Patricia Ann Cruz', 'patricia.cruz@investor.com', '$2b$10$encrypted_password', 'investor', 1, 'verified', 'La Trinidad', 'Technology', 'Former tech executive now investing in AI/ML and EdTech companies.', 'female', '1980-08-25', '+639241234574', NOW()),
(204, 'Michael John', 'Garcia', 'Michael John Garcia', 'michael.garcia@investor.com', '$2b$10$encrypted_password', 'investor', 1, 'verified', 'Tabuk City', 'Agriculture', 'AgTech investor supporting sustainable farming and food security initiatives.', 'male', '1982-01-30', '+639251234575', NOW());

-- Insert user preferences
INSERT INTO user_preferences (
  user_id, position_desired, preferred_industries, preferred_startup_stage, preferred_location
) VALUES 
-- Entrepreneur preferences
(101, 'technical_co-founder', '["Technology", "AI/ML", "Software Development"]', 'mvp', 'Baguio City'),
(102, 'product_co-founder', '["Technology", "EdTech", "Educational Technology"]', 'mvp', 'Baguio City'),
(103, 'business_co-founder', '["Technology", "FinTech", "AgTech"]', 'scaling', 'Baguio City'),
(104, 'healthcare_partner', '["Healthcare", "HealthTech", "Telemedicine"]', 'mvp', 'Baguio City'),
(105, 'technical_partner', '["Agriculture", "AgTech", "Sustainable Agriculture"]', 'scaling', 'La Trinidad'),

-- Investor preferences  
(201, 'investor', '["Technology", "AI/ML", "FinTech", "EdTech"]', 'mvp', 'Baguio City'),
(202, 'investor', '["Healthcare", "HealthTech", "Medical Services"]', 'mvp', 'Baguio City'), 
(203, 'investor', '["Technology", "EdTech", "AI/ML"]', 'scaling', 'Baguio City'),
(204, 'investor', '["Agriculture", "AgTech", "Food Processing"]', 'scaling', 'Baguio City');

-- Insert user skills
INSERT INTO user_skills (user_id, skill_name, skill_level) VALUES 
-- Juan Carlos (101) - AI/ML Tech Entrepreneur
(101, 'Python Programming', 'expert'),
(101, 'Machine Learning', 'expert'), 
(101, 'React', 'intermediate'),
(101, 'Data Science', 'expert'),
(101, 'Business Strategy', 'intermediate'),

-- Maria Sofia (102) - EdTech Entrepreneur
(102, 'React', 'expert'),
(102, 'Node.js', 'expert'),
(102, 'UI/UX Design', 'intermediate'),
(102, 'Educational Technology', 'expert'),
(102, 'Product Management', 'intermediate'),

-- Carlos Miguel (103) - FinTech/AgTech 
(103, 'Mobile Development', 'expert'),
(103, 'React Native', 'expert'),
(103, 'Blockchain', 'intermediate'),
(103, 'Financial Services', 'intermediate'),
(103, 'Agricultural Technology', 'beginner'),

-- Dr. Ana Marie (104) - HealthTech
(104, 'Medical Practice', 'expert'),
(104, 'Telemedicine', 'expert'),
(104, 'Healthcare Analytics', 'intermediate'),
(104, 'Product Strategy', 'intermediate'),
(104, 'Regulatory Compliance', 'expert'),

-- Roberto Luis (105) - AgTech
(105, 'Agricultural Engineering', 'expert'),
(105, 'IoT Development', 'expert'),
(105, 'Data Analytics', 'expert'),
(105, 'Sustainable Agriculture', 'expert'),
(105, 'Business Development', 'intermediate');

-- Create some test startups
INSERT INTO startups (
  startup_id, name, description, industry, location, startup_stage, 
  entrepreneur_id, approval_status, created_at
) VALUES 
(501, 'MindBridge AI', 'AI-powered mental health platform for rural communities in the Philippines', 'Technology', 'Baguio City', 'mvp', 101, 'approved', NOW()),
(502, 'EduKonnect', 'Interactive learning platform connecting students in remote areas with quality education', 'Technology', 'Baguio City', 'mvp', 102, 'approved', NOW()),
(503, 'FarmSense', 'IoT-based smart farming solution for sustainable agriculture in mountain provinces', 'Agriculture', 'La Trinidad', 'scaling', 105, 'approved', NOW()),
(504, 'HealthReach', 'Telemedicine platform connecting rural patients with healthcare professionals', 'Healthcare', 'Baguio City', 'mvp', 104, 'approved', NOW()),
(505, 'PayMountain', 'Mobile payment solution designed for rural and mountainous regions', 'Technology', 'La Trinidad', 'scaling', 103, 'approved', NOW());

-- Test query to verify data
SELECT 
  u.id, u.first_name, u.last_name, u.role, u.industry, u.location,
  up.preferred_industries, up.preferred_startup_stage, up.preferred_location,
  GROUP_CONCAT(us.skill_name ORDER BY us.skill_level DESC) as skills
FROM users u
LEFT JOIN user_preferences up ON u.id = up.user_id
LEFT JOIN user_skills us ON u.id = us.user_id
WHERE u.id BETWEEN 101 AND 210
GROUP BY u.id, u.first_name, u.last_name, u.role, u.industry, u.location, up.preferred_industries, up.preferred_startup_stage, up.preferred_location
ORDER BY u.role, u.id;

-- Show startups
SELECT startup_id, name, industry, location, startup_stage, entrepreneur_id, approval_status
FROM startups 
WHERE startup_id BETWEEN 501 AND 510
ORDER BY startup_id;

-- Show sample investor data
SELECT u.first_name, u.last_name, i.investment_range_min, i.investment_range_max, i.preferred_industries, i.preferred_locations
FROM users u
JOIN investors i ON u.id = i.investor_id
WHERE u.id BETWEEN 201 AND 205;

COMMIT;

-- Instructions for Testing:
-- 1. Run this SQL script in your database
-- 2. Login as any user (or create a test user with ID 2 and preferences matching some of the above)
-- 3. Navigate to the EntrepreneurDashboard or InvestorDashboard
-- 4. The mock data should be replaced by this real database data
-- 5. Match scores should now be calculated by the algorithm based on:
--    - Industry alignment (Technology matches Technology)
--    - Location proximity (Baguio City, La Trinidad)
--    - Startup stage preferences (MVP, Scaling, etc.)
--    - Skills compatibility
-- 6. Expected results:
--    - High matches (80-95%): Same industry + same location + compatible stage
--    - Medium matches (60-80%): Same industry + nearby location OR different stage
--    - Lower matches (40-60%): Different industry but same location OR same industry but distant location
--    
-- Debug Tips:
-- - Check browser console for "Enhanced user for matching" and "Match calculation details" logs
-- - Verify user preferences are loaded correctly  
-- - Ensure skills are properly parsed as arrays
-- - Check that industry categories are mapping correctly in the matchmaking algorithm 