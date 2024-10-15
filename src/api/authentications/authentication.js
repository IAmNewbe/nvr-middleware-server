const jwt = require('jsonwebtoken');
require('dotenv').config();

// Middleware to authenticate JWT and check roles
const authenticateJWT = (req, res, next) => {
  const token = req.header('Authorization') && req.header('Authorization').split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Authorization header missing' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(400).json({ message: 'Invalid token' });
  }
};

// Middleware to check for specific roles
const authorizeRoles = (allowedRoles) => (req, res, next) => {
  if (!allowedRoles.includes(req.user.role)) {
    return res.status(403).json({ message: 'Forbidden: Insufficient role access' });
  }
  next();
};

module.exports = {
  authenticateJWT,
  authorizeRoles,
};
