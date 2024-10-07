const { nanoid } = require('nanoid');// Import nanoid for generating unique IDs
const express = require('express');
const router = express.Router(); // Create a router instance
const Connection = require('./Connection')

// POST route to handle adding a task
router.post('/postTaskById', (req, res) => {
  try {
    const taskData = req.body.data;
    const id = nanoid(16);
    const created_at = new Date().toISOString();
		const updated_at = created_at;
    if (!taskData) {
      throw new Error('No task data received');
    }

    // Create a new task object with a unique ID
    taskData.id = id;

    // SQL query to insert the data into the serverData table
    const sql = `INSERT INTO task_list 
    (
      id, name, username, password, server, port, prefix, created_at, updated_at,
      ftp_url, ftp_port, ftp_user, ftp_pass, ftp_dir, send_interval, status
    ) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    const values = [
      taskData.id,
      taskData.name,
      taskData.username,
      taskData.password,
      taskData.server,
      taskData.port,
      taskData.prefix,
      created_at,
      updated_at,
      taskData.ftp_url,
      taskData.ftp_port,
      taskData.ftp_user,
      taskData.ftp_pass,
      taskData.ftp_dir,
      taskData.send_interval,
      taskData.status, 
    ];
   
    // Execute the query
    Connection.query(sql, values, (err, results) => {
      if (err) {
        return console.error('Error inserting data:', err.message);
      }
    });
    // Send a JSON response with the newly added task
    res.status(201).json({ status: res.statusCode ,message: 'Task added successfully', task: taskData });
  } catch (error) {
    console.error('Error processing task:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET route to retrieve all tasks
router.get('/getAllTasks', (req, res) => {
  // Query to get all data from the table
  const sql = 'SELECT * FROM task_list';  // Replace 'serverData' with your table name
  // Execute the query
  Connection.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching data:', err.message);
      return;
    }
    const data = results;
    res.status(200).json({ status: res.statusCode ,message: 'show All Tasks', data});
  });
});

module.exports = router; // Export the router