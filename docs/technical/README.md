# Technical Documentation

This folder contains technical documentation for developers working on the Kapital x Taraki platform.

## 📚 Documentation Files

### Core Documentation
- **[System Documentation](./SYSTEM_DOCUMENTATION.md)** - Complete system overview, architecture, and setup
- **[API Documentation](./API_DOCUMENTATION.md)** - All API endpoints, requests, and responses
- **[Database Documentation](./DATABASE_DOCUMENTATION.md)** - Database schema, tables, and relationships
- **[Frontend Documentation](./FRONTEND_DOCUMENTATION.md)** - React components, architecture, and frontend structure

### Feature Documentation
- **[Notification System](./NOTIFICATION_SYSTEM.md)** - Notification system implementation and usage
- **[Detailed Page Descriptions](./DETAILED_PAGE_DESCRIPTIONS.md)** - Detailed descriptions of all pages and components

## 🏗️ Architecture Overview

### Backend (Node.js/Express)
- RESTful API with Express.js
- MySQL database with connection pooling
- JWT authentication
- File upload handling with Multer
- CORS configuration for production

### Frontend (React)
- React 18 with functional components
- Tailwind CSS for styling
- React Router for navigation
- Axios for API calls
- Responsive design

### Database (MySQL)
- InnoDB engine
- UTF8MB4 charset
- Normalized schema
- Foreign key constraints

## 🔧 Development Setup

See the main [README.md](../../README.md) for development setup instructions.

## 📝 Code Structure

```
server/
├── routes/          # API route handlers
├── middleware/      # Authentication and validation
├── database/        # Database connection and initialization
├── utils/           # Utility functions
└── public/          # Static files and uploads

src/
├── components/      # React components
├── pages/           # Page components
├── api/             # API service functions
├── config/          # Configuration files
└── utils/           # Frontend utilities
```

## 🔐 Security

- JWT-based authentication
- Password hashing with bcrypt
- Input validation and sanitization
- SQL injection prevention
- File upload restrictions
- Role-based access control

## 📊 Database Schema

See [Database Documentation](./DATABASE_DOCUMENTATION.md) for complete schema details.

## 🧪 Testing

- Component unit tests
- API integration tests
- End-to-end user flow tests

