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
    const sql = `INSERT INTO task_list (id, name, user, password, server, port, prefix, created_at, updated_at) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    const values = [
      taskData.id,
      taskData.name,
      taskData.username,
      taskData.password,
      taskData.server,
      taskData.port,
      taskData.prefix,
      created_at,
      updated_at
    ];
   
    // Execute the query
    Connection.query(sql, values, (err, results) => {
      if (err) {
        return console.error('Error inserting data:', err.message);
      }
      console.log('Data inserted successfully:', results);
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
    // Log the results
    console.log('Data from table:', results);

    // Close the connection
    Connection.end();
  });
});

module.exports = router; // Export the router