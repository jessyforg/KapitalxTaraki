# Kapital x Taraki - Detailed Page Descriptions for PDF Manual

## 1. Landing Page (Home)

**URL:** `/`
**Purpose:** First impression and platform overview

### Visual Elements:
- **Header:** Full-width video background showing Taraki ecosystem animation
- **Logo:** Large centered Taraki 10X logo in white
- **Statistics Section:** 4-card grid displaying:
  - Active Startups count
  - Active Entrepreneurs count  
  - Active Investors count
  - Funded Startups count
- **Testimonials Section:** User testimonials carousel
- **Navigation Bar:** Top navigation with Login/Signup buttons

### Key Features:
- Responsive video background that adapts to screen size
- Real-time statistics fetched from database
- Smooth animations and hover effects on statistics cards
- Professional, modern design with dark theme

### User Actions:
- Click "Login" to access existing account
- Click "Sign Up" to create new account
- View real-time platform statistics
- Navigate through testimonials

---

## 2. Authentication Pages

### Login Form
**Purpose:** User authentication

#### Visual Layout:
- **Modal Design:** Centered modal with rounded corners
- **Tab Navigation:** "Log in" and "Sign up" tabs at the top
- **Form Fields:**
  - Email input field
  - Password input with show/hide toggle
  - "Remember me" checkbox
  - "Forgot password" link
- **Social Login:** Google, Facebook, Microsoft buttons
- **Color Scheme:** Orange accent color (#FF6500)

#### Features:
- Real-time form validation
- Password visibility toggle
- Error message display
- Success feedback
- Social media login options (visual only)

### Sign Up Form
**Purpose:** New user registration

#### Visual Layout:
- **Form Fields:**
  - First Name and Last Name (side by side)
  - Email address
  - Password with strength validation
  - Confirm Password
  - Role selection dropdown (Entrepreneur/Investor/Admin)
  - Terms & Conditions checkbox
- **Password Requirements:** Visual feedback for:
  - Minimum 8 characters
  - Uppercase letter
  - Lowercase letter
  - Number
- **Social Registration:** Same social buttons as login

#### Features:
- Real-time password validation with specific requirements
- Role-based registration
- Terms and conditions modal
- Email verification flow
- UserDetailsModal for additional profile setup

---

## 3. Entrepreneur Dashboard

**URL:** `/entrepreneur-dashboard`
**Purpose:** Main workspace for entrepreneurs

### Layout Structure:
- **Left Sidebar:** Fixed navigation panel
- **Main Content Area:** Dynamic content based on selected section
- **Mobile Hamburger Menu:** Circular floating button (bottom-right)

### Sidebar Components:
#### Profile Section:
- **Profile Image:** Circular avatar (16x16) with orange border
- **User Info:** Role badge and full name
- **Navigation Links:**
  - Startups (building icon)
  - Co-Founders (users icon)
  - Investors (dollar icon)
  - Ecosystem (globe icon)
  - Events (calendar icon)

#### Bottom Section:
- Settings button with gear icon
- Logout button with exit icon

### Main Content Sections:

#### 3.1 Startups Section
**Purpose:** Manage startup profiles

##### Visual Elements:
- **Header:** "Startups" title with create button
- **Filter Bar:** Industry, Location, Startup Stage dropdowns
- **Create Startup Button:** Orange button with plus icon
- **Startup Cards Grid:** 3-column responsive grid

##### Startup Card Design:
- **Logo Area:** 200px height placeholder or uploaded logo
- **Info Section:**
  - Startup name (bold, large)
  - Industry badge (orange)
  - Location badge (blue)
  - Description preview (60 chars)
  - Status badge (colored by approval status)
- **Action Buttons:**
  - Edit (gray border button)
  - View Details (orange button)

##### States:
- **Empty State:** Rocket icon with "Create Your First Startup" message
- **Loading State:** Spinner with "Loading your startups..." text
- **Error State:** Red error message display

#### 3.2 Co-Founders Section
**Purpose:** Find potential co-founders

##### Visual Elements:
- **Filter Bar:** Industry and Location dropdowns
- **Co-Founder Cards:** Similar design to startup cards

##### Co-Founder Card Design:
- **Profile Image:** 200px height with user icon fallback
- **Match Score Badge:** Color-coded percentage
  - Green: 80-100% match
  - Yellow: 60-79% match
  - Red: Below 60% match
- **Information Display:**
  - Preferred Industry badge
  - Preferred Location badge
  - Preferred Stage badge
  - Skills tags (first 4 shown, "+X more" if exceed)
- **Action Buttons:**
  - View Profile (orange)
  - Message (gray)

#### 3.3 Investors Section
**Purpose:** Connect with potential investors

##### Similar layout to Co-Founders with:
- Investor-specific information
- Investment preferences
- Match scoring algorithm
- Contact capabilities

### Verification Banner:
- **Display Condition:** When user.verification_status !== 'verified'
- **Design:** Orange background with warning icon
- **Content:**
  - Warning message about limited features
  - List of restricted actions
  - "Verify Your Account" button

---

## 4. Investor Dashboard

**URL:** `/investor-dashboard`
**Purpose:** Investment discovery and management

### Similar Structure to Entrepreneur Dashboard with Investor-Specific Sections:

#### 4.1 Startups Section
- **Available Startups:** Browse all approved startups
- **Matched Startups:** Algorithm-matched investment opportunities
- **Filtering:** Industry, location, stage, funding needs

#### 4.2 Matches Section
- **High-Priority Matches:** 80%+ compatibility
- **Investment Recommendations:** Based on preferences
- **Match Explanations:** Why startups were matched

#### 4.3 Entrepreneurs Section
- **Browse Entrepreneurs:** Find startup founders
- **Contact Options:** Direct messaging capabilities
- **Profile Viewing:** Detailed entrepreneur profiles

---

## 5. Admin Dashboard

**URL:** `/admin` (admin role required)
**Purpose:** Platform administration and management

### Comprehensive Admin Interface:

#### 5.1 Dashboard Overview
- **Statistics Cards:** Platform metrics
- **Recent Activity:** Latest user actions
- **Quick Actions:** Common admin tasks

#### 5.2 User Management
- **User List:** All registered users
- **Verification Queue:** Pending user verifications
- **User Actions:**
  - Verify users
  - Suspend accounts
  - Ban users
  - Edit user details

#### 5.3 Startup Management
- **Pending Approvals:** Startups awaiting review
- **Approved Startups:** Active startup listings
- **Bulk Actions:** Mass approval/rejection
- **Detailed Review:** Document verification

#### 5.4 Event Management
- **Event Calendar:** Visual calendar interface
- **Event Creation:** Form-based event setup
- **Event Editing:** Modify existing events
- **RSVP Management:** Track attendee registrations

#### 5.5 Ticket System
- **Support Tickets:** User-submitted issues
- **Ticket Categories:** Bug, Feature, General
- **Response Management:** Admin replies
- **Ticket Status:** Open, In Progress, Resolved

---

## 6. Create Startup Page

**URL:** `/create-startup`
**Purpose:** Register new startup on platform

### Form Structure:

#### 6.1 Basic Information Section
- **Startup Name:** Text input
- **Industry:** Dropdown with categorized options
- **Description:** Textarea for detailed description
- **Location:** Location selector
- **Website:** URL input

#### 6.2 Financial Information Section
- **Funding Needed:** Numeric input with currency
- **Funding Stage:** Dropdown (Pre-seed, Seed, Series A, etc.)
- **Startup Stage:** Dropdown (Ideation, MVP, Growth, etc.)

#### 6.3 Team Information Section
- **Add Team Members:** Dynamic form
- **Member Details:**
  - Name input
  - Position input
  - Bio textarea
  - Photo upload
- **Co-founder Designation:** Checkbox option

#### 6.4 Document Upload Section
- **Logo Upload:** Image file upload with preview
- **Pitch Deck:** PDF upload
- **Business Plan:** Document upload
- **Legal Documents:**
  - Business Permit upload
  - SEC Registration upload

#### 6.5 Social Media & Contact
- **Social Media Links:** Facebook, Twitter, LinkedIn, Instagram
- **Contact Information:** Business email, phone number
- **Full Address:** Complete business address

### Features:
- **Real-time Validation:** Field-by-field validation
- **File Upload Progress:** Visual upload indicators
- **Preview Capabilities:** Logo and document previews
- **Error Handling:** Comprehensive error messages
- **Auto-save:** Draft saving capability

---

## 7. Messages Page

**URL:** `/messages`
**Purpose:** Communication between platform users

### Layout Design:
- **Three-Column Layout:**
  1. **Conversation List:** Left sidebar
  2. **Chat Interface:** Center main area
  3. **Profile Panel:** Right sidebar (optional)

### Conversation List Features:
- **User Avatars:** Profile pictures
- **Last Message Preview:** Truncated last message
- **Timestamp:** Relative time display
- **Unread Indicators:** Badge with count
- **Search Functionality:** Find conversations

### Chat Interface:
- **Message Bubbles:** Sender/receiver distinction
- **File Sharing:** Document and image attachments
- **Timestamp Display:** Message timing
- **Typing Indicators:** Real-time typing status
- **Message Status:** Sent, delivered, read indicators

---

## 8. Settings Page

**URL:** `/settings`
**Purpose:** User profile and preference management

### Settings Categories:

#### 8.1 Profile Settings
- **Personal Information:**
  - Profile photo upload with cropping
  - First name, Last name
  - Bio/description
  - Contact information
- **Professional Details:**
  - Industry selection
  - Skills and expertise
  - Years of experience

#### 8.2 Preferences
- **Industry Preferences:** Multiple selection
- **Location Preferences:** Geographic areas
- **Investment Ranges:** (for investors)
- **Startup Stages:** Preferred development stages

#### 8.3 Privacy Settings
- **Profile Visibility:** Public/private toggle
- **Search Visibility:** Appear in search results
- **Contact Permissions:** Who can message you

#### 8.4 Notification Settings
- **Email Notifications:** Various email preferences
- **Platform Notifications:** In-app notification settings
- **Marketing Communications:** Newsletter subscriptions

---

## 9. Verification Page

**URL:** `/verify-account`
**Purpose:** Account verification process

### Verification Requirements:
- **Identity Verification:** Government ID upload
- **Business Verification:** (for entrepreneurs)
- **Investment Verification:** (for investors)
- **Document Review:** Admin approval process

---

## 10. Mobile Responsive Design

### Mobile-Specific Features:
- **Hamburger Menu:** Circular floating button
- **Swipe Navigation:** Touch-friendly interactions
- **Optimized Forms:** Mobile keyboard support
- **Touch Targets:** Proper sizing for touch interfaces
- **Responsive Grid:** Adaptive card layouts

### Responsive Breakpoints:
- **Mobile:** < 768px
- **Tablet:** 768px - 1024px
- **Desktop:** > 1024px

---

## Design System

### Color Palette:
- **Primary Orange:** #FF6500
- **Dark Background:** #1a1a1a
- **White Background:** #ffffff
- **Gray Accents:** Various shades for text and borders
- **Status Colors:** Green (success), Yellow (warning), Red (error)

### Typography:
- **Primary Font:** Satoshi Variable
- **Font Weights:** 400 (regular), 600 (semibold), 700 (bold)
- **Font Sizes:** Responsive scaling based on screen size

### Components:
- **Cards:** Rounded corners (12px), shadow effects
- **Buttons:** Rounded (8px), consistent padding
- **Form Elements:** Consistent styling, focus states
- **Badges:** Small labels with background colors
- **Icons:** FontAwesome and React Icons

---

## User Flow Summary

### For Entrepreneurs:
1. **Registration** → Email Verification → Profile Setup
2. **Dashboard** → Create Startup → Admin Approval
3. **Browse** → Find Co-founders/Investors → Connect
4. **Manage** → Update Startup → Track Performance

### For Investors:
1. **Registration** → Email Verification → Profile Setup
2. **Dashboard** → Browse Startups → View Matches
3. **Evaluate** → Review Documents → Contact Entrepreneurs
4. **Track** → Investment Pipeline → Portfolio Management

### For Admins:
1. **Dashboard** → Overview Statistics → Pending Items
2. **Review** → Verify Users → Approve Startups
3. **Manage** → Create Events → Handle Tickets
4. **Monitor** → Platform Performance → User Activity

This comprehensive guide provides all the visual and functional details needed to create a professional PDF user manual with or without screenshots.





