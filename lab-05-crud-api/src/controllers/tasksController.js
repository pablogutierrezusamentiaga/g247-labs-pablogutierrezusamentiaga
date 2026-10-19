/*
  src/controllers/tasksController.js
  Laboratorio 5 — API CRUD de tareas en memoria
*/

let tasks = [];
let nextId = 1;

function isValidTitle(title) {
  return typeof title === "string" && title.trim().length > 0;
}

function findIndexById(rawId) {
  const id = Number(rawId);
  if (!Number.isInteger(id)) return -1;
  return tasks.findIndex((t) => t.id === id);
}

// GET /tasks -> 200 + array completo
function listTasks(req, res) {
  return res.status(200).json(tasks);
}

// GET /tasks/:id -> 200 + tarea | 404 si no existe
function getTask(req, res) {
  const index = findIndexById(req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: "Task not found" });
  }
  return res.status(200).json(tasks[index]);
}

// POST /tasks -> 201 + Location + tarea creada | 400 si falta title
function createTask(req, res) {
  const { title, done, userId } = req.body || {};
  if (!isValidTitle(title)) {
    return res.status(400).json({ error: "title is required" });
  }

  const task = {
    id: nextId++,
    title: title.trim(),
    done: done === true,
    userId: userId ?? null,
  };
  tasks.push(task);

  return res.status(201).location(`/tasks/${task.id}`).json(task);
}

// PUT /tasks/:id -> 200 + tarea sustituida | 404 si no existe | 400 sin title
// PUT sustituye el recurso COMPLETO: los campos que no envías vuelven a su valor por defecto.
function updateTask(req, res) {
  const index = findIndexById(req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: "Task not found" });
  }

  const { title, done, userId } = req.body || {};
  if (!isValidTitle(title)) {
    return res.status(400).json({ error: "title is required" });
  }

  const replaced = {
    id: tasks[index].id,
    title: title.trim(),
    done: done === true,
    userId: userId ?? null,
  };
  tasks[index] = replaced;

  return res.status(200).json(replaced);
}

// DELETE /tasks/:id -> 204 sin cuerpo | 404 si no existe
function deleteTask(req, res) {
  const index = findIndexById(req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: "Task not found" });
  }

  tasks.splice(index, 1);
  return res.status(204).send();
}

module.exports = { listTasks, getTask, createTask, updateTask, deleteTask };