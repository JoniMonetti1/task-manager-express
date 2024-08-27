const db = require('../database/dbConnection');

class UserController {
    constructor() {}

    consultar(req, res) {
        try {
            db.query(`SELECT * FROM users;`, (err, result) => {
                if (err) {
                    res.status(500).send(err.message);
                }
                res.json(result);
            })
        } catch (error) {
            console.error(error);
            res.status(500).send(err.message);
        }
    }

    consultarUno(req, res) {
        const {id} = req.params; 
        try {
            db.query(`SELECT * FROM users WHERE id_user = ?;`, [id], (err, result) => {
                if (err) {
                    res.status(500).send(err.message);
                }
                res.json(result);
            })
        } catch (error) {
            console.error(error);
            res.status(500).send(error.message);
        }
    }

    ingresar(req, res) {
        const {username, email, password} = req.body;
        try {
            db.query(`INSERT INTO users (username, email, password)
                VALUES (?, ?, ?);`,
                [username, email, password],
                (err, result) => {
                    if (err) {
                        console.error(err);
                        return res.status(500).send('Error inserting user');
                    }
                    res.status(201).send('User created successfully');
            });
        } catch (error) {
            console.error(error);
            res.status(500).send(error.message);
        }
    }

    modificar(req, res) {
        const {id} = req.params;
        const {username, email, password} = req.body;
        try {
            db.query(`UPDATE users SET username = ?, email = ?, password = ?
                WHERE id_user = ?;`,[username, email, password, id],
                (err, result) => {
                    if (err) {
                        console.error(err);
                        return res.status(500).send('Error while modifying user');
                    }
                    res.send('User modified successfully');
            });
        } catch (error) {
            console.error(error);
            res.status(500).send(error.message);
        }
    }
}

module.exports = new UserController;