# Ejemplos de Peticiones HTTP para Testing

Este archivo contiene ejemplos de peticiones HTTP para probar todos los endpoints de la API.

## 🔧 Usando curl (desde la terminal)

### 1. REGISTRAR UN NUEVO USUARIO

```bash
curl -X POST http://localhost:3000/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "test123",
    "email": "test@example.com"
  }'
```

### 2. INICIAR SESIÓN

```bash
curl -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "test123"
  }'
```

**Importante:** Guarda el token que recibes en la respuesta. Lo necesitarás para las siguientes peticiones.

Ejemplo de respuesta:
```json
{
  "mensaje": "Inicio de sesión exitoso",
  "usuario": {
    "id": 1,
    "username": "testuser",
    "email": "test@example.com"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcm5hbWUiOiJ0ZXN0dXNlciIsImlhdCI6MTcwODI4ODAwMCwiZXhwIjoxNzA4Mzc0NDAwfQ.XXXXX"
}
```

### 3. CREAR UNA NUEVA TAREA

Reemplaza `TU_TOKEN_AQUI` con el token que obtuviste al iniciar sesión.

```bash
curl -X POST http://localhost:3000/tareas \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TU_TOKEN_AQUI" \
  -d '{
    "titulo": "Completar proyecto de Node.js",
    "descripcion": "Terminar la API RESTful con autenticación JWT"
  }'
```

### 4. OBTENER TODAS LAS TAREAS

```bash
curl -X GET http://localhost:3000/tareas \
  -H "Authorization: Bearer TU_TOKEN_AQUI"
```

### 5. OBTENER UNA TAREA ESPECÍFICA

Reemplaza `1` con el ID de la tarea que deseas obtener.

```bash
curl -X GET http://localhost:3000/tareas/1 \
  -H "Authorization: Bearer TU_TOKEN_AQUI"
```

### 6. ACTUALIZAR UNA TAREA

Reemplaza `1` con el ID de la tarea que deseas actualizar.

```bash
curl -X PUT http://localhost:3000/tareas/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TU_TOKEN_AQUI" \
  -d '{
    "titulo": "Título actualizado",
    "descripcion": "Descripción actualizada",
    "completada": true
  }'
```

### 7. ELIMINAR UNA TAREA

Reemplaza `1` con el ID de la tarea que deseas eliminar.

```bash
curl -X DELETE http://localhost:3000/tareas/1 \
  -H "Authorization: Bearer TU_TOKEN_AQUI"
```

---

## 🧪 Usando Postman o Thunder Client

### Configuración de Headers para rutas protegidas:

```
Authorization: Bearer TU_TOKEN_AQUI
Content-Type: application/json
```

### 1. POST /register
- **URL:** `http://localhost:3000/register`
- **Método:** POST
- **Body (JSON):**
```json
{
  "username": "usuario1",
  "password": "password123",
  "email": "usuario1@example.com"
}
```

### 2. POST /login
- **URL:** `http://localhost:3000/login`
- **Método:** POST
- **Body (JSON):**
```json
{
  "username": "usuario1",
  "password": "password123"
}
```

### 3. POST /tareas
- **URL:** `http://localhost:3000/tareas`
- **Método:** POST
- **Headers:** `Authorization: Bearer <token>`
- **Body (JSON):**
```json
{
  "titulo": "Aprender Node.js",
  "descripcion": "Estudiar el Event Loop y operaciones asincrónicas"
}
```

### 4. GET /tareas
- **URL:** `http://localhost:3000/tareas`
- **Método:** GET
- **Headers:** `Authorization: Bearer <token>`

### 5. GET /tareas/:id
- **URL:** `http://localhost:3000/tareas/1`
- **Método:** GET
- **Headers:** `Authorization: Bearer <token>`

### 6. PUT /tareas/:id
- **URL:** `http://localhost:3000/tareas/1`
- **Método:** PUT
- **Headers:** `Authorization: Bearer <token>`
- **Body (JSON):**
```json
{
  "titulo": "Aprender Node.js - Completado",
  "descripcion": "Ya domino el Event Loop!",
  "completada": true
}
```

### 7. DELETE /tareas/:id
- **URL:** `http://localhost:3000/tareas/1`
- **Método:** DELETE
- **Headers:** `Authorization: Bearer <token>`

---

## 🔍 Casos de Error a Probar

### Error 401 - No autenticado (sin token)
```bash
curl -X GET http://localhost:3000/tareas
```

### Error 403 - Token inválido
```bash
curl -X GET http://localhost:3000/tareas \
  -H "Authorization: Bearer token_invalido"
```

### Error 404 - Tarea no encontrada
```bash
curl -X GET http://localhost:3000/tareas/9999 \
  -H "Authorization: Bearer TU_TOKEN_AQUI"
```

### Error 400 - Datos incompletos al crear tarea
```bash
curl -X POST http://localhost:3000/tareas \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TU_TOKEN_AQUI" \
  -d '{
    "descripcion": "Tarea sin título"
  }'
```

### Error 409 - Usuario ya existe
```bash
# Primero registrar un usuario
curl -X POST http://localhost:3000/register \
  -H "Content-Type: application/json" \
  -d '{"username": "duplicado", "password": "123456"}'

# Intentar registrarlo de nuevo (debe dar error 409)
curl -X POST http://localhost:3000/register \
  -H "Content-Type: application/json" \
  -d '{"username": "duplicado", "password": "123456"}'
```

---

## 💡 Tips para Testing

1. **Guardar el token en una variable (Bash/Zsh):**
```bash
TOKEN=$(curl -s -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"test123"}' \
  | grep -o '"token":"[^"]*' | cut -d'"' -f4)

echo $TOKEN
```

2. **Usar el token guardado en peticiones:**
```bash
curl -X GET http://localhost:3000/tareas \
  -H "Authorization: Bearer $TOKEN"
```

3. **Ver la respuesta formateada (requiere jq):**
```bash
curl -X GET http://localhost:3000/tareas \
  -H "Authorization: Bearer $TOKEN" | jq
```
