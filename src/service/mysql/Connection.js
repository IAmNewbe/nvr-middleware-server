const mysql = require('mysql2');

const Connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'nvr_middleware',
});

Connection.connect(function(error){
  if(!!error){
    console.log(error);
  }else{
    console.log('Connection Succuessfully!');
  }
})

module.exports = Connection; 