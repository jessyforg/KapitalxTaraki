import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

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