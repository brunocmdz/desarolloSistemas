const User = require('../model/user');
const Template = require('../model/templates');
const Record = require('../model/record');
const Notification = require('../model/notifications');
const { Op } = require('sequelize');
const bcrypt = require('bcrypt');

const notification = async (req, res) => {
    try {
        const { userId, title, message } = req.body;
        
        // Validar campos requeridos
        if (!title || !message) {
            return res.status(400).json({ message: 'Título y mensaje son requeridos' });
        }
        
        const newNotification = await Notification.create({
            title,
            message,
            idUsuario: userId || null,
            allUsers: userId ? false : true
        });
        
        res.status(201).json({ 
            message: 'Notificación creada exitosamente',
            notification: newNotification 
        });
    } catch (err) {
        console.error('Error al crear la notificación:', err);
        res.status(500).json({ message: 'Error interno del servidor', error: err.message });
    }
};
const getNotifications = async(req, res) => {
    try {
        const userId = req.headers.authorization;
        
        // Traer notificaciones del usuario actual o notificaciones para todos
        const notifications = await Notification.findAll({
            where: {
                [Op.or]: [
                    { idUsuario: userId },
                    { allUsers: true }
                ]
            }
        });
        res.json(notifications);
    } catch (err) {
        console.error('Error al obtener las notificaciones:', err);
        res.status(500).json({ message: 'Error interno del servidor', error: err.message });
    }
}
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

const fixFile = async (req, res) => {
    try {
        // Extraer los datos del cuerpo de la petición
        const { userId, fileName, fileContent, templateId } = req.body;

        // Validar que todos los campos requeridos estén presentes
        if (!userId || !fileName || !fileContent || !templateId) {
            return res.status(400).json({ 
                message: 'Faltan campos requeridos: userId, fileName, fileContent, templateId',
                received: { userId: !!userId, fileName: !!fileName, fileContent: !!fileContent, templateId: !!templateId }
            });
        }

        // Buscar la plantilla seleccionada en la base de datos
        const template = await Template.findOne({ where: { idPlantilla: templateId } });
        if (!template) {
            return res.status(404).json({ message: 'Plantilla no encontrada' });
        }

        // Obtener el contenido de la plantilla
        const templateContent = template.content;
        
        // Extraer las palabras fijas del template (sin las 'x') para identificar qué palabras ignorar
        // Ejemplo: si template = "tipo°°de°°xxxx", palabras = ['tipo', 'de']
        const templateWords = templateContent
            .replace(/x+/gi, '') // Eliminar todas las secuencias de 'x' (mayúsculas o minúsculas)
            .replace(/[°\/\_<>=]/g, ' ') // Reemplazar separadores especiales por espacios
            .split(/\s+/) // Dividir por espacios en blanco
            .filter(w => w.trim().length > 0) // Filtrar palabras vacías
            .map(w => w.toLowerCase()); // Convertir a minúsculas para comparación
        
        // Extraer todas las palabras del archivo subido por el usuario
        const fileWords = fileContent
            .replace(/[°\/\_<>=]/g, ' ') // Reemplazar separadores por espacios
            .split(/\s+/) // Dividir por espacios
            .filter(w => w.trim().length > 0); // Filtrar palabras vacías
        
        // Filtrar solo las palabras nuevas (valores) que NO están en el template
        // Estas son las palabras que reemplazarán las 'x' del template
        const newValues = fileWords.filter(word => 
            !templateWords.includes(word.toLowerCase())
        );
        
        // Inicializar el resultado con el contenido del template
        let result = templateContent;
        let valueIndex = 0; // Índice para recorrer los valores nuevos

        // Reemplazar cada secuencia de 'x' con el siguiente valor nuevo
        // Regex /x+/gi busca una o más 'x' consecutivas (mayúsculas o minúsculas)
        result = result.replace(/x+/gi, (match) => {
            if (valueIndex < newValues.length) {
                // Tomar el siguiente valor y avanzar el índice
                const value = newValues[valueIndex];
                valueIndex++;
                return value;
            }
            return match; // Si no hay más valores, dejar las 'x' como están
        });

        // Guardar el resultado procesado en la tabla Record
        const record = await Record.create({
            name: fileName,
            content: result, // Guardar el template con las 'x' reemplazadas
            userId: userId
        });

        // Responder con éxito
        res.status(201).json({ 
            message: 'Archivo procesado exitosamente',
            record: record,
            templateUsed: template.nameTemplate
        });
    } catch (err) {
        console.error('Error al procesar archivo:', err);
        res.status(500).json({ message: 'Error interno del servidor', error: err.message });
    }
};

const getTemplates = async(_req, res) => {
    try {
        const templates = await Template.findAll();
        res.json(templates);
    } catch (err) {
        console.error('Error al obtener las plantillas:', err);
        res.status(500).json({ message: 'Error interno del servidor', error: err.message });
    }
};

const uploadTemplate = async (req, res) => {
    try {
        const { nameTemplate, versionTemplate, content } = req.body || {};

        let finalContent = content;
        if (!finalContent && req.file && req.file.buffer) {
            finalContent = req.file.buffer.toString('utf8');
        }
        if (!finalContent) {
            return res.status(400).json({ message: 'Falta contenido de la plantilla (campo content) o archivo .txt' });
        }
        const tpl = await Template.create({ content: finalContent, versionTemplate, nameTemplate });
        
        // Crear notificación para todos los usuarios
        await Notification.create({
            title: 'Nueva plantilla',
            message: `Se ha subido una nueva plantilla: ${nameTemplate || 'Sin nombre'}`,
            allUsers: true
        });
        
        res.json(tpl);
    } catch (err) {
        console.error('Error subiendo la plantilla:', err);
        res.status(500).json({ message: 'Error interno del servidor', error: err.message });
    }
};

const deleteTemplate = async (req, res) => {
    try {
        const id = req.params.id;
        if (!id) return res.status(400).json({ message: 'Falta id de plantilla' });
        
        // Obtener info de la plantilla antes de borrarla
        const template = await Template.findOne({ where: { idPlantilla: id } });
        
        const deleted = await Template.destroy({ where: { idPlantilla: id } });
        if (deleted === 0) return res.status(404).json({ message: 'Plantilla no encontrada' });
        
        // Crear notificación para todos los usuarios
        await Notification.create({
            title: 'Plantilla eliminada',
            message: `Se ha eliminado la plantilla: ${template?.nameTemplate || 'ID ' + id}`,
            allUsers: true
        });
        
        res.json({ message: 'Plantilla eliminada', id });
    } catch (err) {
        console.error('Error eliminando plantilla:', err);
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

const getRecords = async (req, res) => {
    try {
        const userId = req.headers.authorization;
        
        if (!userId) {
            return res.status(401).json({ message: 'No autorizado' });
        }

        const records = await Record.findAll({
            where: { userId },
            order: [['createdAt', 'DESC']]
        });
        
        res.json(records);
    } catch (err) {
        console.error('Error al obtener records:', err);
        res.status(500).json({ message: 'Error interno del servidor', error: err.message });
    }
};

module.exports = { notification, getNotifications, getUser, registerUser, getUserByEmail, login, editUser, setUserState, getTemplates, uploadTemplate, deleteTemplate, fixFile, getRecords };

