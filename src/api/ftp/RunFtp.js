const Connection = require('../../service/mysql/Connection');
const { imageFetch } = require('../nvr_snapshot/Auth');

// Function to update the task status in the database
async function updateTaskStatus(id, successCount, failedCount) {
  const updateSql = `
    UPDATE task_list
    SET success = ?, failed = ?
    WHERE id = ?;
  `;
  
  return new Promise((resolve, reject) => {
    Connection.query(updateSql, [successCount, failedCount, id], (err, result) => {
      if (err) {
        console.error(`Error updating task status for id: ${id}`, err.message);
        return reject(err);
      }
      console.log(`Successfully updated task with id: ${id} (Success: ${successCount}, Failed: ${failedCount})`);
      resolve(result);
    });
  });
}

async function runFtpRequest(req, res) {
  try {
    let data = [];
    const sql = 'SELECT * FROM task_list WHERE status = 1';
    
    // Wrap the Connection.query in a promise
    data = await new Promise((resolve, reject) => {
      Connection.query(sql, (err, result) => {
        if (err) {
          console.error('Error fetching data:', err.message);
          return reject(err);
        }
        resolve(result); // Resolve with the query result
      });
    });

    // Now you can safely log and use 'data'
    console.log("server ftp : ", data.map(item => item.server));

    if (data.length === 0) {
      console.log('No active tasks');
    }

    console.log(data);
    for (const task of data) {
      const {
        id,
        server,
        port,
        username,
        password,
        prefix,
        ftp_url,
        ftp_port,
        ftp_user,
        ftp_pass,
        ftp_dir,
        send_interval,
      } = task;
  
      let intervalId;
      let successCount = 0;
      let failedCount = 0;

      console.log(`Starting interval for task on server: ${server}`);

      // Clear any existing intervals to prevent multiple intervals running
      clearInterval(intervalId);

      // Start the interval for sending images
      intervalId = setInterval(async () => {
        try {
          // Fetch the image from the server
          const response = await imageFetch(
            server, port, username, password, prefix, ftp_url,
            ftp_port,
            ftp_user,
            ftp_pass,
            ftp_dir,
            send_interval, res);
          
          console.log(response);
          
          // Increment success count
          successCount++;
          console.log(`Image uploaded successfully for server: ${server} (Success count: ${successCount})`);

          // Update the database with the new success count (Uncomment if needed)
          await updateTaskStatus(id, successCount, failedCount);

        } catch (error) {
          // Increment failed count on error
          failedCount++;
          console.error(`Failed to upload image for server: ${server} (Failed count: ${failedCount}) - Error: ${error.message}`);

          /// Update the database with the new failed count
          await updateTaskStatus(id, successCount, failedCount);
        }
      }, send_interval); // Set interval based on send_interval
    }
  } catch (err) {
    console.error(`Error in image ftp.js fetching process for server:`, err);
    // res.status(500).send(`Error processing server`);
  }
}

module.exports = {
  runFtpRequest
}