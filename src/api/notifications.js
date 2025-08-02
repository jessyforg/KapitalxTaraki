import axios from 'axios';

// Dynamic API URL that works for both localhost and network access
const getApiUrl = () => {
  if (typeof window === 'undefined') {
    return 'http://localhost:5000/api'; // Server-side rendering fallback
  }
  
  const hostname = window.location.hostname;
  const port = window.location.port;
  
  // Always point to the backend server on port 5000
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:5000/api';
  }
  
  // If accessing from network (e.g., 192.168.0.24:3000)
  // Point to the backend server on the same host but port 5000
  return `http://${hostname}:5000/api`;
};

// Use only the dynamic API URL, ignore environment variables
const API_URL = getApiUrl();


console.log('🔧 DEBUG - API Configuration:');
console.log('- Ignoring process.env.REACT_APP_API_URL (was causing issues)');
console.log('- getApiUrl() returns:', getApiUrl());
console.log('- Final API_URL being used:', API_URL);
console.log('- Current window.location.hostname:', typeof window !== 'undefined' ? window.location.hostname : 'N/A');
console.log('- Current window.location.port:', typeof window !== 'undefined' ? window.location.port : 'N/A');
console.log('- Current window.location.href:', typeof window !== 'undefined' ? window.location.href : 'N/A');

// Get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  console.log('Token from localStorage:', token ? 'Token exists' : 'No token found');
  
  if (!token) {
    console.warn('No authentication token found in localStorage');
    return {};
  }
  
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

// Get notifications for the current user
export const getNotifications = async () => {
  try {
    const headers = getAuthHeaders();
    if (!headers.Authorization) {
      throw new Error('No authentication token available');
    }
    
    console.log('Making request to:', `${API_URL}/notifications`);
    console.log('With headers:', headers);
    
    const response = await axios.get(`${API_URL}/notifications`, { headers });
    return response.data;
  } catch (error) {
    console.error('Error fetching notifications:', error);
    if (error.response?.status === 401) {
      console.error('Authentication failed - token may be invalid or expired');
      // Optionally redirect to login or clear invalid token
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.reload();
    }
    throw error;
  }
};

// Mark a notification as read
export const markNotificationAsRead = async (notificationId) => {
  try {
    const headers = getAuthHeaders();
    if (!headers.Authorization) {
      throw new Error('No authentication token available');
    }
    
    const response = await axios.post(
      `${API_URL}/notifications/${notificationId}/read`,
      {},
      { headers }
    );
    return response.data;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    if (error.response?.status === 401) {
      console.error('Authentication failed - token may be invalid or expired');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.reload();
    }
    throw error;
  }
};

// Mark all notifications as read
export const markAllNotificationsAsRead = async () => {
  try {
    const headers = getAuthHeaders();
    if (!headers.Authorization) {
      throw new Error('No authentication token available');
    }
    
    const response = await axios.post(
      `${API_URL}/notifications/read-all`,
      {},
      { headers }
    );
    return response.data;
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    if (error.response?.status === 401) {
      console.error('Authentication failed - token may be invalid or expired');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.reload();
    }
    throw error;
  }
};

// Update notification preferences
export const updateNotificationPreferences = async (preferences) => {
  try {
    const headers = getAuthHeaders();
    if (!headers.Authorization) {
      throw new Error('No authentication token available');
    }
    
    const response = await axios.put(
      `${API_URL}/notifications/preferences`,
      preferences,
      { headers }
    );
    return response.data;
  } catch (error) {
    console.error('Error updating notification preferences:', error);
    if (error.response?.status === 401) {
      console.error('Authentication failed - token may be invalid or expired');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.reload();
    }
    throw error;
  }
};

// Get notification preferences
export const getNotificationPreferences = async () => {
  try {
    const headers = getAuthHeaders();
    if (!headers.Authorization) {
      throw new Error('No authentication token available');
    }
    
    const response = await axios.get(`${API_URL}/notifications/preferences`, { headers });
    return response.data;
  } catch (error) {
    console.error('Error fetching notification preferences:', error);
    if (error.response?.status === 401) {
      console.error('Authentication failed - token may be invalid or expired');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.reload();
    }
    throw error;
  }
};

// Delete a notification
export const deleteNotification = async (notificationId) => {
  try {
    const headers = getAuthHeaders();
    if (!headers.Authorization) {
      throw new Error('No authentication token available');
    }
    
    const response = await axios.delete(
      `${API_URL}/notifications/${notificationId}`,
      { headers }
    );
    return response.data;
  } catch (error) {
    console.error('Error deleting notification:', error);
    if (error.response?.status === 401) {
      console.error('Authentication failed - token may be invalid or expired');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.reload();
    }
    throw error;
  }
};

// Get unread notification count
export const getUnreadNotificationCount = async () => {
  try {
    const headers = getAuthHeaders();
    if (!headers.Authorization) {
      throw new Error('No authentication token available');
    }
    
    console.log('Making request to:', `${API_URL}/notifications/unread-count`);
    console.log('With headers:', headers);
    
    const response = await axios.get(`${API_URL}/notifications/unread-count`, { headers });
    return response.data;
  } catch (error) {
    console.error('Error fetching unread notification count:', error);
    if (error.response?.status === 401) {
      console.error('Authentication failed - token may be invalid or expired');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.reload();
    }
    throw error;
  }
}; 