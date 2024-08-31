const express = require('express');
const router = express.Router();
const usersController = require('../controllers/usersController');
const authenticateToken = require('../middlewares/authMiddleware');

// Rutas públicas
router.post('/login', usersController.authentication);
router.post('/', usersController.ingresar);  // Registro de usuario

// Rutas protegidas
router.get('/', authenticateToken, usersController.consultar);

router.route('/:id')
    .get(authenticateToken, usersController.consultarUno)
    .put(authenticateToken, usersController.modificar)
    .delete(authenticateToken, usersController.borrar);

module.exports = router;