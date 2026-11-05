/*
  src/routes/auth.js
  Rutas PÚBLICAS: así consigue un token quien aún no lo tiene.
*/

const express = require("express");

function buildAuthRouter(authController) {
  const router = express.Router();

  router.post("/register", authController.register);
  router.post("/login", authController.login);

  return router;
}

module.exports = { buildAuthRouter };