# 📚 Conceptos Clave Implementados

Este documento explica los conceptos fundamentales de Node.js y Express.js aplicados en este proyecto.

## 🔄 Event Loop y Asincronía

### ¿Qué es el Event Loop?
El Event Loop es el mecanismo que permite a Node.js realizar operaciones no bloqueantes a pesar de que JavaScript es single-threaded.

### Implementación en el Proyecto
```javascript
// ❌ FORMA SÍNCRONA (Bloqueante - NO USAR)
const data = fs.readFileSync('tareas.json', 'utf8');

// ✅ FORMA ASÍNCRONA (No bloqueante - USAR)
const data = await fs.readFile('tareas.json', 'utf8');
```

**Ubicación:** Todos los archivos en `routes/` usan `fs.promises` para operaciones asincrónicas.

### Ventajas
- No bloquea el Event Loop
- Permite manejar múltiples peticiones simultáneamente
- Mejor rendimiento y escalabilidad

---

## 🛣️ Middleware en Express

### ¿Qué es un Middleware?
Una función que tiene acceso a los objetos `request`, `response` y la función `next()`.

### Tipos Implementados

#### 1. Middleware Global
```javascript
// server.js - Línea 16
app.use(express.json());
app.use(bodyParser.json());
```
**Propósito:** Parsear el body de las peticiones JSON.

#### 2. Middleware de Logging
```javascript
// server.js - Línea 21
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});
```
**Propósito:** Registrar todas las peticiones para debugging.

#### 3. Middleware de Autenticación
```javascript
// middleware/autenticacion.js
function autenticarToken(req, res, next) {
  const token = req.headers['authorization'];
  if (!token) return res.status(401).json({ error: 'Acceso denegado' });
  
  const decoded = jwt.verify(tokenLimpio, JWT_SECRET);
  req.user = decoded;
  next();
}
```
**Propósito:** Verificar tokens JWT antes de acceder a rutas protegidas.
**Uso:** `app.get('/tareas', autenticarToken, async (req, res) => {...})`

#### 4. Middleware de Manejo de Errores
```javascript
// middleware/errores.js
function manejarErrores(err, req, res, next) {
  console.error('Error:', err.message);
  res.status(statusCode).json({ error: true, mensaje });
}
```
**Propósito:** Capturar y manejar todos los errores de forma centralizada.
**Nota:** Debe ser el **último** middleware registrado.

---

## 🔐 Autenticación con JWT

### ¿Qué es JWT?
JSON Web Token - un estándar para transmitir información de forma segura entre partes.

### Flujo de Autenticación

```
1. Usuario se registra/inicia sesión
   ↓
2. Servidor verifica credenciales
   ↓
3. Servidor genera JWT con datos del usuario
   ↓
4. Cliente recibe y guarda el token
   ↓
5. Cliente incluye token en headers de peticiones futuras
   ↓
6. Middleware verifica token antes de cada petición protegida
```

### Implementación

#### Generar Token (al login/register)
```javascript
// routes/auth.js - Línea 56 y 128
const token = jwt.sign(
  { id: usuario.id, username: usuario.username },
  JWT_SECRET,
  { expiresIn: '24h' }
);
```

#### Verificar Token (en cada petición protegida)
```javascript
// middleware/autenticacion.js - Línea 24
const decoded = jwt.verify(tokenLimpio, JWT_SECRET);
req.user = decoded; // Disponible en la ruta
```

---

## 🔒 Encriptación con bcryptjs

### ¿Por qué encriptar contraseñas?
**Nunca** se deben guardar contraseñas en texto plano. bcryptjs usa hashing con salt.

### Proceso de Registro
```javascript
// routes/auth.js - Línea 44
const salt = await bcrypt.genSalt(10);
const passwordHash = await bcrypt.hash(password, salt);
```

### Proceso de Login
```javascript
// routes/auth.js - Línea 107
const passwordValido = await bcrypt.compare(password, usuario.password);
```

**Ejemplo:**
- Contraseña original: `"password123"`
- Hash almacenado: `"$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy"`

---

## 📁 Manejo de Archivos con fs.promises

### ¿Por qué fs.promises?
Permite usar async/await en lugar de callbacks, haciendo el código más legible.

### Operaciones Implementadas

#### Leer Archivo
```javascript
// routes/tareas.js - Línea 12
async function obtenerTareas() {
  const data = await fs.readFile(tareasPath, 'utf8');
  return JSON.parse(data);
}
```

#### Escribir Archivo
```javascript
// routes/tareas.js - Línea 24
async function guardarTareas(tareas) {
  await fs.writeFile(tareasPath, JSON.stringify(tareas, null, 2), 'utf8');
}
```

#### Manejo de Errores (archivo no existe)
```javascript
try {
  const data = await fs.readFile(tareasPath, 'utf8');
  return JSON.parse(data);
} catch (error) {
  if (error.code === 'ENOENT') {
    return []; // Retornar array vacío si no existe
  }
  throw error; // Re-lanzar otros errores
}
```

---

## 🌐 Rutas RESTful

### Principios REST
- **GET** - Obtener recursos
- **POST** - Crear recursos
- **PUT** - Actualizar recursos completos
- **PATCH** - Actualizar recursos parciales
- **DELETE** - Eliminar recursos

### Implementación en el Proyecto

| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| POST | /register | Registrar usuario | ❌ |
| POST | /login | Iniciar sesión | ❌ |
| GET | /tareas | Listar todas las tareas | ✅ |
| GET | /tareas/:id | Obtener una tarea | ✅ |
| POST | /tareas | Crear tarea | ✅ |
| PUT | /tareas/:id | Actualizar tarea | ✅ |
| DELETE | /tareas/:id | Eliminar tarea | ✅ |

---

## ⚠️ Manejo de Errores

### Estrategia de 3 Niveles

#### Nivel 1: Validación en Rutas
```javascript
// routes/tareas.js - Línea 66
if (!titulo) {
  return res.status(400).json({ 
    error: 'Datos incompletos',
    mensaje: 'El título es obligatorio' 
  });
}
```

#### Nivel 2: Try-Catch en Operaciones Asíncronas
```javascript
// routes/tareas.js - Línea 31
try {
  const tareas = await obtenerTareas();
  res.status(200).json({ tareas });
} catch (error) {
  next(error); // Pasar al middleware de errores
}
```

#### Nivel 3: Middleware Centralizado
```javascript
// middleware/errores.js
function manejarErrores(err, req, res, next) {
  console.error('Error:', err.message);
  res.status(statusCode).json({ error: true, mensaje });
}
```

### Códigos de Estado HTTP Implementados

- **200** OK - Operación exitosa
- **201** Created - Recurso creado
- **400** Bad Request - Datos inválidos
- **401** Unauthorized - Token faltante
- **403** Forbidden - Token inválido
- **404** Not Found - Recurso no encontrado
- **409** Conflict - Recurso duplicado
- **500** Internal Server Error - Error del servidor

---

## 🐛 Debugging

### Herramientas Implementadas

#### 1. Console.log Estratégico
```javascript
// middleware/errores.js - Línea 8
console.error('=== ERROR CAPTURADO ===');
console.error('Ruta:', req.method, req.path);
console.error('Error:', err.message);
console.error('Stack:', err.stack);
```

#### 2. Node.js Inspector (--inspect)
```bash
npm run dev  # Ejecuta: node --inspect server.js
```

Luego abrir Chrome en: `chrome://inspect`

#### 3. Logging de Peticiones
```javascript
// server.js - Línea 21
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});
```

---

## 🏗️ Arquitectura del Proyecto

```
Petición HTTP
    ↓
Middleware Global (express.json, logging)
    ↓
Rutas Específicas (routes/*)
    ↓
Middleware de Autenticación (si aplica)
    ↓
Controladores de Ruta (async functions)
    ↓
Operaciones con fs.promises
    ↓
Respuesta JSON
    ↓
Middleware de Errores (si hay error)
```

### Separación de Responsabilidades

- **server.js** - Configuración y orchestración
- **routes/** - Definición de endpoints y lógica de negocio
- **middleware/** - Funciones reutilizables (auth, errores)
- **\*.json** - Persistencia de datos

---

## 💡 Mejores Prácticas Aplicadas

✅ **Asincronía:** Todas las operaciones I/O usan async/await
✅ **Seguridad:** Contraseñas encriptadas, tokens JWT
✅ **Validación:** Datos validados antes de procesarse
✅ **Manejo de Errores:** Centralizado y estructurado
✅ **Separación de Concerns:** Middleware, rutas y lógica separados
✅ **RESTful:** Verbos HTTP correctos y rutas semánticas
✅ **Logging:** Peticiones y errores registrados
✅ **Documentación:** README, TESTING y QUICKSTART

---

## 🚀 Próximos Pasos (Mejoras Posibles)

1. **Base de datos:** Migrar de JSON a MongoDB/PostgreSQL
2. **Variables de entorno:** Usar dotenv para JWT_SECRET
3. **Validación:** Implementar librería como Joi o express-validator
4. **Tests:** Agregar tests unitarios e integración (Jest, Mocha)
5. **Rate Limiting:** Prevenir ataques de fuerza bruta
6. **CORS:** Configurar para permitir frontend
7. **Swagger:** Documentación automática de API
8. **Refresh Tokens:** Mejorar sistema de autenticación
