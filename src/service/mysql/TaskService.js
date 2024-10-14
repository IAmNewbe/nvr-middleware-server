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
        console.error('Error inserting data:', err.message);
        res.status(500).json({ status: res.statusCode ,message: err.message });
      }
    });
    // Send a JSON response with the newly added task
    res.status(201).json({ status: res.statusCode ,message: 'Task added successfully', task: taskData });
  } catch (error) {
    console.error('Error processing task:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Route to edit an existing task
router.put('/editTaskById/:id', (req, res) => {
  const taskId = req.params.id; // Get the task ID from the URL parameters
  const updatedTaskData = req.body.data; // Get the updated task data from the request body

  if (!updatedTaskData) {
    return res.status(400).json({ error: 'No task data received' });
  }

  const updated_at = new Date().toISOString(); // Get the current timestamp for the updated_at field

  // SQL query to update the task in the task_list table
  const sql = `UPDATE task_list SET
    name = ?,
    username = ?,
    password = ?,
    server = ?,
    port = ?,
    prefix = ?,
    updated_at = ?,
    ftp_url = ?,
    ftp_port = ?,
    ftp_user = ?,
    ftp_pass = ?,
    ftp_dir = ?,
    send_interval = ?,
    status = ?
  WHERE id = ?`;

  const values = [
    updatedTaskData.name,
    updatedTaskData.username,
    updatedTaskData.password,
    updatedTaskData.server,
    updatedTaskData.port,
    updatedTaskData.prefix,
    updated_at,
    updatedTaskData.ftp_url,
    updatedTaskData.ftp_port,
    updatedTaskData.ftp_user,
    updatedTaskData.ftp_pass,
    updatedTaskData.ftp_dir,
    updatedTaskData.send_interval,
    updatedTaskData.status,
    taskId // Include the task ID for the WHERE clause
  ];

  // Execute the query
  Connection.query(sql, values, (err, results) => {
    if (err) {
      console.error('Error updating task:', err.message);
      return res.status(500).json({ status: res.statusCode, message: err.message });
    }

    if (results.affectedRows === 0) {
      // If no rows were affected, the task may not exist
      return res.status(404).json({ status: res.statusCode, message: 'Task not found' });
    }

    // Send a JSON response with a success message
    res.status(200).json({ status: res.statusCode, message: 'Task updated successfully', taskId });
  });
});

// GET route by task ID
router.get('/getTaskById/:id', async(req, res) => {
  const id = req.params.id;
  console.log(id); 
  const sql = 'SELECT * FROM task_list Where id = ?';

  Connection.query(sql, [id], (err, result) => {
    if (err) {
      console.error('Error fetching data:', err.message);
      return;
    }
    if (result.length === 0) {
      // If the task doesn't exist
      return res.status(404).json({ status: res.statusCode, message: 'Task not found' });
    }
    const data = result[0];
    res.status(200).json({ status: res.statusCode, message: 'Task fetched successfully', data });
  });
})

// DELETE route to delete a task by ID
router.delete('/deleteTaskById/:id', (req, res) => {
  
  const id = req.params.id;
  const sql = 'DELETE FROM task_list WHERE id = ?';
  Connection.query(sql, [id], (err) => {
    if (err) {
      return res.status(500).json({ error: 'Error deleting task' });
    }
    // If the deletion was successful
    res.status(200).json({ status: res.statusCode, message: 'Task deleted successfully' });
  });
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