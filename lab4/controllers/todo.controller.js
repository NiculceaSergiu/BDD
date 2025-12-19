const Todo  = require("../models/todo.model");

exports.getTodo = (req, res) => {
    Todo.getAll((err, results) => {
        if (err) {
            return res.status(500).json({ error: "Database error" });
        }
        res.json(results);
    });
}

exports.createTodo = (req, res) => {
    const { title } = req.body;
    if(!title) {
        return res.status(400).json({ error: "Title is required" });
    }
    Todo.create(title, (err, result) => {
        if (err) {
            return res.status(500).json({ error: "Database error" });
        }
        res.status(201).json({ id: result.insertId, title, completed: false });
    });
}

exports.deleteTodo = (req, res) => {
    const { id } = req.params;

    if (!id) {
        return res.status(400).json({ error: "Todo id is required" });
    }

    Todo.delete(id, (err) => {
        if (err) {
            return res.status(500).json({ error: "Database error" });
        }
        res.json({ message: "Todo deleted successfully" });
    });
}

exports.updateTodo = (req, res) => {
    const { id } = req.params;
    const { completed } = req.body;

    if (!id) {
        return res.status(400).json({ error: "Todo id is required" });
    }

    if (typeof completed === "undefined") {
        return res.status(400).json({ error: "Completed flag is required" });
    }

    Todo.update(id, completed, (err) => {
        if (err) {
            return res.status(500).json({ error: "Database error" });
        }
        res.json({ message: "Todo updated successfully" });
    });
}
