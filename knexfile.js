require('dotenv').config();

const config = {
    client: 'sqlite3',
    connection: {
        filename: process.env.DB_FILENAME || './database.sqlite'
    },
    useNullAsDefault: true,
    migrations: {
        directory: './src/database/migrations'
    },
    seeds: {
        directory: './src/database/seeds'
    }
};

module.exports = {
    development: config,
    production: config
};
