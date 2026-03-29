const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getAllTodos, createTodo, updateTodo, deleteTodo } = require('../controllers/todos.controller');

router.get('/', auth, getAllTodos);
router.post('/', auth, createTodo);
router.put('/:id', auth, updateTodo);
router.delete('/:id', auth, deleteTodo);

module.exports = router;