const db = require('../config/database');

class Cliente {
    static async getAll(activo = null, busqueda = '') {
        let query = db('cliente');

        if (activo !== null) {
            query = query.where('activo', activo);
        }

        if (busqueda) {
            query = query.where(builder => {
                builder.whereILike('nombre', `%${busqueda}%`)
                    .orWhereILike('ruc', `%${busqueda}%`)
                    .orWhereILike('dni', `%${busqueda}%`)
                    .orWhereILike('email', `%${busqueda}%`);
            });
        }

        return await query.orderBy('nombre', 'asc');
    }

    static async getById(id) {
        return await db('cliente').where({ id }).first();
    }

    static async create(data) {
        const [id] = await db('cliente').insert(data);
        return id;
    }

    static async update(id, data) {
        return await db('cliente').where({ id }).update(data);
    }

    static async toggleActivo(id) {
        const cliente = await this.getById(id);
        if (!cliente) return null;
        await db('cliente').where({ id }).update({ activo: !cliente.activo });
        return !cliente.activo;
    }

    static async delete(id) {
        return await db('cliente').where({ id }).del();
    }

    static async count() {
        const result = await db('cliente').count('* as count').first();
        return result.count;
    }
}

module.exports = Cliente;