const express = require('express');
const router = express.Router();
const taskController = require('../controllers/tasksController');

// Rutas estáticas
router.get('/', taskController.consultar);
router.post('/', taskController.ingresar);

// Rutas dinamicas
router.route('/:id')
    .get(taskController.consultarUno)
    .put(taskController.modificar)
    .delete(taskController.borrar)
    
module.exports = router;