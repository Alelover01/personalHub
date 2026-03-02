const pool = require('../config/db');

const getAllBooks = async (req, res) => {
  try {
    const [books] = await pool.query(
      'SELECT * FROM books WHERE user_id = ? ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json(books);
  } catch (err) {
    res.status(500).json({ message: 'Errore server', error: err.message });
  }
};

const getBookById = async (req, res) => {
  try {
    const [books] = await pool.query(
      'SELECT * FROM books WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );
    if (books.length === 0) {
      return res.status(404).json({ message: 'Libro non trovato' });
    }
    res.json(books[0]);
  } catch (err) {
    res.status(500).json({ message: 'Errore server', error: err.message });
  }
};

const createBook = async (req, res) => {
  try {
    const { title, author, genre, status, rating, notes } = req.body;
    const cover_image = req.file ? `/uploads/${req.file.filename}` : null;

    if (!title || !author) {
      return res.status(400).json({ message: 'Titolo e autore obbligatori' });
    }

    const [result] = await pool.query(
      `INSERT INTO books (user_id, title, author, genre, status, cover_image, rating, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [req.user.id, title, author, genre, status || 'to_read', cover_image, rating, notes]
    );

    const [newBook] = await pool.query('SELECT * FROM books WHERE id = ?', [result.insertId]);
    res.status(201).json(newBook[0]);
  } catch (err) {
    res.status(500).json({ message: 'Errore server', error: err.message });
  }
};

const updateBook = async (req, res) => {
  try {
    const { title, author, genre, status, rating, notes } = req.body;
    const cover_image = req.file ? `/uploads/${req.file.filename}` : undefined;

    const [existing] = await pool.query(
      'SELECT * FROM books WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Libro non trovato' });
    }

    await pool.query(
      `UPDATE books SET 
        title = COALESCE(?, title),
        author = COALESCE(?, author),
        genre = COALESCE(?, genre),
        status = COALESCE(?, status),
        cover_image = COALESCE(?, cover_image),
        rating = COALESCE(?, rating),
        notes = COALESCE(?, notes)
       WHERE id = ? AND user_id = ?`,
      [title, author, genre, status, cover_image, rating, notes, req.params.id, req.user.id]
    );

    const [updated] = await pool.query('SELECT * FROM books WHERE id = ?', [req.params.id]);
    res.json(updated[0]);
  } catch (err) {
    res.status(500).json({ message: 'Errore server', error: err.message });
  }
};

const deleteBook = async (req, res) => {
  try {
    const [existing] = await pool.query(
      'SELECT * FROM books WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Libro non trovato' });
    }

    await pool.query('DELETE FROM books WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    res.json({ message: 'Libro eliminato con successo' });
  } catch (err) {
    res.status(500).json({ message: 'Errore server', error: err.message });
  }
};

const getStats = async (req, res) => {
  try {
    const [total] = await pool.query(
      'SELECT COUNT(*) as total FROM books WHERE user_id = ?', [req.user.id]
    );
    const [byStatus] = await pool.query(
      'SELECT status, COUNT(*) as count FROM books WHERE user_id = ? GROUP BY status',
      [req.user.id]
    );
    res.json({ total: total[0].total, byStatus });
  } catch (err) {
    res.status(500).json({ message: 'Errore server', error: err.message });
  }
};

module.exports = { getAllBooks, getBookById, createBook, updateBook, deleteBook, getStats };