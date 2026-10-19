/*
  src/routes/tasks.js
  Laboratorio 5 — API CRUD de tareas en memoria
*/

const express = require("express");
const {
  listTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
} = require("../controllers/tasksController");

const router = express.Router();

// Cada operación CRUD = un verbo HTTP + una URL
router.get("/", listTasks);          // Read (lista)
router.get("/:id", getTask);         // Read (una)
router.post("/", createTask);        // Create
router.put("/:id", updateTask);      // Update (sustitución completa)
router.delete("/:id", deleteTask);   // Delete

module.exports = router;