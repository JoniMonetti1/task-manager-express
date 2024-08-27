const express = require('express');
const cors = require('cors');
const usersRoutes = require('./routes/usersRoutes');

const app = express();
const PORT = 3000;
//middleware
app.use(cors());
app.use(express.json());

//Route users
app.use('/users', usersRoutes);

app.listen(PORT, () => {
    console.log(`Listening on ${PORT}`);
})