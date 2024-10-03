const { nanoid } = require('nanoid');// Import nanoid for generating unique IDs
const express = require('express');
const router = express.Router(); // Create a router instance

// In-memory array to store tasks
let tasks = [
              {
                "server": "192.168.1.2",
                "port": 6000,
                "name": "ini 3",
                "user": "admin",
                "password": "wkwwk",
                "prefix": "/wkwkw/wkwk-iamge",
                "id": "7NtnKXlq2y-oGaX_"
              },
              {
                "server": "192.168.1.2",
                "port": 6000,
                "name": "ini 3",
                "user": "admin",
                "password": "wkwwk",
                "prefix": "/wkwkw/wkwk-iamge",
                "id": "TG9rcycgMqffTaV6"
              },
              {
                "server": "192.168.1.2",
                "port": 6000,
                "name": "ini 2",
                "user": "admin",
                "password": "wkwwk",
                "prefix": "/wkwkw/wkwk-iamge",
                "id": "QcP8anm3mvm2YLr7"
              },
              {
                "server": "192.168.1.1",
                "port": 6000,
                "name": "ini 1",
                "user": "admin",
                "password": "wkwwk",
                "prefix": "/wkwkw/wkwk-iamge",
                "id": "CR6H_RPYtEImTmYS"
              }
            ];

// POST route to handle adding a task
router.post('/postTaskById', (req, res) => {
  try {
    const taskData = req.body.data;
    const id = nanoid(16);
    if (!taskData) {
      throw new Error('No task data received');
    }

    // Create a new task object with a unique ID
    taskData.id = id;
    // SQL query to insert the data into the serverData table
    const sql = `INSERT INTO serverData (id, server, port, name, user, password, prefix) 
    VALUES (?, ?, ?, ?, ?, ?, ?)`;
    // Add the new task to the tasks array
    tasks.push(taskData);

    // Send a JSON response with the newly added task
    res.status(201).json({ status: res.statusCode ,message: 'Task added successfully', task: taskData });
  } catch (error) {
    console.error('Error processing task:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET route to retrieve all tasks
router.get('/getAllTasks', (req, res) => {
  res.status(200).json({ tasks });
});

module.exports = router; // Export the router