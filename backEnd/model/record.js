const sequelize = require('../config/database');
const { DataTypes } = require('sequelize');

const Record = sequelize.define('Record',
    {
        id_record: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        content: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
    },
    {
        tableName: 'Record',
        timestamps: true
    }
)

module.exports = Record;
