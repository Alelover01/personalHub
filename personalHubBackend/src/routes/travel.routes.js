const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
  getAllTravel, getTravelById, createTravel, updateTravel, deleteTravel, getStats
} = require('../controllers/travel.controller');

router.get('/', auth, getAllTravel);
router.get('/stats', auth, getStats);
router.get('/:id', auth, getTravelById);
router.post('/', auth, upload.single('cover_image'), createTravel);
router.put('/:id', auth, upload.single('cover_image'), updateTravel);
router.delete('/:id', auth, deleteTravel);

module.exports = router;