const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getAllEvents, createEvent, updateEvent, deleteEvent } = require('../controllers/events.controller');

router.get('/', auth, getAllEvents);
router.post('/', auth, createEvent);
router.put('/:id', auth, updateEvent);
router.delete('/:id', auth, deleteEvent);

module.exports = router;