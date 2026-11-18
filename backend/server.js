
const express = require("express");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Temporary task storage
let tasks = [];
let nextId = 1;

// Root endpoint
app.get("/", (req, res) => {
    res.json({
        message: "TaskFlow API is running"
    });
});

// Health check endpoint
app.get("/health", (req, res) => {
    res.status(200).json({
        status: "healthy",
        service: "taskflow-backend"
    });
});

// GET - Retrieve all tasks
app.get("/api/tasks", (req, res) => {
    res.json(tasks);
});

// POST - Create a new task
app.post("/api/tasks", (req, res) => {
    const { title } = req.body || {};

    if (
        typeof title !== "string" ||
        !title.trim() ||
        title.trim().length > 200
    ) {
        return res.status(400).json({
            error: "Task title must contain 1 to 200 characters"
        });
    }

    const task = {
        id: nextId++,
        title: title.trim(),
        completed: false
    };

    tasks.push(task);

    res.status(201).json(task);
});

// PATCH - Update task status
app.patch("/api/tasks/:id", (req, res) => {
    const id = Number(req.params.id);
    const { completed } = req.body || {};

    if (typeof completed !== "boolean") {
        return res.status(400).json({
            error: "Completed must be a boolean"
        });
    }

    const task = tasks.find(task => task.id === id);

    if (!task) {
        return res.status(404).json({
            error: "Task not found"
        });
    }

    task.completed = completed;

    res.json(task);
});

// DELETE - Delete a task
app.delete("/api/tasks/:id", (req, res) => {
    const id = Number(req.params.id);

    const index = tasks.findIndex(task => task.id === id);

    if (index === -1) {
        return res.status(404).json({
            error: "Task not found"
        });
    }

    tasks.splice(index, 1);

    res.status(204).send();
});

// Start the server
app.listen(PORT, "0.0.0.0", () => {
    console.log(`TaskFlow backend running on port ${PORT}`);
});
