// Dynamic API URL that works for both localhost and network access
const getApiUrl = () => {
  // If we're accessing from localhost, use localhost
  if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    return 'http://localhost:5000/api';
  }
  // Otherwise, use the same hostname as the frontend (for network access)
  return typeof window !== 'undefined' ? `http://${window.location.hostname}:5000/api` : 'http://localhost:5000/api';
};

const API_URL = getApiUrl();

const getHeaders = () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  } catch (error) {
    console.warn('Error accessing localStorage:', error);
    throw error;
  }
};

// Compress image
const compressImage = (base64Image) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = base64Image;
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;
      
      // Calculate new dimensions while maintaining aspect ratio
      const MAX_WIDTH = 800;
      const MAX_HEIGHT = 800;
      
      if (width > height) {
        if (width > MAX_WIDTH) {
          height = Math.round((height * MAX_WIDTH) / width);
          width = MAX_WIDTH;
        }
      } else {
        if (height > MAX_HEIGHT) {
          width = Math.round((width * MAX_HEIGHT) / height);
          height = MAX_HEIGHT;
        }
      }
      
      canvas.width = width;
      canvas.height = height;
      
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      
      // Convert to base64 with reduced quality
      const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
      resolve(compressedBase64);
    };
    
    img.onerror = () => {
      reject(new Error('Failed to load image for compression'));
    };
  });
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
      // Validate image size (max 5MB)
      const base64Data = profileImage.split(',')[1];
      const sizeInBytes = Math.ceil((base64Data.length * 3) / 4);
      const sizeInMB = sizeInBytes / (1024 * 1024);
      
      if (sizeInMB > 5) {
        throw new Error('Image size must be less than 5MB');
      }

      // Compress image if needed
      const compressedImage = await compressImage(profileImage);

      const response = await fetch(`${API_URL}/user/${userId}/profile-image`, {
        method: 'PUT',
        headers: {
          ...getHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ profileImage: compressedImage }),
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
      const response = await fetch(`${API_URL}/users/${userId}/social-links`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(socialLinks),
        credentials: 'include'
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update social links');
      }
      const data = await response.json();
      return data.socialLinks;
    } catch (error) {
      console.error('Error updating social links:', error);
      throw error;
    }
  },

  // Delete a specific social link
  async deleteSocialLink(userId, platform) {
    try {
      const response = await fetch(`${API_URL}/users/${userId}/social-links/${platform}`, {
        method: 'DELETE',
        headers: getHeaders(),
        credentials: 'include'
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete social link');
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error deleting social link:', error);
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
  },

  // Update password
  async updatePassword(userId, passwordData) {
    try {
      const response = await fetch(`${API_URL}/user/${userId}/password`, {
        method: 'PUT',
        headers: {
          ...getHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(passwordData),
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update password');
      }

      const data = await response.json();
      return data.success;
    } catch (error) {
      console.error('Error updating password:', error);
      throw error;
    }
  }
};

export default userProfileAPI; 