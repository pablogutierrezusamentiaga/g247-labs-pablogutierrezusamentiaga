-- queries.sql — Session 22 Lab: SQL & the models/ seam
-- Web Application Programming (G247) · CUNEF EPS · Block II · Week 8
--
-- Run these after schema.sql, e.g. in psql:  \i queries.sql
-- Each query is commented with the question it answers.

-- (a) How many tasks does each user have?
SELECT u.id, u.email, COUNT(t.id) AS task_count
FROM users u
LEFT JOIN tasks t ON t.user_id = u.id
GROUP BY u.id, u.email
ORDER BY u.id;

-- (b) Who has the most OPEN (not done) tasks?
SELECT u.id, u.email, COUNT(t.id) AS open_tasks
FROM users u
JOIN tasks t ON t.user_id = u.id
WHERE t.done = FALSE
GROUP BY u.id, u.email
ORDER BY open_tasks DESC, u.id
LIMIT 1;

-- (c) The five most recently inserted tasks, with the owner's email.
SELECT t.id, t.title, t.done, u.email
FROM tasks t
JOIN users u ON u.id = t.user_id
ORDER BY t.id DESC
LIMIT 5;

-- (d) Paginated list of tasks — 10 per page.
-- Page 1 (OFFSET 0)
SELECT id, user_id, title, done
FROM tasks
ORDER BY id
LIMIT 10 OFFSET 0;

-- Page 2 (OFFSET 2): different offset, different rows
SELECT id, user_id, title, done
FROM tasks
ORDER BY id
LIMIT 10 OFFSET 2;