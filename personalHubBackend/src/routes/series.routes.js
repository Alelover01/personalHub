const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
  getAllSeries, getSeriesById, createSeries, updateSeries, deleteSeries, getStats
} = require('../controllers/series.controller');

router.get('/', auth, getAllSeries);
router.get('/stats', auth, getStats);
router.get('/:id', auth, getSeriesById);
router.post('/', auth, upload.single('cover_image'), createSeries);
router.put('/:id', auth, upload.single('cover_image'), updateSeries);
router.delete('/:id', auth, deleteSeries);

module.exports = router;