const db = require('../config/database');

class Empresa {
    static async get() {
        return await db('empresa').first();
    }

    static async update(id, data) {
        return await db('empresa').where({ id }).update(data);
    }

    static async create(data) {
        return await db('empresa').insert(data);
    }
}

module.exports = Empresa;