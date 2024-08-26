const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3000;
//middleware
app.use(cors());
app.use(express.json());

app.listen(PORT, () => {
    console.log(`Listening on ${PORT}`);
})