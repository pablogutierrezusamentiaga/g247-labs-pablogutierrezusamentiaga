/*
  src/app.js
  Laboratorio 4 — Programación de Aplicaciones Web (G247) · CUNEF EPS
  Participante: Pablo Gutiérrez Usamentiaga

  Este fichero CONSTRUYE y EXPORTA la app. NO llama a app.listen:
  de eso se encarga server.js.
*/

const express = require("express");
const logger = require("./middleware/logger");

const app = express();

// Datos provisionales — en laboratorios posteriores pasarán a un
// controlador y después a un modelo de base de datos.
const tasks = [
  { id: 1, title: "Write the API skeleton", done: true, userId: 1 },
  { id: 2, title: "Add a request logger", done: false, userId: 1 },
  { id: 3, title: "Create the first routes", done: false, userId: 2 },
];

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

app.get("/tasks", (req, res) => {
  res.json(tasks);
});

app.post("/tasks", (req, res) => {
  res.status(201).json({ received: req.body });
});

module.exports = app;