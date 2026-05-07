const express = require('express');
const { handleGetAllTasks, handleCreateTask, handleUpdateTask, handleDeleteTask, handleGetTaskById } = require('../controllers/task');
const router = express.Router();

router.get("/", handleGetAllTasks)
router.post("/", handleCreateTask)
router.get("/:id", handleGetTaskById)
router.put("/:id", handleUpdateTask)
router.delete("/:id", handleDeleteTask)

module.exports = router