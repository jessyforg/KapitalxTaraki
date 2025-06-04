-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS taraki_db;
USE taraki_db;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    profile_image LONGTEXT,
    profile_picture_url LONGTEXT,
    facebook_url VARCHAR(255),
    twitter_url VARCHAR(255),
    instagram_url VARCHAR(255),
    linkedin_url VARCHAR(255),
    role ENUM('user', 'admin', 'entrepreneur') DEFAULT 'user',
    is_verified BOOLEAN DEFAULT FALSE,
    verification_token VARCHAR(255),
    verification_status VARCHAR(50),
    location VARCHAR(255),
    introduction TEXT,
    accomplishments TEXT,
    education TEXT,
    employment TEXT,
    gender VARCHAR(50),
    birthdate DATE,
    contact_number VARCHAR(50),
    public_email VARCHAR(255),
    industry VARCHAR(255),
    show_in_search BOOLEAN DEFAULT TRUE,
    show_in_messages BOOLEAN DEFAULT TRUE,
    show_in_pages BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
); 