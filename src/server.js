const express = require('express');
const axios = require('axios');
const crypto = require('crypto');
const cors = require('cors');
const taskServiceRoutes = require('./service/mysql/taskService');
const snapshotRoutes = require('./api/nvr_snapshot/Snapshot');
const ftpRoutes = require('./api/ftp/ftp');
const userRoutes = require('./service/mysql/UserService');
const Connection = require('./service/mysql/Connection');
const { runFtpRequest } = require('./api/ftp/RunFtp');
const app = express();
const port = 3000;

// Enable CORS for all routes
app.use(cors()); // Mengizinkan semua origin
app.use(express.json());

runFtpRequest();

app.get('/', (req, res) => {
  res.send('Hello, BANG!');
})

app.use(taskServiceRoutes);

app.use(snapshotRoutes);

app.use(ftpRoutes);

app.use(userRoutes);
// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
