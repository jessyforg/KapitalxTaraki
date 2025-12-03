# Kapital x Taraki - API Documentation

## Base URL
- **Development**: `http://localhost:5000/api`
- **Production**: `https://your-domain.com/api`

## Authentication
All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Response Format
All API responses follow this structure:
```json
{
  "success": true,
  "data": {},
  "message": "Operation successful",
  "error": null
}
```

## Error Handling
Error responses include:
```json
{
  "success": false,
  "error": "Error message",
  "status": 400
}
```

---

## Authentication Endpoints

### POST /auth/register
Register a new user account.

**Request Body:**
```json
{
  "first_name": "John",
  "last_name": "Doe",
  "email": "john@example.com",
  "password": "securePassword123",
  "role": "entrepreneur"
}
```

**Response:**
```json
{
  "message": "Registration successful",
  "token": "jwt-token-here",
  "user": {
    "id": 1,
    "first_name": "John",
    "last_name": "Doe",
    "email": "john@example.com",
    "role": "entrepreneur"
  }
}
```

### POST /auth/login
Authenticate user and get access token.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "token": "jwt-token-here",
  "user": {
    "id": 1,
    "first_name": "John",
    "last_name": "Doe",
    "role": "entrepreneur"
  }
}
```

---

## User Management Endpoints

### GET /users
Get all users (Admin only).

**Query Parameters:**
- `role` (optional): Filter by user role
- `status` (optional): Filter by verification status
- `page` (optional): Page number for pagination
- `limit` (optional): Number of users per page

**Response:**
```json
{
  "users": [
    {
      "id": 1,
      "first_name": "John",
      "last_name": "Doe",
      "email": "john@example.com",
      "role": "entrepreneur",
      "verification_status": "verified",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ],
  "total": 100,
  "page": 1,
  "totalPages": 10
}
```

### GET /users/:id
Get specific user details.

**Response:**
```json
{
  "id": 1,
  "first_name": "John",
  "last_name": "Doe",
  "email": "john@example.com",
  "bio": "Passionate entrepreneur",
  "industry": "Technology",
  "location": "Baguio City",
  "profile_picture_url": "/uploads/profile.jpg"
}
```

### PUT /users/:id
Update user profile.

**Request Body:**
```json
{
  "first_name": "John",
  "last_name": "Smith",
  "bio": "Updated bio",
  "industry": "FinTech",
  "location": "Manila"
}
```

### POST /users/:id/verify
Verify user account (Admin only).

**Request Body:**
```json
{
  "verification_status": "verified",
  "comment": "All documents verified"
}
```

### POST /users/:id/suspend
Suspend user account (Admin only).

**Request Body:**
```json
{
  "reason": "Policy violation",
  "duration": "30 days"
}
```

---

## Startup Management Endpoints

### GET /startups
Get all startups.

**Query Parameters:**
- `industry` (optional): Filter by industry
- `stage` (optional): Filter by startup stage
- `approval_status` (optional): Filter by approval status
- `location` (optional): Filter by location

**Response:**
```json
{
  "startups": [
    {
      "startup_id": 1,
      "name": "TechCorp",
      "industry": "Technology",
      "description": "AI-powered solutions",
      "funding_needed": 500000,
      "startup_stage": "mvp",
      "approval_status": "approved",
      "entrepreneur": {
        "id": 1,
        "name": "John Doe"
      }
    }
  ]
}
```

### POST /startups
Create new startup.

**Request Body:**
```json
{
  "name": "TechCorp",
  "industry": "Technology",
  "description": "AI-powered solutions for businesses",
  "location": "Baguio City",
  "funding_needed": 500000,
  "startup_stage": "mvp",
  "website": "https://techcorp.com"
}
```

### GET /startups/:id
Get detailed startup information.

**Response:**
```json
{
  "startup_id": 1,
  "name": "TechCorp",
  "industry": "Technology",
  "description": "AI-powered solutions",
  "location": "Baguio City",
  "funding_needed": 500000,
  "startup_stage": "mvp",
  "approval_status": "approved",
  "logo_url": "/uploads/logo.png",
  "pitch_deck_url": "/uploads/pitch.pdf",
  "entrepreneur": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com"
  },
  "team_members": [
    {
      "id": 1,
      "name": "Jane Smith",
      "role": "CTO"
    }
  ]
}
```

### PUT /startups/:id/approve
Approve startup (Admin only).

**Request Body:**
```json
{
  "approval_status": "approved",
  "comment": "Excellent business plan and team"
}
```

---

## Messaging System Endpoints

### GET /messages/preview
Get conversation previews for current user.

**Response:**
```json
{
  "conversations": [
    {
      "user_id": 2,
      "user_name": "Jane Smith",
      "user_role": "investor",
      "profile_picture_url": "/uploads/jane.jpg",
      "last_message": "Looking forward to our meeting",
      "last_message_time": "2024-01-01T12:00:00Z",
      "unread_count": 2
    }
  ]
}
```

### GET /messages/:userId
Get messages with specific user.

**Response:**
```json
{
  "messages": [
    {
      "message_id": 1,
      "sender_id": 1,
      "receiver_id": 2,
      "content": "Hello, interested in your startup",
      "is_read": true,
      "created_at": "2024-01-01T10:00:00Z",
      "files": []
    }
  ],
  "user": {
    "id": 2,
    "name": "Jane Smith",
    "profile_picture_url": "/uploads/jane.jpg"
  }
}
```

### POST /messages/send
Send new message.

**Request Body:**
```json
{
  "receiver_id": 2,
  "content": "Hello, I'm interested in investing",
  "files": ["file1.pdf", "file2.jpg"]
}
```

### POST /messages/upload
Upload file attachment.

**Form Data:**
- `file`: File to upload
- `receiver_id`: Recipient user ID

**Response:**
```json
{
  "filename": "document_123456789.pdf",
  "path": "/uploads/messages/document_123456789.pdf",
  "size": 1024000
}
```

---

## Notifications Endpoints

### GET /notifications
Get user notifications.

**Query Parameters:**
- `unread` (optional): Filter unread notifications
- `type` (optional): Filter by notification type
- `limit` (optional): Number of notifications to return

**Response:**
```json
{
  "notifications": [
    {
      "id": 1,
      "type": "message",
      "title": "New Message",
      "message": "You have a new message from John Doe",
      "is_read": false,
      "created_at": "2024-01-01T12:00:00Z",
      "action_url": "/messages/1"
    }
  ],
  "unread_count": 5
}
```

### PUT /notifications/:id/read
Mark notification as read.

**Response:**
```json
{
  "message": "Notification marked as read"
}
```

### PUT /notifications/read-all
Mark all notifications as read.

**Response:**
```json
{
  "message": "All notifications marked as read",
  "updated_count": 10
}
```

---

## Search & Discovery Endpoints

### GET /search
Search users and startups.

**Query Parameters:**
- `q`: Search query
- `type` (optional): Filter by type (user, startup)
- `role` (optional): Filter users by role

**Response:**
```json
{
  "results": [
    {
      "id": 1,
      "name": "John Doe",
      "type": "user",
      "role": "entrepreneur",
      "profile_image": "/uploads/john.jpg"
    },
    {
      "id": 1,
      "name": "TechCorp",
      "type": "startup",
      "industry": "Technology",
      "logo": "/uploads/techcorp.png"
    }
  ]
}
```

### GET /matches/entrepreneurs
Get entrepreneur matches for investors.

**Response:**
```json
{
  "matches": [
    {
      "entrepreneur": {
        "id": 1,
        "name": "John Doe",
        "industry": "Technology",
        "location": "Baguio City"
      },
      "match_score": 85,
      "match_reasons": [
        "Industry alignment: Technology",
        "Location proximity: Baguio City area",
        "Stage compatibility: Looking for seed funding"
      ]
    }
  ]
}
```

---

## Events Management Endpoints

### GET /events
Get all events.

**Query Parameters:**
- `upcoming` (optional): Filter upcoming events
- `category` (optional): Filter by event category
- `location` (optional): Filter by location

**Response:**
```json
{
  "events": [
    {
      "id": 1,
      "title": "Startup Pitch Night",
      "description": "Monthly startup pitch competition",
      "date": "2024-02-15",
      "time": "18:00",
      "location": "Baguio Convention Center",
      "category": "networking",
      "max_attendees": 100,
      "current_attendees": 45,
      "registration_deadline": "2024-02-10"
    }
  ]
}
```

### POST /events
Create new event (Admin only).

**Request Body:**
```json
{
  "title": "Startup Pitch Night",
  "description": "Monthly startup pitch competition",
  "date": "2024-02-15",
  "time": "18:00",
  "location": "Baguio Convention Center",
  "category": "networking",
  "max_attendees": 100,
  "registration_deadline": "2024-02-10"
}
```

### POST /events/:id/register
Register for event.

**Response:**
```json
{
  "message": "Successfully registered for event",
  "event": {
    "id": 1,
    "title": "Startup Pitch Night"
  }
}
```

---

## Team Management Endpoints

### GET /team
Get team members.

**Response:**
```json
{
  "team_members": [
    {
      "id": 1,
      "name": "Alice Johnson",
      "position": "CEO & Founder",
      "description": "Experienced entrepreneur with 10+ years",
      "image_url": "/uploads/team/alice.jpg"
    }
  ]
}
```

### POST /team
Add team member (Admin only).

**Form Data:**
- `name`: Member name
- `position`: Member position
- `description`: Member description
- `image`: Profile image file

---

## Support System Endpoints

### GET /tickets
Get support tickets.

**Response:**
```json
{
  "tickets": [
    {
      "id": 1,
      "title": "Login Issue",
      "description": "Cannot log into my account",
      "type": "technical",
      "status": "open",
      "priority": "high",
      "created_at": "2024-01-01T10:00:00Z",
      "user": {
        "id": 1,
        "name": "John Doe"
      }
    }
  ]
}
```

### POST /tickets
Create support ticket.

**Request Body:**
```json
{
  "title": "Login Issue",
  "description": "Cannot log into my account",
  "type": "technical",
  "priority": "high"
}
```

---

## Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `422` - Validation Error
- `500` - Internal Server Error

## Rate Limiting

API requests are limited to:
- 1000 requests per hour for authenticated users
- 100 requests per hour for unauthenticated users

## File Upload Limits

- Maximum file size: 10MB
- Allowed image formats: JPG, PNG, WEBP
- Allowed document formats: PDF, DOC, DOCX

---

*Last updated: January 2024* 