/*
  src/controllers/authController.js
  register (alta) y login. bcryptjs para el hash, jsonwebtoken para el token.
*/

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET;
const MAX_PASSWORD_BYTES = 72; // límite de bcrypt: se rechaza, no se trunca

function isValidEmail(email) {
  return typeof email === "string" && email.trim() !== "";
}

function isValidPassword(password) {
  return (
    typeof password === "string" &&
    password.length >= 8 &&
    Buffer.byteLength(password, "utf8") <= MAX_PASSWORD_BYTES
  );
}

function createAuthController({ usersModel }) {
  return {
    async register(req, res, next) {
      try {
        const { email, password } = req.body ?? {};
        if (!isValidEmail(email) || !isValidPassword(password)) {
          return res.status(400).json({
            error: "email obligatorio y contraseña de 8 a 72 bytes UTF-8",
          });
        }
        const cleanEmail = email.trim().toLowerCase();

        if (await usersModel.findByEmail(cleanEmail)) {
          return res.status(409).json({ error: "Email already registered" });
        }

        const passwordHash = await bcrypt.hash(password, 10);
        const user = await usersModel.create({
          email: cleanEmail,
          passwordHash,
        });

        // Solo { id, email }: nunca se devuelve el hash.
        return res.status(201).json({ id: user.id, email: user.email });
      } catch (err) {
        // 23505 = violación de UNIQUE en Postgres (dos registros a la vez)
        if (err.code === "23505") {
          return res.status(409).json({ error: "Email already registered" });
        }
        next(err);
      }
    },

    async login(req, res, next) {
      try {
        const { email, password } = req.body ?? {};
        if (!isValidEmail(email) || typeof password !== "string") {
          return res.status(400).json({ error: "email y password obligatorios" });
        }
        // Una contraseña de más de 72 bytes nunca puede ser válida
        if (Buffer.byteLength(password, "utf8") > MAX_PASSWORD_BYTES) {
          return res.status(401).json({ error: "Invalid credentials" });
        }

        const user = await usersModel.findByEmail(email.trim().toLowerCase());
        if (!user) {
          return res.status(401).json({ error: "Invalid credentials" });
        }

        const ok = await bcrypt.compare(password, user.password_hash);
        if (!ok) {
          return res.status(401).json({ error: "Invalid credentials" });
        }

        const token = jwt.sign({ sub: user.id, role: user.role }, JWT_SECRET, {
          expiresIn: "1h",
        });
        return res.status(200).json({ token });
      } catch (err) {
        next(err);
      }
    },
  };
}

module.exports = { createAuthController };