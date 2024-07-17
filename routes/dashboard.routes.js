import { Router } from "express";
import { authRequire } from "../middlewares/validate.Token.js";
import { getAllQuantities } from "../controllers/dashboard.controller.js"

const router = Router();

router.get("/dashboard", authRequire, getAllQuantities)

export default router;