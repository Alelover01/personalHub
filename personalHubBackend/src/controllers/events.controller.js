const pool = require('../config/db');

const getAllEvents = async (req, res) => {
  try {
    const [events] = await pool.query(
      'SELECT * FROM events WHERE user_id = ? ORDER BY date ASC, time ASC',
      [req.user.id]
    );
    res.json(events);
  } catch (err) {
    res.status(500).json({ message: 'Errore server', error: err.message });
  }
};

const createEvent = async (req, res) => {
  try {
    const { title, date, time, color } = req.body;
    if (!title || !date) {
      return res.status(400).json({ message: 'Titolo e data obbligatori' });
    }
    const [result] = await pool.query(
      'INSERT INTO events (user_id, title, date, time, color) VALUES (?, ?, ?, ?, ?)',
      [req.user.id, title, date, time || null, color || '#7c3aed']
    );
    const [newEvent] = await pool.query('SELECT * FROM events WHERE id = ?', [result.insertId]);
    res.status(201).json(newEvent[0]);
  } catch (err) {
    res.status(500).json({ message: 'Errore server', error: err.message });
  }
};

const deleteEvent = async (req, res) => {
  try {
    await pool.query(
      'DELETE FROM events WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );
    res.json({ message: 'Evento eliminato' });
  } catch (err) {
    res.status(500).json({ message: 'Errore server', error: err.message });
  }
};

module.exports = { getAllEvents, createEvent, deleteEvent };