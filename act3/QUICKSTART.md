# 🚀 Guía Rápida de Inicio

## Paso 1: Iniciar el Servidor

```bash
cd act3
npm start
```

O en modo debugging:
```bash
npm run dev
```

Verás un mensaje como:
```
==================================================
🚀 Servidor corriendo en el puerto 3000
📡 URL: http://localhost:3000
==================================================
```

## Paso 2: Probar la API (Abre otra terminal)

### 1️⃣ Registrar un usuario
```bash
curl -X POST http://localhost:3000/register \
  -H "Content-Type: application/json" \
  -d '{"username":"juan","password":"123456"}'
```

### 2️⃣ Iniciar sesión y guardar el token
```bash
curl -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -d '{"username":"juan","password":"123456"}'
```

**Copia el token de la respuesta** (lo necesitarás para los siguientes pasos)

### 3️⃣ Crear una tarea (reemplaza TU_TOKEN con el token real)
```bash
curl -X POST http://localhost:3000/tareas \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TU_TOKEN" \
  -d '{"titulo":"Mi primera tarea","descripcion":"Aprender Node.js"}'
```

### 4️⃣ Obtener todas las tareas
```bash
curl -X GET http://localhost:3000/tareas \
  -H "Authorization: Bearer TU_TOKEN"
```

### 5️⃣ Actualizar una tarea (ID = 1)
```bash
curl -X PUT http://localhost:3000/tareas/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TU_TOKEN" \
  -d '{"titulo":"Tarea actualizada","completada":true}'
```

### 6️⃣ Eliminar una tarea (ID = 1)
```bash
curl -X DELETE http://localhost:3000/tareas/1 \
  -H "Authorization: Bearer TU_TOKEN"
```

## 📝 Notas Importantes

- El servidor debe estar corriendo en una terminal
- Usa otra terminal para ejecutar los comandos curl
- Guarda el token que recibes al hacer login
- Reemplaza `TU_TOKEN` con tu token real en cada petición
- Para detener el servidor, presiona `Ctrl + C`

## 🔧 Comandos Útiles

### Script automatizado (guarda el token automáticamente)
```bash
# Registrar y hacer login en un comando
TOKEN=$(curl -s -X POST http://localhost:3000/register \
  -H "Content-Type: application/json" \
  -d '{"username":"auto","password":"123456"}' \
  | grep -o '"token":"[^"]*' | grep -o '[^"]*$')

echo "Token guardado: $TOKEN"

# Ahora puedes usar $TOKEN en tus peticiones
curl -X POST http://localhost:3000/tareas \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"titulo":"Tarea automática","descripcion":"Creada con script"}'
```

## 📊 Ver los datos almacenados

```bash
# Ver usuarios registrados
cat usuarios.json

# Ver tareas creadas
cat tareas.json
```

## 🐛 Debugging

Si encuentras errores, revisa:
1. La consola donde está corriendo el servidor
2. Los archivos `tareas.json` y `usuarios.json` para ver los datos
3. Asegúrate de incluir el header `Authorization: Bearer <token>`
