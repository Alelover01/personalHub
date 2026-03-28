const pool = require('../config/db');

const getAllSeries = async (req, res) => {
  try {
    const [series] = await pool.query(
      'SELECT * FROM series WHERE user_id = ? ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json(series);
  } catch (err) {
    res.status(500).json({ message: 'Errore server', error: err.message });
  }
};

const getSeriesById = async (req, res) => {
  try {
    const [series] = await pool.query(
      'SELECT * FROM series WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );
    if (series.length === 0) {
      return res.status(404).json({ message: 'Serie non trovata' });
    }
    res.json(series[0]);
  } catch (err) {
    res.status(500).json({ message: 'Errore server', error: err.message });
  }
};

const createSeries = async (req, res) => {
  try {
    const { title, genre, status, total_episodes, watched_episodes, rating, platform, notes } = req.body;
    const cover_image = req.file ? `/uploads/${req.file.filename}` : null;

    if (!title) {
      return res.status(400).json({ message: 'Titolo obbligatorio' });
    }

    const [result] = await pool.query(
      `INSERT INTO series (user_id, title, genre, status, cover_image, total_episodes, watched_episodes, rating, platform, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [req.user.id, title, genre, status || 'to_watch', cover_image, total_episodes, watched_episodes || 0, rating, platform, notes]
    );

    const [newSeries] = await pool.query('SELECT * FROM series WHERE id = ?', [result.insertId]);
    res.status(201).json(newSeries[0]);
  } catch (err) {
    res.status(500).json({ message: 'Errore server', error: err.message });
  }
};

const updateSeries = async (req, res) => {
  try {
    const { title, genre, status, total_episodes, watched_episodes, rating, platform, notes } = req.body;
    const cover_image = req.file ? `/uploads/${req.file.filename}` : undefined;

    const [existing] = await pool.query(
      'SELECT * FROM series WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Serie non trovata' });
    }

    await pool.query(
      `UPDATE series SET
        title = COALESCE(?, title),
        genre = COALESCE(?, genre),
        status = COALESCE(?, status),
        cover_image = COALESCE(?, cover_image),
        total_episodes = COALESCE(?, total_episodes),
        watched_episodes = COALESCE(?, watched_episodes),
        rating = COALESCE(?, rating),
        platform = COALESCE(?, platform),
        notes = COALESCE(?, notes)
       WHERE id = ? AND user_id = ?`,
      [title, genre, status, cover_image, total_episodes, watched_episodes, rating, platform, notes, req.params.id, req.user.id]
    );

    const [updated] = await pool.query('SELECT * FROM series WHERE id = ?', [req.params.id]);
    res.json(updated[0]);
  } catch (err) {
    res.status(500).json({ message: 'Errore server', error: err.message });
  }
};

const deleteSeries = async (req, res) => {
  try {
    const [existing] = await pool.query(
      'SELECT * FROM series WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Serie non trovata' });
    }

    await pool.query('DELETE FROM series WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    res.json({ message: 'Serie eliminata con successo' });
  } catch (err) {
    res.status(500).json({ message: 'Errore server', error: err.message });
  }
};

const getStats = async (req, res) => {
  try {
    const [total] = await pool.query(
      'SELECT COUNT(*) as total FROM series WHERE user_id = ?', [req.user.id]
    );
    const [byStatus] = await pool.query(
      'SELECT status, COUNT(*) as count FROM series WHERE user_id = ? GROUP BY status',
      [req.user.id]
    );
    const [episodes] = await pool.query(
      'SELECT SUM(watched_episodes) as total_watched FROM series WHERE user_id = ?',
      [req.user.id]
    );
    res.json({ total: total[0].total, byStatus, totalWatchedEpisodes: episodes[0].total_watched });
  } catch (err) {
    res.status(500).json({ message: 'Errore server', error: err.message });
  }
};

module.exports = { getAllSeries, getSeriesById, createSeries, updateSeries, deleteSeries, getStats };