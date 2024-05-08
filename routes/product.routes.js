import { Router } from "express";
import { authRequire } from "../middlewares/validate.Token.js";
import {
  createTask,
  deleteTask,
  getAllTasks,
  getTask,
  updateTask,
} from "../controllers/note.controller.js";

const router = Router();

router.get("/products", authRequire, getAllTasks);
router.get("/products/:id", authRequire, getTask);
router.post("/products", authRequire, createTask);
router.delete("/products/:id", authRequire, deleteTask);
router.put("/products/:id", authRequire, updateTask);

export default router;
