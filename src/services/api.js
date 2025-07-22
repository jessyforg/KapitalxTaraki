// Dynamic API URL that works for both localhost and network access
const getApiUrl = () => {
  if (typeof window === 'undefined') {
    return 'http://localhost:5000/api'; // Server-side rendering fallback
  }
  
  const hostname = window.location.hostname;
  const port = window.location.port;
  
  // Always point directly to the backend server on port 5000
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:5000/api';
  }
  
  // If accessing from network (e.g., 192.168.0.24:3000)
  // Point to the backend server on the same host but port 5000
  return `http://${hostname}:5000/api`;
};

const API_URL = getApiUrl();

const getHeaders = () => {
  try {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
    };
  } catch (error) {
    console.warn('Error accessing localStorage:', error);
    return {
      'Content-Type': 'application/json',
    };
  }
};

const api = {
  // Authentication
  async register(userData) {
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
        credentials: 'include'
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || data.message || 'Registration failed');
      }
      return data;
    } catch (error) {
      console.error('Registration error:', error);
      throw new Error(error.message || 'Registration failed');
    }
  },

  async login(credentials) {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
        credentials: 'include'
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Login failed');
      return data;
    } catch (error) {
      throw new Error(error.message || 'Login failed');
    }
  },

  async verifyEmail(token) {
    try {
      const response = await fetch(`${API_URL}/auth/verify-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
        credentials: 'include'
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Email verification failed');
      return data;
    } catch (error) {
      throw new Error(error.message || 'Email verification failed');
    }
  },

  // User Profile
  async getUserProfile(userId) {
    try {
      const response = await fetch(`${API_URL}/users/${userId}`, {
        headers: getHeaders(),
        credentials: 'include'
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to fetch user profile');
      return data;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch user profile');
    }
  },

  async updateUserProfile(userId, profileData) {
    try {
      // Ensure skills is an array
      const dataToSend = {
        ...profileData,
        skills: Array.isArray(profileData.skills) ? profileData.skills : [],
        preferred_industries: Array.isArray(profileData.preferred_industries) ? profileData.preferred_industries : []
      };

      const response = await fetch(`${API_URL}/users/${userId}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(dataToSend),
        credentials: 'include'
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to update profile');
      return data;
    } catch (error) {
      throw new Error(error.message || 'Failed to update profile');
    }
  },

  async updateProfileImage(userId, profileImage) {
    try {
      const response = await fetch(`${API_URL}/users/${userId}/profile-image`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ profileImage }),
        credentials: 'include'
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to update profile image');
      return data;
    } catch (error) {
      throw new Error(error.message || 'Failed to update profile image');
    }
  },

  // Fetch user social links
  async getUserSocialLinks(userId) {
    try {
      const response = await fetch(`${API_URL}/users/${userId}/social-links`, {
        headers: getHeaders(),
        credentials: 'include'
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to fetch user social links');
      return data;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch user social links');
    }
  },

  // Get user preferences
  async getUserPreferences(userId) {
    try {
      const response = await fetch(`${API_URL}/users/${userId}`, {
        headers: getHeaders(),
        credentials: 'include'
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to fetch user preferences');
      
      // Extract preference fields from user data
      return {
        position_desired: data.position_desired,
        preferred_industries: data.preferred_industries,
        preferred_startup_stage: data.preferred_startup_stage,
        preferred_location: data.preferred_location,
        skills: data.skills
      };
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch user preferences');
    }
  },

  // Event endpoints
  async createEvent(eventData) {
    try {
      const response = await fetch(`${API_URL}/events`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(eventData),
        credentials: 'include'
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to create event');
      return data;
    } catch (error) {
      throw new Error(error.message || 'Failed to create event');
    }
  },

  async getEvents() {
    try {
      const response = await fetch(`${API_URL}/events`, {
        headers: getHeaders(),
        credentials: 'include'
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to fetch events');
      return data;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch events');
    }
  },

  async getEventById(id) {
    try {
      const response = await fetch(`${API_URL}/events/${id}`, {
        headers: getHeaders(),
        credentials: 'include'
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to fetch event');
      return data;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch event');
    }
  },
};

export default api; 