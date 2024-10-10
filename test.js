const tasks = [
  {
    server: 'server1.com',
    port: 8080,
    username: 'user1',
    password: 'pass1',
    prefix: 'prefix1',
    ftp_url: 'ftp1.com',
    ftp_port: 21,
    ftp_user: 'ftpUser1',
    ftp_pass: 'ftpPass1',
    ftp_dir: '/dir1',
    send_interval: 5,
  },
  {
    server: 'server2.com',
    port: 3000,
    username: 'user2',
    password: 'pass2',
    prefix: 'prefix2',
    ftp_url: 'ftp2.com',
    ftp_port: 21,
    ftp_user: 'ftpUser2',
    ftp_pass: 'ftpPass2',
    ftp_dir: '/dir2',
    send_interval: 10,
  },
  // more objects...
];

// Process each task in the array
tasks.forEach( (task) => {
  
    const {
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

    const ftpConfig = {
      host: ftp_url,
      port: ftp_port,
      user: ftp_user,
      password: ftp_pass,
      passive: true,
    };

    // Fetch image and upload to FTP
    console.log(ftpConfig)

  
});
