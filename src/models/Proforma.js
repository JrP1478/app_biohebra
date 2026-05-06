const db = require('../config/database');

class Proforma {
    static async getAll(estado = null, busqueda = '') {
        let query = db('proforma')
            .join('cliente', 'proforma.cliente_id', 'cliente.id')
            .select(
                'proforma.*',
                'cliente.nombre as cliente_nombre',
                'cliente.ruc as cliente_ruc',
                'cliente.dni as cliente_dni',
                'cliente.tipo_documento as cliente_tipo_documento'
            );

        if (estado) {
            query = query.where('proforma.estado', estado);
        }

        if (busqueda) {
            query = query.where(builder => {
                builder.whereILike('proforma.numero', `%${busqueda}%`)
                    .orWhereILike('cliente.nombre', `%${busqueda}%`);
            });
        }

        return await query.orderBy('proforma.fecha_emision', 'desc');
    }

    static async getById(id) {
        const proforma = await db('proforma')
            .join('cliente', 'proforma.cliente_id', 'cliente.id')
            .select(
                'proforma.*',
                'cliente.nombre as cliente_nombre',
                'cliente.ruc as cliente_ruc',
                'cliente.dni as cliente_dni',
                'cliente.tipo_documento as cliente_tipo_documento',
                'cliente.direccion as cliente_direccion',
                'cliente.telefono as cliente_telefono',
                'cliente.contacto as cliente_contacto'
            )
            .where('proforma.id', id)
            .first();

        if (!proforma) return null;

        // Determinar el documento a mostrar
        if (proforma.cliente_tipo_documento === 'DNI') {
            proforma.cliente_documento = proforma.cliente_dni;
            proforma.cliente_documento_label = 'DNI';
        } else {
            proforma.cliente_documento = proforma.cliente_ruc;
            proforma.cliente_documento_label = 'RUC';
        }

        proforma.detalles = await db('proforma_detalle')
            .join('producto', 'proforma_detalle.producto_id', 'producto.id')
            .select(
                'proforma_detalle.*',
                'producto.nombre as producto_nombre'
            )
            .where('proforma_detalle.proforma_id', id);

        return proforma;
    }

    static async create(data, detalles) {
        const trx = await db.transaction();

        try {
            const [proformaId] = await trx('proforma').insert({
                numero: data.numero,
                cliente_id: data.cliente_id,
                fecha_emision: data.fecha_emision,
                subtotal: data.subtotal,
                igv: data.igv,
                total: data.total,
                estado: data.estado || 'EMITIDA',
                observaciones: data.observaciones || null
            });

            const detallesInsert = detalles.map(d => ({
                proforma_id: proformaId,
                producto_id: d.producto_id,
                descripcion: d.descripcion,
                cantidad: d.cantidad,
                precio_unitario: d.precio_unitario,
                total: d.total
            }));

            await trx('proforma_detalle').insert(detallesInsert);
            await trx.commit();

            return proformaId;
        } catch (error) {
            await trx.rollback();
            throw error;
        }
    }

    static async update(id, data, detalles) {
        const trx = await db.transaction();

        try {
            await trx('proforma').where({ id }).update({
                cliente_id: data.cliente_id,
                fecha_emision: data.fecha_emision,
                subtotal: data.subtotal,
                igv: data.igv,
                total: data.total,
                observaciones: data.observaciones || null
            });

            await trx('proforma_detalle').where({ proforma_id: id }).del();

            const detallesInsert = detalles.map(d => ({
                proforma_id: id,
                producto_id: d.producto_id,
                descripcion: d.descripcion,
                cantidad: d.cantidad,
                precio_unitario: d.precio_unitario,
                total: d.total
            }));

            await trx('proforma_detalle').insert(detallesInsert);
            await trx.commit();

            return id;
        } catch (error) {
            await trx.rollback();
            throw error;
        }
    }

    static async updateEstado(id, estado) {
        return await db('proforma').where({ id }).update({ estado });
    }
}

module.exports = Proforma;