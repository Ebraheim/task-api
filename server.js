require("dotenv").config();
require("dotenv").config();

const express = require("express");
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./openapi.json");
const taskService = require("./services/taskService");
const supabase = require("./config/supabaseClient");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.get("/", (req, res) => {
  res.json({
    name: "Task API",
    version: "2.0",
    database: "PostgreSQL",
    endpoints: ["/tasks"],
  });
});

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
  });
});

app.get("/tasks", async (req, res) => {
  try {
    const tasks = await taskService.getAllTasks();
    res.json(tasks);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Database error",
    });
  }
});

app.get("/tasks/:id", async (req, res) => {
  try {
    const taskId = Number(req.params.id);
    const task = await taskService.getTaskById(taskId);

    if (!task) {
      return res.status(404).json({
        error: "Task not found",
      });
    }

    res.json(task);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Database error",
    });
  }
});

app.post("/tasks", async (req, res) => {
  try {
    const { title } = req.body;

    if (!title || typeof title !== "string" || title.trim() === "") {
      return res.status(400).json({
        error: "Title is required and must not be empty",
      });
    }

    const newTask = await taskService.createTask(title.trim());

    res.status(201).json(newTask);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Database error",
    });
  }
});

app.put("/tasks/:id", async (req, res) => {
  try {
    const taskId = Number(req.params.id);

    const existingTask = await taskService.getTaskById(taskId);

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
      done !== undefined ? done : existingTask.done;

    const updatedTask = await taskService.updateTask(
      taskId,
      updatedTitle,
      updatedDone
    );

    res.status(200).json(updatedTask);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Database error",
    });
  }
});

app.delete("/tasks/:id", async (req, res) => {
  try {
    const taskId = Number(req.params.id);

    const deleted = await taskService.deleteTask(taskId);

    if (!deleted) {
      return res.status(404).json({
        error: "Task not found",
      });
    }

    res.status(204).send();
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Database error",
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log("Server running and connected to Supabase");
});