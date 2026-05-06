const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Importar rutas de módulos
const empresaRoutes = require('./empresa.routes');
const clienteRoutes = require('./cliente.routes');
const productoRoutes = require('./producto.routes');
const proformaRoutes = require('./proforma.routes');
const reporteRoutes = require('./reporte.routes');

// Dashboard
router.get('/', async (req, res) => {
    try {
        const stats = await db('proforma')
            .select('estado')
            .count('* as cantidad')
            .groupBy('estado');

        const totales = await db('proforma')
            .sum('total as total_general')
            .first();

        const totalProformas = await db('proforma').count('* as count').first();
        const totalClientes = await db('cliente').count('* as count').first();
        const totalProductos = await db('producto').count('* as count').first();

        res.render('dashboard/index', {
            titulo: 'Dashboard',
            stats: stats || [],
            totalGeneral: totales?.total_general || 0,
            totalProformas: totalProformas?.count || 0,
            totalClientes: totalClientes?.count || 0,
            totalProductos: totalProductos?.count || 0
        });
    } catch (error) {
        console.error(error);
        res.status(500).render('error', {
            titulo: 'Error',
            mensaje: 'No se pudo cargar el dashboard',
            codigo: 500
        });
    }
});

// Registrar rutas de módulos
router.use('/empresa', empresaRoutes);
router.use('/clientes', clienteRoutes);
router.use('/productos', productoRoutes);
router.use('/proformas', proformaRoutes);
router.use('/reportes', reporteRoutes);

module.exports = router;