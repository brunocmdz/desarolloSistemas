const { Sequelize } = require('sequelize');

const sequelize = process.env.DATABASE_URL
    ? new Sequelize(process.env.DATABASE_URL, { dialect: 'postgres', logging: false })
    : new Sequelize(
        process.env.DB_NAME || 'gainracksDB',
        process.env.DB_USER || 'postgres',
        process.env.DB_PASSWORD || '1234',
        {
            host: process.env.DB_HOST || 'localhost',
            port: Number(process.env.DB_PORT || 5432),
            dialect: 'postgres',
            logging: false
        }
    );

module.exports = sequelize;