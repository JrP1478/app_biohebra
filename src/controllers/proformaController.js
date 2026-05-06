const Proforma = require('../models/Proforma');
const Cliente = require('../models/Cliente');
const Producto = require('../models/Producto');
const { generarNumero } = require('../services/numeracionService');
const { calcularProforma, formatearMoneda } = require('../services/calculoService');
const { validationResult, body } = require('express-validator');

exports.listar = async (req, res) => {
    try {
        const { busqueda, estado } = req.query;
        const proformas = await Proforma.getAll(
            estado || null,
            busqueda || ''
        );

        res.render('proformas/list', {
            titulo: 'Proformas',
            proformas,
            busqueda: busqueda || '',
            filtroEstado: estado || ''
        });
    } catch (error) {
        console.error(error);
        res.status(500).render('error', {
            titulo: 'Error',
            mensaje: 'No se pudo cargar las proformas',
            codigo: 500
        });
    }
};

exports.formCrear = async (req, res) => {
    try {
        const clientes = await Cliente.getAll(true);
        const productos = await Producto.getAll(true);
        const numero = await generarNumero();

        res.render('proformas/form', {
            titulo: 'Nueva Proforma',
            clientes,
            productos,
            numero,
            proforma: { 
                fecha_emision: new Date().toISOString().split('T')[0],
                detalles: []  // <-- AGREGAR ESTO
            },
            errores: [],
            modo: 'crear'  // <-- AGREGAR ESTO
        });
    } catch (error) {
        console.error(error);
        res.status(500).render('error', {
            titulo: 'Error',
            mensaje: 'No se pudo cargar el formulario',
            codigo: 500
        });
    }
};

exports.crear = [
    body('cliente_id').isInt({ min: 1 }).withMessage('Seleccione un cliente'),
    body('fecha_emision').isDate().withMessage('Fecha inválida'),
    body('detalles').isArray({ min: 1 }).withMessage('Agregue al menos un producto'),

    async (req, res) => {
        const errores = validationResult(req);
        if (!errores.isEmpty()) {
            const clientes = await Cliente.getAll(true);
            const productos = await Producto.getAll(true);
            return res.render('proformas/form', {
                titulo: 'Nueva Proforma',
                clientes,
                productos,
                numero: req.body.numero,
                proforma: req.body,
                errores: errores.array()
            });
        }

        try {
            const detallesRaw = Array.isArray(req.body.detalles) ? req.body.detalles : [req.body.detalles];
            
            const detalles = detallesRaw.map(d => ({
                producto_id: parseInt(d.producto_id),
                descripcion: d.descripcion,
                cantidad: parseFloat(d.cantidad),
                precio_unitario: parseFloat(d.precio_unitario),
                total: parseFloat(d.cantidad) * parseFloat(d.precio_unitario)
            }));

            const calculos = calcularProforma(detalles);

            const proformaId = await Proforma.create({
                numero: req.body.numero,
                cliente_id: parseInt(req.body.cliente_id),
                fecha_emision: req.body.fecha_emision,
                subtotal: calculos.subtotal,
                igv: calculos.igv,
                total: calculos.total,
                estado: 'EMITIDA',
                observaciones: req.body.observaciones || null
            }, detalles);
            req.session.success_msg = `Proforma ${req.body.numero} creada exitosamente`;
            res.redirect(`/proformas/${proformaId}`);
        } catch (error) {
            console.error(error);
            const clientes = await Cliente.getAll(true);
            const productos = await Producto.getAll(true);
            res.render('proformas/form', {
                titulo: 'Nueva Proforma',
                clientes,
                productos,
                numero: req.body.numero,
                proforma: req.body,
                errores: [{ msg: 'Error al guardar la proforma: ' + error.message }]
            });
        }
    }
];

exports.ver = async (req, res) => {
    try {
        const proforma = await Proforma.getById(req.params.id);
        if (!proforma) {
            return res.status(404).render('error', {
                titulo: 'No encontrado',
                mensaje: 'La proforma no existe',
                codigo: 404
            });
        }

        res.render('proformas/show', {
            titulo: `Proforma ${proforma.numero}`,
            proforma,
            formatearMoneda
        });
    } catch (error) {
        console.error(error);
        res.status(500).render('error', {
            titulo: 'Error',
            mensaje: 'No se pudo cargar la proforma',
            codigo: 500
        });
    }
};

exports.cambiarEstado = async (req, res) => {
    try {
        const { estado } = req.body;
        const estadosValidos = ['EMITIDA', 'ENVIADA', 'ACEPTADA', 'RECHAZADA', 'ANULADA'];
        
        if (!estadosValidos.includes(estado)) {
            return res.status(400).render('error', {
                titulo: 'Error',
                mensaje: 'Estado inválido',
                codigo: 400
            });
        }

        await Proforma.updateEstado(req.params.id, estado);
        req.session.success_msg = `Estado cambiado a ${estado}`;
        res.redirect(`/proformas/${req.params.id}`);
    } catch (error) {
        console.error(error);
        res.status(500).render('error', {
            titulo: 'Error',
            mensaje: 'No se pudo cambiar el estado',
            codigo: 500
        });
    }
};

exports.formEditar = async (req, res) => {
    try {
        const proforma = await Proforma.getById(req.params.id);
        if (!proforma) {
            return res.status(404).render('error', {
                titulo: 'No encontrado',
                mensaje: 'La proforma no existe',
                codigo: 404
            });
        }

        const clientes = await Cliente.getAll(true);
        const productos = await Producto.getAll(true);

        res.render('proformas/form', {
            titulo: 'Editar Proforma',
            clientes,
            productos,
            numero: proforma.numero,
            proforma: proforma,
            errores: [],
            modo: 'editar'
        });
    } catch (error) {
        console.error(error);
        res.status(500).render('error', {
            titulo: 'Error',
            mensaje: 'No se pudo cargar el formulario',
            codigo: 500
        });
    }
};

exports.actualizar = [
    body('cliente_id').isInt({ min: 1 }).withMessage('Seleccione un cliente'),
    body('fecha_emision').isDate().withMessage('Fecha inválida'),
    body('detalles').isArray({ min: 1 }).withMessage('Agregue al menos un producto'),

    async (req, res) => {
        const errores = validationResult(req);
        if (!errores.isEmpty()) {
            const clientes = await Cliente.getAll(true);
            const productos = await Producto.getAll(true);
            return res.render('proformas/form', {
                titulo: 'Editar Proforma',
                clientes,
                productos,
                numero: req.body.numero,
                proforma: req.body,
                errores: errores.array(),
                modo: 'editar'
            });
        }

        try {
            const detallesRaw = Array.isArray(req.body.detalles) ? req.body.detalles : [req.body.detalles];
            
            const detalles = detallesRaw.map(d => ({
                producto_id: parseInt(d.producto_id),
                descripcion: d.descripcion,
                cantidad: parseFloat(d.cantidad),
                precio_unitario: parseFloat(d.precio_unitario),
                total: parseFloat(d.cantidad) * parseFloat(d.precio_unitario)
            }));

            const calculos = calcularProforma(detalles);

            await Proforma.update(req.params.id, {
                cliente_id: parseInt(req.body.cliente_id),
                fecha_emision: req.body.fecha_emision,
                subtotal: calculos.subtotal,
                igv: calculos.igv,
                total: calculos.total,
                observaciones: req.body.observaciones || null
            }, detalles);

            req.session.success_msg = `Proforma ${req.body.numero} actualizada exitosamente`;
            res.redirect(`/proformas/${req.params.id}`);
        } catch (error) {
            console.error(error);
            const clientes = await Cliente.getAll(true);
            const productos = await Producto.getAll(true);
            res.render('proformas/form', {
                titulo: 'Editar Proforma',
                clientes,
                productos,
                numero: req.body.numero,
                proforma: req.body,
                errores: [{ msg: 'Error al actualizar la proforma: ' + error.message }],
                modo: 'editar'
            });
        }
    }
];