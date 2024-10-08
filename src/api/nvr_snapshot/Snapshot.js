const express = require('express');
const axios = require('axios');
const router = express.Router(); 
const crypto = require('crypto');

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

router.post('/test-fetch-image', async (req, res) => {
  try {
    const { server, port, username, password, prefix } = req.body;

    const rtspUrl = `http://${server}:${port}/${prefix}`;

    // Initial request to get WWW-Authenticate header
    const initialResponse = await axios.get(rtspUrl, { validateStatus: (status) => status === 401 });

    const wwwAuthHeader = initialResponse.headers['www-authenticate'];
    if (!wwwAuthHeader) {
      return res.status(500).send('Failed to retrieve digest authentication details');
    } else {
      console.log('success Authentication details');
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

    // Send the image back to the client
    res.setHeader('Content-Type', 'image/jpeg');
    res.send(Buffer.from(response.data));
    return response;
  } catch (error) {
    console.error('Error fetching image:', error);
    res.status(500).send('Error fetching image');
  }
});

module.exports = router;