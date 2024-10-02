import myql from 'mysql2';

const pool = myql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'nvr_task_list'
});

const result = await pool.query(`SELECT * FROM nvr_task_list`)
console.log(result)