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
router.post("/createProduct", authRequire, createProduct);
router.post("/updateProduct", authRequire, updateStock);
router.delete("/products/:id", authRequire, deleteProduct);
export default router;
