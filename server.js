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

app.post("/auth/signup", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: "Email and password are required",
      });
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      return res.status(400).json({
        error: error.message,
      });
    }

    res.status(201).json({
      user: data.user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Server error",
    });
  }
});

app.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: "Email and password are required",
      });
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return res.status(401).json({
        error: "Invalid login credentials",
      });
    }

    res.status(200).json({
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      user: data.user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Server error",
    });
  }
});

app.get("/public/info", (req, res) => {
  res.status(200).json({
    message: "Welcome stranger! This info is public.",
  });
});

app.get("/protected/profile", (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      error: "Access token required",
    });
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      error: "Access token required",
    });
  }

  res.status(200).json({
    message: "Token received. Verification will be added next.",
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log("Server running and connected to Supabase");
});