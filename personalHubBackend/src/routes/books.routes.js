const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
  getAllBooks, getBookById, createBook, updateBook, deleteBook, getStats
} = require('../controllers/books.controller');

router.get('/', auth, getAllBooks);
router.get('/stats', auth, getStats);
router.get('/:id', auth, getBookById);
router.post('/', auth, upload.single('cover_image'), createBook);
router.put('/:id', auth, upload.single('cover_image'), updateBook);
router.delete('/:id', auth, deleteBook);

module.exports = router;