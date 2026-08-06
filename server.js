const express = require("express");

const app = express();
const PORT = 3000;

const tasks = [
  { id: 1, title: "Prepare for interview", done: false },
  { id: 2, title: "Update portfolio", done: true },
  { id: 3, title: "Apply for robotics jobs", done: false },
];

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
  res.json(tasks);
});

app.get("/tasks/:id", (req, res) => {
  const taskId = Number(req.params.id);
  const task = tasks.find((item) => item.id === taskId);

  if (!task) {
    return res.status(404).json({
      error: `Task ${taskId} not found`,
    });
  }

  res.json(task);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});