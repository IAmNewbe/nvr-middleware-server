const express = require('express');
// const ftp = require('basic-ftp');
const ftp = require("ftp");
const router = express.Router(); 
const path = require('path');
const { imageFetch } = require('../nvr_snapshot/Auth');

// Initialize variables to store the status and counts
let intervalId;
let successCount = 0;
let failedCount = 0;

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
   
    const response = await imageFetch(server, port, username, password, prefix, res);
     
    console.log(Buffer.from(response.data));
    const nameImg = new Date().toISOString();
    // Use the response body stream directly for FTP upload
    await uploadStreamToFtp(response.data, `/${nameImg}.jpg`, ftpConfig, res);
    
    res.send('Upload process has been initiated. Check the server logs for upload status.');
  } catch (error) {
    res.status(500).send('Error in image ftp.js fetching process');
  }
    
});

// Route to start the upload process
router.post('/upload-image', async (req, res) => {
  res.send('ini Upload Image');
  try {
    // const {
    //   server,
    //   port,
    //   username,
    //   password,
    //   prefix,
    //   ftp_url,
    //   ftp_port,
    //   ftp_user,
    //   ftp_pass,
    //   ftp_dir,
    //   send_interval,
    // } = req.body.data;
    
    const server = "36.92.168.180"
    const port = 10180
    const username = "admin"
    const password = "telkomiot123"
    const prefix = "cgi-bin/snapshot.cgi?channel=4&subtype=2"
    const ftp_url = "antarescam.id"
    const ftp_port = 21
    const ftp_user = "CCTV01KGqdwvRKHGnW"
    const ftp_pass = "lLZWZFhcdzaV"
    const ftp_dir = "/"
    const send_interval = 5000
    

    const ftpConfig = {
      host: ftp_url,
      port: ftp_port,
      user: ftp_user,
      password: ftp_pass,
      passive: true,
    };

    // Clear any existing intervals to prevent multiple intervals running
    clearInterval(intervalId);

    // Set the upload status to Running
    await updateTaskStatus(server, port, username, password, prefix, ftp_url, ftp_port, ftp_user, ftp_pass, ftp_dir, send_interval, true, successCount, failedCount);

    // Start the interval for sending images
    intervalId = setInterval(async () => {
      try {
        // Fetch the image from the server
        const response = await imageFetch(server, port, username, password, prefix, res);
        console.log(response);
        // Prepare the image name
        const nameImg = new Date().toISOString();

        // Use the response body stream directly for FTP upload
        await uploadStreamToFtp(response.data, `/${nameImg}.jpg`, ftpConfig);

        // Increment success count
        successCount++;
        console.log(`Successfully uploaded: ${nameImg}.jpg`);

        // Update the database with the new success count
        await updateTaskStatus(server, port, username, password, prefix, ftp_url, ftp_port, ftp_user, ftp_pass, ftp_dir, send_interval, true, successCount, failedCount);
      } catch (error) {
        // Increment failed count on error
        failedCount++;
        console.error(`Failed to upload image: ${error.message}`);

        // Update the database with the new failed count
        // await updateTaskStatus(server, port, username, password, prefix, ftp_url, ftp_port, ftp_user, ftp_pass, ftp_dir, send_interval, true, successCount, failedCount);
      }
    }, send_interval); // Set the interval based on send_interval from request

    // Respond to the client with the current status
    res.json({
      status: true,
      success: successCount,
      failed: failedCount,
    });
  } catch (error) {
    console.error('Error in image ftp.js fetching process:', error);
    res.status(500).send('Error in image ftp.js fetching process');
  }
});

// Function to update task status in MySQL
const updateTaskStatus = (server, port, username, password, prefix, ftp_url, ftp_port, ftp_user, ftp_pass, ftp_dir, send_interval, status, success, failed) => {
  const sql = `
    INSERT INTO taskslist (server, port, username, password, prefix, ftp_url, ftp_port, ftp_user, ftp_pass, ftp_dir, send_interval, status, success, failed)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE 
      status = VALUES(status),
      success = VALUES(success),
      failed = VALUES(failed)
  `;

  const values = [server, port, username, password, prefix, ftp_url, ftp_port, ftp_user, ftp_pass, ftp_dir, send_interval, status, success, failed];

  return new Promise((resolve, reject) => {
    db.query(sql, values, (err) => {
      if (err) {
        console.error('Error updating task status in database:', err);
        reject(err);
      } else {
        console.log('Task status updated successfully');
        resolve();
      }
    });
  });
};

// Route to stop the upload process
router.post('/stop-upload', (req, res) => {
  clearInterval(intervalId);
  res.send('Upload process has been stopped.');
});

module.exports = router;

