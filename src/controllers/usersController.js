const db = require('../database/dbConnection');
const { hashPassword, verifyPassword } = require('../services/authService');
const jwt = require('jsonwebtoken');
require('dotenv').config();

class UserController {
    constructor() {}

    verificarUsuarioExiste = async (id) => {
        const [existingUser] = await db.promise().query(`
            SELECT 
                id_user 
            FROM users 
            WHERE id_user = ?;
        `, [id]);
        return existingUser.length > 0;
    }

    consultar = async (req, res) => {
        try {
            const [result] = await db.promise().query(`
                SELECT 
                    id_user, 
                    username, 
                    email 
                FROM users;
            `);
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
            const [result] = await db.promise().query(`
                SELECT 
                    id_user, 
                    username, 
                    email 
                FROM users 
                WHERE id_user = ?;
            `, [id]);
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
            //hash the password
            const hashedPassword = await hashPassword(password);

            const [result] = await db.promise().query(`
                INSERT INTO users 
                    (username, 
                    email, 
                    password) 
                VALUES (?, ?, ?);
            `, [username, email, hashedPassword]);

            // Get user id
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
            // Check if user already exists
            const usuarioExiste = await this.verificarUsuarioExiste(id);
            if (!usuarioExiste) {
                return res.status(404).send('User not found');
            }

            //Hashing the password
            let hashedPassword;
            if (password) {
                hashedPassword = await hashPassword(password);
            } else {
                const [existingUser] = await db.promise().query(`
                    SELECT 
                        password 
                    FROM users 
                    WHERE id_user = ?;`
                , [id]);
                hashedPassword = existingUser[0].password;
            }

            const [result] = await db.promise().query(`
                UPDATE users 
                SET 
                    username = COALESCE(?, username), 
                    email = COALESCE(?, email),  
                    password = COALESCE(?, password) 
                WHERE id_user = ?;
            `, [username, email, hashedPassword, id]);
            return res.status(200).send(`User with id ${id} was modified`);
        } catch (error) {
            console.error(error);
            res.status(500).send(error.message);
        }
    }

    borrar = async (req, res) => {
        const {id} = req.params;
        try {
            // Check if user already exists
            const usuarioExiste = await this.verificarUsuarioExiste(id);
            if (!usuarioExiste) {
                return res.status(404).send('User not found');
            }

            const [result] = await db.promise().query(`
                DELETE FROM 
                    users 
                WHERE id_user = ?;`
            , [id]);
            return res.status(200).send(`User with id ${id} was deleted`)
        } catch (error) {
            console.log(error);
            res.status(500).send(error.message);
        }
    }

    authentication = async (req, res) => {
        const {username, password} = req.body;
        if (!username ||!password) {
            return res.status(400).send('Missing required fields');
        }
    
        try {
            const[user] = await db.promise().query(
                `SELECT
                    id_user, password
                FROM users
                WHERE username = ?;`,
                [username]
            );
    
            if (user.length === 0) {
                return res.status(401).send('Invalid username or password');
            }
    
            const isValidPassword = await verifyPassword(user[0].password, password);
            if (!isValidPassword) {
                return res.status(401).send('Invalid username or password');
            }
    
            // Si la contraseña es válida pero no está hasheada, actualizarla
            if (!user[0].password.startsWith('$')) {
                const hashedPassword = await hashPassword(password);
                await db.promise().query(
                    `UPDATE users SET password = ? WHERE id_user = ?;`,
                    [hashedPassword, user[0].id_user]
                );
            }
    
            const token = jwt.sign(
                {id_user: user[0].id_user, username: username},
                process.env.JWT_SECRET,
                {expiresIn: '12h'}
            )
    
            return res.status(200).json({token});
        } catch (error) {
            console.log(error);
            res.status(500).send(error.message);
        }
    }
}

module.exports = new UserController;