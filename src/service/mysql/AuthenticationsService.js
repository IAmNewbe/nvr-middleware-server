const express = require('express');
const router = express.Router(); // Create a router instance
const Connection = require('./Connection');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// JWT Secret (you should move this to your .env file for security)
const secret = process.env.JWT_SECRET;

// /login route to authenticate the user
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  console.log("login : ",email);

  try {
    // Check if the user exists in the database
    const query = 'SELECT * FROM users WHERE email = ?';
    Connection.query(query, [email], async (err, result) => {
      if (err) {
        return res.status(500).json({ message: 'Error fetching user data' });
      }

      if (result.length === 0) {
        return res.status(404).json({ message: 'User not found' });
      }

      const user = result[0];

      // Compare the entered password with the hashed password stored in the database
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Generate JWT token if authentication is successful
      const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, secret, { expiresIn: '1h' });

      // Return the token and user info (excluding the password)
      res.status(200).json({
        token,
        user: { id: user.id, email: user.email, username: user.username, role: user.role },
      });
    });
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

const authenticateJWT = (req, res, next) => {
  const token = req.header('Authorization').split(' ')[1]; // Assuming "Bearer TOKEN"

  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, secret);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(400).json({ message: 'Invalid token' });
  }
};

// Protect this route
router.get('/protected', authenticateJWT, (req, res) => {
  res.json({ message: 'Access to protected route granted.' });
});

module.exports = router;

