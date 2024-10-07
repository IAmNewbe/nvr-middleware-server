const ftp = require("ftp");
const fs = require("fs");
const path = require("path");

// FTP connection details
const client = new ftp();
const ftpConfig = {
  host: "antarescam.id",
  port: 21,
  user: "CCTV01KGqdwvRKHGnW",
  password: "lLZWZFhcdzaV"
};

// Local file path and remote destination path
const localFilePath = path.join(__dirname, "tes.jpg");
const remoteFilePath = "/tes.jpg";

// Connect to the FTP server and upload the file
client.on("ready", () => {
  fs.readFile(localFilePath, (err, data) => {
    if (err) throw err;
    
    client.put(data, remoteFilePath, (err) => {
      if (err) throw err;
      console.log("File uploaded successfully!");
      client.end(); // Close the connection
    });
  });
});

// Handle connection errors
client.on("error", (err) => {
  console.error("FTP error:", err.message);
  client.end();
});

// Start the connection
client.connect(ftpConfig);
