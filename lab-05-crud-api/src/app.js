/*
  src/app.js
  Laboratorio 5 — Programación de Aplicaciones Web (G247) · CUNEF EPS
  Participante: Pablo Gutiérrez Usamentiaga

  Este fichero CONSTRUYE y EXPORTA la app. NO llama a app.listen:
  de eso se encarga server.js.
*/

const express = require("express");
const logger = require("./middleware/logger");
const tasksRouter = require("./routes/tasks");

const app = express();

// --- middleware de nivel de aplicación (ANTES de las rutas) ---
app.use(express.json()); // parsea cuerpos JSON y los deja en req.body
app.use(logger);         // una línea de registro por petición

// --- rutas ---
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.get("/echo/:msg", (req, res) => {
  res.json({ echo: req.params.msg });
});

// El router se monta ANTES del error handler
app.use("/tasks", tasksRouter);

// --- error handler centralizado (siempre el último, con 4 argumentos) ---
app.use((err, req, res, next) => {
  const status = err.status || err.statusCode || 500;
  res.status(status).json({
    error: status === 500 ? "Internal Server Error" : err.message,
  });
});

module.exports = app;