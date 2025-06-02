const API_URL = 'http://localhost:3000/api';

const api = {
  // Auth endpoints
  async register(userData) {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    return response.json();
  },

  async login(credentials) {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });
    return response.json();
  },

  // Event endpoints
  async createEvent(eventData, token) {
    const response = await fetch(`${API_URL}/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(eventData),
    });
    return response.json();
  },

  async getEvents() {
    const response = await fetch(`${API_URL}/events`);
    return response.json();
  },

  async getEventById(id) {
    const response = await fetch(`${API_URL}/events/${id}`);
    return response.json();
  },
};

export default api; 