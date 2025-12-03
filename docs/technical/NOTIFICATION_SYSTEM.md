# TARAKI Notification System

## Overview

The TARAKI platform now features a comprehensive notification system that keeps users informed about important events, interactions, and status updates. The system supports multiple notification types, delivery methods, and user preferences.

## 🚀 Features Implemented

### ✅ Core Notification Types

1. **Message Notifications** 
   - Triggered when users send/receive messages
   - Shows sender name and message preview
   - Links to conversation

2. **Profile View Notifications**
   - Triggered when someone views your profile
   - Shows viewer name and role
   - Links to viewer's profile

3. **Event Reminder Notifications**
   - Automatic reminders for registered events
   - Multiple reminder intervals (1 week, 1 day, 1 hour)
   - Background service handles scheduling

4. **Document Verification Notifications**
   - Admin approval/rejection of uploaded documents
   - Shows verification status and rejection reasons
   - Links to document management page

5. **Connection Request Notifications**
   - When someone wants to connect via messages
   - Shows requester name and role
   - Links to connections page

6. **Welcome Notifications**
   - Automatic welcome message for new users
   - Role-specific guidance messages
   - Links to relevant dashboard sections

7. **Startup Application Notifications**
   - Status updates for startup applications
   - Approval, rejection, and under review states
   - Links to dashboard

8. **Investor Match Notifications** (Existing)
   - When investors match with startups
   - Bidirectional notifications

### 🔧 Technical Architecture

#### Notification Helper (`server/utils/notificationHelper.js`)
Centralized functions for creating all notification types:
- `createNotification()` - Base function for all notifications
- `createMessageNotification()` - Message notifications
- `createProfileViewNotification()` - Profile view notifications
- `createEventReminderNotification()` - Event reminders
- `createDocumentVerificationNotification()` - Document status updates
- `createConnectionRequestNotification()` - Connection requests
- `createWelcomeNotification()` - Welcome messages
- `createStartupApplicationNotification()` - Startup status updates

#### Event Reminder Service (`server/utils/eventReminderService.js`)
Background service that:
- Checks for upcoming events every 15 minutes
- Schedules reminders at 1 week, 1 day, and 1 hour intervals
- Automatically sends notifications to registered participants
- Handles graceful shutdown

#### Database Schema
Enhanced `notifications` table with:
- Comprehensive notification types enum
- Priority levels (high, medium, low)
- URL links for navigation
- Metadata JSON field for additional data
- Expiration dates for time-sensitive notifications
- Soft delete support

## 📍 Implementation Locations

### Backend Integration Points

1. **Message System** (`server/routes/messages.js`)
   - Lines 337-355: Message notifications
   - Lines 377-395: Connection request notifications

2. **Authentication** (`server/routes/auth.js`)
   - Lines 44-56: Welcome notifications for new users

3. **Profile Viewing** (`server/index.js` & `server/routes/users.js`)
   - Profile view notifications when accessing user profiles

4. **Document Verification** (`server/index.js`)
   - Lines 1607-1625: Document approval notifications
   - Lines 1680-1698: Document rejection notifications

5. **Startup Management** (`server/index.js`)
   - Lines 866-878: New startup submission notifications
   - Lines 1897-1919: Startup approval notifications
   - Lines 1934-1956: Startup rejection notifications

6. **Event System** (`server/index.js`)
   - Event reminder service initialization at server startup

### Frontend Integration

1. **Notification Icons** (`src/components/NotificationDropdown.js`)
   - Added icons for all new notification types
   - Color-coded notification categories

2. **Navigation Handling** (`src/components/Navbar.js`)
   - Click handlers for different notification types
   - Automatic navigation to relevant pages

## 🎯 Notification Triggers

| Event | Notification Type | Recipient | Trigger Location |
|-------|------------------|-----------|------------------|
| User registration | `new_registration` | New user | Auth registration endpoint |
| Message sent | `message` | Message receiver | Message creation endpoint |
| Profile viewed | `profile_view` | Profile owner | Profile access endpoints |
| Event reminder | `event_reminder` | Event participants | Background service |
| Document approved | `document_verification` | Document owner | Admin approval endpoint |
| Document rejected | `document_verification` | Document owner | Admin rejection endpoint |
| Connection request | `connection_request` | Target user | Message request endpoint |
| Startup submitted | `startup_application` | Entrepreneur | Startup creation endpoint |
| Startup approved | `startup_application` | Entrepreneur | Admin approval endpoint |
| Startup rejected | `startup_application` | Entrepreneur | Admin rejection endpoint |
| Investor match | `investor_match` / `startup_match` | Both parties | Match creation endpoint |

## 🔍 Testing

Run the test suite to verify all notification types:

```bash
cd server
node test-notifications.js
```

The test script verifies:
- All notification helper functions work correctly
- Database insertions are successful
- Notification data integrity
- Error handling

## ⚙️ Configuration

### Event Reminder Service
- Check interval: 15 minutes
- Reminder intervals: 1 week, 1 day, 1 hour before events
- Automatic startup with server
- Graceful shutdown handling

### Notification Priorities
- **High**: Document approvals/rejections, startup status changes, welcome messages
- **Medium**: Event reminders, connection requests, startup application submissions
- **Low**: Profile views

### User Preferences
Users can control notification preferences through:
- Notification type toggles
- Delivery method preferences (in-app, email, push)
- Frequency settings

## 🚀 Future Enhancements

### Planned Features
1. **Email Notifications**: Send important notifications via email
2. **Push Notifications**: Browser push notifications for real-time alerts
3. **Notification Batching**: Group similar notifications to reduce noise
4. **Smart Scheduling**: AI-powered optimal notification timing
5. **Advanced Filtering**: User-defined notification filters and rules

### Extension Points
- Add new notification types by extending the enum in database schema
- Create new helper functions in `notificationHelper.js`
- Add corresponding frontend icons and navigation handlers
- Integrate with external notification services (SendGrid, Firebase, etc.)

## 📊 Monitoring

### Logging
All notification operations are logged with:
- Success/failure status
- Notification type and recipient
- Error details for failed operations
- Performance metrics

### Metrics to Track
- Notification delivery rates
- User engagement with notifications
- Most common notification types
- Error rates by notification type

## 🔐 Security Considerations

- Notifications only created for authenticated users
- Sender verification for message notifications
- Admin-only access for document verification notifications
- Profile view notifications respect privacy settings
- Soft delete for sensitive notification data

---

## Quick Start for Developers

1. **Creating a new notification type:**
   ```javascript
   // Add to notificationHelper.js
   const createMyNotification = async (pool, { user_id, message }) => {
     return await createNotification(pool, {
       user_id,
       type: 'my_notification',
       message,
       priority: 'medium'
     });
   };
   ```

2. **Using notifications in endpoints:**
   ```javascript
   const { createMyNotification } = require('../utils/notificationHelper');
   
   // In your route handler
   await createMyNotification(pool, {
     user_id: userId,
     message: 'Your custom notification message'
   });
   ```

3. **Adding frontend support:**
   ```javascript
   // In NotificationDropdown.js
   case 'my_notification':
     return <FaIcon className="text-color-500" />;
   
   // In Navbar.js
   case 'my_notification':
     navigate('/my-page');
     break;
   ```

The notification system is now fully functional and ready for production use! 🎉 