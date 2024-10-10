const express = require('express');
const ftp = require("ftp");
const router = express.Router(); 
const { tesImageFetch } = require('../nvr_snapshot/Auth');
const Connection = require('../../service/mysql/Connection');

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

router.put('/run-task-by-id/:id', async (req, res) => {
  try {
    // Extract the task ID from the URL parameters
    const { id } = req.params;

    // Extract the boolean value (1 or 0) from the request body
    const { status } = req.body;

    // Validate that the status is either 1 or 0
    if (status !== 1 && status !== 0) {
      return res.status(400).json({ message: 'Invalid status value. Must be 1 or 0.' });
    }

    // SQL query to update the status of the task
    const updateSql = `
      UPDATE task_list
      SET status = ?
      WHERE id = ?;
    `;

    // Execute the query with the new status and the task ID
    Connection.query(updateSql, [status, id], (err, result) => {
      if (err) {
        console.error(`Error updating task status for task with id: ${id}`, err.message);
        return res.status(500).json({ message: 'Failed to update task status' });
      }

      // Check if any rows were affected (to ensure the task exists)
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Task not found' });
      }

      // Send success response
      res.status(200).json({ message: `Task with id: ${id} updated successfully`, newStatus: status });
    });
  } catch (error) {
    console.error(`Error in PUT request for updating task status:`, error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
})

module.exports = router;

