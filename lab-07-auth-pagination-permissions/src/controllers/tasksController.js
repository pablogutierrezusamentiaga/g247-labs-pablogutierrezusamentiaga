/*
  src/controllers/tasksController.js
  Factoría con el tasksModel inyectado. Todos los handlers comprueban propietario.
  toDTO mantiene el contrato público: la BD usa user_id, la API devuelve userId.
*/

// Convierte un valor de query string en entero seguro dentro de [min, max].
// Ausente, fracción, texto o Infinity -> fallback.
function toInt(value, { min, max, fallback }) {
  if (typeof value !== "string" || !/^-?\d+$/.test(value.trim())) {
    return fallback;
  }
  return Math.min(max, Math.max(min, Number(value)));
}

function createTasksController({ tasksModel }) {
  const toDTO = (row) => ({
    id: row.id,
    title: row.title,
    done: row.done,
    userId: row.user_id,
  });

  // Carga la tarea y comprueba propiedad.
  // Devuelve la fila, o responde 404/403 y devuelve null.
  async function loadOwned(req, res) {
    const id = Number(req.params.id);
    // Un id no numérico o fuera del rango de INT de Postgres no puede existir
    if (!Number.isInteger(id) || id < 1 || id > 2147483647) {
      res.status(404).json({ error: "Task not found" });
      return null;
    }
    const task = await tasksModel.findById(id);
    if (!task) {
      res.status(404).json({ error: "Task not found" });
      return null;
    }
    if (Number(task.user_id) !== Number(req.user.sub)) {
      // Token válido pero tarea ajena: autorización, no autenticación -> 403
      res.status(403).json({ error: "Forbidden" });
      return null;
    }
    return task;
  }

  return {
    async list(req, res, next) {
      try {
        const page = toInt(req.query.page, { min: 1, max: 100000, fallback: 1 });
        const limit = toInt(req.query.limit, { min: 1, max: 100, fallback: 20 });
        const offset = (page - 1) * limit;

        const rows = await tasksModel.findByOwner(Number(req.user.sub), {
          limit,
          offset,
        });
        res.json({ page, limit, items: rows.map(toDTO) });
      } catch (err) {
        next(err);
      }
    },

    async getOne(req, res, next) {
      try {
        const task = await loadOwned(req, res);
        if (task) res.json(toDTO(task));
      } catch (err) {
        next(err);
      }
    },

    async create(req, res, next) {
      try {
        const { title, done } = req.body;
        // El propietario sale del token, NUNCA del body
        const created = await tasksModel.create({
          title,
          userId: Number(req.user.sub),
          done,
        });
        res.status(201).location(`/tasks/${created.id}`).json(toDTO(created));
      } catch (err) {
        next(err);
      }
    },

    async update(req, res, next) {
      try {
        const task = await loadOwned(req, res);
        if (!task) return;
        const { title, done } = req.body;
        const updated = await tasksModel.update(task.id, { title, done });
        res.json(toDTO(updated));
      } catch (err) {
        next(err);
      }
    },

    async remove(req, res, next) {
      try {
        const task = await loadOwned(req, res);
        if (!task) return;
        await tasksModel.remove(task.id);
        res.status(204).end();
      } catch (err) {
        next(err);
      }
    },
  };
}

module.exports = { createTasksController };
