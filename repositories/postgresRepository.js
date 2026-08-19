const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function getAllTasks() {
  const result = await pool.query(
    "SELECT id, title, done FROM tasks ORDER BY id"
  );

  return result.rows;
}

async function getTaskById(id) {
  const result = await pool.query(
    "SELECT id, title, done FROM tasks WHERE id = $1",
    [id]
  );

  return result.rows[0] || null;
}

async function createTask(title) {
  const result = await pool.query(
    `INSERT INTO tasks (title, done)
     VALUES ($1, FALSE)
     RETURNING id, title, done`,
    [title]
  );

  return result.rows[0];
}

async function updateTask(id, title, done) {
  const result = await pool.query(
    `UPDATE tasks
     SET title = $1, done = $2
     WHERE id = $3
     RETURNING id, title, done`,
    [title, done, id]
  );

  return result.rows[0] || null;
}

async function deleteTask(id) {
  const result = await pool.query(
    "DELETE FROM tasks WHERE id = $1",
    [id]
  );

  return result.rowCount > 0;
}

module.exports = {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
};