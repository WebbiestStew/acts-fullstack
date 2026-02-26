/**
 * ============================================================
 * TASKMANAGER PRO - MongoDB Schema Export
 * Base de datos: MongoDB (Mongoose ODM)
 * ============================================================
 *
 * Colecciones:
 *   1. users
 *   2. tasks
 *
 * Para importar datos de ejemplo al iniciar el backend,
 * ejecuta: node seed.js
 */

// ─── Colección: users ────────────────────────────────────────────────────────
const userSchema = {
  _id: "ObjectId (auto-generado)",
  name: {
    type: "String",
    required: true,
    minlength: 2,
    maxlength: 50,
  },
  email: {
    type: "String",
    required: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: "String (bcrypt hash)",
    required: true,
    select: false, // excluido de consultas por defecto
  },
  role: {
    type: "String",
    enum: ["user", "admin"],
    default: "user",
  },
  active: {
    type: "Boolean",
    default: true,
  },
  createdAt: "Date (auto, timestamps)",
  updatedAt: "Date (auto, timestamps)",
};

// ─── Colección: tasks ────────────────────────────────────────────────────────
const taskSchema = {
  _id: "ObjectId (auto-generado)",
  title: {
    type: "String",
    required: true,
    minlength: 3,
    maxlength: 100,
  },
  description: {
    type: "String",
    maxlength: 500,
    default: "",
  },
  status: {
    type: "String",
    enum: ["pending", "in-progress", "completed", "cancelled"],
    default: "pending",
  },
  priority: {
    type: "String",
    enum: ["low", "medium", "high"],
    default: "medium",
  },
  category: {
    type: "String",
    maxlength: 50,
    default: "General",
  },
  dueDate: {
    type: "Date",
    default: null,
  },
  owner: {
    type: "ObjectId → ref: 'User'",
    required: true,
  },
  assignedTo: {
    type: "ObjectId → ref: 'User'",
    default: null,
  },
  createdAt: "Date (auto, timestamps)",
  updatedAt: "Date (auto, timestamps)",
};

module.exports = { userSchema, taskSchema };
