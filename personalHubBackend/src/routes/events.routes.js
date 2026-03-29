const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getAllEvents, createEvent, deleteEvent } = require('../controllers/events.controller');

router.get('/', auth, getAllEvents);
router.post('/', auth, createEvent);
router.delete('/:id', auth, deleteEvent);

module.exports = router;