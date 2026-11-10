# Gainracks API

## Puesta en marcha

1. Crea la base de datos PostgreSQL `gainracksDB` (el servidor crea las tablas al iniciar).
2. Copia `.env.example` a `.env` y configura usuario, contraseña y un `AUTH_SECRET` aleatorio.
3. Define `ADMIN_EMAIL` con el correo que tendrá permisos de administrador.
4. Ejecuta `npm install` y `npm run dev`.

La primera cuenta registrada con el correo indicado en `ADMIN_EMAIL` se crea como administradora. No existe una ruta pública para asignar ese rol. En producción, configura siempre `AUTH_SECRET`, `DATABASE_URL` o las variables `DB_*`, y `FRONTEND_ORIGIN`.

## Datos persistidos

- `User`: acceso, rol, estado y datos del perfil.
- `exercises`: catálogo de movimientos por grupo muscular; se completa al iniciar la API.
- `routines`: rutinas y ejercicios asociados al usuario propietario.
- `workout_sessions`: entrenamientos completados, duración, notas y repeticiones/peso real registrado en cada serie.

Al iniciar, Sequelize sincroniza los modelos con PostgreSQL y carga/actualiza el catálogo inicial de ejercicios. Las operaciones de perfil, rutinas e historial requieren el token Bearer devuelto por el login; el panel y la gestión de usuarios requieren además el rol de administrador.