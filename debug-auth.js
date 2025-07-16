// Quick debug script to check authentication
console.log('=== Authentication Debug ===');
console.log('Token:', localStorage.getItem('token'));
console.log('User:', localStorage.getItem('user'));

const token = localStorage.getItem('token');
if (token) {
  try {
    // Decode JWT token (note: this doesn't verify, just decodes)
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    
    const decoded = JSON.parse(jsonPayload);
    console.log('Decoded token:', decoded);
    console.log('Token expires:', new Date(decoded.exp * 1000));
    console.log('Current time:', new Date());
    console.log('Token valid:', new Date(decoded.exp * 1000) > new Date());
  } catch (e) {
    console.error('Error decoding token:', e);
  }
} else {
  console.log('No token found!');
} 