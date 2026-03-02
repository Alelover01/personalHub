const pool = require('./db');
console.log('pool:', pool);
console.log('tipo:', typeof pool);
console.log('query:', typeof pool.query);
const initDB = async() => {
    try{
        //USERS Table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                email VARCHAR(100) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL,
                avatar VARCHAR(255) DEFAULT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
            `);
        // BOOKS
        await pool.query(`
            CREATE TABLE IF NOT EXISTS books (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                title VARCHAR(255) NOT NULL,
                author VARCHAR(255) NOT NULL,
                genre VARCHAR(100),
                status ENUM('reading', 'completed', 'to_read') DEFAULT 'to_read',
                cover_image VARCHAR(255) DEFAULT NULL,
                rating INT DEFAULT NULL,
                notes TEXT DEFAULT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
            `);

    // SERIES
    await pool.query(
      `CREATE TABLE IF NOT EXISTS series (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        genre VARCHAR(100),
        status ENUM('watching', 'completed', 'to_watch', 'dropped') DEFAULT 'to_watch',
        cover_image VARCHAR(255) DEFAULT NULL,
        total_episodes INT DEFAULT NULL,
        watched_episodes INT DEFAULT 0,
        rating INT DEFAULT NULL,
        platform VARCHAR(100),
        notes TEXT DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )`
    );

    //TRAVEL
    await pool.query(
      `CREATE TABLE IF NOT EXISTS travel_plans (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        destination VARCHAR(255) NOT NULL,
        country VARCHAR(100),
        status ENUM('upcoming', 'completed', 'cancelled') DEFAULT 'upcoming',
        cover_image VARCHAR(255) DEFAULT NULL,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        flight VARCHAR(255),
        budget DECIMAL(10,2) DEFAULT NULL,
        notes TEXT DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )`
    );
// TODOS 
    await pool.query(
      `CREATE TABLE IF NOT EXISTS todos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        priority ENUM('alta', 'media', 'bassa') DEFAULT 'media',
        due_date DATE DEFAULT NULL,
        completed BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )`
    );

    // NOTIFICATIONS
    await pool.query(
      `CREATE TABLE IF NOT EXISTS notifications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        message VARCHAR(255) NOT NULL,
        type VARCHAR(50) DEFAULT 'info',
        read_status BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )`
    );
    console.log('Tabelle create correttamente');
    }catch(err){
        console.log(`Errore creazione tabelle :`, err.message);
    }
};

module.exports = initDB