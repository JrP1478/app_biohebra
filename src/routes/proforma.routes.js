const express = require('express');
const router = express.Router();
const proformaController = require('../controllers/proformaController');

router.get('/', proformaController.listar);
router.get('/nueva', proformaController.formCrear);
router.post('/nueva', proformaController.crear);
router.get('/:id', proformaController.ver);
router.get('/:id/editar', proformaController.formEditar);
router.post('/:id/editar', proformaController.actualizar);
router.post('/:id/estado', proformaController.cambiarEstado);

module.exports = router;