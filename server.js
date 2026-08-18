const express = require("express");
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./openapi.json");
const Database = require("better-sqlite3");

const app = express();
const PORT = 3000;

app.use(express.json());

app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

const db = new Database("tasks.db");

db.prepare(`
  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    done INTEGER NOT NULL DEFAULT 0
  )
`).run();

const taskCount = db.prepare("SELECT COUNT(*) AS count FROM tasks").get();

if (taskCount.count === 0) {
  const insertTask = db.prepare(
    "INSERT INTO tasks (title, done) VALUES (?, ?)"
  );

  insertTask.run("Prepare for interview", 0);
  insertTask.run("Update portfolio", 1);
  insertTask.run("Apply for robotics jobs", 0);
}

app.get("/", (req, res) => {
  res.json({
    name: "Task API",
    version: "1.0",
    endpoints: ["/tasks"],
  });
});

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
  });
});

app.get("/tasks", (req, res) => {
  const tasks = db.prepare("SELECT * FROM tasks").all();

  const formattedTasks = tasks.map((task) => ({
    ...task,
    done: Boolean(task.done),
  }));

  res.json(formattedTasks);
});

app.get("/tasks/:id", (req, res) => {
  const taskId = Number(req.params.id);

  const task = db
    .prepare("SELECT * FROM tasks WHERE id = ?")
    .get(taskId);

  if (!task) {
    return res.status(404).json({
      error: "Task not found",
    });
  }

  res.json({
    ...task,
    done: Boolean(task.done),
  });
});

app.post("/tasks", (req, res) => {
  const { title } = req.body;

  if (!title || typeof title !== "string" || title.trim() === "") {
    return res.status(400).json({
      error: "Title is required and must not be empty",
    });
  }

  const result = db
    .prepare("INSERT INTO tasks (title, done) VALUES (?, ?)")
    .run(title.trim(), 0);

  const newTask = db
    .prepare("SELECT * FROM tasks WHERE id = ?")
    .get(result.lastInsertRowid);

  res.status(201).json({
    ...newTask,
    done: Boolean(newTask.done),
  });
});

app.put("/tasks/:id", (req, res) => {
  const taskId = Number(req.params.id);

  const existingTask = db
    .prepare("SELECT * FROM tasks WHERE id = ?")
    .get(taskId);

  if (!existingTask) {
    return res.status(404).json({
      error: "Task not found",
    });
  }

  const { title, done } = req.body;

  if (title === undefined && done === undefined) {
    return res.status(400).json({
      error: "Provide a title or done value",
    });
  }

  if (
    title !== undefined &&
    (typeof title !== "string" || title.trim() === "")
  ) {
    return res.status(400).json({
      error: "Title must be a non-empty string",
    });
  }

  if (done !== undefined && typeof done !== "boolean") {
    return res.status(400).json({
      error: "Done must be true or false",
    });
  }

  const updatedTitle =
    title !== undefined ? title.trim() : existingTask.title;

  const updatedDone =
    done !== undefined ? (done ? 1 : 0) : existingTask.done;

  db.prepare(`
    UPDATE tasks
    SET title = ?, done = ?
    WHERE id = ?
  `).run(updatedTitle, updatedDone, taskId);

  const updatedTask = db
    .prepare("SELECT * FROM tasks WHERE id = ?")
    .get(taskId);

  res.status(200).json({
    ...updatedTask,
    done: Boolean(updatedTask.done),
  });
});

app.delete("/tasks/:id", (req, res) => {
  const taskId = Number(req.params.id);

  const result = db
    .prepare("DELETE FROM tasks WHERE id = ?")
    .run(taskId);

  if (result.changes === 0) {
    return res.status(404).json({
      error: "Task not found",
    });
  }

  res.status(204).send();
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});