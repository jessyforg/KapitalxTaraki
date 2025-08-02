# Kapital x Taraki - Frontend Documentation

## Overview

The Kapital x Taraki frontend is built with React 18 and uses modern development practices including functional components, hooks, and responsive design. The application provides a comprehensive user interface for entrepreneurs, investors, and administrators to interact with the startup ecosystem platform.

## Technology Stack

- **React**: 18.3.1 (Functional components with hooks)
- **Styling**: Tailwind CSS 3.4.4
- **Routing**: React Router DOM 6.24.0
- **Icons**: React Icons 5.5.0
- **HTTP Client**: Axios 1.10.0
- **File Handling**: React Easy Crop, File Saver
- **PDF Generation**: jsPDF with autoTable
- **Data Export**: xlsx (Excel export)
- **Animation**: AOS (Animate On Scroll)

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── navigation/      # Navigation components
│   ├── modals/         # Modal components
│   ├── forms/          # Form components
│   └── layout/         # Layout components
├── pages/              # Main application pages
│   ├── dashboard/      # Dashboard pages
│   ├── auth/          # Authentication pages
│   └── public/        # Public pages
├── hooks/             # Custom React hooks
├── utils/             # Utility functions
├── api/               # API service functions
├── contexts/          # React contexts
├── services/          # Business logic services
└── styles/            # CSS and styling files
```

## Core Components

### Navigation Components

#### `Navbar.js`
**Purpose**: Main navigation bar with responsive design and role-based content.

**Features**:
- Responsive hamburger menu for mobile
- Role-based navigation items
- User authentication status display
- Search functionality integration
- Dark mode toggle support

**Props**:
```javascript
{
  hideNavLinks: boolean,          // Hide navigation links
  adminTabs: array,              // Admin-specific tabs
  adminActiveTab: string,        // Currently active admin tab
  setAdminActiveTab: function    // Tab change handler
}
```

**Usage**:
```jsx
<Navbar 
  hideNavLinks={false}
  adminTabs={tabs}
  adminActiveTab={activeTab}
  setAdminActiveTab={setActiveTab}
/>
```

#### `MobileSidebar.js`
**Purpose**: Mobile-optimized sidebar navigation.

**Features**:
- Touch-friendly navigation
- Slide-in animation
- Overlay background
- Role-specific menu items

#### `HamburgerButton.js`
**Purpose**: Mobile menu toggle button with animation.

**Features**:
- Smooth transition animation
- Accessible design
- Custom styling options

### Dashboard Components

#### `AdminDashboard.js`
**Purpose**: Comprehensive administration interface.

**Features**:
- **User Management**: View, verify, suspend users
- **Startup Management**: Approve/reject startup applications
- **Analytics Dashboard**: Platform statistics and metrics
- **Event Management**: Create and manage events
- **Support System**: Handle support tickets
- **Data Export**: Excel and PDF export functionality

**Key Functions**:
```javascript
// User management
const handleVerifyUser = async (userId, comment) => { /* ... */ }
const handleSuspendUser = async (userId, reason) => { /* ... */ }

// Startup management
const handleApproveStartup = async (startupId, comment) => { /* ... */ }
const handleRejectStartup = async (startupId, reason) => { /* ... */ }

// Data export
const exportToExcel = (data, filename) => { /* ... */ }
const exportToPDF = (data, title) => { /* ... */ }
```

**State Management**:
```javascript
const [users, setUsers] = useState([]);
const [startups, setStartups] = useState([]);
const [events, setEvents] = useState([]);
const [analytics, setAnalytics] = useState({});
const [selectedTab, setSelectedTab] = useState('dashboard');
```

#### `EntrepreneurDashboard.js`
**Purpose**: Entrepreneur-specific dashboard interface.

**Features**:
- **Startup Management**: Create and edit startup profiles
- **Match Viewing**: See investor matches
- **Message Center**: Communication with investors
- **Profile Management**: Update entrepreneur profile
- **Document Upload**: Verification documents

**Key Sections**:
- Overview statistics
- Match recommendations
- Recent messages
- Startup portfolio
- Profile completion status

#### `InvestorDashboard.js`
**Purpose**: Investor-focused dashboard interface.

**Features**:
- **Startup Discovery**: Browse and filter startups
- **Match Results**: Algorithm-generated matches
- **Investment Tracking**: Portfolio management
- **Communication**: Direct messaging with entrepreneurs
- **Profile Preferences**: Investment criteria settings

**Filtering Options**:
```javascript
const filters = {
  industry: ['Technology', 'Healthcare', 'FinTech'],
  stage: ['seed', 'series_a', 'series_b'],
  location: ['Baguio City', 'Manila', 'Cebu'],
  fundingRange: { min: 100000, max: 10000000 }
};
```

### Authentication Components

#### `LoginForm.js`
**Purpose**: User authentication form.

**Features**:
- Form validation
- Password visibility toggle
- Remember me functionality
- Error handling and display
- Redirect on successful login

**Form Fields**:
```javascript
const [formData, setFormData] = useState({
  email: '',
  password: '',
  rememberMe: false
});
```

#### `SignupForm.js`
**Purpose**: User registration form.

**Features**:
- Multi-step registration process
- Role selection (entrepreneur/investor)
- Password strength validation
- Terms and conditions acceptance
- Email verification flow

**Registration Steps**:
1. Basic information (name, email)
2. Role selection and details
3. Profile information
4. Email verification

#### `ProtectedRoute.js`
**Purpose**: Route protection based on authentication and roles.

**Features**:
- Authentication verification
- Role-based access control
- Automatic redirects
- Token validation

**Usage**:
```jsx
<ProtectedRoute allowedRoles={['admin']}>
  <AdminDashboard />
</ProtectedRoute>
```

### Communication Components

#### `Messages.js`
**Purpose**: Real-time messaging interface.

**Features**:
- **Real-time Chat**: Instant messaging between users
- **File Sharing**: Document and image attachments
- **Conversation Management**: Chat organization and search
- **Status Indicators**: Online/offline status
- **Message Threading**: Organized conversation history

**Key Features**:
```javascript
// Message sending
const sendMessage = async (receiverId, content, files) => { /* ... */ }

// File upload
const handleFileUpload = async (file, receiverId) => { /* ... */ }

// Real-time updates
useEffect(() => {
  const interval = setInterval(fetchMessages, 3000);
  return () => clearInterval(interval);
}, []);
```

**Message Types**:
- Text messages
- File attachments
- Image sharing
- Connection requests

#### `NotificationDropdown.js`
**Purpose**: Notification display and management.

**Features**:
- Real-time notification updates
- Mark as read functionality
- Notification categorization
- Action buttons for quick responses

**Notification Types**:
- New messages
- Match alerts
- Startup approvals
- Event reminders
- Profile views

### Business Components

#### `CreateStartup.js`
**Purpose**: Startup creation and editing form.

**Features**:
- **Multi-step Form**: Progressive information collection
- **File Uploads**: Logo, pitch deck, business plan
- **Validation**: Comprehensive form validation
- **Auto-save**: Draft saving functionality
- **Preview Mode**: Review before submission

**Form Sections**:
1. Basic Information
2. Financial Details
3. Team Information
4. Documents Upload
5. Review and Submit

#### `StartupDetails.js`
**Purpose**: Detailed startup information display.

**Features**:
- Comprehensive startup profile
- Team member showcase
- Financial information display
- Document download links
- Contact entrepreneur functionality

#### `Matches.js`
**Purpose**: Matchmaking results display.

**Features**:
- **Algorithm Results**: Display match scores and reasons
- **Filtering Options**: Refine matches by criteria
- **Contact Actions**: Direct messaging from matches
- **Match Explanations**: Detailed compatibility reasons

**Match Display**:
```javascript
const MatchCard = ({ match }) => (
  <div className="match-card">
    <div className="match-score">{match.score}%</div>
    <div className="match-details">
      <h3>{match.name}</h3>
      <p>{match.industry}</p>
      <ul className="match-reasons">
        {match.reasons.map(reason => (
          <li key={reason}>{reason}</li>
        ))}
      </ul>
    </div>
    <button onClick={() => contactMatch(match.id)}>
      Contact
    </button>
  </div>
);
```

### Content Components

#### `Home.js`
**Purpose**: Landing page with platform overview.

**Features**:
- Hero section with video background
- Platform statistics display
- Feature highlights
- Call-to-action buttons
- Testimonials integration

**Dynamic Statistics**:
```javascript
const [stats, setStats] = useState({
  total_users: 0,
  total_startups: 0,
  total_entrepreneurs: 0,
  total_investors: 0
});
```

#### `Team.js`
**Purpose**: Team members showcase.

**Features**:
- Team member profiles
- Role descriptions
- Social media links
- Professional backgrounds

#### `Events.js`
**Purpose**: Event listing and management.

**Features**:
- Event calendar view
- Event registration
- Filter by category/date
- Event details modal
- Registration management

#### `FAQ.js`
**Purpose**: Frequently asked questions.

**Features**:
- Collapsible question sections
- Search functionality
- Category-based organization
- Contact support integration

### Utility Components

#### `UserDetailsModal.js`
**Purpose**: User information display modal.

**Features**:
- Complete user profile view
- Contact information
- Professional background
- Social media links
- Action buttons (message, connect)

#### `UserProfile.js`
**Purpose**: User profile management interface.

**Features**:
- **Profile Editing**: Update personal information
- **Image Upload**: Profile picture management
- **Social Links**: Social media integration
- **Privacy Settings**: Visibility controls
- **Preference Management**: Matchmaking preferences

**Profile Sections**:
- Personal Information
- Professional Background
- Education History
- Skills and Interests
- Privacy Settings
- Notification Preferences

## Custom Hooks

### `useScreenSize.js`
**Purpose**: Responsive design helper hook.

**Features**:
- Screen size detection
- Breakpoint management
- Mobile/desktop detection
- Responsive behavior control

**Usage**:
```javascript
const { isDesktop, isMobile, isTablet } = useBreakpoint();
const screenSize = useScreenSize();

// Conditional rendering
{isMobile ? <MobileComponent /> : <DesktopComponent />}
```

## Utility Functions

### `matchmaking.js`
**Purpose**: Matchmaking algorithm implementation.

**Key Functions**:
```javascript
// Calculate match score between entities
export const calculateMatchScore = (entity1, entity2) => { /* ... */ }

// Match startups with investors
export const matchStartupsWithInvestors = (startups, investors) => { /* ... */ }

// Match entrepreneurs for co-founder connections
export const matchCoFounders = (entrepreneurs) => { /* ... */ }

// Enhance user data for matching
export const enhanceUserForMatching = async (user, preferences) => { /* ... */ }
```

**Matching Criteria**:
- Industry alignment
- Location proximity
- Startup stage compatibility
- Funding requirements
- Skills and experience

### `validation.js`
**Purpose**: Form validation utilities.

**Validation Functions**:
```javascript
// Email validation
export const validateEmail = (email) => { /* ... */ }

// Password strength validation
export const validatePassword = (password) => { /* ... */ }

// Form field validation
export const validateRequired = (value, fieldName) => { /* ... */ }

// File validation
export const validateFile = (file, allowedTypes, maxSize) => { /* ... */ }
```

### `cropImage.js`
**Purpose**: Image cropping and processing.

**Features**:
- Image cropping functionality
- Aspect ratio maintenance
- File size optimization
- Format conversion

## API Integration

### `api.js`
**Purpose**: Centralized API communication.

**Key Functions**:
```javascript
// Generic API request
export const apiRequest = async (endpoint, options) => { /* ... */ }

// Authentication requests
export const login = async (credentials) => { /* ... */ }
export const register = async (userData) => { /* ... */ }

// User management
export const updateProfile = async (userId, profileData) => { /* ... */ }
export const uploadProfileImage = async (userId, imageFile) => { /* ... */ }

// Startup operations
export const createStartup = async (startupData) => { /* ... */ }
export const updateStartup = async (startupId, updateData) => { /* ... */ }

// Messaging
export const sendMessage = async (receiverId, content) => { /* ... */ }
export const getMessages = async (userId) => { /* ... */ }
```

### `locationAPI.js`
**Purpose**: Philippine location data management.

**Features**:
- Region/province/city data
- Location hierarchy
- Search functionality
- Address formatting

## Responsive Design

### Breakpoints
```css
xs: 475px     /* Extra small devices */
sm: 640px     /* Small devices */
md: 768px     /* Medium devices (tablets) */
lg: 1024px    /* Large devices (laptops) */
xl: 1280px    /* Extra large devices */
2xl: 1536px   /* 2X large devices */
```

### Mobile-First Approach
- Progressive enhancement
- Touch-friendly interactions
- Optimized performance
- Accessible design

### Component Responsiveness
```javascript
// Responsive component example
const ResponsiveGrid = ({ children }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
    {children}
  </div>
);
```

## State Management

### Local State
- Component-level state using `useState`
- Form state management
- UI state (modals, dropdowns)

### Shared State
- User authentication state
- Theme preferences
- Notification state

### Data Fetching
- API calls using `useEffect`
- Loading states management
- Error handling

## Performance Optimization

### Code Splitting
- Route-based code splitting
- Component lazy loading
- Dynamic imports

### Memoization
```javascript
// Expensive calculations
const memoizedValue = useMemo(() => 
  computeExpensiveValue(a, b), [a, b]);

// Callback optimization
const memoizedCallback = useCallback(
  () => doSomething(a, b), [a, b]);
```

### Image Optimization
- Lazy loading
- WebP format support
- Responsive images
- Compression

## Error Handling

### Error Boundaries
- Component error catching
- Graceful degradation
- Error reporting

### API Error Handling
```javascript
const handleApiError = (error) => {
  if (error.response?.status === 401) {
    // Redirect to login
    logout();
  } else if (error.response?.status === 403) {
    // Show permission error
    showError('Access denied');
  } else {
    // Generic error handling
    showError('Something went wrong');
  }
};
```

## Accessibility

### ARIA Support
- Proper ARIA labels
- Screen reader support
- Keyboard navigation
- Focus management

### Semantic HTML
- Proper heading hierarchy
- Semantic elements usage
- Form accessibility
- Link descriptions

## Testing Strategy

### Component Testing
- Unit tests for components
- Props validation
- Event handling tests
- Snapshot testing

### Integration Testing
- User flow testing
- API integration tests
- Form submission tests
- Navigation tests

## Deployment Considerations

### Build Optimization
- Bundle size optimization
- Tree shaking
- Asset optimization
- Cache strategies

### Environment Configuration
- Development/production configs
- API endpoint management
- Feature flags
- Error reporting

---

*This documentation covers the frontend architecture and components of the Kapital x Taraki platform. For backend documentation, refer to the API Documentation and System Documentation files.* 