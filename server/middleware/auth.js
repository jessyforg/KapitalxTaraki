const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

module.exports = function (req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  console.log('Auth middleware: Authorization header:', authHeader);
  if (!token) {
    console.log('Auth middleware: No token provided');
    return res.status(401).json({ error: 'Authentication required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      console.log('Auth middleware: Invalid token', err);
      return res.status(403).json({ error: 'Invalid token' });
    }
    console.log('Auth middleware: Decoded user:', user);
    req.user = user;
    next();
  });
}; 