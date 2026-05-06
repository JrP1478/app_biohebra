const Cliente = require('../models/Cliente');
const { validarDocumento } = require('../utils/validarDocumento');
const { validationResult, body } = require('express-validator');

exports.listar = async (req, res) => {
    try {
        const { busqueda, activo } = req.query;
        const clientes = await Cliente.getAll(
            activo === '' ? null : (activo === '1' ? true : (activo === '0' ? false : null)),
            busqueda || ''
        );

        res.render('clientes/list', {
            titulo: 'Clientes',
            clientes,
            busqueda: busqueda || '',
            filtroActivo: activo || ''
        });
    } catch (error) {
        console.error(error);
        res.status(500).render('error', {
            titulo: 'Error',
            mensaje: 'No se pudo cargar los clientes',
            codigo: 500
        });
    }
};

exports.formCrear = (req, res) => {
    res.render('clientes/form', {
        titulo: 'Nuevo Cliente',
        cliente: {},
        errores: [],
        modo: 'crear'
    });
};

exports.crear = [
    body('nombre').trim().notEmpty().withMessage('El nombre es obligatorio'),
    body('tipo_documento').isIn(['RUC', 'DNI']).withMessage('Tipo de documento inválido'),
    body('numero_documento').optional({ checkFalsy: true }).trim().custom((value, { req }) => {
        if (value && !validarDocumento(value, req.body.tipo_documento)) {
            throw new Error(`${req.body.tipo_documento} inválido`);
        }
        return true;
    }),
    body('email').optional({ checkFalsy: true }).isEmail().withMessage('Email inválido'),
    
    async (req, res) => {
        const errores = validationResult(req);
        if (!errores.isEmpty()) {
            return res.render('clientes/form', {
                titulo: 'Nuevo Cliente',
                cliente: req.body,
                errores: errores.array(),
                modo: 'crear'
            });
        }

        try {
            const data = {
                nombre: req.body.nombre,
                tipo_documento: req.body.tipo_documento || 'RUC',
                ruc: req.body.tipo_documento === 'RUC' ? (req.body.numero_documento || null) : null,
                dni: req.body.tipo_documento === 'DNI' ? (req.body.numero_documento || null) : null,
                contacto: req.body.contacto || null,
                telefono: req.body.telefono || null,
                direccion: req.body.direccion || null,
                email: req.body.email || null,
                activo: true
            };

            await Cliente.create(data);
            req.session.success_msg = 'Cliente creado exitosamente';
            res.redirect('/clientes');
        } catch (error) {
            console.error(error);
            res.render('clientes/form', {
                titulo: 'Nuevo Cliente',
                cliente: req.body,
                errores: [{ msg: 'Error al guardar el cliente: ' + error.message }],
                modo: 'crear'
            });
        }
    }
];

exports.ver = async (req, res) => {
    try {
        const cliente = await Cliente.getById(req.params.id);
        if (!cliente) {
            return res.status(404).render('error', {
                titulo: 'No encontrado',
                mensaje: 'El cliente no existe',
                codigo: 404
            });
        }

        res.render('clientes/show', {
            titulo: 'Ver Cliente',
            cliente
        });
    } catch (error) {
        console.error(error);
        res.status(500).render('error', {
            titulo: 'Error',
            mensaje: 'No se pudo cargar el cliente',
            codigo: 500
        });
    }
};

exports.formEditar = async (req, res) => {
    try {
        const cliente = await Cliente.getById(req.params.id);
        if (!cliente) {
            return res.status(404).render('error', {
                titulo: 'No encontrado',
                mensaje: 'El cliente no existe',
                codigo: 404
            });
        }

        res.render('clientes/form', {
            titulo: 'Editar Cliente',
            cliente,
            errores: [],
            modo: 'editar'
        });
    } catch (error) {
        console.error(error);
        res.status(500).render('error', {
            titulo: 'Error',
            mensaje: 'No se pudo cargar el cliente',
            codigo: 500
        });
    }
};

exports.actualizar = [
    body('nombre').trim().notEmpty().withMessage('El nombre es obligatorio'),
    body('tipo_documento').isIn(['RUC', 'DNI']).withMessage('Tipo de documento inválido'),
    body('numero_documento').optional({ checkFalsy: true }).trim().custom((value, { req }) => {
        if (value && !validarDocumento(value, req.body.tipo_documento)) {
            throw new Error(`${req.body.tipo_documento} inválido`);
        }
        return true;
    }),
    body('email').optional({ checkFalsy: true }).isEmail().withMessage('Email inválido'),

    async (req, res) => {
        const errores = validationResult(req);
        if (!errores.isEmpty()) {
            return res.render('clientes/form', {
                titulo: 'Editar Cliente',
                cliente: { ...req.body, id: req.params.id },
                errores: errores.array(),
                modo: 'editar'
            });
        }

        try {
            const data = {
                nombre: req.body.nombre,
                tipo_documento: req.body.tipo_documento || 'RUC',
                ruc: req.body.tipo_documento === 'RUC' ? (req.body.numero_documento || null) : null,
                dni: req.body.tipo_documento === 'DNI' ? (req.body.numero_documento || null) : null,
                contacto: req.body.contacto || null,
                telefono: req.body.telefono || null,
                direccion: req.body.direccion || null,
                email: req.body.email || null
            };

            await Cliente.update(req.params.id, data);
            req.session.success_msg = 'Cliente actualizado exitosamente';
            res.redirect('/clientes');
        } catch (error) {
            console.error(error);
            res.render('clientes/form', {
                titulo: 'Editar Cliente',
                cliente: { ...req.body, id: req.params.id },
                errores: [{ msg: 'Error al actualizar el cliente: ' + error.message }],
                modo: 'editar'
            });
        }
    }
];

exports.toggleActivo = async (req, res) => {
    try {
        const nuevoEstado = await Cliente.toggleActivo(req.params.id);
        if (nuevoEstado === null) {
            return res.status(404).render('error', {
                titulo: 'No encontrado',
                mensaje: 'El cliente no existe',
                codigo: 404
            });
        }
        req.session.success_msg = `Cliente ${nuevoEstado ? 'activado' : 'desactivado'} exitosamente`;
        res.redirect('/clientes');
    } catch (error) {
        console.error(error);
        res.status(500).render('error', {
            titulo: 'Error',
            mensaje: 'No se pudo cambiar el estado',
            codigo: 500
        });
    }
};

exports.eliminar = async (req, res) => {
    try {
        await Cliente.delete(req.params.id);
        req.session.success_msg = 'Cliente eliminado exitosamente';
        res.redirect('/clientes');
    } catch (error) {
        console.error(error);
        res.status(500).render('error', {
            titulo: 'Error',
            mensaje: 'No se pudo eliminar el cliente',
            codigo: 500
        });
    }
};