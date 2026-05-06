const db = require('../config/database');

class ProformaDetalle {
    static async getByProformaId(proformaId) {
        return await db('proforma_detalle')
            .join('producto', 'proforma_detalle.producto_id', 'producto.id')
            .select(
                'proforma_detalle.*',
                'producto.nombre as producto_nombre'
            )
            .where('proforma_detalle.proforma_id', proformaId);
    }
}

module.exports = ProformaDetalle;