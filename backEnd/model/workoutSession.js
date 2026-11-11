const sequelize = require('../config/database');
const { DataTypes } = require('sequelize');
const User = require('./user');
const Routine = require('./routine');

const WorkoutSession = sequelize.define('WorkoutSession', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  userId: { type: DataTypes.INTEGER, allowNull: false },
  routineId: { type: DataTypes.INTEGER, allowNull: true },
  routineName: { type: DataTypes.STRING(100), allowNull: false },
  durationMinutes: { type: DataTypes.INTEGER, allowNull: true },
  bodyWeightKg: { type: DataTypes.DECIMAL(5, 2), allowNull: true },
  estimatedCalories: { type: DataTypes.INTEGER, allowNull: true },
  notes: { type: DataTypes.STRING(500), allowNull: true },
  exercises: { type: DataTypes.JSONB, allowNull: false, defaultValue: [] },
  completedAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
}, { tableName: 'workout_sessions' });

WorkoutSession.belongsTo(User, { foreignKey: 'userId', as: 'owner' });
User.hasMany(WorkoutSession, { foreignKey: 'userId', as: 'workoutSessions' });
WorkoutSession.belongsTo(Routine, { foreignKey: 'routineId', as: 'routine' });

module.exports = WorkoutSession;