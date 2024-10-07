const express = require('express');
const ftp = require('basic-ftp');
const router = express.Router(); 
const path = require('path');
const { imageFetch } = require('../nvr_snapshot/Auth');

// Function to upload a stream directly to FTP
async function uploadStreamToFtp(stream, fileName, ftpConfig) {
  // const ftpConfig = {
  //     host: 'antarescam.id',
  //     port: 21,
  //     user: 'CCTV01KGqdwvRKHGnW',
  //     password: 'lLZWZFhcdzaV',
  // };

  const client = new ftp.Client();

  try {
      await client.access(ftpConfig);
      await client.uploadFrom(stream, fileName); // Uploading the stream directly
      console.log('File uploaded successfully:', fileName);
  } catch (error) {
      console.error('Error uploading file:', error);
  } finally {
      client.close();
  }
}

router.post('/test-upload-image', async (req, res) => {
  const { server, port, username, password, prefix, ftp_url, ftp_port, ftp_user, ftp_pass, ftp_dir, send_interval } = req.body;
  const response = imageFetch(server, port, username, password, prefix);

  const ftpConfig = {
    host: ftp_url,
    port: ftp_port,
    user: ftp_user,
    password: ftp_pass,
  };

  const nameImg = new Date().toISOString();;

    // Use the response body stream directly for FTP upload
  await uploadStreamToFtp(response.body, `${nameImg}.jpeg`, ftpConfig);
  
  res.send('Upload process has been initiated. Check the server logs for upload status.');
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

