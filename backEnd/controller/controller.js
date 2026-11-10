const User = require('../model/user');
const bcrypt = require('bcrypt');
const { createAuthToken } = require('../midlewares/auth');

const getUser = async(_req, res) => {
    try {
        const users = await User.findAll({ attributes: { exclude: ['password'] } });
        res.json(users);
    } catch (err) {
        console.error('Error al obtener los usuarios:', err);
        res.status(500).json({ message: 'Error interno del servidor', error: err.message });
    }
};
const getUserByEmail = async(req, res) => {
    try {
        const email = req.params.email;
        const users = await User.findOne({
            where: { email },
            attributes: { exclude: ['password'] }
        });
        res.json(users);
    } catch (err) {
        console.error('Error al obtener los usuarios:', err);
        res.status(500).json({ message: 'Error interno del servidor', error: err.message });
    }
};


const editUser = async(req, res) => {
    try {
        const {firstName, lastName,  id_usuario } = req.query;
        const users = await User.update(
            { firstName, lastName },
            { where: { id_usuario } }
        );
        res.json(users);
    } catch (err) {
        console.error('Error al obtener los usuarios:', err);
        res.status(500).json({ message: 'Error interno del servidor', error: err.message });
    }
};
const setUserState = async (req, res) => {
    try {
        const { id, state } = req.body;
        if (!id) {
            return res.status(400).json({ message: 'Falta id del usuario' });
        }
        // convertir state a boolean (acepta 'true'/'false', '1'/'0', boolean)
        const newState = state === true || state === 'true';

        const [updated] = await User.update(
            { state: newState },
            { where: { id_usuario: id } }
        );

        if (updated === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado o sin cambios' });
        }

        const updatedUser = await User.findOne({ where: { id_usuario: id } });
        res.json({ message: 'Estado actualizado', user: updatedUser });
    } catch (err) {
        console.error('Error actualizando estado de usuario:', err);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};
async function registerUser(req, res) {
    try {
        const { email, password, firstName, lastName } = req.body;
        if (!email || !password || !firstName || !lastName || password.length < 8) {
            return res.status(400).json({ message: 'Completa todos los campos. La contraseña debe tener al menos 8 caracteres.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            email: email.trim().toLowerCase(),
            password: hashedPassword,
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            state: true,
            isAdmin: email.trim().toLowerCase() === process.env.ADMIN_EMAIL?.trim().toLowerCase()
        });

        res.status(201).json({ id: user.id_usuario, email: user.email, firstName: user.firstName, lastName: user.lastName });

    } catch (err) {
        console.error('Error al obtener los usuarios:', err);
        if (err.name === 'SequelizeUniqueConstraintError') {
            return res.status(409).json({ message: 'Ya existe una cuenta con ese correo.' });
        }
        res.status(500).json({ message: 'Error interno del servidor', error: err.message });
    }
};
async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Correo y contraseña son obligatorios.' });

    // Buscar usuario solo por email
    const user = await User.findOne({ where: { email: email.trim().toLowerCase() } });

    if (!user) {
      return res.status(401).json({ message: "Credenciales inválidas" });
    }

    // Comparar contraseña encriptada
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Credenciales inválidas" });
    }

    if (user.state === false) {
            return res.status(403).json({ message: 'Usuario desactivado' });
    }

    res.json({
      id: user.id_usuario,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
    isAdmin: user.isAdmin,
    token: createAuthToken(user.id_usuario)
    });

  } catch (err) {
    console.error("Error al obtener los usuarios:", err);
    res.status(500).json({ message: "Error interno del servidor", err });
  }
};

module.exports = { getUser, registerUser, getUserByEmail, login , setUserState };

