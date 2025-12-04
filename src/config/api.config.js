// API Configuration for different environments
// This file centralizes the API base URL for production and development

const API_CONFIG = {
  development: 'http://localhost:5000/api',
  production: 'https://taraki-production.up.railway.app/api'
};

// Get current environment
const getEnvironment = () => {
  // Check if we're in a production build
  if (process.env.NODE_ENV === 'production') {
    return 'production';
  }
  return 'development';
};

// Export the appropriate API URL
export const API_BASE_URL = API_CONFIG[getEnvironment()];

// For debugging (only in development)
if (process.env.NODE_ENV === 'development') {
  console.log('API Base URL:', API_BASE_URL);
}


