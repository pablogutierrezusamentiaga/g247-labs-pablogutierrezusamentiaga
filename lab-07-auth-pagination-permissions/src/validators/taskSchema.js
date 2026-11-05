/*
  src/validators/taskSchema.js
  Nunca se confía en req.body: se valida y, si no encaja, 400 antes del controlador.
  userId NO está en el esquema: el propietario sale del token, nunca del cliente.
*/

const { z } = require("zod");

const taskSchema = z.object({
  title: z.string().trim().min(1).max(120),
  done: z.boolean().optional().default(false),
});

function validate(schema) {
  return (req, res, next) => {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues });
    }
    // Sustituye el body por el valor analizado (con defaults y sin campos extra)
    req.body = parsed.data;
    next();
  };
}

module.exports = { taskSchema, validate };