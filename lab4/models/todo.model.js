const db = require("../config/db");

const Todo = {
    getAll: (callback) => { 
        db.query("SELECT * FROM todos", callback);
    },

    create: (title, callback) => {
        db.query("INSERT INTO todos (title) VALUES (?)", [title], callback);
    },

    update: (id, completed, callback) => {
        db.query("UPDATE todos SET completed = ? WHERE id = ?", [completed, id], callback);
    },

    delete: (id, callback) => {
        db.query("DELETE FROM todos WHERE id = ?", [id], callback);
    }
}

module.exports = Todo;
