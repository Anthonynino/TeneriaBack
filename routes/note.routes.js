import { Router } from "express";
import { authRequire } from "../middlewares/validate.Token.js";
import { createTask, deleteTask, getAllTasks, getTask, updateTask } from "../controllers/note.controller.js"

const router = Router()

router.get('/tasks', authRequire, getAllTasks)
router.get('/tasks/:id', authRequire, getTask)
router.post('/tasks', authRequire, createTask)
router.delete('/tasks/:id', authRequire, deleteTask)
router.put('/tasks/:id', authRequire, updateTask)

export default router