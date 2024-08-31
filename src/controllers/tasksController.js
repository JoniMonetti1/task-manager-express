const db = require('../database/dbConnection');

class TaskController {
    constructor() {}

    verificarTaskExiste = async (id) => {
        const [existingTask] = await db.promise().query(`SELECT id_task FROM tasks WHERE id_task = ?;`, [id]);
        return existingTask.length > 0;
    }

    consultar = async (req, res) => {
        const userId = req.user.id_user;
        try {
            const [result] = await db.promise().query(`
                SELECT
                    t.id_task, 
                    t.title, 
                    t.description, 
                    ts.status_value,
                    t.due_date
                FROM tasks t
                JOIN task_status ts ON t.status_id = ts.status_id
                WHERE t.id_user = ?;
            `, [userId]);
            if (result.length === 0) {
                return res.status(404).send('Tasks not found');
            }
            res.status(200).json(result);
        } catch (error) {
            console.error(error);
            res.status(500).send(error.message);
        }
    }

    consultarUno = async (req, res) => {
        const {id} = req.params;
        const userId = req.user.id_user;
        try {
            const [result] = await db.promise().query(`
                SELECT
                    t.id_task,
                    t.title, 
                    t.description, 
                    ts.status_value,
                    t.due_date
                FROM tasks t
                JOIN task_status ts ON t.status_id = ts.status_id
                WHERE t.id_task = ? AND t.id_user = ?;
            `, [id, userId]);
            if (result.length === 0) {
                return res.status(404).send('Task not found');
            }
            res.status(200).json(result[0]);
        } catch (error) {
            console.error(error);
            res.status(500).send(error.message);
        }
    }

    ingresar = async (req, res) => {
        const {title, description, status_id, due_date} = req.body;
        const id_user = req.user.id_user;
        if (!title || status_id === undefined || id_user === undefined) {
            return res.status(400).send('Missing required fields');
        }

        try {
            const [result] = await db.promise().query(`
                INSERT INTO tasks 
                    (title, 
                    description, 
                    status_id,
                    due_date, 
                    id_user) 
                VALUES (?, ?, ?, ?, ?);
            `, [title, description, status_id, due_date, id_user]);

            // Get id task
            const id = result.insertId;

            return res.status(201).send(`Task with id ${id} was added successfully`);
        } catch (error) {
            console.error(error);
            res.status(500).send(error.message);
        }
    }

    modificar = async (req, res) => {
        const {id} = req.params;
        const {title, description, status_id, due_date} = req.body;
        const userId = req.user.id_user;

        try {
            // Check if the task exists and belongs to the user
            const taskExiste = await this.verificarTaskExiste(id);
            if (!taskExiste) {
                return res.status(404).send('Task not found');
            }

            const [result] = await db.promise().query(`
                UPDATE tasks 
                SET 
                    title = COALESCE(?, title), 
                    description = COALESCE(?, description), 
                    status_id = COALESCE(?, status_id),
                    due_date = COALESCE(?, due_date)
                WHERE id_task = ? AND id_user = ?;
            `, [title, description, status_id, due_date, id, userId]);
            return res.status(200).send(`Task with id ${id} was modified`);
        } catch (error) {
            console.error(error);
            res.status(500).send(error.message);
        }
    }

    borrar = async (req, res) => {
        const id = req.params.id;
        const userId = req.user.id_user;
        console.log(`Attempting to delete task with id: ${id} for user: ${userId}`);
        
        if (!id) {
            console.log('No task ID provided');
            return res.status(400).send('Task ID is required');
        }
    
        try {
            // Check if the task exists
            const taskExiste = await this.verificarTaskExiste(id);
            console.log(`Task exists: ${taskExiste}`);
            
            if (!taskExiste) {
                console.log(`Task with id ${id} not found`);
                return res.status(404).send('Task not found');
            }
    
            const [result] = await db.promise().query(`
                DELETE FROM tasks 
                WHERE id_task = ? AND id_user = ?;`
            , [id, userId]);
            
            console.log(`Delete result: ${JSON.stringify(result)}`);
            
            if (result.affectedRows === 0) {
                console.log(`No task deleted. User ${userId} may not have permission to delete task ${id}`);
                return res.status(403).send('No task deleted. You may not have permission to delete this task.');
            }
            
            console.log(`Task with id ${id} was successfully deleted`);
            return res.status(200).send(`Task with id ${id} was deleted`)
        } catch (error) {
            console.error('Error deleting task:', error);
            res.status(500).send(`Error deleting task: ${error.message}`);
        }
    }
}

module.exports = new TaskController;