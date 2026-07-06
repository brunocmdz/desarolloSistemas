const sequelize = require('../config/database');
const { DataTypes } = require('sequelize');

const Notification = sequelize.define('Notification',
    {
        id_notification: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false
        },
        message: {
            type: DataTypes.STRING,
            allowNull: false
        },
        idUsuario: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        allUsers: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        }
    },
    {
        tableName: 'Notification',
        timestamps: true
    }
)

module.exports = Notification;
