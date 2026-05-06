const knex = require('knex');
const path = require('path');

const db = knex({
    client: 'sqlite3',
    connection: {
        filename: path.resolve(process.env.DB_FILENAME || './database.sqlite')
    },
    useNullAsDefault: true,
    migrations: {
        directory: path.resolve(__dirname, '../database/migrations')
    },
    seeds: {
        directory: path.resolve(__dirname, '../database/seeds')
    }
});

module.exports = db;