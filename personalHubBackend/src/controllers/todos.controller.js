const pool = require('../config/db');

const getAllTodos = async (req, res) => {
  try {
    const [todos] = await pool.query(
      'SELECT * FROM todos WHERE user_id = ? ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json(todos);
  } catch (err) {
    res.status(500).json({ message: 'Errore server', error: err.message });
  }
};

const createTodo = async (req, res) => {
  try {
    const { title, priority, due_date } = req.body;

    if (!title) {
      return res.status(400).json({ message: 'Titolo obbligatorio' });
    }

    const [result] = await pool.query(
      'INSERT INTO todos (user_id, title, priority, due_date) VALUES (?, ?, ?, ?)',
      [req.user.id, title, priority || 'media', due_date || null]
    );

    const [newTodo] = await pool.query('SELECT * FROM todos WHERE id = ?', [result.insertId]);
    res.status(201).json(newTodo[0]);
  } catch (err) {
    res.status(500).json({ message: 'Errore server', error: err.message });
  }
};

const updateTodo = async (req, res) => {
  try {
    const { title, priority, due_date, completed } = req.body;

    const [existing] = await pool.query(
      'SELECT * FROM todos WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Todo non trovato' });
    }

    await pool.query(
      `UPDATE todos SET
        title = COALESCE(?, title),
        priority = COALESCE(?, priority),
        due_date = COALESCE(?, due_date),
        completed = COALESCE(?, completed)
       WHERE id = ? AND user_id = ?`,
      [title, priority, due_date, completed, req.params.id, req.user.id]
    );

    const [updated] = await pool.query('SELECT * FROM todos WHERE id = ?', [req.params.id]);
    res.json(updated[0]);
  } catch (err) {
    res.status(500).json({ message: 'Errore server', error: err.message });
  }
};

const deleteTodo = async (req, res) => {
  try {
    const [existing] = await pool.query(
      'SELECT * FROM todos WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Todo non trovato' });
    }

    await pool.query('DELETE FROM todos WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    res.json({ message: 'Todo eliminato con successo' });
  } catch (err) {
    res.status(500).json({ message: 'Errore server', error: err.message });
  }
};

module.exports = { getAllTodos, createTodo, updateTodo, deleteTodo };