/*
  src/routes/tasks.js
  Montado DETRÁS de auth en app.js, así que req.user ya existe en cada handler.
*/

const express = require("express");
const { taskSchema, validate } = require("../validators/taskSchema");

function buildTasksRouter(tasksController) {
  const router = express.Router();

  router.get("/", tasksController.list);
  router.get("/:id", tasksController.getOne);
  router.post("/", validate(taskSchema), tasksController.create);
  router.put("/:id", validate(taskSchema), tasksController.update);
  router.delete("/:id", tasksController.remove);

  return router;
}

module.exports = { buildTasksRouter };
