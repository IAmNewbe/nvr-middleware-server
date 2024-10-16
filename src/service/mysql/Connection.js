const mysql = require('mysql2');
require('dotenv').config();

const Connection = mysql.createConnection({
  host: process.env.HOST,
  user: process.env.USER,
  password: process.env.PASSWORD,
  database: process.env.DATABASE,
});

Connection.connect(function(error){
  if(!!error){
    console.log(error);
  }else{
    console.log('Connection Succuessfully!');
  }
})

module.exports = Connection; 