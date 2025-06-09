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
  async updateUserProfile(userId, profileData) {
    try {
      const response = await fetch(`${API_URL}/user/${userId}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(profileData),
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
        headers: {
          ...getHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ profileImage }),
        credentials: 'include'
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update profile image');
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error updating profile image:', error);
      throw error;
    }
  },

  // Update social links
  async updateSocialLinks(userId, socialLinks) {
    try {
      const response = await fetch(`${API_URL}/user/${userId}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ social_links: socialLinks }),
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to update social links');
      const data = await response.json();
      return data.success;
    } catch (error) {
      console.error('Error updating social links:', error);
      throw error;
    }
  },

  // Update employment
  async updateEmployment(userId, employment) {
    try {
      const response = await fetch(`${API_URL}/user/${userId}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ employment }),
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to update employment');
      const data = await response.json();
      return data.success;
    } catch (error) {
      console.error('Error updating employment:', error);
      throw error;
    }
  },

  // Update academic profile
  async updateAcademicProfile(userId, academicProfile) {
    try {
      const response = await fetch(`${API_URL}/user/${userId}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ academic_profile: academicProfile }),
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to update academic profile');
      const data = await response.json();
      return data.success;
    } catch (error) {
      console.error('Error updating academic profile:', error);
      throw error;
    }
  }
};

export default userProfileAPI; 