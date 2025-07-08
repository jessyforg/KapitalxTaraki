import axios from 'axios';

// Dynamic API URL that works for both localhost and network access
const getApiUrl = () => {
  if (typeof window === 'undefined') {
    return '/api'; // Server-side rendering fallback
  }
  
  const hostname = window.location.hostname;
  const port = window.location.port;
  
  // If accessing from localhost (React dev server on port 3000)
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    // Use relative URL - the proxy in package.json will forward to port 5000
    return '/api';
  }
  
  // If accessing from network (e.g., 192.168.0.24:3000)
  // Point to the backend server on the same host but port 5000
  return `http://${hostname}:5000/api`;
};

// Use only the dynamic API URL, ignore environment variables
const API_URL = getApiUrl();

// Get all users with a specific role
export const getUsersByRole = async (role) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/users/role/${role}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching ${role}s:`, error);
    throw error;
  }
};

// Get all entrepreneurs
export const getEntrepreneurs = async () => {
  return getUsersByRole('entrepreneur');
};

// Get all investors
export const getInvestors = async () => {
  return getUsersByRole('investor');
};

// Get all co-founders (entrepreneurs who are looking for co-founders)
export const getCoFounders = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/users/cofounders`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching co-founders:', error);
    throw error;
  }
};

// Get user preferences
export const getUserPreferences = async (userId) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/users/${userId}/preferences`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching preferences for user ${userId}:`, error);
    throw error;
  }
};

// Get user profile
export const getUserProfile = async (userId) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/user/${userId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching profile for user ${userId}:`, error);
    throw error;
  }
}; 