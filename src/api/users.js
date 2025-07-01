import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

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
    const response = await axios.get(`${API_URL}/users/${userId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching profile for user ${userId}:`, error);
    throw error;
  }
}; 