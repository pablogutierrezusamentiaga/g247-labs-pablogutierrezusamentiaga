/*
  src/middleware/logger.js
  Laboratorio 4 — Programación de Aplicaciones Web (G247) · CUNEF EPS
  Participante: Pablo Gutiérrez Usamentiaga
*/

// Middleware de nivel de aplicación. Express lo llama en CADA petición
// con tres argumentos: la petición, la respuesta y next.
function logger(req, res, next) {
    console.log(`${req.method} ${req.url}`);
    next();
}
  
module.exports = logger;