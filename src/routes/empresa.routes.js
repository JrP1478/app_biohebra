const express = require('express');
const router = express.Router();
const empresaController = require('../controllers/empresaController');
const upload = require('../middlewares/upload');

router.get('/', empresaController.mostrar);
router.get('/editar', empresaController.formEditar);
router.post('/actualizar', upload.single('logo'), empresaController.actualizar);

module.exports = router;