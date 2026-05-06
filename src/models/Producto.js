const db = require('../config/database');

class Producto {
    static async getAll(activo = null, busqueda = '') {
        let query = db('producto');

        if (activo !== null) {
            query = query.where('activo', activo);
        }

        if (busqueda) {
            query = query.where(builder => {
                builder.whereILike('nombre', `%${busqueda}%`)
                    .orWhereILike('descripcion', `%${busqueda}%`);
            });
        }

        return await query.orderBy('nombre', 'asc');
    }

    static async getById(id) {
        return await db('producto').where({ id }).first();
    }

    static async create(data) {
        const [id] = await db('producto').insert(data);
        return id;
    }

    static async update(id, data) {
        return await db('producto').where({ id }).update(data);
    }

    static async toggleActivo(id) {
        const producto = await this.getById(id);
        if (!producto) return null;
        await db('producto').where({ id }).update({ activo: !producto.activo });
        return !producto.activo;
    }

    static async delete(id) {
        return await db('producto').where({ id }).del();
    }

    static async count() {
        const result = await db('producto').count('* as count').first();
        return result.count;
    }
}

module.exports = Producto;