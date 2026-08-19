const repository = require("../repositories/postgresRepository");

async function getAllTasks() {
  return repository.getAllTasks();
}

async function getTaskById(id) {
  return repository.getTaskById(id);
}

async function createTask(title) {
  return repository.createTask(title);
}

async function updateTask(id, title, done) {
  return repository.updateTask(id, title, done);
}

async function deleteTask(id) {
  return repository.deleteTask(id);
}

module.exports = {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
};