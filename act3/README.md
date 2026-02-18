# API RESTful de Gestión de Tareas

API desarrollada con Node.js y Express.js para gestionar una lista de tareas con sistema de autenticación JWT.

## 🚀 Características

- **CRUD completo** de tareas (Crear, Leer, Actualizar, Eliminar)
- **Autenticación JWT** con tokens
- **Encriptación de contraseñas** con bcryptjs
- **Almacenamiento en archivos JSON** usando fs.promises
- **Middleware personalizado** para manejo de errores
- **Rutas protegidas** que requieren autenticación
- **Operaciones asincrónicas** para evitar bloqueo del Event Loop

## 📋 Requisitos Previos

- Node.js (v14 o superior)
- npm (v6 o superior)

## 🔧 Instalación

1. Instalar dependencias:
```bash
npm install
```

## ▶️ Ejecución

### Modo normal:
```bash
npm start
```

### Modo debugging (con inspector de Node.js):
```bash
npm run dev
```

El servidor se ejecutará en `http://localhost:3000`

## 📚 Endpoints de la API

### Autenticación (públicos)

#### Registrar nuevo usuario
```http
POST /register
Content-Type: application/json

{
  "username": "usuario123",
  "password": "password123",
  "email": "usuario@example.com"
}
```

#### Iniciar sesión
```http
POST /login
Content-Type: application/json

{
  "username": "usuario123",
  "password": "password123"
}
```

Respuesta incluye un token JWT:
```json
{
  "mensaje": "Inicio de sesión exitoso",
  "usuario": { "id": 1, "username": "usuario123" },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Tareas (requieren autenticación)

**Nota:** Todas las rutas de tareas requieren el header `Authorization` con el token:
```
Authorization: Bearer <tu_token_jwt>
```

#### Obtener todas las tareas
```http
GET /tareas
Authorization: Bearer <token>
```

#### Obtener una tarea específica
```http
GET /tareas/:id
Authorization: Bearer <token>
```

#### Crear nueva tarea
```http
POST /tareas
Authorization: Bearer <token>
Content-Type: application/json

{
  "titulo": "Completar proyecto",
  "descripcion": "Finalizar la API RESTful de tareas"
}
```

#### Actualizar tarea
```http
PUT /tareas/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "titulo": "Título actualizado",
  "descripcion": "Descripción actualizada",
  "completada": true
}
```

#### Eliminar tarea
```http
DELETE /tareas/:id
Authorization: Bearer <token>
```

## 🏗️ Estructura del Proyecto

```
act3/
├── server.js                  # Archivo principal del servidor
├── package.json               # Configuración y dependencias
├── tareas.json                # Almacenamiento de tareas
├── usuarios.json              # Almacenamiento de usuarios
├── middleware/
│   ├── autenticacion.js      # Middleware de autenticación JWT
│   └── errores.js            # Middleware de manejo de errores
└── routes/
    ├── auth.js               # Rutas de autenticación
    └── tareas.js             # Rutas CRUD de tareas
```

## 🔒 Seguridad

- Las contraseñas se encriptan usando **bcryptjs** con salt rounds
- Los tokens JWT expiran en **24 horas**
- Cada usuario solo puede ver y modificar **sus propias tareas**
- Validación de datos en todas las rutas

## 🐛 Debugging

Para depurar la aplicación con Chrome DevTools:

1. Ejecutar en modo debug:
```bash
npm run dev
```

2. Abrir Chrome e ir a: `chrome://inspect`

3. Click en "inspect" bajo el proceso de Node.js

## 📝 Códigos de Estado HTTP

| Código | Significado |
|--------|-------------|
| 200 | Operación exitosa |
| 201 | Recurso creado exitosamente |
| 400 | Solicitud incorrecta (datos inválidos) |
| 401 | No autenticado (token faltante o inválido) |
| 403 | Prohibido (token inválido) |
| 404 | Recurso no encontrado |
| 409 | Conflicto (usuario ya existe) |
| 500 | Error interno del servidor |

## 🧪 Ejemplo de Uso Completo

1. **Registrar usuario:**
```bash
curl -X POST http://localhost:3000/register \
  -H "Content-Type: application/json" \
  -d '{"username":"juan","password":"123456"}'
```

2. **Iniciar sesión y obtener token:**
```bash
curl -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -d '{"username":"juan","password":"123456"}'
```

3. **Crear tarea (usar el token obtenido):**
```bash
curl -X POST http://localhost:3000/tareas \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TU_TOKEN_AQUI" \
  -d '{"titulo":"Mi primera tarea","descripcion":"Descripción de prueba"}'
```

4. **Obtener todas las tareas:**
```bash
curl http://localhost:3000/tareas \
  -H "Authorization: Bearer TU_TOKEN_AQUI"
```

## 📖 Conceptos Implementados

- **Event Loop:** Operaciones asincrónicas con fs.promises
- **Middleware:** Autenticación y manejo de errores
- **Express.js:** Rutas y gestión de peticiones/respuestas
- **Asincronía:** async/await en todas las operaciones de I/O
- **JWT:** Autenticación basada en tokens
- **Bcrypt:** Encriptación de contraseñas
- **Error Handling:** Manejo centralizado de errores

## 👨‍💻 Autor

Desarrollado como actividad práctica de Node.js y Express.js

## 📄 Licencia

ISC
