const express = require('express');
const router = express.Router();
const reporteController = require('../controllers/reporteController');

router.get('/proforma/:id/pdf', reporteController.descargarPDF);

module.exports = router;