export const updateProfile = async (profileData) => {
  const token = localStorage.getItem('token');
  const response = await fetch('/api/user/profile', {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(profileData)
  });
  if (!response.ok) throw new Error('Failed to update profile');
  return await response.json();
};

export const changePassword = async (passwordData) => {
  const token = localStorage.getItem('token');
  const response = await fetch('/api/user/password', {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(passwordData)
  });
  if (!response.ok) throw new Error('Failed to change password');
  return await response.json();
};

export const updateNotificationPrefs = async (prefs) => {
  const token = localStorage.getItem('token');
  const response = await fetch('/api/user/notifications', {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(prefs)
  });
  if (!response.ok) throw new Error('Failed to update notification preferences');
  return await response.json();
}; 