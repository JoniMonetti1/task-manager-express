const express = require('express');
const cors = require('cors');
const usersRoutes = require('./routes/usersRoutes');
const tasksRoutes = require('./routes/tasksRoutes');

const app = express();
const PORT = 3000;

//middlewares
app.use(cors());
app.use(express.json());

//Route users
app.use('/users', usersRoutes);

//Route tasks
app.use('/tasks', tasksRoutes);

app.listen(PORT, () => {
    console.log(`Listening on ${PORT}`);
})