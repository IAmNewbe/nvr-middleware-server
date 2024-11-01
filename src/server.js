const express = require('express');
const cors = require('cors');
require('dotenv').config();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const taskServiceRoutes = require('./service/mysql/TaskService');
const snapshotRoutes = require('./api/nvr_snapshot/Snapshot');
const ftpRoutes = require('./api/ftp/ftp');
const userRoutes = require('./service/mysql/UserService');
const authRoutes = require('./service/mysql/AuthenticationsService');
const { runFtpRequest } = require('./api/ftp/RunFtp');
const app = express();

const host = process.env.BASEURL;
const port = process.env.PORT;

// Enable CORS for all routes
app.use(cors()); // Mengizinkan semua origin
app.use(express.json());

runFtpRequest();

app.get('/', (req, res) => {
  res.send('Hello, BANG!');
})

app.use(authRoutes);

app.use(taskServiceRoutes);

app.use(snapshotRoutes);

app.use(ftpRoutes);

app.use(userRoutes);
// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
