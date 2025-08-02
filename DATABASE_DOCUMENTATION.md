# Kapital x Taraki - Database Documentation

## Overview

The Kapital x Taraki platform uses a MySQL/MariaDB database (`taraki_db`) designed to support a comprehensive startup ecosystem platform. The database is optimized for handling user management, startup operations, messaging, notifications, and analytics.

## Database Configuration

- **Engine**: InnoDB (supports transactions and foreign keys)
- **Charset**: utf8mb4 (full Unicode support)
- **Collation**: utf8mb4_general_ci
- **Time Zone**: UTC

## Table Structure

### Core User Management

#### `users` Table
Primary table for all platform users (entrepreneurs, investors, admins).

```sql
CREATE TABLE users (
    id INT(11) PRIMARY KEY AUTO_INCREMENT,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    bio TEXT,
    profile_image LONGTEXT,
    profile_picture_url VARCHAR(255),
    role ENUM('entrepreneur', 'investor', 'admin') NOT NULL,
    industry VARCHAR(255),
    location VARCHAR(255),
    
    -- Verification fields
    is_verified BOOLEAN DEFAULT FALSE,
    verification_token VARCHAR(255),
    verification_status ENUM('pending', 'verified', 'rejected'),
    verification_comment TEXT,
    verified_by INT,
    verified_at TIMESTAMP NULL,
    
    -- Social media links
    facebook_url VARCHAR(255),
    twitter_url VARCHAR(255),
    instagram_url VARCHAR(255),
    linkedin_url VARCHAR(255),
    
    -- Privacy settings
    show_in_search BOOLEAN DEFAULT TRUE,
    show_in_messages BOOLEAN DEFAULT TRUE,
    show_in_pages BOOLEAN DEFAULT TRUE,
    
    -- Profile information
    introduction TEXT,
    accomplishments TEXT,
    education TEXT,
    employment TEXT,
    gender VARCHAR(50),
    birthdate DATE,
    contact_number VARCHAR(50),
    public_email VARCHAR(255),
    
    -- System fields
    is_suspended BOOLEAN DEFAULT FALSE,
    two_factor_enabled BOOLEAN DEFAULT FALSE,
    status ENUM('online', 'invisible', 'offline') DEFAULT 'offline',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

**Key Features:**
- Multi-role support (entrepreneur, investor, admin)
- Comprehensive user verification system
- Social media integration
- Privacy controls
- Profile management

**Indexes:**
- Primary key on `id`
- Unique index on `email`
- Index on `role` for filtering
- Index on `verification_status`

#### `user_preferences` Table
Stores user preferences for matchmaking and platform behavior.

```sql
CREATE TABLE user_preferences (
    id INT(11) PRIMARY KEY AUTO_INCREMENT,
    user_id INT(11) NOT NULL,
    preferred_industries TEXT,
    preferred_startup_stage VARCHAR(50),
    preferred_location VARCHAR(255),
    min_funding_amount DECIMAL(15,2),
    max_funding_amount DECIMAL(15,2),
    notification_preferences JSON,
    position_desired VARCHAR(50),
    skills TEXT,
    investment_range_min DECIMAL(15,2),
    investment_range_max DECIMAL(15,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

**Purpose:**
- Matchmaking algorithm input
- Investment preferences
- Notification settings
- Skill tracking

#### `academic_profile` Table
Educational background information.

```sql
CREATE TABLE academic_profile (
    id INT(11) PRIMARY KEY AUTO_INCREMENT,
    user_id INT(11) NOT NULL,
    level VARCHAR(50),
    course VARCHAR(100),
    institution VARCHAR(100),
    address VARCHAR(255),
    graduation_date DATE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

#### `employment_profile` Table
Professional experience tracking.

```sql
CREATE TABLE employment_profile (
    id INT(11) PRIMARY KEY AUTO_INCREMENT,
    user_id INT(11) NOT NULL,
    company VARCHAR(100),
    position VARCHAR(100),
    start_date DATE,
    end_date DATE,
    description TEXT,
    is_current BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### Startup Management

#### `startups` Table
Central table for startup information.

```sql
CREATE TABLE startups (
    startup_id INT(11) PRIMARY KEY AUTO_INCREMENT,
    entrepreneur_id INT(11) NOT NULL,
    name VARCHAR(255) NOT NULL,
    industry VARCHAR(255) NOT NULL,
    description TEXT,
    location VARCHAR(255),
    
    -- Financial information
    funding_needed DECIMAL(15,2),
    funding_stage ENUM('startup','seed','series_a','series_b','series_c','exit'),
    startup_stage ENUM('ideation','validation','mvp','growth','maturity'),
    
    -- Documents and media
    pitch_deck_url VARCHAR(255),
    business_plan_url VARCHAR(255),
    logo_url VARCHAR(255),
    video_url VARCHAR(255),
    website VARCHAR(255),
    
    -- Approval workflow
    approval_status ENUM('pending','approved','rejected') DEFAULT 'pending',
    approved_by INT,
    approval_comment TEXT,
    
    -- Social media
    facebook_url VARCHAR(255),
    twitter_url VARCHAR(255),
    instagram_url VARCHAR(255),
    linkedin_url VARCHAR(255),
    
    -- System fields
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (entrepreneur_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL
);
```

**Key Features:**
- Comprehensive startup profiles
- Document management
- Approval workflow
- Financial tracking
- Social media integration

**Indexes:**
- Primary key on `startup_id`
- Index on `entrepreneur_id`
- Index on `industry`
- Index on `approval_status`

#### `startup_team_members` Table
Team composition for startups.

```sql
CREATE TABLE startup_team_members (
    id INT(11) PRIMARY KEY AUTO_INCREMENT,
    startup_id INT(11) NOT NULL,
    name VARCHAR(255) NOT NULL,
    position VARCHAR(255),
    bio TEXT,
    image_url VARCHAR(255),
    is_founder BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (startup_id) REFERENCES startups(startup_id) ON DELETE CASCADE
);
```

### Communication System

#### `messages` Table
Real-time messaging between users.

```sql
CREATE TABLE messages (
    message_id INT(11) PRIMARY KEY AUTO_INCREMENT,
    sender_id INT(11) NOT NULL,
    receiver_id INT(11) NOT NULL,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    message_type ENUM('text', 'file', 'image') DEFAULT 'text',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE
);
```

**Indexes:**
- Primary key on `message_id`
- Composite index on `(sender_id, receiver_id)`
- Index on `created_at` for chronological queries
- Index on `is_read` for unread message queries

#### `message_files` Table
File attachments for messages.

```sql
CREATE TABLE message_files (
    file_id INT(11) PRIMARY KEY AUTO_INCREMENT,
    message_id INT(11) NOT NULL,
    filename VARCHAR(255) NOT NULL,
    path VARCHAR(255) NOT NULL,
    file_type VARCHAR(100),
    file_size INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (message_id) REFERENCES messages(message_id) ON DELETE CASCADE
);
```

#### `conversation_requests` Table
Connection request management.

```sql
CREATE TABLE conversation_requests (
    request_id INT(11) PRIMARY KEY AUTO_INCREMENT,
    sender_id INT(11) NOT NULL,
    receiver_id INT(11) NOT NULL,
    status ENUM('pending','approved','rejected') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE
);
```

#### `chat_categories` Table
User-defined message organization.

```sql
CREATE TABLE chat_categories (
    id INT(11) PRIMARY KEY AUTO_INCREMENT,
    user_id INT(11) NOT NULL,
    name VARCHAR(100) NOT NULL,
    icon VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### Notification System

#### `notifications` Table
Comprehensive notification management.

```sql
CREATE TABLE notifications (
    id INT(11) PRIMARY KEY AUTO_INCREMENT,
    user_id INT(11) NOT NULL,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    action_url VARCHAR(255),
    is_read BOOLEAN DEFAULT FALSE,
    priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
    expires_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

**Notification Types:**
- `message` - New message notifications
- `match` - Investment match notifications
- `startup_approval` - Startup status updates
- `document_verification` - Document approval/rejection
- `event_reminder` - Event reminders
- `profile_view` - Profile view notifications
- `connection_request` - Connection requests

**Indexes:**
- Primary key on `id`
- Index on `user_id`
- Index on `is_read`
- Index on `type`
- Index on `created_at`

### Event Management

#### `events` Table
Platform events and activities.

```sql
CREATE TABLE events (
    event_id INT(11) PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    event_date DATE NOT NULL,
    event_time TIME,
    location VARCHAR(255),
    event_type VARCHAR(100),
    max_attendees INT,
    registration_deadline DATE,
    image_url VARCHAR(255),
    created_by INT(11),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);
```

#### `event_registrations` Table
Event attendance tracking.

```sql
CREATE TABLE event_registrations (
    registration_id INT(11) PRIMARY KEY AUTO_INCREMENT,
    event_id INT(11) NOT NULL,
    user_id INT(11) NOT NULL,
    registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    attendance_status ENUM('registered', 'attended', 'cancelled') DEFAULT 'registered',
    
    FOREIGN KEY (event_id) REFERENCES events(event_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_registration (event_id, user_id)
);
```

### Document Management

#### `verification_documents` Table
User verification document storage.

```sql
CREATE TABLE Verification_Documents (
    document_id INT(11) PRIMARY KEY AUTO_INCREMENT,
    user_id INT(11) NOT NULL,
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
```

### Support System

#### `tickets` Table
Customer support ticket system.

```sql
CREATE TABLE tickets (
    id INT(11) PRIMARY KEY AUTO_INCREMENT,
    user_id INT(11),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    type ENUM('technical', 'billing', 'general', 'bug_report') DEFAULT 'general',
    priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
    status ENUM('open', 'in_progress', 'resolved', 'closed') DEFAULT 'open',
    admin_response TEXT,
    admin_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP NULL,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);
```

### Analytics & Tracking

#### `analytics` Table
User behavior and platform analytics.

```sql
CREATE TABLE analytics (
    id INT(11) PRIMARY KEY AUTO_INCREMENT,
    user_id INT(11),
    event_id INT(11),
    action_type VARCHAR(50),
    action_data JSON,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);
```

**Action Types:**
- `login` - User login events
- `profile_view` - Profile views
- `startup_view` - Startup page views
- `message_sent` - Message sending
- `search` - Search queries
- `match_view` - Match result views

#### `profile_views` Table
Profile viewing analytics.

```sql
CREATE TABLE profile_views (
    id INT(11) PRIMARY KEY AUTO_INCREMENT,
    viewer_id INT(11),
    viewed_user_id INT(11) NOT NULL,
    view_count INT DEFAULT 1,
    last_viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (viewer_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (viewed_user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_view (viewer_id, viewed_user_id)
);
```

### Team & Organization

#### `team_members` Table
Platform team information.

```sql
CREATE TABLE team_members (
    id INT(11) PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    position VARCHAR(255),
    description TEXT,
    image_url VARCHAR(255),
    social_links JSON,
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Relationships and Foreign Keys

### Primary Relationships
1. **Users → Startups**: One-to-Many (entrepreneur can have multiple startups)
2. **Users → Messages**: Many-to-Many (users can message each other)
3. **Users → Notifications**: One-to-Many (user receives multiple notifications)
4. **Users → Events**: Many-to-Many (through event_registrations)
5. **Startups → Team Members**: One-to-Many
6. **Messages → Files**: One-to-Many

### Indexes for Performance

#### Critical Indexes
```sql
-- User queries
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_verification ON users(verification_status);

-- Messaging performance
CREATE INDEX idx_messages_conversation ON messages(sender_id, receiver_id);
CREATE INDEX idx_messages_unread ON messages(receiver_id, is_read);
CREATE INDEX idx_messages_timestamp ON messages(created_at);

-- Startup queries
CREATE INDEX idx_startups_entrepreneur ON startups(entrepreneur_id);
CREATE INDEX idx_startups_industry ON startups(industry);
CREATE INDEX idx_startups_status ON startups(approval_status);

-- Notification performance
CREATE INDEX idx_notifications_user_unread ON notifications(user_id, is_read);
CREATE INDEX idx_notifications_type ON notifications(type);
```

## Data Integrity Rules

### Constraints
1. **Email Uniqueness**: Users must have unique email addresses
2. **Role Validation**: Only allowed roles (entrepreneur, investor, admin)
3. **Status Validation**: Controlled status enums for consistency
4. **Foreign Key Constraints**: Maintain referential integrity
5. **Cascade Deletes**: Proper cleanup of related records

### Triggers
```sql
-- Auto-update full_name when first_name or last_name changes
DELIMITER $$
CREATE TRIGGER update_full_name 
BEFORE UPDATE ON users
FOR EACH ROW
BEGIN
    SET NEW.full_name = CONCAT(NEW.first_name, ' ', NEW.last_name);
END$$
DELIMITER ;
```

## Backup and Maintenance

### Backup Strategy
- **Daily**: Automated full database backup
- **Hourly**: Transaction log backup
- **Weekly**: Full backup verification
- **Monthly**: Archive old data

### Maintenance Tasks
- **Weekly**: Index optimization
- **Monthly**: Statistics update
- **Quarterly**: Performance analysis
- **Annually**: Data archival

### Data Retention
- **Messages**: 7 years
- **Analytics**: 2 years
- **Notifications**: 1 year (archived after 3 months)
- **User Data**: Indefinite (until account deletion)

---

*This documentation reflects the current database schema as of January 2024. For schema migrations and updates, refer to the migration scripts in the `/database` directory.* 