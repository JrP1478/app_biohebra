const express = require('express');
const router = express.Router();
const productoController = require('../controllers/productoController');

router.get('/', productoController.listar);
router.get('/nuevo', productoController.formCrear);
router.post('/nuevo', productoController.crear);
router.get('/:id', productoController.ver);
router.get('/:id/editar', productoController.formEditar);
router.post('/:id/editar', productoController.actualizar);
router.post('/:id/toggle', productoController.toggleActivo);
router.post('/:id/eliminar', productoController.eliminar);

module.exports = router;