const sequelize = require('../config/database');
const { DataTypes } = require('sequelize');

const User = sequelize.define('User',
    {
        id_usuario: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
        },
        email: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false,
            validate: {
                isEmail: true
            }
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false
        },
        firstName: {
            type: DataTypes.STRING,
            allowNull: false
        },
        lastName: {
            type: DataTypes.STRING,
            allowNull: false
        },
        state: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
        },
        isAdmin: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        weightKg: {
            type: DataTypes.DECIMAL(5, 2),
            allowNull: true
        },
        heightCm: {
            type: DataTypes.DECIMAL(5, 2),
            allowNull: true
        },
        goal: {
            type: DataTypes.STRING(120),
            allowNull: true
        }
    },
    {
        tableName: 'User',
        timestamps: false
    }
)

module.exports = User;
