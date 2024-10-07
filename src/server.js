const express = require('express');
const axios = require('axios');
const crypto = require('crypto');
const cors = require('cors');
const taskServiceRoutes = require('./service/mysql/taskService');
const snapshotRoutes = require('./api/nvr_snapshot/Snapshot')

const app = express();
const port = 3000;

// Enable CORS for all routes
app.use(cors()); // Mengizinkan semua origin
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello, BANG!');
})

app.use(taskServiceRoutes);

app.use(snapshotRoutes);

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
