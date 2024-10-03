import myql from 'mysql2';

const Connection = myql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'nvr_task_list'
});

Connection.connect(function(error){
  if(!!error){
    console.log(error);
  }else{
    console.log('Connection Succuessfully!');
  }
})

module.exports = Connection; 