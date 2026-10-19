/*
  src/server.js
  Laboratorio 4 — Programación de Aplicaciones Web (G247) · CUNEF EPS
  Participante: Pablo Gutiérrez Usamentiaga

  Punto de entrada: se ejecuta con `npm start`.
  Su única misión es importar la app y ponerse a escuchar.
*/

const app = require("./app");

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Tasks API listening on http://localhost:${PORT}`);
});