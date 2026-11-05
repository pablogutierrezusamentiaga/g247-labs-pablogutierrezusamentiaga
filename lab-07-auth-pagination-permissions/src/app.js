/*
  Starter — src/app.js
  Assemble the Lab 6 model with the new Lab 7 routes and middleware.
  Keep this wiring as infrastructure; implement the TODOs in the other files.
*/
const express = require("express");
const { createTasksModel } = require("./models/tasksModel");
const { createUsersModel } = require("./models/usersModel");
const { createTasksController } = require("./controllers/tasksController");
const { createAuthController } = require("./controllers/authController");
const { buildTasksRouter } = require("./routes/tasks");
const { buildAuthRouter } = require("./routes/auth");
const { auth } = require("./middleware/auth");

function buildApp(db) {
  const app = express();
  app.use(express.json());

  const tasksController = createTasksController({ tasksModel: createTasksModel(db) });
  const authController = createAuthController({ usersModel: createUsersModel(db) });

  app.get("/health", (_req, res) => res.json({ status: "ok" }));
  app.use("/auth", buildAuthRouter(authController));
  app.use("/tasks", auth, buildTasksRouter(tasksController));

  app.use((err, _req, res, _next) => {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  });

  return app;
}

module.exports = { buildApp };
