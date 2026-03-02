const mysql = require('mysql2/promise');
require('dotenv').config();

//Takes the data form the env
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    waitForConnections: true,
    connectionLimit: 10,
});

const testConnection = async () => {
    try {
        const conn = await pool.getConnection();
        console.log("Connessione con MYSQL avvenuta correttamente");
        conn.release();
    } catch(err) {
        console.error("Errore connessione con MYSQL:", err.message);
        process.exit(1);
    }
};

module.exports = {pool, testConnection};