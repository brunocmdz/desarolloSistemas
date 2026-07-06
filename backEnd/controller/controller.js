const User = require('../model/user');
const { Op } = require('sequelize');
const bcrypt = require('bcrypt');

const getUser = async(_req, res) => {
    try {
        const users = await User.findAll();
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
            where : {email}
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
        const { id, state } = req.query;
        if (!id) {
            return res.status(400).json({ message: 'Falta id del usuario' });
        }
        // convertir state a boolean (acepta 'true'/'false', '1'/'0', boolean)
        const newState = (state === true);

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
        const { email, password, firstName, lastName } = req.query;

        // Encriptar la contraseña antes de guardar
        const hashedPassword = await bcrypt.hash(password, 10);

        const users = await User.create({
            email,
            password: hashedPassword,  // ← ya encriptada
            firstName,
            lastName,
            state: true
        });

        res.json(users);

    } catch (err) {
        console.error('Error al obtener los usuarios:', err);
        res.status(500).json({ message: 'Error interno del servidor', error: err.message });
    }
};
async function login(req, res) {
  try {
    const { email, password } = req.query;

    // Buscar usuario solo por email
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(401).json({ message: "Credenciales inválidas" });
    }

    // Comparar contraseña encriptada
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Credenciales inválidas" });
    }

    // impedir login si el usuario está desactivado
    if (user.state === false || user.state === 'false' || user.state === 0) {
        return res.status(403).json({ message: 'Usuario desactivado' });
    }
    // impedir login si el usuario está desactivado
    if (user.state === false) {
            return res.status(403).json({ message: 'Usuario desactivado' });
    }

    res.json({
      id: user.id_usuario,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      isAdmin: user.isAdmin
    });

  } catch (err) {
    console.error("Error al obtener los usuarios:", err);
    res.status(500).json({ message: "Error interno del servidor", err });
  }
};

module.exports = { getUser, registerUser, getUserByEmail, login , setUserState };

