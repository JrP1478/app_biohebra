const express = require('express');
const router = express.Router();
const clienteController = require('../controllers/clienteController');

router.get('/', clienteController.listar);
router.get('/nuevo', clienteController.formCrear);
router.post('/nuevo', clienteController.crear);
router.get('/:id', clienteController.ver);
router.get('/:id/editar', clienteController.formEditar);
router.post('/:id/editar', clienteController.actualizar);
router.post('/:id/toggle', clienteController.toggleActivo);
router.post('/:id/eliminar', clienteController.eliminar);

module.exports = router;