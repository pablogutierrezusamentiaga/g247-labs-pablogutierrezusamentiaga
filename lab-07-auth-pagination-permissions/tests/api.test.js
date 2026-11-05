// Debe ir ANTES de requerir la app: authController y middleware/auth leen
// process.env.JWT_SECRET en el momento de cargarse.
process.env.JWT_SECRET = "test-secret-lab7";

const test = require("node:test");
const assert = require("node:assert/strict");
const request = require("supertest");
const jwt = require("jsonwebtoken");
const { buildApp } = require("../src/app");

const SECRET = process.env.JWT_SECRET;

/* ------------------------------------------------------------------
  Fake de db: implementa query(text, params) en memoria para las
  consultas de usersModel y tasksModel. Sin PostgreSQL.
------------------------------------------------------------------ */
function createFakeDb() {
  const users = [];
  const tasks = [];
  let userSeq = 0;
  let taskSeq = 0;
  const norm = (s) => s.replace(/\s+/g, " ").trim().toLowerCase();
  const result = (rows) => ({ rows, rowCount: rows.length });

  return {
    users,
    tasks,

    // Atajo para preparar datos sin pasar por la API
    seedTask(userId, title, done = false) {
      const row = { id: ++taskSeq, user_id: userId, title, done };
      tasks.push(row);
      return row;
    },

    async query(text, params = []) {
      const sql = norm(text);

      // usersModel.findByEmail
      if (sql.startsWith("select") && sql.includes("from users where email")) {
        return result(users.filter((u) => u.email === params[0]).map((u) => ({ ...u })));
      }
      // usersModel.create
      if (sql.startsWith("insert into users")) {
        const [email, password_hash, role] = params;
        if (users.some((u) => u.email === email)) {
          const err = new Error("duplicate key value violates unique constraint");
          err.code = "23505";
          throw err;
        }
        const row = { id: ++userSeq, email, password_hash, role };
        users.push(row);
        return result([{ id: row.id, email, role }]);
      }
      // tasksModel.findById
      if (sql.startsWith("select") && sql.includes("from tasks where id =")) {
        return result(tasks.filter((t) => t.id === params[0]).map((t) => ({ ...t })));
      }
      // tasksModel.findByOwner (ORDER BY id LIMIT $2 OFFSET $3)
      if (sql.startsWith("select") && sql.includes("from tasks where user_id =")) {
        const [userId, limit, offset] = params;
        const rows = tasks
          .filter((t) => t.user_id === userId)
          .sort((a, b) => a.id - b.id)
          .slice(offset, offset + limit)
          .map((t) => ({ ...t }));
        return result(rows);
      }
      // tasksModel.create
      if (sql.startsWith("insert into tasks")) {
        const [user_id, title, done] = params;
        const row = { id: ++taskSeq, user_id, title, done };
        tasks.push(row);
        return result([{ ...row }]);
      }
      // tasksModel.update (COALESCE: null conserva el valor actual)
      if (sql.startsWith("update tasks")) {
        const [id, title, done, user_id] = params;
        const row = tasks.find((t) => t.id === id);
        if (!row) return result([]);
        if (title != null) row.title = title;
        if (done != null) row.done = done;
        if (user_id != null) row.user_id = user_id;
        return result([{ ...row }]);
      }
      // tasksModel.remove
      if (sql.startsWith("delete from tasks")) {
        const idx = tasks.findIndex((t) => t.id === params[0]);
        if (idx === -1) return result([]);
        const [removed] = tasks.splice(idx, 1);
        return result([{ id: removed.id }]);
      }

      throw new Error(`Fake db: consulta no soportada: ${text}`);
    },
  };
}

function setup() {
  const db = createFakeDb();
  return { db, app: buildApp(db) };
}

async function registerAndLogin(app, email, password = "password123") {
  await request(app).post("/auth/register").send({ email, password });
  const res = await request(app).post("/auth/login").send({ email, password });
  return res.body.token;
}

const bearer = (token) => ({ Authorization: `Bearer ${token}` });

/* ------------------------------------------------------------------
  Infraestructura
------------------------------------------------------------------ */
test("health route is available", async () => {
  const { app } = setup();
  const response = await request(app).get("/health");
  assert.equal(response.status, 200);
  assert.deepEqual(response.body, { status: "ok" });
});

test("task routes require a token", async () => {
  const { app } = setup();
  const response = await request(app).get("/tasks").timeout(1000);
  assert.equal(response.status, 401);
});

/* ------------------------------------------------------------------
  Registro
------------------------------------------------------------------ */
test("register: 201 { id, email } y la contraseña se guarda como hash bcrypt (coste >= 10)", async () => {
  const { app, db } = setup();
  const res = await request(app)
    .post("/auth/register")
    .send({ email: "ana@example.com", password: "password123" });

  assert.equal(res.status, 201);
  assert.deepEqual(Object.keys(res.body).sort(), ["email", "id"]); // nunca el hash
  const stored = db.users[0];
  assert.notEqual(stored.password_hash, "password123");
  assert.match(stored.password_hash, /^\$2[aby]\$(1\d|[2-9]\d)\$/);
  assert.equal(stored.role, "user");
});

test("register: correo duplicado devuelve 409", async () => {
  const { app, db } = setup();
  const body = { email: "ana@example.com", password: "password123" };
  await request(app).post("/auth/register").send(body);
  const res = await request(app).post("/auth/register").send(body);
  assert.equal(res.status, 409);
  assert.equal(db.users.length, 1);
});

test("register: rechaza datos inválidos y contraseñas de más de 72 bytes UTF-8 (400)", async () => {
  const { app, db } = setup();
  const post = (b) => request(app).post("/auth/register").send(b);

  assert.equal((await post({ password: "password123" })).status, 400); // sin email
  assert.equal((await post({ email: "a@x.com", password: "1234567" })).status, 400); // corta
  assert.equal((await post({ email: "a@x.com", password: "a".repeat(73) })).status, 400); // 73 bytes
  assert.equal((await post({ email: "a@x.com", password: "é".repeat(40) })).status, 400); // 80 bytes
  assert.equal(db.users.length, 0);
});

/* ------------------------------------------------------------------
Acceso
------------------------------------------------------------------ */
test("login: 200 { token } con JWT { sub, role } que caduca en una hora", async () => {
  const { app, db } = setup();
  await request(app).post("/auth/register").send({ email: "ana@example.com", password: "password123" });
  const res = await request(app).post("/auth/login").send({ email: "ana@example.com", password: "password123" });

  assert.equal(res.status, 200);
  const payload = jwt.verify(res.body.token, SECRET);
  assert.equal(payload.sub, db.users[0].id);
  assert.equal(payload.role, "user");
  assert.equal(payload.exp - payload.iat, 3600);
});

test("login: credenciales incorrectas devuelven 401", async () => {
  const { app } = setup();
  await request(app).post("/auth/register").send({ email: "ana@example.com", password: "password123" });
  const login = (b) => request(app).post("/auth/login").send(b);

  const wrongPass = await login({ email: "ana@example.com", password: "mala-clave-1" });
  assert.equal(wrongPass.status, 401);
  assert.equal(wrongPass.body.token, undefined);
  assert.equal((await login({ email: "nadie@example.com", password: "password123" })).status, 401);
  assert.equal((await login({ email: "ana@example.com", password: "a".repeat(73) })).status, 401);
});

/* ------------------------------------------------------------------
  Autenticación (401)
------------------------------------------------------------------ */
test("auth: token ausente, mal formado, caducado o firmado con otra clave -> 401", async () => {
  const { app } = setup();
  const get = (headers) => request(app).get("/tasks").set(headers);

  assert.equal((await request(app).get("/tasks")).status, 401);
  assert.equal((await get({ Authorization: "Bearer basura" })).status, 401);
  assert.equal((await get({ Authorization: "Basic abc" })).status, 401);

  const expired = jwt.sign({ sub: 1, role: "user" }, SECRET, { expiresIn: -10 });
  assert.equal((await get(bearer(expired))).status, 401);

  const wrongKey = jwt.sign({ sub: 1, role: "user" }, "otra-clave");
  assert.equal((await get(bearer(wrongKey))).status, 401);
});

/* ------------------------------------------------------------------
  Validación (400)
------------------------------------------------------------------ */
test("POST /tasks: title ausente o inválido devuelve 400 con los errores de Zod", async () => {
  const { app, db } = setup();
  const token = await registerAndLogin(app, "ana@example.com");
  const post = (b) => request(app).post("/tasks").set(bearer(token)).send(b);

  const missing = await post({});
  assert.equal(missing.status, 400);
  assert.ok(Array.isArray(missing.body.error));
  assert.ok(missing.body.error.some((i) => i.path[0] === "title"));

  assert.equal((await post({ title: "   " })).status, 400);
  assert.equal((await post({ title: 123 })).status, 400);
  assert.equal((await post({ title: "x".repeat(121) })).status, 400);
  assert.equal(db.tasks.length, 0); // no llegó al modelo
});

test("PUT /tasks/:id: cuerpo inválido devuelve 400", async () => {
  const { app } = setup();
  const token = await registerAndLogin(app, "ana@example.com");
  const created = await request(app).post("/tasks").set(bearer(token)).send({ title: "ok" });
  const res = await request(app).put(`/tasks/${created.body.id}`).set(bearer(token)).send({});
  assert.equal(res.status, 400);
});

/* ------------------------------------------------------------------
  Creación: el propietario sale del token
------------------------------------------------------------------ */
test("POST /tasks: 201, el propietario sale del token y no del cuerpo; respuesta { id, title, done, userId }", async () => {
  const { app } = setup();
  const token = await registerAndLogin(app, "ana@example.com");
  const me = jwt.decode(token).sub;

  const res = await request(app)
    .post("/tasks")
    .set(bearer(token))
    .send({ title: "Mi tarea", userId: 999 });

  assert.equal(res.status, 201);
  assert.deepEqual(Object.keys(res.body).sort(), ["done", "id", "title", "userId"]);
  assert.equal(res.body.userId, me);
  assert.equal(res.body.done, false);
  assert.equal(res.headers.location, `/tasks/${res.body.id}`);
});

/* ------------------------------------------------------------------
   Autorización (403)
------------------------------------------------------------------ */
test("tarea ajena: GET, PUT y DELETE devuelven 403; el propietario sí accede", async () => {
  const { app, db } = setup();
  const a = await registerAndLogin(app, "ana@example.com");
  const b = await registerAndLogin(app, "ben@example.com");
  const created = await request(app).post("/tasks").set(bearer(a)).send({ title: "de Ana" });
  const id = created.body.id;

  assert.equal((await request(app).get(`/tasks/${id}`).set(bearer(b))).status, 403);
  assert.equal((await request(app).put(`/tasks/${id}`).set(bearer(b)).send({ title: "hack" })).status, 403);
  assert.equal((await request(app).delete(`/tasks/${id}`).set(bearer(b))).status, 403);
  // Ben no pudo modificar ni borrar nada
  assert.equal(db.tasks.length, 1);
  assert.equal(db.tasks[0].title, "de Ana");

  assert.equal((await request(app).get(`/tasks/${id}`).set(bearer(a))).status, 200);
  const put = await request(app).put(`/tasks/${id}`).set(bearer(a)).send({ title: "editada", done: true });
  assert.equal(put.status, 200);
  assert.equal(put.body.title, "editada");
  assert.equal(put.body.done, true);
  assert.equal((await request(app).delete(`/tasks/${id}`).set(bearer(a))).status, 204);
  assert.equal((await request(app).get(`/tasks/${id}`).set(bearer(a))).status, 404);
});

test("tarea inexistente o id no numérico devuelve 404", async () => {
  const { app } = setup();
  const token = await registerAndLogin(app, "ana@example.com");
  assert.equal((await request(app).get("/tasks/99999").set(bearer(token))).status, 404);
  assert.equal((await request(app).get("/tasks/abc").set(bearer(token))).status, 404);
});

/* ------------------------------------------------------------------
   Paginación
------------------------------------------------------------------ */
test("GET /tasks: { page, limit, items }, solo del propietario y transformadas con toDTO", async () => {
  const { app, db } = setup();
  const a = await registerAndLogin(app, "ana@example.com");
  const b = await registerAndLogin(app, "ben@example.com");
  const meA = jwt.decode(a).sub;
  const meB = jwt.decode(b).sub;
  db.seedTask(meB, "de Ben");
  db.seedTask(meA, "de Ana");

  const res = await request(app).get("/tasks").set(bearer(a));
  assert.equal(res.status, 200);
  assert.deepEqual(Object.keys(res.body).sort(), ["items", "limit", "page"]);
  assert.equal(res.body.items.length, 1);
  assert.deepEqual(res.body.items[0], { id: 2, title: "de Ana", done: false, userId: meA });
  assert.equal("user_id" in res.body.items[0], false);
});

test("GET /tasks: límites seguros (page 1..100000, limit 1..100) y valores por defecto", async () => {
  const { app, db } = setup();
  const token = await registerAndLogin(app, "ana@example.com");
  const me = jwt.decode(token).sub;
  for (let i = 1; i <= 25; i++) db.seedTask(me, `t${i}`);
  const get = (qs) => request(app).get(`/tasks${qs}`).set(bearer(token));

  const def = await get("");
  assert.equal(def.body.page, 1);
  assert.equal(def.body.limit, 20);
  assert.equal(def.body.items.length, 20);

  const p2 = await get("?page=2&limit=10");
  assert.equal(p2.body.items.length, 10);
  assert.equal(p2.body.items[0].title, "t11"); // offset = (2 - 1) * 10

  assert.equal((await get("?limit=999")).body.limit, 100);
  assert.equal((await get("?limit=0")).body.limit, 1);
  assert.equal((await get("?page=0")).body.page, 1);
  assert.equal((await get("?page=-5")).body.page, 1);

  const junk = await get("?page=abc&limit=1.5");
  assert.equal(junk.body.page, 1);
  assert.equal(junk.body.limit, 20);

  const huge = await get("?page=999999999");
  assert.equal(huge.body.page, 100000);
  assert.deepEqual(huge.body.items, []);
});