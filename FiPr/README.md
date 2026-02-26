# TaskManager Pro – Proyecto Final Integrador

Aplicación Full Stack profesional de gestión de tareas con autenticación JWT, autorización por roles, CRUD completo y pruebas automatizadas.

---

## Estructura del Repositorio

```
FiPr/
├── backend/          # API REST Node.js + Express + MongoDB
├── frontend/         # SPA React + Vite
└── database-model/   # Esquemas MongoDB + Diagrama ER
```

---

## Tecnologías

| Capa         | Tecnología                          |
|--------------|-------------------------------------|
| Frontend     | React 18, Vite, React Router v6     |
| Backend      | Node.js, Express 4                  |
| Base de datos| MongoDB + Mongoose                  |
| Autenticación| JWT (jsonwebtoken) + bcryptjs       |
| Validación   | express-validator                   |
| Pruebas      | Jest + Supertest + mongodb-memory-server |
| HTTP Client  | Axios                               |

---

## Instalación y Ejecución

### Requisitos previos
- Node.js v18+
- MongoDB local **o** cuenta de MongoDB Atlas (gratuita)

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env
# Editar .env con tu MONGO_URI y JWT_SECRET
npm run dev          # Inicia en http://localhost:3000
```

**Opcional – poblar datos de ejemplo:**
```bash
node seed.js
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev          # Inicia en http://localhost:5173
```

### 3. Pruebas automatizadas

```bash
cd backend
npm test             # Corre las 20 pruebas Jest
npm run test:coverage  # Con reporte de cobertura
```

---

## Credenciales de prueba (tras ejecutar seed.js)

| Rol   | Email                        | Contraseña  |
|-------|------------------------------|-------------|
| Admin | admin@taskmanager.com        | admin1234   |
| User  | user@taskmanager.com         | user1234    |

---

## Endpoints de la API

### Autenticación
| Método | Ruta                            | Acceso      | Descripción              |
|--------|---------------------------------|-------------|--------------------------|
| POST   | `/api/auth/register`            | Público     | Registrar usuario        |
| POST   | `/api/auth/login`               | Público     | Iniciar sesión           |
| GET    | `/api/auth/me`                  | Privado     | Perfil del usuario       |
| GET    | `/api/auth/users`               | Admin       | Listar todos los usuarios|
| PATCH  | `/api/auth/users/:id/role`      | Admin       | Cambiar rol de usuario   |

### Tareas
| Método | Ruta                            | Acceso      | Descripción              |
|--------|---------------------------------|-------------|--------------------------|
| GET    | `/api/tasks`                    | Privado     | Listar (paginación + filtros) |
| GET    | `/api/tasks/stats`              | Admin       | Estadísticas globales    |
| GET    | `/api/tasks/:id`                | Privado     | Obtener tarea por ID     |
| POST   | `/api/tasks`                    | Privado     | Crear tarea              |
| PUT    | `/api/tasks/:id`                | Privado     | Actualizar tarea         |
| DELETE | `/api/tasks/:id`                | Privado     | Eliminar tarea           |
| PATCH  | `/api/tasks/:id/status`         | Privado     | Cambiar estado           |

**Filtros disponibles en `GET /api/tasks`:**
```
?page=1&limit=6&status=pending&priority=high&search=texto&sortBy=createdAt&sortOrder=desc
```

---

## Funcionalidades del Frontend

- Pantalla de Login y Registro
- Dashboard con estadísticas en tiempo real
- Listado de tareas con paginación (6 por página)
- Filtros: estado, prioridad, búsqueda por texto
- Crear, editar y eliminar tareas
- Vista de detalle con cambio de estado rápido
- Panel administrativo (solo admin): gestión de usuarios, cambio de roles
- Control visual por rol (menú Admin solo visible para admins)
- JWT almacenado y verificado automáticamente
- Rutas protegidas con React Router

---

## Pruebas Automatizadas (20 pruebas)

### auth.test.js (10 pruebas)
1. Registro exitoso devuelve 201 y token JWT
2. Registro con email duplicado devuelve 409
3. Registro con datos inválidos devuelve 422 (validación fallida)
4. Login exitoso devuelve 200, token y datos del usuario
5. Login con contraseña incorrecta devuelve 401
6. Login con email no registrado devuelve 401
7. Acceso permitido a /api/auth/me con token válido
8. Acceso denegado a /api/auth/me sin token (401)
9. Acceso denegado por rol insuficiente (403)
10. Admin puede acceder a /api/auth/users

### tasks.test.js (10 pruebas)
1. Crear tarea exitosamente devuelve 201
2. Crear tarea con datos inválidos devuelve 422
3. Listar tareas devuelve paginación correcta
4. Filtrar tareas por status devuelve solo las correctas
5. Obtener tarea por ID devuelve datos completos
6. Actualizar tarea (PUT) cambia los campos correctamente
7. Cambiar estado via PATCH /status
8. Eliminar tarea devuelve 200 y ya no existe (404)
9. Usuario no puede ver tarea ajena (403)
10. Admin puede ver tareas de todos los usuarios
