const express = require('express');
const router = express.Router();
const taskController = require('../controllers/tasksController');
const authenticateToken = require('../middlewares/authMiddleware');

// Aplicar autenticación a todas las rutas de tareas
router.use(authenticateToken);

// Rutas estáticas
router.get('/', taskController.consultar);
router.post('/', taskController.ingresar);

// Rutas dinámicas
router.route('/:id')
    .get(taskController.consultarUno)
    .put(taskController.modificar)
    .delete(taskController.borrar);

module.exports = router;