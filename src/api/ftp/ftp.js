const express = require('express');
// const ftp = require('basic-ftp');
const ftp = require("ftp");
const router = express.Router(); 
const path = require('path');
const { imageFetch } = require('../nvr_snapshot/Auth');

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
router.post('/upload-image', (req, res) => {
  const { ftp_url, ftp_port, ftp_user, ftp_pass, ftp_dir, send_interval } = req.body;

  const ftpConfig = {
    host: ftp_url,
    port: ftp_port,
    user: ftp_user,
    password: ftp_pass,
  };

  setInterval(() => {
    const localFilePath = path.join(__dirname, 'images.jpg'); // Change this to your file path
    uploadFile(localFilePath, ftpConfig);
  }, send_interval);
  res.send('Upload process has been initiated. Check the server logs for upload status.');
});

module.exports = router;

