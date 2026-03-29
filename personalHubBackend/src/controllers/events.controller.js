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

const updateEvent = async (req, res) => {
  try {
    const { title, date, time, color } = req.body;
    const [existing] = await pool.query(
      'SELECT * FROM events WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Evento non trovato' });
    }
    await pool.query(
      `UPDATE events SET
        title = COALESCE(?, title),
        date = COALESCE(?, date),
        time = COALESCE(?, time),
        color = COALESCE(?, color)
       WHERE id = ? AND user_id = ?`,
      [title, date, time, color, req.params.id, req.user.id]
    );
    const [updated] = await pool.query('SELECT * FROM events WHERE id = ?', [req.params.id]);
    res.json(updated[0]);
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

module.exports = { getAllEvents, createEvent, updateEvent, deleteEvent };