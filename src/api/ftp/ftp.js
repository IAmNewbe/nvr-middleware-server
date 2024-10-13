const express = require('express');
const ftp = require("ftp");
const router = express.Router(); 
const { tesImageFetch } = require('../nvr_snapshot/Auth');
const Connection = require('../../service/mysql/Connection');
const { runFtpRequest, stopFtpTask } = require('./RunFtp');

// Function to upload a stream directly to FTP
async function uploadStreamToFtp(stream, fileName, ftpConfig, res) {
  const client = new ftp();

  console.log("stream : ", stream);
  console.log(ftpConfig);
  
  client.on("ready", () => {
    client.put(stream, fileName, (err) => {
      if (err) {
        console.error("Error uploading file:", err);
      } 
      console.log("File uploaded successfully!");
    
      client.end(); // Close the connection
    });
  })

  client.on("error", (err) => {
    console.error("FTP error:", err.message);
    client.end();
  });

  client.connect(ftpConfig);
}

router.post('/test-upload-image', async (req, res) => {

  try {
    const { server, port, username, password, prefix, ftp_url, ftp_port, ftp_user, ftp_pass, ftp_dir, send_interval } = req.body.data;
    const ftpConfig = {
      host: ftp_url,
      port: ftp_port,
      user: ftp_user,
      password: ftp_pass,
      passive: true,
    };
   
    const response = await tesImageFetch(server, port, username, password, prefix, res);
     
    console.log(Buffer.from(response.data));
    const nameImg = new Date().toISOString();
    // Use the response body stream directly for FTP upload
    await uploadStreamToFtp(response.data, `/${nameImg}.jpg`, ftpConfig, res);
    
    res.send('Upload process has been initiated. Check the server logs for upload status.');
  } catch (error) {
    res.status(500).send('Error in image ftp.js fetching process');
  }
    
});

// Route to toggle task status
router.put('/toggle-task-status/:id', async (req, res) => {
  const taskId = req.params.id;
  console.log(req);
  // const newStatus = req.body.status; // The new status (0 or 1)

  try {
    // Find the current status of the task by id
    const queryGetStatus = `SELECT status FROM task_list WHERE id = ?`;

    Connection.query(queryGetStatus, [taskId], (err, result) => {
      if (err) {
        console.error('Error fetching task status:', err.message);
        return res.status(500).json({ error: 'Error fetching task status' });
      }

      if (result.length === 0) {
        return res.status(404).json({ error: 'Task not found' });
      }

      // Get current status (assuming it's a boolean or tinyint(1))
      const currentStatus = result[0].status;

      // Toggle the status: 1 to 0 or 0 to 1
      const newStatus = currentStatus === 1 ? 0 : 1;

      // Update the task status in the database
      const updateSql = `UPDATE task_list SET status = ? WHERE id = ?`;
     
      Connection.query(updateSql, [newStatus, taskId], (err, result) => {
        if (err) {
          console.error('Error updating task status:', err.message);
          return res.status(500).json({ error: 'Error updating task status' });
        }
        // return res.status(200).json({ success: true, newStatus, message: 'Task status updated successfully' });
      });

      // If the new status is 0, stop the FTP task interval
      if (newStatus === 0) {
        stopFtpTask(taskId);
      } else if (newStatus === 1) {
        // If the new status is 1, restart the FTP task
        runFtpRequest(req, res); // Restart the FTP request for active tasks
      }

      res.json({ success: true, message: `Task ${taskId} status updated to ${newStatus}`, data: newStatus });
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating task status' });
  }
});

module.exports = router;

