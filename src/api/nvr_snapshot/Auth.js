const express = require('express');
const axios = require('axios');
const router = express.Router(); 
const crypto = require('crypto');
const ftp = require("ftp");

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

// Helper function to generate Digest Authorization Header
function generateDigestAuthHeader(wwwAuthHeader, method, url, username, password) {
  const realm = wwwAuthHeader.match(/realm="([^"]+)"/)[1];
  const nonce = wwwAuthHeader.match(/nonce="([^"]+)"/)[1];
  const qop = wwwAuthHeader.match(/qop="([^"]+)"/)[1];
  const opaque = wwwAuthHeader.match(/opaque="([^"]+)"/)?.[1];

  const ha1 = crypto.createHash('md5').update(`${username}:${realm}:${password}`).digest('hex');
  const ha2 = crypto.createHash('md5').update(`${method}:${url}`).digest('hex');
  const nc = '00000001'; // Nonce count (fixed)
  const cnonce = crypto.randomBytes(8).toString('hex'); // Client nonce
  const response = crypto
    .createHash('md5')
    .update(`${ha1}:${nonce}:${nc}:${cnonce}:${qop}:${ha2}`)
    .digest('hex');

  let authHeader = `Digest username="${username}", realm="${realm}", nonce="${nonce}", uri="${url}", response="${response}", qop=${qop}, nc=${nc}, cnonce="${cnonce}"`;

  if (opaque) {
    authHeader += `, opaque="${opaque}"`;
  }

  return authHeader;
}

async function imageFetch(server, port, username, password, prefix, 
  ftp_url,
  ftp_port,
  ftp_user,
  ftp_pass,
  ftp_dir,
  send_interval, res) {

  try {
    const rtspUrl = `http://${server}:${port}/${prefix}`;
    console.log(rtspUrl);
    const ftpConfig = {
      host: ftp_url,
      port: ftp_port,
      user: ftp_user,
      password: ftp_pass,
      passive: true,
    };
    
    // Initial request to get WWW-Authenticate header
    const initialResponse = await axios.get(rtspUrl, { validateStatus: (status) => status === 401 });

    const wwwAuthHeader = initialResponse.headers['www-authenticate'];
    if (!wwwAuthHeader) {
      return res.status(500).send('Failed to retrieve digest authentication details');
    }

    // Generate Digest Authentication header
    const digestAuthHeader = generateDigestAuthHeader(wwwAuthHeader, 'GET', prefix, username, password);

    // Make the actual request with the Digest Authentication header
    const response = await axios.get(rtspUrl, {
      headers: {
        Authorization: digestAuthHeader,
      },
      responseType: 'arraybuffer', // To handle binary data (image)
    });

    // Prepare the image name
    const nameImg = new Date().toISOString();

    // Use the response body stream directly for FTP upload
    await uploadStreamToFtp(response.data, `/${nameImg}.jpg`, ftpConfig);
    console.log(`Successfully uploaded: ${nameImg}.jpg`);
  } catch (error) {
    console.error('Error fetching image in ImageFetcher func:', error);
    res.status(500).send('Error fetching image');
    return error;
  }
}

async function tesImageFetch(server, port, username, password, prefix, res) {

  try {
    const rtspUrl = `http://${server}:${port}/${prefix}`;
    console.log(rtspUrl);
    
    // Initial request to get WWW-Authenticate header
    const initialResponse = await axios.get(rtspUrl, { validateStatus: (status) => status === 401 });

    const wwwAuthHeader = initialResponse.headers['www-authenticate'];
    if (!wwwAuthHeader) {
      return res.status(500).send('Failed to retrieve digest authentication details');
    }

    // Generate Digest Authentication header
    const digestAuthHeader = generateDigestAuthHeader(wwwAuthHeader, 'GET', prefix, username, password);

    // Make the actual request with the Digest Authentication header
    const response = await axios.get(rtspUrl, {
      headers: {
        Authorization: digestAuthHeader,
      },
      responseType: 'arraybuffer', // To handle binary data (image)
    });

    // Prepare the image name
    const nameImg = new Date().toISOString();
    console.log(`Successfully uploaded: ${nameImg}.jpg`);
    return response;
  } catch (error) {
    console.error('Error fetching image in ImageFetcher func:', error);
    res.status(500).send('Error fetching image');
    return error;
  }
}



module.exports = {
  imageFetch,
  tesImageFetch,
  generateDigestAuthHeader
}