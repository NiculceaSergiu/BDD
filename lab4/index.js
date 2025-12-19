const express = require('express');
const app = express();
const todoRoutes = require('./routes/todo.router');

app.use(express.json());

app.use('/api', todoRoutes);

const PORT = 3000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});