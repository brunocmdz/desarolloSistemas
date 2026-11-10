const User = require('../model/user');
const Routine = require('../model/routine');
const WorkoutSession = require('../model/workoutSession');
const Exercise = require('../model/exercise');

const normalizeName = (name) => String(name || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();

const normalizeRoutineExercises = async (items) => {
  if (!Array.isArray(items) || items.length === 0 || items.length > 50) return null;
  const catalog = await Exercise.findAll();
  const catalogById = new Map(catalog.map((exercise) => [exercise.id, exercise]));
  const requestedIds = items.map((item) => String(item.exerciseId || item.id || ''));
  const resolved = items.map((item, index) => {
    let exercise = catalogById.get(requestedIds[index]);
    if (!exercise) {
      const oldName = normalizeName(item.name);
      exercise = catalog.find((candidate) => {
        const catalogName = normalizeName(candidate.name);
        return catalogName === oldName || catalogName.startsWith(`${oldName} `) || oldName.startsWith(`${catalogName} `);
      });
    }
    if (!exercise) return null;

    const rawSets = Array.isArray(item.sets) ? item.sets : null;
    const setCount = Number(item.setsCount ?? rawSets?.length ?? item.sets);
    const reps = Number(item.targetReps ?? item.reps ?? rawSets?.[0]?.targetReps ?? rawSets?.[0]?.reps);
    const weightValue = item.targetWeightKg ?? item.weightKg ?? rawSets?.[0]?.targetWeightKg;
    const weightKg = weightValue === '' || weightValue == null ? null : Number(weightValue);
    if (!Number.isInteger(setCount) || setCount < 1 || setCount > 30 || !Number.isInteger(reps) || reps < 1 || reps > 100 || (weightKg !== null && (!Number.isFinite(weightKg) || weightKg < 0 || weightKg > 1000))) return null;

    return {
      exerciseId: exercise.id,
      name: exercise.name,
      muscle: exercise.muscleGroup,
      sets: Array.from({ length: setCount }, (_, index) => ({
        setNumber: index + 1,
        targetReps: Number.isInteger(rawSets?.[index]?.targetReps) ? rawSets[index].targetReps : reps,
        targetWeightKg: rawSets?.[index]?.targetWeightKg ?? weightKg
      }))
    };
  });

  if (resolved.some((exercise) => !exercise) || new Set(resolved.map((exercise) => exercise.exerciseId)).size !== resolved.length) return null;
  return resolved;
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
  return res.json(await Promise.all(routines.map(async (routine) => ({
    ...routine.toJSON(),
    exercises: await normalizeRoutineExercises(routine.exercises)
  }))));
};

const createRoutine = async (req, res) => {
  const name = String(req.body.name || '').trim().slice(0, 100);
  const exercises = await normalizeRoutineExercises(req.body.exercises);
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
  if (!routine) return res.status(404).json({ message: 'Rutina no encontrada.' });

  const plannedExercises = await normalizeRoutineExercises(routine.exercises);
  const submittedExercises = req.body.exercises;
  const duration = durationMinutes === '' || durationMinutes == null ? null : Number(durationMinutes);
  if (!plannedExercises || !Array.isArray(submittedExercises) || submittedExercises.length !== plannedExercises.length || (duration !== null && (!Number.isInteger(duration) || duration < 1 || duration > 1440))) {
    return res.status(400).json({ message: 'Completa las series de la rutina y registra una duración válida.' });
  }

  const exercises = [];
  for (const planned of plannedExercises) {
    const performed = submittedExercises.find((item) => String(item.exerciseId) === planned.exerciseId);
    if (!performed || !Array.isArray(performed.sets) || performed.sets.length !== planned.sets.length) {
      return res.status(400).json({ message: `Completa todas las series de ${planned.name}.` });
    }
    const sets = performed.sets.map((set, index) => {
      const reps = Number(set.reps);
      const weightKg = set.weightKg === '' || set.weightKg == null ? null : Number(set.weightKg);
      if (!Number.isInteger(reps) || reps < 1 || reps > 100 || (weightKg !== null && (!Number.isFinite(weightKg) || weightKg < 0 || weightKg > 1000))) return null;
      return {
        setNumber: index + 1,
        targetReps: planned.sets[index].targetReps,
        targetWeightKg: planned.sets[index].targetWeightKg,
        reps,
        weightKg
      };
    });
    if (sets.some((set) => !set)) return res.status(400).json({ message: `Revisa repeticiones y peso de ${planned.name}.` });
    exercises.push({ exerciseId: planned.exerciseId, name: planned.name, muscle: planned.muscle, sets });
  }

  const session = await WorkoutSession.create({
    userId: req.user.id_usuario,
    routineId: routine.id,
    routineName: routine.name,
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