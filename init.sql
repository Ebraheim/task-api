CREATE TABLE IF NOT EXISTS tasks (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  done BOOLEAN NOT NULL DEFAULT FALSE
);

INSERT INTO tasks (title, done)
SELECT 'Prepare for interview', FALSE
WHERE NOT EXISTS (SELECT 1 FROM tasks);

INSERT INTO tasks (title, done)
SELECT 'Update portfolio', TRUE
WHERE (SELECT COUNT(*) FROM tasks) = 1;

INSERT INTO tasks (title, done)
SELECT 'Apply for robotics jobs', FALSE
WHERE (SELECT COUNT(*) FROM tasks) = 2;