const sequelize = require('../config/database');
const { DataTypes } = require('sequelize');

const Exercise = sequelize.define('Exercise', {
  id: { type: DataTypes.STRING(20), primaryKey: true },
  name: { type: DataTypes.STRING(120), allowNull: false },
  muscleGroup: { type: DataTypes.STRING(40), allowNull: false },
  image: { type: DataTypes.TEXT, allowNull: true }
}, {
  tableName: 'exercises',
  timestamps: false,
  indexes: [{ fields: ['muscleGroup'] }]
});

module.exports = Exercise;