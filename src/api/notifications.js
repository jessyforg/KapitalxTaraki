import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || '';

// Get notifications for the current user
export const getNotifications = async () => {
  try {
    const response = await axios.get(`${API_URL}/api/notifications`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching notifications:', error);
    throw error;
  }
};

// Mark a notification as read
export const markNotificationAsRead = async (notificationId) => {
  try {
    const response = await axios.post(
      `${API_URL}/api/notifications/${notificationId}/read`,
      {},
      {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

// Mark all notifications as read
export const markAllNotificationsAsRead = async () => {
  try {
    const response = await axios.post(
      `${API_URL}/api/notifications/read-all`,
      {},
      {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    throw error;
  }
};

// Update notification preferences
export const updateNotificationPreferences = async (preferences) => {
  try {
    const response = await axios.put(
      `${API_URL}/api/notifications/preferences`,
      preferences,
      {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error updating notification preferences:', error);
    throw error;
  }
};

// Get notification preferences
export const getNotificationPreferences = async () => {
  try {
    const response = await axios.get(`${API_URL}/api/notifications/preferences`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching notification preferences:', error);
    throw error;
  }
};

// Delete a notification
export const deleteNotification = async (notificationId) => {
  try {
    const response = await axios.delete(
      `${API_URL}/api/notifications/${notificationId}`,
      {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error deleting notification:', error);
    throw error;
  }
};

// Get unread notification count
export const getUnreadNotificationCount = async () => {
  try {
    const response = await axios.get(`${API_URL}/api/notifications/unread-count`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching unread notification count:', error);
    throw error;
  }
}; 