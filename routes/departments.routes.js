import { Router } from "express";
import { authRequire } from "../middlewares/validate.Token.js";
import { getAllDepartments } from "../controllers/departments.controller.js";

const router = Router();

router.get("/departments", authRequire, getAllDepartments);

export default router;
