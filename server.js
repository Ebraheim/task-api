require("dotenv").config();

const express = require("express");
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./openapi.json");

const taskService = require("./services/taskService");
const supabase = require("./config/supabaseClient");
const authMiddleware = require("./middleware/authMiddleware");

const app = express();
const PORT = process.env.PORT || 3000;

/* =========================
   MIDDLEWARE
========================= */

app.use(express.json());

app.use(
  "/docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerDocument)
);

/* =========================
   BASIC ROUTES
========================= */

app.get("/", (req, res) => {
  res.status(200).json({
    name: "Task API",
    version: "3.0",
    database: "PostgreSQL",
    authentication: "Supabase Auth",
    endpoints: [
      "/tasks",
      "/auth/signup",
      "/auth/login",
      "/auth/logout",
      "/public/info",
      "/protected/profile",
      "/protected/dashboard",
      "/docs",
    ],
  });
});

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
  });
});

/* =========================
   TASK ROUTES
========================= */

app.get("/tasks", async (req, res) => {
  try {
    const tasks = await taskService.getAllTasks();

    res.status(200).json(tasks);
  } catch (error) {
    console.error("GET /tasks error:", error);

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

    res.status(200).json(task);
  } catch (error) {
    console.error("GET /tasks/:id error:", error);

    res.status(500).json({
      error: "Database error",
    });
  }
});

app.post("/tasks", async (req, res) => {
  try {
    const { title } = req.body;

    if (
      !title ||
      typeof title !== "string" ||
      title.trim() === ""
    ) {
      return res.status(400).json({
        error: "Title is required and must not be empty",
      });
    }

    const newTask = await taskService.createTask(
      title.trim()
    );

    res.status(201).json(newTask);
  } catch (error) {
    console.error("POST /tasks error:", error);

    res.status(500).json({
      error: "Database error",
    });
  }
});

app.put("/tasks/:id", async (req, res) => {
  try {
    const taskId = Number(req.params.id);

    const existingTask =
      await taskService.getTaskById(taskId);

    if (!existingTask) {
      return res.status(404).json({
        error: "Task not found",
      });
    }

    const { title, done } = req.body;

    if (
      title === undefined &&
      done === undefined
    ) {
      return res.status(400).json({
        error: "Provide a title or done value",
      });
    }

    if (
      title !== undefined &&
      (typeof title !== "string" ||
        title.trim() === "")
    ) {
      return res.status(400).json({
        error: "Title must be a non-empty string",
      });
    }

    if (
      done !== undefined &&
      typeof done !== "boolean"
    ) {
      return res.status(400).json({
        error: "Done must be true or false",
      });
    }

    const updatedTitle =
      title !== undefined
        ? title.trim()
        : existingTask.title;

    const updatedDone =
      done !== undefined
        ? done
        : existingTask.done;

    const updatedTask =
      await taskService.updateTask(
        taskId,
        updatedTitle,
        updatedDone
      );

    res.status(200).json(updatedTask);
  } catch (error) {
    console.error("PUT /tasks/:id error:", error);

    res.status(500).json({
      error: "Database error",
    });
  }
});

app.delete("/tasks/:id", async (req, res) => {
  try {
    const taskId = Number(req.params.id);

    const deleted =
      await taskService.deleteTask(taskId);

    if (!deleted) {
      return res.status(404).json({
        error: "Task not found",
      });
    }

    res.status(204).send();
  } catch (error) {
    console.error("DELETE /tasks/:id error:", error);

    res.status(500).json({
      error: "Database error",
    });
  }
});

/* =========================
   AUTH - SIGNUP
========================= */

app.post("/auth/signup", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: "Email and password are required",
      });
    }

    const { data, error } =
      await supabase.auth.signUp({
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
    console.error("Signup error:", error);

    res.status(500).json({
      error: "Server error",
    });
  }
});

/* =========================
   AUTH - LOGIN
========================= */

app.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: "Email and password are required",
      });
    }

    const { data, error } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (
      error ||
      !data ||
      !data.session
    ) {
      return res.status(401).json({
        error: "Invalid login credentials",
      });
    }

    res.status(200).json({
      access_token:
        data.session.access_token,
      refresh_token:
        data.session.refresh_token,
      user: data.user,
    });
  } catch (error) {
    console.error("Login error:", error);

    res.status(500).json({
      error: "Server error",
    });
  }
});

/* =========================
   PUBLIC ROUTE
========================= */

app.get("/public/info", (req, res) => {
  res.status(200).json({
    message:
      "Welcome stranger! This info is public.",
  });
});

/* =========================
   PROTECTED PROFILE
========================= */

app.get(
  "/protected/profile",
  authMiddleware,
  (req, res) => {
    res.status(200).json({
      id: req.user.id,
      email: req.user.email,
      created_at: req.user.created_at,
    });
  }
);

/* =========================
   PROTECTED DASHBOARD
========================= */

app.get(
  "/protected/dashboard",
  authMiddleware,
  (req, res) => {
    res.status(200).json({
      message:
        "Welcome to the protected dashboard",
      user: req.user.email,
    });
  }
);

/* =========================
   LOGOUT
========================= */

app.post(
  "/auth/logout",
  authMiddleware,
  async (req, res) => {
    try {
      const { error } =
        await supabase.auth.signOut();

      if (error) {
        return res.status(400).json({
          error: error.message,
        });
      }

      res.status(204).send();
    } catch (error) {
      console.error("Logout error:", error);

      res.status(500).json({
        error: "Server error",
      });
    }
  }
);

/* =========================
   SERVER
========================= */

const server = app.listen(
  PORT,
  "0.0.0.0",
  () => {
    console.log(
      `Server running on port ${PORT}`
    );
    console.log(
      "Server running and connected to Supabase"
    );
  }
);

server.on("error", (error) => {
  console.error("Server error:", error);
});

/*
  Explicitly keep the HTTP server referenced
  in Node's event loop.
*/
server.ref();