const express = require('express');
const router = express.Router();
const todoController = require('../controllers/todo.controller');

router.get('/todos', todoController.getTodo);
router.post('/todos', todoController.createTodo);
router.delete('/todos/:id', todoController.deleteTodo);
router.put('/todos/:id', todoController.updateTodo);

module.exports = router;
