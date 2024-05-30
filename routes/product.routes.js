import { Router } from "express";
import { authRequire } from "../middlewares/validate.Token.js";
import {
  getAllProducts,
  getProduct,
  createProduct,
  updateStock
} from "../controllers/product.controller.js";

const router = Router();

router.get("/products", authRequire, getAllProducts);
router.get("/products/:id", authRequire, getProduct);
router.post("/products", authRequire, createProduct);
router.post("/products/:id", authRequire, updateStock)
export default router;
