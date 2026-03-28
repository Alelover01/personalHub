const pool = require('../config/db');

const getAllTravel = async (req, res) => {
  try {
    const [plans] = await pool.query(
      'SELECT * FROM travel_plans WHERE user_id = ? ORDER BY start_date DESC',
      [req.user.id]
    );
    res.json(plans);
  } catch (err) {
    res.status(500).json({ message: 'Errore server', error: err.message });
  }
};

const getTravelById = async (req, res) => {
  try {
    const [plans] = await pool.query(
      'SELECT * FROM travel_plans WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );
    if (plans.length === 0) {
      return res.status(404).json({ message: 'Viaggio non trovato' });
    }
    res.json(plans[0]);
  } catch (err) {
    res.status(500).json({ message: 'Errore server', error: err.message });
  }
};

const createTravel = async (req, res) => {
  try {
    const { destination, country, status, start_date, end_date, flight, budget, notes } = req.body;
    const cover_image = req.file ? `/uploads/${req.file.filename}` : null;

    if (!destination || !start_date || !end_date) {
      return res.status(400).json({ message: 'Destinazione e date obbligatorie' });
    }

    const [result] = await pool.query(
      `INSERT INTO travel_plans (user_id, destination, country, status, cover_image, start_date, end_date, flight, budget, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [req.user.id, destination, country, status || 'upcoming', cover_image, start_date, end_date, flight, budget, notes]
    );

    const [newPlan] = await pool.query('SELECT * FROM travel_plans WHERE id = ?', [result.insertId]);
    res.status(201).json(newPlan[0]);
  } catch (err) {
    res.status(500).json({ message: 'Errore server', error: err.message });
  }
};

const updateTravel = async (req, res) => {
  try {
    const { destination, country, status, start_date, end_date, flight, budget, notes } = req.body;
    const cover_image = req.file ? `/uploads/${req.file.filename}` : undefined;

    const [existing] = await pool.query(
      'SELECT * FROM travel_plans WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Viaggio non trovato' });
    }

    await pool.query(
      `UPDATE travel_plans SET
        destination = COALESCE(?, destination),
        country = COALESCE(?, country),
        status = COALESCE(?, status),
        cover_image = COALESCE(?, cover_image),
        start_date = COALESCE(?, start_date),
        end_date = COALESCE(?, end_date),
        flight = COALESCE(?, flight),
        budget = COALESCE(?, budget),
        notes = COALESCE(?, notes)
       WHERE id = ? AND user_id = ?`,
      [destination, country, status, cover_image, start_date, end_date, flight, budget, notes, req.params.id, req.user.id]
    );

    const [updated] = await pool.query('SELECT * FROM travel_plans WHERE id = ?', [req.params.id]);
    res.json(updated[0]);
  } catch (err) {
    res.status(500).json({ message: 'Errore server', error: err.message });
  }
};

const deleteTravel = async (req, res) => {
  try {
    const [existing] = await pool.query(
      'SELECT * FROM travel_plans WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Viaggio non trovato' });
    }

    await pool.query('DELETE FROM travel_plans WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    res.json({ message: 'Viaggio eliminato con successo' });
  } catch (err) {
    res.status(500).json({ message: 'Errore server', error: err.message });
  }
};

const getStats = async (req, res) => {
  try {
    const [total] = await pool.query(
      'SELECT COUNT(*) as total FROM travel_plans WHERE user_id = ?', [req.user.id]
    );
    const [byStatus] = await pool.query(
      'SELECT status, COUNT(*) as count FROM travel_plans WHERE user_id = ? GROUP BY status',
      [req.user.id]
    );
    const [budget] = await pool.query(
      'SELECT SUM(budget) as total_spent FROM travel_plans WHERE user_id = ? AND status = "completed"',
      [req.user.id]
    );
    res.json({ total: total[0].total, byStatus, totalSpent: budget[0].total_spent });
  } catch (err) {
    res.status(500).json({ message: 'Errore server', error: err.message });
  }
};

module.exports = { getAllTravel, getTravelById, createTravel, updateTravel, deleteTravel, getStats };