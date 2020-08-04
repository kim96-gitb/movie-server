const mysql = require("mysql2");

//커넥션 풀 (connection pool)을 만든다
// 이유 , 풀이 알아서 커넥션 연결을 컨트롤한다.

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  waitForConnections: true,
  connectionLimit: 10,
});
//await 으로 사용하기 위해 , 프라미스로 저장.
const connection = pool.promise();

module.exports = connection;
// aws 연결 코드 하나 만들어서 노출 시키면 코드를 계속 쓸 일 없음
