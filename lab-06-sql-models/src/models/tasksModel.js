/*
  src/models/tasksModel.js
  Session 22 Lab · Web Application Programming (G247) · CUNEF EPS

  Models layer: all access to the `tasks` table goes through here.
  The module exports a FACTORY that receives `db`, an object with an
  async `query(text, params)` method (a node-postgres Pool in real use,
  an in-memory fake in tests).

  GOLDEN RULE: every query is PARAMETERIZED ($1, $2, ...). Never build
  SQL by concatenating user input.
*/

function createTasksModel(db) {
  return {
    // GET all tasks (ordered so results are stable).
    async findAll() {
      const sql = "SELECT id, user_id, title, done FROM tasks ORDER BY id";
      const { rows } = await db.query(sql, []);
      return rows;
    },

    // GET one task by id: the row, or null if there is none.
    async findById(id) {
      const sql =
        "SELECT id, user_id, title, done FROM tasks WHERE id = $1";
      const { rows } = await db.query(sql, [id]);
      return rows[0] ?? null;
    },

    // CREATE a task. RETURNING gives back the row actually stored.
    async create({ title, userId, done = false }) {
      const sql =
        "INSERT INTO tasks (user_id, title, done) " +
        "VALUES ($1, $2, $3) " +
        "RETURNING id, user_id, title, done";
      const { rows } = await db.query(sql, [userId, title, done]);
      return rows[0];
    },

    // UPDATE a task. COALESCE keeps the current value of any field
    // left undefined. Returns the updated row, or null if id not found.
    async update(id, fields) {
      const sql =
        "UPDATE tasks " +
        "SET title = COALESCE($2, title), " +
        "    done = COALESCE($3, done), " +
        "    user_id = COALESCE($4, user_id) " +
        "WHERE id = $1 " +
        "RETURNING id, user_id, title, done";
      const params = [
        id,
        fields.title ?? null,
        fields.done ?? null,
        fields.userId ?? null,
      ];
      const { rows } = await db.query(sql, params);
      return rows[0] ?? null;
    },

    // DELETE a task. true if a row was removed, false if the id did not exist.
    async remove(id) {
      const sql = "DELETE FROM tasks WHERE id = $1 RETURNING id";
      const result = await db.query(sql, [id]);
      return result.rowCount > 0;
    },

    // LIST one owner's tasks, paginated. ORDER BY keeps pages stable.
    async findByOwner(userId, { limit = 10, offset = 0 } = {}) {
      const sql =
        "SELECT id, user_id, title, done FROM tasks " +
        "WHERE user_id = $1 " +
        "ORDER BY id " +
        "LIMIT $2 OFFSET $3";
      const { rows } = await db.query(sql, [userId, limit, offset]);
      return rows;
    },
  };
}

module.exports = { createTasksModel };