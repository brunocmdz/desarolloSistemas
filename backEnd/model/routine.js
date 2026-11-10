const sequelize = require('../config/database');
const { DataTypes } = require('sequelize');
const User = require('./user');

const Routine = sequelize.define('Routine', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  userId: { type: DataTypes.INTEGER, allowNull: false },
  name: { type: DataTypes.STRING(100), allowNull: false },
  description: { type: DataTypes.STRING(500), allowNull: true },
  exercises: { type: DataTypes.JSONB, allowNull: false, defaultValue: [] }
}, { tableName: 'routines' });

Routine.belongsTo(User, { foreignKey: 'userId', as: 'owner' });
User.hasMany(Routine, { foreignKey: 'userId', as: 'routines' });

module.exports = Routine;