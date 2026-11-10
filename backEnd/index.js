require('dotenv').config();
require('./model/user');
require('./model/routine');
require('./model/workoutSession');

const express = require('express');
const app = express();
const port = Number(process.env.PORT || 3000);
const cors = require('cors');
const sequelize = require('./config/database');
const { getUser, registerUser, login } = require('./controller/controller');
const { getExercisesByMuscle } = require('./controller/exerciseController');
const { isAuth, isAdmin } = require('./midlewares/auth');
const fitness = require('./controller/fitnessController');

app.use(cors({ origin: process.env.FRONTEND_ORIGIN || 'http://localhost:5173' }));
app.use(express.json());

// Rutas de usuario
app.get('/users', isAuth, isAdmin, getUser);
app.post('/users/regist', registerUser);
app.post('/users/login', login);
app.get('/api/profile', isAuth, fitness.getProfile);
app.put('/api/profile', isAuth, fitness.updateProfile);
app.get('/api/routines', isAuth, fitness.listRoutines);
app.post('/api/routines', isAuth, fitness.createRoutine);
app.post('/api/workouts', isAuth, fitness.completeWorkout);
app.get('/api/history', isAuth, fitness.getHistory);
app.get('/api/admin/dashboard', isAuth, isAdmin, fitness.getAdminDashboard);
app.put('/api/admin/users/state', isAuth, isAdmin, fitness.setUserState);

// Ruta para la API de ejercicios
app.get('/api/exercises/:muscle', getExercisesByMuscle);

const startServer = async () => {
  await sequelize.authenticate();
  await sequelize.sync({ alter: true });
  if (process.env.ADMIN_EMAIL) {
    await require('./model/user').update(
      { isAdmin: true },
      { where: { email: process.env.ADMIN_EMAIL.trim().toLowerCase() } }
    );
  }
  app.listen(port, () => {
  console.log(`El servidor esta corriendo en el puerto ${port}`);
  });
};

startServer().catch((error) => {
  console.error('No se pudo iniciar el servidor:', error.message);
  process.exitCode = 1;
});

app.use((error, _req, res, _next) => {
  console.error('Error en la API:', error);
  res.status(500).json({ message: 'Error interno del servidor' });
});