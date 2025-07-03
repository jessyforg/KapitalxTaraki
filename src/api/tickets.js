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

export const getTickets = async () => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_URL}/tickets`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  if (!response.ok) throw new Error('Failed to fetch tickets');
  return await response.json();
};

export const submitTicket = async (ticketData) => {
  try {
    const response = await axios.post(`${API_URL}/tickets`, ticketData, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to submit ticket');
  }
};

export const updateTicket = async (ticketId, data) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_URL}/tickets/${ticketId}`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });
  if (!response.ok) throw new Error('Failed to update ticket');
  return await response.json();
};