const { nanoid } = require('nanoid');// Import nanoid for generating unique IDs
const express = require('express');
const router = express.Router(); // Create a router instance
const Connection = require('./Connection')

// POST route to handle adding a task
router.post('/postUserById', (req, res) => {
  try {
    const userData = req.body;
    console.log(userData);
    const id = nanoid(16);
    const created_at = new Date().toISOString();
    const updated_at = created_at;
    if (!userData) {
      throw new Error('No user data received');
    }

    userData.id = id;

    // SQL query to insert a new user into the database
    const sql = `INSERT INTO users 
    (
      id, email, username, password, role, created_at, update_at
    ) 
    VALUES (?, ?, ?,?,?,?,?)`;

    const values = [userData.id, userData.email, userData.username, userData.password,  userData.role, created_at, updated_at]
    // Execute the query
    Connection.query(sql, values, (err, result) => {
      if (err) {
        res.status(500).json({error : 'Internal Server error'})
      }
      res.status(201).json({ status: res.statusCode, message: 'User created successfully', data: userData});
    });
  } catch (err) {
    console.error("error adding new user: ", err);
    res.status(500).json({ status: res.statusCode, message: 'Internal Server Error' });
    return;
  }
});

//GET route to retrive all users 
router.get('/getAllUsers', (req, res) => {
  try {
    // SQL query to get all users from the database
    const sql = 'SELECT * FROM users';
    // Execute the query
    Connection.query(sql, (err, result) => {
      if (err) throw err;
      res.status(200).json({ status: res.statusCode, message: 'Success', data: result });
    });
  } catch (err) {
    console.error("error fetching all users: ", err);
    res.status(500).json({ status: res.statusCode, message: 'Internal Server Error' });
    return;
  }
})

module.exports = router; // Export the router instance

