# Gainracks

Aplicación web para planificar rutinas de gimnasio, registrar entrenamientos y seguir el progreso personal por ejercicio.

## Funciones principales

- Registro e inicio de sesión con contraseña cifrada y sesión Bearer firmada.
- Perfil de usuario con peso, altura y objetivo de entrenamiento.
- Catálogo de ejercicios en PostgreSQL, organizado por grupo muscular, con instrucciones y ejercicios personalizados.
- Creación de rutinas desde el catálogo o desde plantillas: PPL (empuje, tirón y piernas), Upper/Lower y Full Body.
- Registro del rendimiento por serie: repeticiones realizadas y peso utilizado, con referencia a sesiones anteriores.
- Historial y gráficos de volumen, repeticiones, peso máximo, 1RM estimado y calorías aproximadas.
- Panel de administración protegido por rol.

Las calorías se estiman con una intensidad de fuerza moderada de 5 MET, la duración de la sesión y el peso corporal. Si el perfil no tiene peso, se asumen 70 kg. Es una estimación orientativa, no una medición médica.

## Tecnologías

**Frontend**

- React 19 y JavaScript.
- Vite 8 para desarrollo y compilación.
- Recharts 3 para gráficos.
- Axios y Fetch API para peticiones HTTP.
- CSS responsive.
- ESLint 10.

**Backend y datos**

- Node.js y Express 5.
- PostgreSQL con Sequelize 6 y el driver `pg`.
- `bcrypt` para cifrar contraseñas.
- `dotenv` para la configuración local y `cors` para las peticiones del frontend.
- Módulo `crypto` de Node.js para firmar los tokens de sesión.

## Requisitos

- Node.js 20.19+ o 22.12+.
- npm.
- PostgreSQL 14 o superior.

## Puesta en marcha

### 1. Crear la base de datos

En PostgreSQL, crea la base de datos que usará la API:

```sql
CREATE DATABASE gainracksDB;
```

### 2. Configurar el backend

En PowerShell, desde la raíz del proyecto:

```powershell
Copy-Item backEnd/.env.example backEnd/.env
```

Edita `backEnd/.env` y configura al menos las credenciales de PostgreSQL, un `AUTH_SECRET` largo y aleatorio, y `ADMIN_EMAIL` con el correo que tendrá permisos de administrador.

Variables disponibles:

| Variable | Uso |
| --- | --- |
| `DB_HOST`, `DB_PORT` | Servidor y puerto de PostgreSQL |
| `DB_NAME`, `DB_USER`, `DB_PASSWORD` | Base de datos y credenciales |
| `DATABASE_URL` | URL alternativa de conexión; si está definida reemplaza las variables `DB_*` |
| `AUTH_SECRET` | Secreto para firmar tokens de sesión |
| `ADMIN_EMAIL` | Correo al que se asigna el rol de administrador |
| `FRONTEND_ORIGIN` | Origen permitido por CORS; por defecto `http://localhost:5173` |
| `PORT` | Puerto de la API; por defecto `3000` |

Instala dependencias e inicia la API:

```powershell
cd backEnd
npm install
npm run dev
```

La API sincroniza los modelos con PostgreSQL y carga el catálogo inicial de ejercicios al arrancar. La primera cuenta registrada con el correo de `ADMIN_EMAIL` recibe el rol admin. Si esa cuenta ya existe, reinicia la API después de configurar la variable.

### 3. Iniciar el frontend

En otra terminal, desde la raíz del proyecto:

```powershell
cd gainracks
npm install
npm run dev
```

Abre <http://localhost:5173/>. El frontend espera que la API esté disponible en <http://localhost:3000/>.

## Verificación

Desde `gainracks/`:

```powershell
npm run lint
npm run build
npm run preview
```

Desde `backEnd/`, `npm run start` inicia la API sin el modo de recarga automática de `npm run dev`.

## API principal

| Método | Ruta | Acceso | Descripción |
| --- | --- | --- | --- |
| `POST` | `/users/regist` | Público | Crea una cuenta; acepta peso, altura y objetivo opcionales |
| `POST` | `/users/login` | Público | Inicia sesión y devuelve el token Bearer |
| `GET` | `/api/exercises` | Público | Lista el catálogo de ejercicios |
| `GET` | `/api/exercises/:muscle` | Público | Lista ejercicios de un grupo muscular |
| `POST` | `/api/exercises/custom` | Autenticado | Agrega un ejercicio personalizado |
| `GET`, `PUT` | `/api/profile` | Autenticado | Consulta y actualiza el perfil |
| `GET`, `POST` | `/api/routines` | Autenticado | Consulta y guarda rutinas propias |
| `POST` | `/api/workouts` | Autenticado | Registra una sesión con datos por serie |
| `GET` | `/api/history` | Autenticado | Consulta el historial y las estimaciones de calorías |
| `GET` | `/api/admin/dashboard` | Administrador | Consulta el panel de administración |
| `PUT` | `/api/admin/users/state` | Administrador | Activa o desactiva una cuenta |

Las rutas autenticadas reciben `Authorization: Bearer <token>`. El rol admin se verifica en la base de datos, no en los datos enviados por el cliente.

## Persistencia

- `User`: credenciales cifradas, rol, estado y datos del perfil.
- `exercises`: catálogo, grupo muscular, instrucciones y ejercicios personalizados.
- `routines`: rutinas y ejercicios planificados del usuario, almacenados como JSONB.
- `workout_sessions`: duración, peso usado para la estimación y rendimiento real por serie, almacenados junto a la sesión.

El backend usa `sequelize.sync({ alter: true })` al iniciar. Para producción, conviene sustituir la sincronización automática por migraciones versionadas y hacer una copia de seguridad antes de modificar el esquema.

## Estructura

```text
.
├── backEnd/       # API Express, modelos y conexión PostgreSQL
├── gainracks/     # Aplicación React/Vite
└── README.md      # Guía general del proyecto
```
