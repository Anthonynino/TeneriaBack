import { Router } from "express";
import { authRequire } from "../middlewares/validate.Token.js";
import { getAllCategories } from "../controllers/category.controller.js";

const router = Router();

router.get("/categories", authRequire, getAllCategories);

export default router;
