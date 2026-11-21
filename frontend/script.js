
const API_URL = "/api/tasks";

// Application state
let tasks = [];
let currentFilter = "all";

// DOM elements
const taskForm = document.getElementById("task-form");
const taskInput = document.getElementById("task-input");
const taskList = document.getElementById("task-list");
const statusMessage = document.getElementById("status-message");
const filterButtons = document.querySelectorAll(".filter");

// Show messages
function showMessage(message) {
    statusMessage.textContent = message;
}

// Send requests to backend
async function apiRequest(url, options = {}) {
    const response = await fetch(url, options);

    if (!response.ok) {
        let message = `Request failed (${response.status})`;

        try {
            const data = await response.json();
            message = data.error || message;
        } catch {
            // Use default error message
        }

        throw new Error(message);
    }

    if (response.status === 204) {
        return null;
    }

    return response.json();
}

// Update task statistics
function updateStats() {
    const completed = tasks.filter(task => task.completed).length;

    document.getElementById("total-count").textContent = tasks.length;
    document.getElementById("pending-count").textContent =
        tasks.length - completed;
    document.getElementById("completed-count").textContent = completed;
}

// Display tasks
function renderTasks() {
    taskList.replaceChildren();

    let filteredTasks = tasks;

    if (currentFilter === "pending") {
        filteredTasks = tasks.filter(task => !task.completed);
    }

    if (currentFilter === "completed") {
        filteredTasks = tasks.filter(task => task.completed);
    }

    showMessage(
        filteredTasks.length === 0 ? "No tasks to display." : ""
    );

    filteredTasks.forEach(task => {
        const item = document.createElement("li");

        item.className = task.completed
            ? "task-item completed"
            : "task-item";

        // Complete task button
        const toggleButton = document.createElement("button");

        toggleButton.className = "toggle-btn";
        toggleButton.textContent = task.completed ? "✓" : "○";

        toggleButton.setAttribute(
            "aria-label",
            task.completed ? "Mark as pending" : "Mark as completed"
        );

        toggleButton.addEventListener("click", () => {
            toggleTask(task.id);
        });

        // Task title
        const title = document.createElement("span");
        title.className = "task-title";
        title.textContent = task.title;

        // Delete button
        const deleteButton = document.createElement("button");

        deleteButton.className = "delete-btn";
        deleteButton.textContent = "Delete";
        deleteButton.setAttribute("aria-label", "Delete " + task.title);

        deleteButton.addEventListener("click", () => {
            deleteTask(task.id);
        });

        item.append(toggleButton, title, deleteButton);
        taskList.appendChild(item);
    });

    updateStats();
}

// Load tasks from MySQL through API
async function loadTasks() {
    showMessage("Loading tasks...");

    try {
        tasks = await apiRequest(API_URL);
        renderTasks();
    } catch (error) {
        console.error("Load failed:", error);
        showMessage("Could not load tasks. " + error.message);
    }
}

// Add a task
taskForm.addEventListener("submit", async event => {
    event.preventDefault();

    const title = taskInput.value.trim();

    if (!title || title.length > 200) {
        showMessage("Task title must contain 1 to 200 characters.");
        return;
    }

    const submitButton = taskForm.querySelector(
        'button[type="submit"]'
    );

    if (submitButton) {
        submitButton.disabled = true;
    }

    try {
        const newTask = await apiRequest(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ title })
        });

        tasks.unshift(newTask);
        taskInput.value = "";
        renderTasks();
    } catch (error) {
        console.error("Add failed:", error);
        showMessage("Could not add task. " + error.message);
    } finally {
        if (submitButton) {
            submitButton.disabled = false;
        }
    }
});

// Change task status
async function toggleTask(id) {
    const task = tasks.find(task => task.id === id);

    if (!task) {
        return;
    }

    try {
        const updatedTask = await apiRequest(`${API_URL}/${id}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                completed: !task.completed
            })
        });

        task.completed = updatedTask.completed;
        renderTasks();
    } catch (error) {
        console.error("Update failed:", error);
        showMessage("Could not update task. " + error.message);
    }
}

// Delete a task
async function deleteTask(id) {
    try {
        await apiRequest(`${API_URL}/${id}`, {
            method: "DELETE"
        });

        tasks = tasks.filter(task => task.id !== id);
        renderTasks();
    } catch (error) {
        console.error("Delete failed:", error);
        showMessage("Could not delete task. " + error.message);
    }
}

// Filter tasks
filterButtons.forEach(button => {
    button.addEventListener("click", () => {
        filterButtons.forEach(btn => {
            btn.classList.remove("active");
        });

        button.classList.add("active");
        currentFilter = button.dataset.filter;

        renderTasks();
    });
});

// Initial load from backend
loadTasks();
