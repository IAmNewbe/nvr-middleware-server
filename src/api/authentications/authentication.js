const jwt = require('jsonwebtoken');
require('dotenv').config();

// JWT Secret (you should move this to your .env file for security)
const secret = process.env.JWT_SECRET;

const authenticateJWT = (req, res, next) => {
  const token = req.header('Authorization').split(' ')[1]; // Assuming "Bearer TOKEN"

  if (!token) {
    return res.status(401).json({ message: 'Access denied. Please login first.' });
  }

  try {
    const decoded = jwt.verify(token, secret);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(400).json({ message: 'Invalid token' });
  }
};

module.exports = {
  authenticateJWT
}