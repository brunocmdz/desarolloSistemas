const sequelize = require('../config/database');
const { DataTypes } = require('sequelize');

const Exercise = sequelize.define('Exercise', {
  id: { type: DataTypes.STRING(60), primaryKey: true },
  name: { type: DataTypes.STRING(120), allowNull: false },
  muscleGroup: { type: DataTypes.STRING(40), allowNull: false },
  image: { type: DataTypes.TEXT, allowNull: true },
  description: { type: DataTypes.STRING(500), allowNull: false, defaultValue: '' },
  instructions: { type: DataTypes.JSONB, allowNull: false, defaultValue: [] },
  isCustom: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
  createdBy: { type: DataTypes.INTEGER, allowNull: true }
}, {
  tableName: 'exercises',
  timestamps: false,
  indexes: [{ fields: ['muscleGroup'] }]
});

module.exports = Exercise;