const User = require('../model/user');

const isAuth = async (req, res, next) => {
  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    return res.status(401).json({ message: 'No existe id' });
  }

  try {
    const user = await User.findByPk(authHeader);
    if (!user) {
      return res.status(403).json({ message: 'Usuario no válido' });
    }
    // adjuntar usuario a la request para middlewares posteriores
    req.user = user;
    next();
  } catch (err) {
    console.error('Error en isAuth:', err);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};

const isAdmin = (req, res, next) => {
  const user = req.user;
  if (user && user.isAdmin) {
    next();
  } else {
    res.status(401).send('No es admin');
  }
};

module.exports = { isAuth, isAdmin };
