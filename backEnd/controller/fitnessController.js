const User = require('../model/user');
const Routine = require('../model/routine');
const WorkoutSession = require('../model/workoutSession');

const cleanExercises = (items) => {
  if (!Array.isArray(items) || items.length === 0 || items.length > 50) return null;
  const exercises = items.map((item) => ({
    name: String(item.name || '').trim().slice(0, 100),
    muscle: String(item.muscle || '').trim().slice(0, 50),
    sets: Number(item.sets),
    reps: Number(item.reps),
    weightKg: item.weightKg === '' || item.weightKg == null ? null : Number(item.weightKg)
  }));

  if (exercises.some((exercise) => !exercise.name || !Number.isInteger(exercise.sets) || exercise.sets < 1 || exercise.sets > 30 || !Number.isInteger(exercise.reps) || exercise.reps < 1 || exercise.reps > 100 || (exercise.weightKg !== null && (!Number.isFinite(exercise.weightKg) || exercise.weightKg < 0 || exercise.weightKg > 1000)))) return null;
  return exercises;
};

const getProfile = async (req, res) => {
  const user = await User.findByPk(req.user.id_usuario, {
    attributes: ['id_usuario', 'email', 'firstName', 'lastName', 'weightKg', 'heightCm', 'goal', 'isAdmin']
  });
  return res.json(user);
};

const updateProfile = async (req, res) => {
  const { firstName, lastName, weightKg, heightCm, goal } = req.body;
  const updates = {};
  if (firstName !== undefined) updates.firstName = String(firstName).trim().slice(0, 80);
  if (lastName !== undefined) updates.lastName = String(lastName).trim().slice(0, 80);
  if (weightKg !== undefined) updates.weightKg = weightKg === '' || weightKg === null ? null : Number(weightKg);
  if (heightCm !== undefined) updates.heightCm = heightCm === '' || heightCm === null ? null : Number(heightCm);
  if (goal !== undefined) updates.goal = String(goal).trim().slice(0, 120) || null;

  if ((updates.firstName !== undefined && !updates.firstName) || (updates.lastName !== undefined && !updates.lastName) || (updates.weightKg !== undefined && updates.weightKg !== null && (!Number.isFinite(updates.weightKg) || updates.weightKg < 1 || updates.weightKg > 500)) || (updates.heightCm !== undefined && updates.heightCm !== null && (!Number.isFinite(updates.heightCm) || updates.heightCm < 50 || updates.heightCm > 300))) {
    return res.status(400).json({ message: 'Revisa los datos del perfil.' });
  }

  await User.update(updates, { where: { id_usuario: req.user.id_usuario } });
  return getProfile(req, res);
};

const listRoutines = async (req, res) => {
  const routines = await Routine.findAll({ where: { userId: req.user.id_usuario }, order: [['updatedAt', 'DESC']] });
  return res.json(routines);
};

const createRoutine = async (req, res) => {
  const name = String(req.body.name || '').trim().slice(0, 100);
  const exercises = cleanExercises(req.body.exercises);
  if (!name || !exercises) return res.status(400).json({ message: 'Añade un nombre y al menos un ejercicio válido.' });

  const routine = await Routine.create({
    userId: req.user.id_usuario,
    name,
    description: String(req.body.description || '').trim().slice(0, 500) || null,
    exercises
  });
  return res.status(201).json(routine);
};

const completeWorkout = async (req, res) => {
  const { routineId, durationMinutes, notes } = req.body;
  const routine = routineId ? await Routine.findOne({ where: { id: routineId, userId: req.user.id_usuario } }) : null;
  if (routineId && !routine) return res.status(404).json({ message: 'Rutina no encontrada.' });

  const exercises = cleanExercises(req.body.exercises || routine?.exercises);
  const duration = durationMinutes === '' || durationMinutes == null ? null : Number(durationMinutes);
  if (!exercises || (duration !== null && (!Number.isInteger(duration) || duration < 1 || duration > 1440))) {
    return res.status(400).json({ message: 'Registra ejercicios y una duración válida.' });
  }

  const session = await WorkoutSession.create({
    userId: req.user.id_usuario,
    routineId: routine?.id || null,
    routineName: routine?.name || String(req.body.routineName || 'Entrenamiento libre').trim().slice(0, 100),
    durationMinutes: duration,
    notes: String(notes || '').trim().slice(0, 500) || null,
    exercises
  });
  return res.status(201).json(session);
};

const getHistory = async (req, res) => {
  const sessions = await WorkoutSession.findAll({
    where: { userId: req.user.id_usuario },
    order: [['completedAt', 'DESC']],
    limit: 100
  });
  return res.json(sessions);
};

const getAdminDashboard = async (_req, res) => {
  const [users, routineCount, sessionCount, recentSessions] = await Promise.all([
    User.findAll({ attributes: { exclude: ['password'] }, order: [['id_usuario', 'DESC']] }),
    Routine.count(),
    WorkoutSession.count(),
    WorkoutSession.findAll({
      include: [{ model: User, as: 'owner', attributes: ['id_usuario', 'firstName', 'lastName', 'email'] }],
      order: [['completedAt', 'DESC']],
      limit: 10
    })
  ]);
  return res.json({ users, stats: { users: users.length, routines: routineCount, sessions: sessionCount }, recentSessions });
};

const setUserState = async (req, res) => {
  if (Number(req.body.id) === req.user.id_usuario) return res.status(400).json({ message: 'No puedes desactivar tu propia cuenta.' });
  const user = await User.findByPk(req.body.id);
  if (!user) return res.status(404).json({ message: 'Usuario no encontrado.' });
  user.state = req.body.state === true;
  await user.save();
  return res.json({ id: user.id_usuario, state: user.state });
};

const asyncHandler = (handler) => (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);

module.exports = {
  getProfile: asyncHandler(getProfile),
  updateProfile: asyncHandler(updateProfile),
  listRoutines: asyncHandler(listRoutines),
  createRoutine: asyncHandler(createRoutine),
  completeWorkout: asyncHandler(completeWorkout),
  getHistory: asyncHandler(getHistory),
  getAdminDashboard: asyncHandler(getAdminDashboard),
  setUserState: asyncHandler(setUserState)
};