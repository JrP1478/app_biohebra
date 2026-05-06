require('dotenv').config();

module.exports = {
    development: {
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
    }
};