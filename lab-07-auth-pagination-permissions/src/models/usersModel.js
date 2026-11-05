/*
  src/models/usersModel.js
  Lab 7 · Capa de acceso a datos de usuarios.
  Recibe `db` (un Pool de node-postgres, o un fake en pruebas).
  Todas las consultas son parametrizadas ($1, $2, ...).
*/

function createUsersModel(db) {
    return {
      // Devuelve el usuario (con password_hash) o null si no existe.
      async findByEmail(email) {
        const sql =
          "SELECT id, email, password_hash, role FROM users WHERE email = $1";
        const { rows } = await db.query(sql, [email]);
        return rows[0] ?? null;
      },
  
      // Crea un usuario. Nunca recibe la contraseña en claro, solo el hash.
      async create({ email, passwordHash, role = "user" }) {
        const sql =
          "INSERT INTO users (email, password_hash, role) " +
          "VALUES ($1, $2, $3) " +
          "RETURNING id, email, role";
        const { rows } = await db.query(sql, [email, passwordHash, role]);
        return rows[0];
      },
    };
  }
  
  module.exports = { createUsersModel };