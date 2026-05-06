const Producto = require('../models/Producto');
const { validationResult, body } = require('express-validator');

exports.listar = async (req, res) => {
    try {
        const { busqueda, activo } = req.query;
        const productos = await Producto.getAll(
            activo === '' ? null : (activo === '1' ? true : (activo === '0' ? false : null)),
            busqueda || ''
        );

        res.render('productos/list', {
            titulo: 'Productos',
            productos,
            busqueda: busqueda || '',
            filtroActivo: activo || ''
        });
    } catch (error) {
        console.error(error);
        res.status(500).render('error', {
            titulo: 'Error',
            mensaje: 'No se pudo cargar los productos',
            codigo: 500
        });
    }
};

exports.formCrear = (req, res) => {
    res.render('productos/form', {
        titulo: 'Nuevo Producto',
        producto: {},
        errores: [],
        modo: 'crear'
    });
};

exports.crear = [
    body('nombre').trim().notEmpty().withMessage('El nombre es obligatorio'),
    body('precio_base').isFloat({ min: 0 }).withMessage('El precio debe ser un número mayor o igual a 0'),
    
    async (req, res) => {
        const errores = validationResult(req);
        if (!errores.isEmpty()) {
            return res.render('productos/form', {
                titulo: 'Nuevo Producto',
                producto: req.body,
                errores: errores.array(),
                modo: 'crear'
            });
        }

        try {
            const data = {
                nombre: req.body.nombre,
                descripcion: req.body.descripcion || null,
                precio_base: parseFloat(req.body.precio_base) || 0,
                activo: true
            };

            await Producto.create(data);
            req.session.success_msg = 'Producto creado exitosamente';
            res.redirect('/productos');
        } catch (error) {
            console.error(error);
            res.render('productos/form', {
                titulo: 'Nuevo Producto',
                producto: req.body,
                errores: [{ msg: 'Error al guardar el producto' }],
                modo: 'crear'
            });
        }
    }
];

exports.ver = async (req, res) => {
    try {
        const producto = await Producto.getById(req.params.id);
        if (!producto) {
            return res.status(404).render('error', {
                titulo: 'No encontrado',
                mensaje: 'El producto no existe',
                codigo: 404
            });
        }

        res.render('productos/show', {
            titulo: 'Ver Producto',
            producto
        });
    } catch (error) {
        console.error(error);
        res.status(500).render('error', {
            titulo: 'Error',
            mensaje: 'No se pudo cargar el producto',
            codigo: 500
        });
    }
};

exports.formEditar = async (req, res) => {
    try {
        const producto = await Producto.getById(req.params.id);
        if (!producto) {
            return res.status(404).render('error', {
                titulo: 'No encontrado',
                mensaje: 'El producto no existe',
                codigo: 404
            });
        }

        res.render('productos/form', {
            titulo: 'Editar Producto',
            producto,
            errores: [],
            modo: 'editar'
        });
    } catch (error) {
        console.error(error);
        res.status(500).render('error', {
            titulo: 'Error',
            mensaje: 'No se pudo cargar el producto',
            codigo: 500
        });
    }
};

exports.actualizar = [
    body('nombre').trim().notEmpty().withMessage('El nombre es obligatorio'),
    body('precio_base').isFloat({ min: 0 }).withMessage('El precio debe ser un número mayor o igual a 0'),

    async (req, res) => {
        const errores = validationResult(req);
        if (!errores.isEmpty()) {
            return res.render('productos/form', {
                titulo: 'Editar Producto',
                producto: { ...req.body, id: req.params.id },
                errores: errores.array(),
                modo: 'editar'
            });
        }

        try {
            const data = {
                nombre: req.body.nombre,
                descripcion: req.body.descripcion || null,
                precio_base: parseFloat(req.body.precio_base) || 0
            };

            await Producto.update(req.params.id, data);
            req.session.success_msg = 'Producto actualizado exitosamente';
            res.redirect('/productos');
        } catch (error) {
            console.error(error);
            res.render('productos/form', {
                titulo: 'Editar Producto',
                producto: { ...req.body, id: req.params.id },
                errores: [{ msg: 'Error al actualizar el producto' }],
                modo: 'editar'
            });
        }
    }
];

exports.toggleActivo = async (req, res) => {
    try {
        const nuevoEstado = await Producto.toggleActivo(req.params.id);
        if (nuevoEstado === null) {
            return res.status(404).render('error', {
                titulo: 'No encontrado',
                mensaje: 'El producto no existe',
                codigo: 404
            });
        }
        req.session.success_msg = `Producto ${nuevoEstado ? 'activado' : 'desactivado'} exitosamente`
        res.redirect('/productos');
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
        await Producto.delete(req.params.id);
        req.session.success_msg = 'Producto eliminado exitosamente';
        res.redirect('/productos');
    } catch (error) {
        console.error(error);
        res.status(500).render('error', {
            titulo: 'Error',
            mensaje: 'No se pudo eliminar el producto',
            codigo: 500
        });
    }
};