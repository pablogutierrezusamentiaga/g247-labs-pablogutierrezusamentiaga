# Lab 7 · Autenticación, paginación y permisos

API REST de tareas con Node, Express y PostgreSQL. Registro y acceso con JWT, rutas protegidas, comprobación de propietario, validación con Zod y listado paginado.

## Arranque

    npm install
    createdb lab7
    psql lab7 -f schema.sql
    export DATABASE_URL="postgresql://localhost:5432/lab7"
    export JWT_SECRET="$(openssl rand -hex 32)"
    npm start

La aplicación no arranca si faltan `DATABASE_URL` o `JWT_SECRET`. La base de datos es nueva (no la del Lab 6).

## Pruebas

    npm test

## Endpoints

- `POST /auth/register` → 201 `{ id, email }`, 409 si el correo existe, 400 si los datos no son válidos
- `POST /auth/login` → 200 `{ token }` (JWT de 1 hora con `{ sub, role }`), 401 si las credenciales fallan
- `GET /tasks?page=&limit=` → `{ page, limit, items }`, solo las tareas del usuario
- `GET /tasks/:id`, `PUT /tasks/:id`, `DELETE /tasks/:id` → 403 si la tarea es de otro usuario, 404 si no existe
- `POST /tasks` → 201, 400 si falta `title`; el propietario sale del token

## Decisiones

- bcryptjs con coste 10; contraseñas de más de 72 bytes UTF-8 se rechazan, no se truncan.
- 401 = no autenticado; 403 = autenticado pero sin permiso sobre esa tarea.
- `userId` nunca se acepta del body.
- `page` entre 1 y 100000 y `limit` entre 1 y 100.