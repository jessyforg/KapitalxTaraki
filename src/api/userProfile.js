const API_URL = 'http://localhost:5000/api';

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

const userProfileAPI = {
  // Get user profile
  async getUserProfile(userId) {
    try {
      const response = await fetch(`${API_URL}/user/${userId}`, {
        headers: getHeaders(),
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch user profile');
      return await response.json();
    } catch (error) {
      console.error('Error getting user profile:', error);
      throw error;
    }
  },

  // Update user profile
  async updateUserProfile(userId, { name, email, profileImage }) {
    try {
      const response = await fetch(`${API_URL}/user/${userId}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ name, email, profileImage }),
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to update user profile');
      const data = await response.json();
      return data.success;
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  },

  // Update profile image
  async updateProfileImage(userId, profileImage) {
    try {
      const response = await fetch(`${API_URL}/user/${userId}/profile-image`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ profileImage }),
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to update profile image');
      const data = await response.json();
      return data.success;
    } catch (error) {
      console.error('Error updating profile image:', error);
      throw error;
    }
  }
};

export default userProfileAPI; 