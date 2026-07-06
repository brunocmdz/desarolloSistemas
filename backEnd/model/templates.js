const sequelize = require('../config/database');
const { DataTypes } = require('sequelize');

const Template = sequelize.define('Template',
    {
        content: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        versionTemplate: {
            type: DataTypes.STRING,
            allowNull: false
        },
        nameTemplate: {
            type: DataTypes.STRING,
            allowNull: false
        },
        // Compatibilidad con esquema existente: si la tabla tiene columna `lastName`
        // marcada como NOT NULL, proporcionamos un campo opcional con valor por defecto.
        lastName: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: ''
        },
        idPlantilla: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        }
    },
    {
        tableName: 'Template',
        timestamps: false
    }
)

module.exports = Template;
