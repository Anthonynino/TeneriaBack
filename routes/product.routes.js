import { Router } from "express";
import { authRequire } from "../middlewares/validate.Token.js";
import {
  getAllProducts,
  getProduct,
  createProduct,
  updateStock,
  deleteProduct,
} from "../controllers/product.controller.js";

const router = Router();

router.get("/products/:categoryId", authRequire, getAllProducts);
router.get("/products/:id", authRequire, getProduct);
router.post("/products", authRequire, createProduct);
router.post("/products/:id", authRequire, updateStock);
router.delete("/products/:id", authRequire, deleteProduct);
export default router;
