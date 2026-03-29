const pool = require('../config/db');

const getAllNotifications = async (req, res) => {
  try {
    const [notifications] = await pool.query(
      'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: 'Errore server', error: err.message });
  }
};

const markAsRead = async (req, res) => {
  try {
    await pool.query(
      'UPDATE notifications SET read_status = TRUE WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );
    res.json({ message: 'Notifica segnata come letta' });
  } catch (err) {
    res.status(500).json({ message: 'Errore server', error: err.message });
  }
};

const markAllAsRead = async (req, res) => {
  try {
    await pool.query(
      'UPDATE notifications SET read_status = TRUE WHERE user_id = ?',
      [req.user.id]
    );
    res.json({ message: 'Tutte le notifiche segnate come lette' });
  } catch (err) {
    res.status(500).json({ message: 'Errore server', error: err.message });
  }
};

const deleteNotification = async (req, res) => {
  try {
    await pool.query(
      'DELETE FROM notifications WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );
    res.json({ message: 'Notifica eliminata' });
  } catch (err) {
    res.status(500).json({ message: 'Errore server', error: err.message });
  }
};

module.exports = { getAllNotifications, markAsRead, markAllAsRead, deleteNotification };