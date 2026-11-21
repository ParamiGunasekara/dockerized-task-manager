
const express = require("express");
const pool = require("./db");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Check application and database health
app.get("/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");

    res.status(200).json({
      status: "healthy",
      service: "taskflow-backend",
      database: "connected",
    });
  } catch (error) {
    res.status(503).json({
      status: "unhealthy",
      database: "disconnected",
    });
  }
});

// Welcome route
app.get("/", (req, res) => {
  res.json({ message: "TaskFlow API is running" });
});

// GET all tasks
app.get("/api/tasks", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, title, completed, created_at FROM tasks ORDER BY id DESC"
    );

    const tasks = rows.map((task) => ({
      ...task,
      completed: Boolean(task.completed),
    }));

    res.json(tasks);
  } catch (error) {
    console.error("GET tasks failed:", error.message);
    res.status(500).json({ error: "Failed to fetch tasks" });
  }
});

// CREATE task
app.post("/api/tasks", async (req, res) => {
  const { title } = req.body || {};

  if (
    typeof title !== "string" ||
    !title.trim() ||
    title.trim().length > 200
  ) {
    return res.status(400).json({
      error: "Task title must contain 1 to 200 characters",
    });
  }

  try {
    const [result] = await pool.execute(
      "INSERT INTO tasks (title, completed) VALUES (?, ?)",
      [title.trim(), false]
    );

    res.status(201).json({
      id: result.insertId,
      title: title.trim(),
      completed: false,
    });
  } catch (error) {
    console.error("CREATE task failed:", error.message);
    res.status(500).json({ error: "Failed to create task" });
  }
});

// UPDATE task completion status
app.patch("/api/tasks/:id", async (req, res) => {
  const id = Number(req.params.id);
  const { completed } = req.body || {};

  if (!Number.isSafeInteger(id) || id < 1) {
    return res.status(400).json({ error: "Invalid task ID" });
  }

  if (typeof completed !== "boolean") {
    return res.status(400).json({
      error: "Completed must be a boolean",
    });
  }

  try {
    const [result] = await pool.execute(
      "UPDATE tasks SET completed = ? WHERE id = ?",
      [completed, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Task not found" });
    }

    const [rows] = await pool.execute(
      "SELECT id, title, completed, created_at FROM tasks WHERE id = ?",
      [id]
    );

    res.json({
      ...rows[0],
      completed: Boolean(rows[0].completed),
    });
  } catch (error) {
    console.error("UPDATE task failed:", error.message);
    res.status(500).json({ error: "Failed to update task" });
  }
});

// DELETE task
app.delete("/api/tasks/:id", async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isSafeInteger(id) || id < 1) {
    return res.status(400).json({ error: "Invalid task ID" });
  }

  try {
    const [result] = await pool.execute(
      "DELETE FROM tasks WHERE id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Task not found" });
    }

    res.status(204).send();
  } catch (error) {
    console.error("DELETE task failed:", error.message);
    res.status(500).json({ error: "Failed to delete task" });
  }
});

// Start backend

if (require.main === module) {
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`TaskFlow backend running on port ${PORT}`);
  });
}

module.exports = app;

