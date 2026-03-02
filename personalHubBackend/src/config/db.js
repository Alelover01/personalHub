require('dotenv').config();
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  waitForConnections: true,
  connectionLimit: 10,
});

const testConnection = async () => {
  try {
    const conn = await pool.getConnection();
    console.log('Connessione con MYSQL avvenuta correttamente');
    conn.release();
  } catch (err) {
    console.error(' Errore connessione MySQL:', err.message);
    process.exit(1);
  }
};

module.exports = pool;
module.exports.testConnection = testConnection;