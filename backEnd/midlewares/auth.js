const User = require('../model/user');
const crypto = require('crypto');

const AUTH_SECRET = process.env.AUTH_SECRET || (process.env.NODE_ENV === 'production' ? '' : 'gainracks-local-development-secret-change-me');
if (!AUTH_SECRET) throw new Error('AUTH_SECRET es obligatorio en producción.');

const createAuthToken = (userId) => {
  const expiresAt = Date.now() + 12 * 60 * 60 * 1000;
  const payload = `${userId}.${expiresAt}`;
  const signature = crypto.createHmac('sha256', AUTH_SECRET).update(payload).digest('hex');
  return `${payload}.${signature}`;
};

const verifyAuthToken = (token) => {
  const [userId, expiresAt, signature] = (token || '').split('.');
  if (!userId || !expiresAt || !signature || Number(expiresAt) <= Date.now()) return null;

  const payload = `${userId}.${expiresAt}`;
  const expected = crypto.createHmac('sha256', AUTH_SECRET).update(payload).digest('hex');
  const receivedBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (receivedBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(receivedBuffer, expectedBuffer)) return null;

  return /^\d+$/.test(userId) ? Number(userId) : null;
};

const isAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
  const userId = verifyAuthToken(token);

  if (!userId) {
    return res.status(401).json({ message: 'Sesión no válida o expirada' });
  }

  try {
    const user = await User.findByPk(userId);
    if (!user || !user.state) {
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

module.exports = { isAuth, isAdmin, createAuthToken };
