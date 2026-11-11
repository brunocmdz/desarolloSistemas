# Gainracks API

## Puesta en marcha

1. Crea la base de datos PostgreSQL `gainracksDB` (el servidor crea las tablas al iniciar).
2. Copia `.env.example` a `.env` y configura usuario, contraseña y un `AUTH_SECRET` aleatorio.
3. Define `ADMIN_EMAIL` con el correo que tendrá permisos de administrador.
4. Ejecuta `npm install` y `npm run dev`.

La primera cuenta registrada con el correo indicado en `ADMIN_EMAIL` se crea como administradora. No existe una ruta pública para asignar ese rol. En producción, configura siempre `AUTH_SECRET`, `DATABASE_URL` o las variables `DB_*`, y `FRONTEND_ORIGIN`.

## Datos persistidos

- `User`: acceso, rol, estado y datos del perfil.
- `exercises`: catálogo por grupo muscular, con descripción, pasos de técnica y ejercicios personalizados del usuario; se completa al iniciar la API.
- `routines`: rutinas y ejercicios asociados al usuario propietario.
- `workout_sessions`: entrenamientos completados, duración, notas y repeticiones/peso real registrado en cada serie.

Al iniciar, Sequelize sincroniza los modelos con PostgreSQL y carga/actualiza el catálogo inicial de ejercicios. El catálogo se consulta en `GET /api/exercises`; el alta personalizada usa `POST /api/exercises/custom` y requiere autenticación. Las operaciones de perfil, rutinas e historial requieren el token Bearer devuelto por el login; el panel y la gestión de usuarios requieren además el rol de administrador.

El historial registra el rendimiento por serie y permite consultar volumen, repeticiones, peso máximo y 1RM estimado por ejercicio. El 1RM se estima con Epley y es orientativo.