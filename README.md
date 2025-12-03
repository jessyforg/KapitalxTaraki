# Kapital x Taraki Platform

A comprehensive startup ecosystem platform connecting entrepreneurs, investors, and industry professionals in the Philippines.

## 📋 Documentation

All documentation is organized in the `docs/` folder for easy navigation:

### 🚀 Deployment Guides
- **[START_HERE.md](START_HERE.md)** ⭐ - Start here for deployment
- **[docs/deployment/](docs/deployment/)** - Complete deployment guides
  - Railway setup, Hostinger configuration, troubleshooting

### 🔧 Technical Documentation
- **[docs/technical/](docs/technical/)** - Developer documentation
  - [System Documentation](docs/technical/SYSTEM_DOCUMENTATION.md) - Complete system overview and architecture
  - [API Documentation](docs/technical/API_DOCUMENTATION.md) - All API endpoints and usage
  - [Database Documentation](docs/technical/DATABASE_DOCUMENTATION.md) - Database schema and structure
  - [Frontend Documentation](docs/technical/FRONTEND_DOCUMENTATION.md) - React components and architecture
  - [Notification System](docs/technical/NOTIFICATION_SYSTEM.md) - Notification system implementation

### 👥 User Documentation
- **[docs/user/](docs/user/)** - User guides
  - [User Manual](docs/user/USER_MANUAL.md) - Complete user manual with step-by-step workflows

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MySQL/MariaDB database
- XAMPP (for local development)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd KapitalxTaraki
   ```

2. **Install dependencies**
   ```bash
   # Frontend dependencies
   npm install
   
   # Backend dependencies
   cd server
   npm install
   ```

3. **Database setup**
   - Start XAMPP MySQL service
   - Import `database/taraki_db.sql` to create tables
   - Database credentials are configured via environment variables

4. **Environment configuration**
   ```bash
   # Create .env file in server directory (for local development)
   # See server/ENV_VARIABLES_FOR_LOCAL.txt for local setup
   # For production (Railway), see server/ENV_VARIABLES_FOR_RAILWAY.txt
   
   NODE_ENV=development
   JWT_SECRET=your-secret-key
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=
   DB_NAME=taraki_db
   CORS_ORIGINS=http://localhost:3000,http://localhost:5000
   ```
   
   **Note:** The code now properly uses environment variables. In production (Railway), all database credentials must be set via Railway's environment variables. See [START_HERE.md](START_HERE.md) for deployment instructions.

5. **Start development servers**
   ```bash
   # Start backend server (from server directory)
   npm run dev
   
   # Start frontend server (from root directory)
   npm start
   ```

## 🏗️ Architecture Overview

### Frontend (React 18)
- **Framework**: React with functional components and hooks
- **Styling**: Tailwind CSS for responsive design
- **Routing**: React Router for navigation
- **State Management**: Local state with hooks
- **API Integration**: Axios for HTTP requests

### Backend (Node.js/Express)
- **Framework**: Express.js for REST API
- **Database**: MySQL/MariaDB with connection pooling
- **Authentication**: JWT tokens with bcrypt encryption
- **File Storage**: Multer for file uploads
- **Middleware**: CORS, authentication, validation

### Database (MySQL)
- **Engine**: InnoDB for transaction support
- **Charset**: utf8mb4 for full Unicode support
- **Structure**: Normalized schema with foreign key constraints
- **Indexing**: Optimized for performance

## 🎯 Key Features

### 👥 User Management
- Multi-role system (entrepreneurs, investors, admins)
- Comprehensive user profiles with verification
- Social media integration
- Privacy controls

### 🏢 Startup Ecosystem
- Detailed startup profiles and portfolios
- Document management (pitch decks, business plans)
- Approval workflow for admin oversight
- Financial tracking and funding stages

### 🤝 Matchmaking System
- Intelligent algorithm-based matching
- Multi-criteria compatibility scoring
- Industry, location, and stage alignment
- Detailed match explanations

### 💬 Communication Platform
- Real-time messaging between users
- File sharing capabilities
- Connection request system
- Conversation organization

### 🔔 Notification System
- Multi-type notifications (messages, matches, approvals)
- Real-time updates
- Customizable preferences
- Event reminders

### 📊 Analytics & Insights
- Platform usage statistics
- User behavior tracking
- Performance metrics
- Export capabilities (Excel, PDF)

## 🛠️ Technology Stack

### Frontend Dependencies
- React 18.3.1
- Tailwind CSS 3.4.4
- React Router DOM 6.24.0
- Axios 1.10.0
- React Icons 5.5.0
- React Easy Crop 5.5.0
- jsPDF 3.0.1
- AOS 2.3.4

### Backend Dependencies
- Express.js 4.18.2
- MySQL2 3.2.0
- bcryptjs 2.4.3
- jsonwebtoken 9.0.0
- multer 1.4.5
- CORS 2.8.5

## 🔐 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Input validation and sanitization
- SQL injection prevention
- File upload restrictions
- Role-based access control

## 📱 Responsive Design

- Mobile-first approach
- Touch-friendly interfaces
- Adaptive layouts for all screen sizes
- Optimized performance across devices

## 🧪 Testing

- Component unit tests
- API integration tests
- End-to-end user flow tests
- Security audits

## 🚀 Deployment

### Development
```bash
# Frontend (Port 3000)
npm start

# Backend (Port 5000)
cd server && npm run dev
```

### Production Deployment
For production deployment to Railway + Hostinger:
- See **[START_HERE.md](START_HERE.md)** for complete deployment guide
- All deployment documentation is in **[docs/deployment/](docs/deployment/)**
- Environment variables are configured in Railway Dashboard
- Code automatically validates required environment variables in production

## 📈 Performance Optimization

- Code splitting and lazy loading
- Image optimization and compression
- Database query optimization
- Caching strategies
- Bundle size optimization

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Write/update tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Support

For technical support or questions:
- Check the documentation files
- Open an issue on GitHub
- Contact the development team

## 🏆 Team

Developed by the Kapital x Taraki development team in collaboration with the Philippine startup ecosystem.

---

*For detailed information about any aspect of the system, please refer to the specific documentation files listed above.*
