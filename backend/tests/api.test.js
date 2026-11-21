
const { test } = require("node:test");
const assert = require("node:assert/strict");
const request = require("supertest");

const app = require("../server");
const pool = require("../db");

test("GET /health returns healthy database status", async () => {
  const response = await request(app).get("/health");

  assert.equal(response.status, 200);
  assert.equal(response.body.status, "healthy");
  assert.equal(response.body.database, "connected");
});

test("Task CRUD lifecycle works with MySQL", async () => {
  let taskId;

  try {
    // CREATE
    const created = await request(app)
      .post("/api/tasks")
      .send({ title: "Automated API Test Task" });

    assert.equal(created.status, 201);
    assert.equal(created.body.title, "Automated API Test Task");
    assert.equal(created.body.completed, false);

    taskId = created.body.id;

    // READ
    const listed = await request(app).get("/api/tasks");

    assert.equal(listed.status, 200);
    assert.ok(
      listed.body.some(task => task.id === taskId)
    );

    // UPDATE
    const updated = await request(app)
      .patch(`/api/tasks/${taskId}`)
      .send({ completed: true });

    assert.equal(updated.status, 200);
    assert.equal(updated.body.completed, true);

    // DELETE
    const deleted = await request(app)
      .delete(`/api/tasks/${taskId}`);

    assert.equal(deleted.status, 204);
    taskId = null;
  } finally {
    // Clean up if an assertion fails midway
    if (taskId !== undefined && taskId !== null) {
      await pool.execute(
        "DELETE FROM tasks WHERE id = ?",
        [taskId]
      );
    }
  }
});

test("POST /api/tasks rejects an empty title", async () => {
  const response = await request(app)
    .post("/api/tasks")
    .send({ title: "" });

  assert.equal(response.status, 400);
});

test.after(async () => {
  await pool.end();
});
