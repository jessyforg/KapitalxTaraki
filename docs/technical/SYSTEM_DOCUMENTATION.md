# Kapital x Taraki Platform - System Documentation

## Table of Contents
- [Overview](#overview)
- [Architecture](#architecture)
- [Database Schema](#database-schema)
- [API Endpoints](#api-endpoints)
- [Frontend Components](#frontend-components)
- [Authentication & Security](#authentication--security)
- [Features & Functionalities](#features--functionalities)
- [Setup & Installation](#setup--installation)
- [Development Guide](#development-guide)

## Overview

Kapital x Taraki is a comprehensive startup ecosystem platform that connects entrepreneurs, investors, and industry professionals. The platform facilitates networking, investment matching, business development, and provides tools for startup management and growth.

### Key Stakeholders
- **Entrepreneurs**: Create startups, find investors, connect with co-founders
- **Investors**: Discover investment opportunities, connect with startups
- **Admins**: Manage platform operations, verify users, oversee activities
- **Industry Professionals**: Network, share expertise, find opportunities

### Technology Stack
- **Frontend**: React 18, Tailwind CSS, React Router
- **Backend**: Node.js, Express.js
- **Database**: MySQL/MariaDB
- **Authentication**: JWT tokens, bcrypt encryption
- **File Storage**: Multer for file uploads
- **Additional Libraries**: Axios, React Icons, AOS animations

## Architecture

### Frontend Architecture
```
src/
├── components/        # Reusable UI components
├── pages/            # Main application pages
├── api/              # API service functions
├── hooks/            # Custom React hooks
├── utils/            # Utility functions
├── contexts/         # React contexts
├── services/         # Business logic services
└── styles/           # CSS and styling files
```

### Backend Architecture
```
server/
├── routes/           # API route handlers
├── middleware/       # Authentication & validation
├── utils/           # Helper functions
├── database/        # Database configuration
├── config/          # Server configuration
└── public/uploads/  # File storage
```

## Database Schema

### Core Tables

#### Users Table
```sql
users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('entrepreneur', 'investor', 'admin'),
    profile_picture_url VARCHAR(255),
    bio TEXT,
    industry VARCHAR(255),
    location VARCHAR(255),
    verification_status ENUM('pending', 'verified', 'rejected'),
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
```

#### Startups Table
```sql
startups (
    startup_id INT PRIMARY KEY AUTO_INCREMENT,
    entrepreneur_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    industry VARCHAR(255) NOT NULL,
    description TEXT,
    location VARCHAR(255),
    funding_needed DECIMAL(15,2),
    funding_stage ENUM('startup','seed','series_a','series_b','series_c','exit'),
    startup_stage ENUM('ideation','validation','mvp','growth','maturity'),
    approval_status ENUM('pending','approved','rejected') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
```

#### Messages Table
```sql
messages (
    message_id INT PRIMARY KEY AUTO_INCREMENT,
    sender_id INT NOT NULL,
    receiver_id INT NOT NULL,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
```

#### Notifications Table
```sql
notifications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
```

## API Endpoints

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/verify` - Email verification
- `POST /api/auth/forgot-password` - Password reset request
- `POST /api/auth/reset-password` - Password reset confirmation

### User Management
- `GET /api/users` - Get all users (admin only)
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user profile
- `DELETE /api/users/:id` - Delete user (admin only)
- `POST /api/users/:id/verify` - Verify user (admin only)
- `POST /api/users/:id/suspend` - Suspend user (admin only)

### Startup Management
- `GET /api/startups` - Get all startups
- `POST /api/startups` - Create new startup
- `GET /api/startups/:id` - Get startup details
- `PUT /api/startups/:id` - Update startup
- `DELETE /api/startups/:id` - Delete startup
- `POST /api/startups/:id/approve` - Approve startup (admin only)

### Messaging System
- `GET /api/messages/preview` - Get conversation previews
- `GET /api/messages/:userId` - Get messages with specific user
- `POST /api/messages/send` - Send new message
- `PUT /api/messages/:id/read` - Mark message as read
- `POST /api/messages/upload` - Upload file attachment

### Notifications
- `GET /api/notifications` - Get user notifications
- `PUT /api/notifications/:id/read` - Mark notification as read
- `PUT /api/notifications/read-all` - Mark all notifications as read
- `DELETE /api/notifications/:id` - Delete notification

### Search & Discovery
- `GET /api/search?q=term` - Search users and startups
- `GET /api/matches/entrepreneurs` - Get entrepreneur matches
- `GET /api/matches/investors` - Get investor matches
- `GET /api/matches/startups` - Get startup matches

### Events Management
- `GET /api/events` - Get all events
- `POST /api/events` - Create new event (admin only)
- `PUT /api/events/:id` - Update event (admin only)
- `DELETE /api/events/:id` - Delete event (admin only)
- `POST /api/events/:id/register` - Register for event

### Team Management
- `GET /api/team` - Get team members
- `POST /api/team` - Add team member (admin only)
- `PUT /api/team/:id` - Update team member (admin only)
- `DELETE /api/team/:id` - Delete team member (admin only)

### Document Management
- `POST /api/documents/upload` - Upload verification documents
- `GET /api/documents/:userId` - Get user documents
- `PUT /api/documents/:id/verify` - Verify document (admin only)

### Support System
- `GET /api/tickets` - Get support tickets
- `POST /api/tickets` - Create support ticket
- `PUT /api/tickets/:id` - Update ticket status (admin only)

## Frontend Components

### Core Components

#### Navigation Components
- **Navbar**: Main navigation bar with responsive design
- **MobileSidebar**: Mobile-optimized sidebar navigation
- **HamburgerButton**: Mobile menu toggle button
- **ResponsiveSidebar**: Adaptive sidebar for different screen sizes

#### Dashboard Components
- **AdminDashboard**: Comprehensive admin interface
- **EntrepreneurDashboard**: Entrepreneur-specific dashboard
- **InvestorDashboard**: Investor-focused dashboard
- **UserProfile**: User profile management interface

#### Authentication Components
- **LoginForm**: User login interface
- **SignupForm**: User registration interface
- **ProtectedRoute**: Route protection for authenticated users

#### Communication Components
- **Messages**: Real-time messaging interface
- **NotificationDropdown**: Notification display component

#### Business Components
- **CreateStartup**: Startup creation form
- **StartupDetails**: Detailed startup information display
- **Matches**: Matching algorithm results display

#### Content Components
- **Home**: Landing page with platform overview
- **About**: Platform information and mission
- **Team**: Team members showcase
- **FAQ**: Frequently asked questions
- **Events**: Event listing and management
- **Contact**: Contact information and forms

### Utility Components
- **UserDetailsModal**: User information modal
- **AdminUserDetailsModal**: Admin-specific user details
- **Footer**: Site footer with links and information

## Authentication & Security

### JWT Authentication
- Stateless authentication using JSON Web Tokens
- Token expiration and refresh mechanisms
- Role-based access control (RBAC)

### Password Security
- bcrypt hashing with salt rounds
- Password strength requirements
- Secure password reset flow

### Route Protection
- Protected routes based on authentication status
- Role-based route access restrictions
- Automatic redirects for unauthorized access

### Data Validation
- Input sanitization and validation
- File upload restrictions and validation
- SQL injection prevention

## Features & Functionalities

### User Management
- **Multi-role System**: Entrepreneurs, Investors, Admins
- **Profile Management**: Comprehensive user profiles with verification
- **Account Verification**: Email verification and document upload
- **Privacy Controls**: Visibility settings for profile information

### Startup Ecosystem
- **Startup Profiles**: Detailed startup information and documentation
- **Investment Tracking**: Funding stages and financial information
- **Approval Workflow**: Admin approval process for startups
- **Industry Categorization**: Industry-based organization

### Matchmaking System
- **Intelligent Matching**: Algorithm-based compatibility scoring
- **Multi-criteria Matching**: Industry, location, stage, and preferences
- **Bidirectional Matching**: Mutual compatibility assessment
- **Match Explanations**: Detailed reasoning for match scores

### Communication Platform
- **Real-time Messaging**: Instant messaging between users
- **File Sharing**: Document and media sharing capabilities
- **Message Threading**: Organized conversation management
- **Connection Requests**: Structured networking requests

### Notification System
- **Multi-type Notifications**: Messages, matches, approvals, events
- **Real-time Updates**: Instant notification delivery
- **Preference Management**: Customizable notification settings
- **Event Reminders**: Automated event reminder system

### Admin Management
- **Dashboard Analytics**: Platform statistics and insights
- **User Management**: User verification and moderation
- **Content Moderation**: Startup and content approval
- **System Configuration**: Platform settings and preferences

### Event Management
- **Event Creation**: Admin event creation and management
- **Registration System**: User event registration
- **Calendar Integration**: Event calendar and scheduling
- **Reminder System**: Automated event reminders

### Search & Discovery
- **Global Search**: Cross-platform search functionality
- **Advanced Filtering**: Multi-criteria search filters
- **Search Results**: Unified search results presentation
- **Quick Access**: Fast user and startup discovery

## Setup & Installation

### Prerequisites
- Node.js (v14 or higher)
- MySQL/MariaDB database
- XAMPP (for local development)

### Installation Steps

1. **Clone Repository**
   ```bash
   git clone <repository-url>
   cd KapitalxTaraki
   ```

2. **Install Dependencies**
   ```bash
   # Frontend dependencies
   npm install
   
   # Backend dependencies
   cd server
   npm install
   ```

3. **Database Setup**
   ```bash
   # Start XAMPP MySQL service
   # Import database/taraki_db.sql to create tables
   # Update database credentials in server/database/db.js
   ```

4. **Environment Configuration**
   ```bash
   # Create .env file in server directory
   JWT_SECRET=your-secret-key
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=
   DB_NAME=taraki_db
   ```

5. **Start Development Servers**
   ```bash
   # Start backend server (from server directory)
   npm run dev
   
   # Start frontend server (from root directory)
   npm start
   ```

### Production Deployment
- Configure environment variables for production
- Set up SSL certificates for HTTPS
- Configure reverse proxy (nginx/Apache)
- Set up database backups and monitoring

## Development Guide

### Code Structure Guidelines
- Follow React functional component patterns
- Use custom hooks for reusable logic
- Implement proper error handling
- Maintain consistent code formatting

### API Development
- Follow RESTful API conventions
- Implement proper error responses
- Use middleware for authentication
- Document all endpoints

### Database Management
- Use prepared statements for queries
- Implement proper indexing
- Regular database backups
- Monitor query performance

### Testing Strategy
- Unit tests for utility functions
- Integration tests for API endpoints
- End-to-end tests for critical flows
- Regular security audits

### Performance Optimization
- Image optimization and compression
- Lazy loading for components
- Database query optimization
- Caching strategies

---

*This documentation is maintained by the Kapital x Taraki development team. For updates and contributions, please follow the established development workflow.* 