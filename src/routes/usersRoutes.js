const express = require('express');
const router = express.Router();
const usersController = require('../controllers/usersController');

//Rutas estaticas
router.get('/', usersController.consultar);

router.post('/', usersController.ingresar);

//Rutas dinamicas
router.route('/:id')
    .get(usersController.consultarUno)
    .put(usersController.modificar)
    .delete(usersController.borrar)

module.exports = router;