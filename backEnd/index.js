require('./model/user');

const express = require('express');
const app = express();
const port = 3000;
const sequelize = require('./config/database');
const {getUser, registerUser, getUserByEmail, login, setUserState } = require('./controller/controller');
const { isAuth, isAdmin } = require('./midlewares/auth');

app.use(express.json());
// Middleware para configurar los headers CORS
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:5173')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  res.setHeader('Access-Control-Allow-Credentials', 'true')
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200)
  }
  next()
})


app.get('/users', isAuth, isAdmin, getUser);
app.get('/users/:email', getUserByEmail);
app.post('/users/regist/',registerUser);
app.post('/users/login/', login);
app.put('/users/state', isAuth, isAdmin, setUserState);

// Rutas de usuario

app.listen(port, async() => {
    await sequelize.authenticate();
    await sequelize.sync({alter: true});
    console.log(`El servidor esta corriendo en el puerto ${port}`);
});

