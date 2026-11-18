
// Application state
let tasks = [];
let currentFilter = "all";
let nextId = 1;

// DOM elements
const taskForm = document.getElementById("task-form");
const taskInput = document.getElementById("task-input");
const taskList = document.getElementById("task-list");
const statusMessage = document.getElementById("status-message");
const filterButtons = document.querySelectorAll(".filter");


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

    statusMessage.textContent = filteredTasks.length === 0
        ? "No tasks to display."
        : "";

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


// Add a task
taskForm.addEventListener("submit", event => {
    event.preventDefault();

    const title = taskInput.value.trim();

    if (!title || title.length > 200) {
        return;
    }

    const newTask = {
        id: nextId++,
        title: title,
        completed: false
    };

    tasks.push(newTask);

    taskInput.value = "";
    renderTasks();
});


// Change task status
function toggleTask(id) {
    const task = tasks.find(task => task.id === id);

    if (task) {
        task.completed = !task.completed;
    }

    renderTasks();
}


// Delete a task
function deleteTask(id) {
    tasks = tasks.filter(task => task.id !== id);

    renderTasks();
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


// Initial application render
renderTasks();
