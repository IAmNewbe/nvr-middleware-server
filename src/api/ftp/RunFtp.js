const Connection = require('../../service/mysql/Connection');
const { imageFetch } = require('../nvr_snapshot/Auth');
let taskIntervals = new Map(); // A map to track the intervals by task id

// Function to update the task status in the database
async function updateTaskStatus(id, successIncrement, failedIncrement) {
  // SQL to get the current values of success and failed
  const getCurrentStatusSql = `
    SELECT success, failed
    FROM task_list
    WHERE id = ?;
  `;
  
  // SQL to update the values of success and failed
  const updateSql = `
    UPDATE task_list
    SET success = ?, failed = ?
    WHERE id = ?;
  `;

  return new Promise((resolve, reject) => {
    // First, get the current values of success and failed
    Connection.query(getCurrentStatusSql, [id], (err, result) => {
      if (err) {
        console.error(`Error fetching current task status for id: ${id}`, err.message);
        return reject(err);
      }

      if (result.length === 0) {
        console.error(`Task with id: ${id} not found`);
        return reject(new Error(`Task with id: ${id} not found`));
      }

      const currentSuccess = result[0].success || 0; // Default to 0 if null
      const currentFailed = result[0].failed || 0;   // Default to 0 if null

      // Increment the current values by the provided increments
      const newSuccess = currentSuccess + successIncrement;
      const newFailed = currentFailed + failedIncrement;

      // Now update the task with the new success and failed values
      Connection.query(updateSql, [newSuccess, newFailed, id], (err, updateResult) => {
        if (err) {
          console.error(`Error updating task status for id: ${id}`, err.message);
          return reject(err);
        }
        console.log(`Successfully updated task with id: ${id} (Success: ${newSuccess}, Failed: ${newFailed})`);
        resolve(updateResult);
      });
    });
  });
}

async function runFtpRequest(req, res) {
  try {
    const sql = 'SELECT * FROM task_list WHERE status = 1'; // Fetch active tasks

    const data = await new Promise((resolve, reject) => {
      Connection.query(sql, (err, result) => {
        if (err) {
          console.error('Error fetching data:', err.message);
          return reject(err);
        }
        resolve(result); // Resolve with the query result
      });
    });

    if (data.length === 0) {
      console.log('No active tasks');
    }

    // Start or maintain intervals for active tasks
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

      // Check if the task already has an interval running
      if (!taskIntervals.has(id)) {
        let successCount = 0;
        let failedCount = 0;

        console.log(`Starting interval for task on server: ${server}`);

        // Start the interval for sending images
        const intervalId = setInterval(async () => {
          try {
            // Fetch the image from the server
            const response = await imageFetch(
              server, port, username, password, prefix, ftp_url,
              ftp_port,
              ftp_user,
              ftp_pass,
              ftp_dir,
              send_interval, res
            );
            
            successCount++;
            console.log(`Image uploaded successfully for server: ${server} (Success count: ${successCount})`);

            // Update the database with the new success count
            await updateTaskStatus(id, successCount, failedCount);

          } catch (error) {
            failedCount++;
            console.error(`Failed to upload image for server: ${server} (Failed count: ${failedCount}) - Error: ${error.message}`);

            // Update the database with the new failed count
            await updateTaskStatus(id, successCount, failedCount);
          }
        }, send_interval); // Set interval based on send_interval

        // Store the interval ID
        taskIntervals.set(id, intervalId);
      }
    }
  } catch (err) {
    console.error(`Error in FTP process for server:`, err);
  }
}

// Function to stop a task's interval when its status is changed to 0
function stopFtpTask(taskId) {
  if (taskIntervals.has(taskId)) {
    clearInterval(taskIntervals.get(taskId));
    taskIntervals.delete(taskId);
    console.log(`Stopped interval for task ${taskId}`);
  }
}

module.exports = {
  runFtpRequest,
  stopFtpTask,
}