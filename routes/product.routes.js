import { Router } from "express";
import { authRequire } from "../middlewares/validate.Token.js";
import {
  getAllProducts,
} from "../controllers/product.controller.js";

const router = Router();

router.get("/products", authRequire, getAllProducts);

export default router;
