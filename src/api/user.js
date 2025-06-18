import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Update user profile
export const updateProfile = async (profileData) => {
  try {
    const response = await axios.put(`${API_URL}/users/profile`, profileData, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    
    // Update local storage with new user data
    const currentUser = JSON.parse(localStorage.getItem('user'));
    const updatedUser = { ...currentUser, ...response.data };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to update profile');
  }
};

// Change password
export const changePassword = async (passwordData) => {
  try {
    const response = await axios.put(`${API_URL}/users/password`, passwordData, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to change password');
  }
};

// Update notification preferences
export const updateNotificationPrefs = async (preferences) => {
  try {
    const response = await axios.put(`${API_URL}/users/notifications`, preferences, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to update notification preferences');
  }
};

export const updateProfilePhoto = async (formData) => {
  try {
    const response = await axios.post(`${API_URL}/users/profile/photo`, formData, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'multipart/form-data'
      }
    });

    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to update profile photo');
  }
};

// Get notification preferences
export const getNotificationPrefs = async () => {
  try {
    const response = await axios.get(`${API_URL}/users/notifications`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch notification preferences');
  }
};

// Update 2FA status
export const update2FA = async (enabled) => {
  try {
    const response = await axios.put(`${API_URL}/users/2fa`, { enabled }, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to update 2FA status');
  }
};

// Get message settings
export const getMessageSettings = async () => {
  try {
    const response = await axios.get(`${API_URL}/users/message-settings`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch message settings');
  }
};

// Update message settings
export const updateMessageSettings = async (settings) => {
  try {
    const response = await axios.put(`${API_URL}/users/message-settings`, settings, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to update message settings');
  }
}; 