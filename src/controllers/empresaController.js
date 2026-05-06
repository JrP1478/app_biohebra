const Empresa = require('../models/Empresa');
const path = require('path');

exports.mostrar = async (req, res) => {
    try {
        const empresa = await Empresa.get();
        res.render('empresa/show', {
            titulo: 'Mi Empresa',
            empresa: empresa || null
        });
    } catch (error) {
        console.error(error);
        res.status(500).render('error', {
            titulo: 'Error',
            mensaje: 'No se pudo cargar los datos de la empresa',
            codigo: 500
        });
    }
};

exports.formEditar = async (req, res) => {
    try {
        const empresa = await Empresa.get();
        res.render('empresa/form', {
            titulo: 'Editar Empresa',
            empresa: empresa || {},
            errores: []
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

exports.actualizar = async (req, res) => {
    try {
        const { nombre, ruc, direccion, telefono, web } = req.body;
        const empresa = await Empresa.get();

        const data = {
            nombre,
            ruc,
            direccion: direccion || null,
            telefono: telefono || null,
            web: web || null
        };

        if (req.file) {
            data.logo = '/uploads/logos/' + req.file.filename;
        }

        if (empresa) {
            await Empresa.update(empresa.id, data);
        } else {
            await Empresa.create(data);
        }

        res.redirect('/empresa');
    } catch (error) {
        console.error(error);
        res.status(500).render('error', {
            titulo: 'Error',
            mensaje: 'No se pudo guardar los datos',
            codigo: 500
        });
    }
};