require("./model/user");
require("./model/templates");
require("./model/record");
require("./model/notifications");

const express = require('express');
const app = express();
const port = 3000;
const sequelize = require('./config/database');
const { notification, getNotifications, editUser, getUser, registerUser, getUserByEmail, login, setUserState, getTemplates, uploadTemplate, deleteTemplate, fixFile, getRecords } = require('./controller/controller');
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
app.post('/users/editUser/', editUser);
app.put('/users/state', isAuth, isAdmin, setUserState);

app.get('/notifications', isAuth, getNotifications);
app.post('/notifications', isAuth, isAdmin, notification);

// Plantillas
app.get('/templates', isAuth, isAdmin, getTemplates);
// NOTE: Accepts JSON with { nameTemplate, versionTemplate, content }
app.post('/templates/upload', isAuth, isAdmin, uploadTemplate);
app.delete('/templates/:id', isAuth, isAdmin, deleteTemplate);

app.post('/fixFile', fixFile)
app.get('/records', isAuth, getRecords);

app.listen(port, async() => {
    await sequelize.authenticate();
    await sequelize.sync({alter: true});
    console.log(`El servidor esta corriendo en el puerto ${port}`);
});

