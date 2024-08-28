const db = require('../database/dbConnection');
const { hashPassword, verifyPassword } = require('../services/authService');

class UserController {
    constructor() {}

    verificarUsuarioExiste = async (id) => {
        const [existingUser] = await db.promise().query(`SELECT id_user FROM users WHERE id_user = ?;`, [id]);
        return existingUser.length > 0;
    }

    consultar = async (req, res) => {
        try {
            const [result] = await db.promise().query(`SELECT id_user, username, email FROM users;`);
            if (result.length === 0) {
                return res.status(200).send('No users found');
            }
            res.status(200).json(result);
        } catch (error) {
            console.error(error);
            res.status(500).send('Error retrieving users');
        }
    }

    consultarUno = async (req, res) => {
        const {id} = req.params; 
        try {
            const [result] = await db.promise().query(`SELECT id_user, username, email FROM users WHERE id_user = ?;`, [id]);
            if (result.length === 0) {
                return res.status(404).send('User not found');
            }
            res.status(200).json(result[0]);
        } catch (error) {
            console.error(error);
            res.status(500).send(error.message);
        }
    }

    ingresar = async (req, res) => {
        const {username, email, password} = req.body;
        if (!username || !email || !password) {
            return res.status(400).send('Missing required fields');
        }

        try {
            //hashear la contraseña
            const hashedPassword = await hashPassword(password);

            const [result] = await db.promise().query(`INSERT INTO users (username, email, password) VALUES (?, ?, ?);`, [username, email, hashedPassword]);

            // Obtener el ID del usuario recién insertado
            const id = result.insertId;

            return res.status(201).send(`User with id ${id} was added successfully`);
        } catch (error) {
            console.error(error);
            res.status(500).send(error.message);
        }
    }

    modificar = async (req, res) => {
        const {id} = req.params;
        const {username, email, password} = req.body;

        try {
            // Verificar si el usuario ya existe
            const usuarioExiste = await this.verificarUsuarioExiste(id);
            if (!usuarioExiste) {
                return res.status(404).send('User not found');
            }

            //Hashear la contraseña
            let hashedPassword;
            if (password) {
                hashedPassword = await hashPassword(password);
            } else {
                const [existingUser] = await db.promise().query(`SELECT password FROM users WHERE id_user = ?`, [id]);
                hashedPassword = existingUser[0].password;
            }

            const [result] = await db.promise().query(`UPDATE users SET username = ?, email = ?, password = ? WHERE id_user = ?;`, [username, email, hashedPassword, id]);
            return res.status(200).send(`User with id ${id} was modified`);
        } catch (error) {
            console.error(error);
            res.status(500).send(error.message);
        }
    }

    borrar = async (req, res) => {
        const {id} = req.params;
        try {
            // Verificar si el usuario ya existe
            const usuarioExiste = await this.verificarUsuarioExiste(id);
            if (!usuarioExiste) {
                return res.status(404).send('User not found');
            }

            const [result] = await db.promise().query(`DELETE FROM users WHERE id_user = ?;`, [id]);
            return res.status(200).send(`User with id ${id} was deleted`)
        } catch (error) {
            console.log(error);
            res.status(500).send(error.message);
        }
    }
}

module.exports = new UserController;