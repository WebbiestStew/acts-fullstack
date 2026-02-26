# Modelo de Datos – TaskManager Pro

Base de datos: **MongoDB** con **Mongoose ODM**

---

## Diagrama de Relaciones (ER)

```
┌─────────────────────────────────────┐
│               USERS                  │
├──────────────────┬──────────────────┤
│ _id              │ ObjectId (PK)    │
│ name             │ String           │
│ email            │ String (unique)  │
│ password         │ String (hash)    │
│ role             │ user | admin     │
│ active           │ Boolean          │
│ createdAt        │ Date             │
│ updatedAt        │ Date             │
└──────────────────┴──────────────────┘
         │ 1                    │ 1
         │ owner                │ assignedTo
         │ (required)           │ (opcional)
         ▼ *                    ▼ *
┌─────────────────────────────────────┐
│               TASKS                  │
├──────────────────┬──────────────────┤
│ _id              │ ObjectId (PK)    │
│ title            │ String           │
│ description      │ String           │
│ status           │ pending |        │
│                  │ in-progress |    │
│                  │ completed |      │
│                  │ cancelled        │
│ priority         │ low | medium |   │
│                  │ high             │
│ category         │ String           │
│ dueDate          │ Date (opcional)  │
│ owner            │ ObjectId → User  │
│ assignedTo       │ ObjectId → User  │
│ createdAt        │ Date             │
│ updatedAt        │ Date             │
└──────────────────┴──────────────────┘
```

---

## Relaciones

| Relación          | Tipo  | Descripción                                         |
|-------------------|-------|-----------------------------------------------------|
| User → Tasks      | 1:N   | Un usuario puede tener múltiples tareas (owner)     |
| User → Tasks      | 1:N   | Un usuario puede ser asignado a múltiples tareas    |
| Task → User       | N:1   | Cada tarea pertenece a exactamente un usuario       |

---

## Índices en MongoDB

```javascript
// Colección tasks
{ owner: 1, status: 1 }          // búsquedas filtradas por usuario y estado
{ title: 'text', description: 'text' }  // búsqueda full-text
```

---

## Valores permitidos

### `tasks.status`
| Valor        | Descripción            |
|--------------|------------------------|
| `pending`    | Tarea creada, sin iniciar |
| `in-progress`| Tarea en proceso       |
| `completed`  | Tarea finalizada       |
| `cancelled`  | Tarea cancelada        |

### `tasks.priority`
| Valor    | Descripción       |
|----------|-------------------|
| `low`    | Baja prioridad    |
| `medium` | Prioridad media   |
| `high`   | Alta prioridad    |

### `users.role`
| Valor   | Descripción                              |
|---------|------------------------------------------|
| `user`  | Usuario estándar, solo ve sus tareas     |
| `admin` | Administrador, acceso total al sistema   |

---

## Datos de ejemplo (seed)

```json
// users
[
  { "name": "Admin Principal", "email": "admin@taskmanager.com", "password": "admin1234", "role": "admin" },
  { "name": "Usuario Demo",    "email": "user@taskmanager.com",  "password": "user1234",  "role": "user" }
]

// tasks
[
  { "title": "Configurar servidor Express",  "priority": "high",   "status": "completed", "category": "Backend"  },
  { "title": "Diseñar interfaz de usuario",  "priority": "medium", "status": "in-progress","category": "Frontend" },
  { "title": "Escribir pruebas Jest",        "priority": "high",   "status": "pending",    "category": "Testing"  },
  { "title": "Documentar API REST",          "priority": "low",    "status": "pending",    "category": "Docs"     }
]
```
