const mysql = require('mysql2');
require('dotenv').config();

//Create connection to database
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
});

db.connect((err) => {
    if (err) throw err;
    console.log('Connected to the database');
});

module.exports = db; //exporting the database connection for other files to use.
